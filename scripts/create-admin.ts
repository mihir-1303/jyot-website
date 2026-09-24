import { loadEnvConfig } from "@next/env";
import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "../lib/db/mongodb-core";
import { User } from "../lib/db/models-core";

loadEnvConfig(process.cwd());

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");
const passwordSchema = z.string().min(12, "Password must be at least 12 characters.").max(256, "Password is too long.");

function question(prompt: string) {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<string>((resolve) => readline.question(prompt, (answer) => { readline.close(); resolve(answer); }));
}

function hiddenQuestion(prompt: string) {
  return new Promise<string>((resolve, reject) => {
    if (!process.stdin.isTTY || !process.stdin.setRawMode) { reject(new Error("A real terminal is required for hidden password input.")); return; }
    process.stdout.write(prompt);
    let answer = "";
    const onData = (chunk: Buffer) => {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") { process.stdin.setRawMode?.(false); process.stdin.off("data", onData); process.stdout.write("\n"); reject(new Error("Cancelled.")); return; }
        if (character === "\r" || character === "\n") { process.stdin.setRawMode?.(false); process.stdin.off("data", onData); process.stdin.pause(); process.stdout.write("\n"); resolve(answer); return; }
        if (character === "\u0008" || character === "\u007f") { answer = answer.slice(0, -1); continue; }
        if (character >= " ") answer += character;
      }
    };
    process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.on("data", onData);
  });
}

async function main() {
  const email = emailSchema.parse(await question("Admin email: "));
  const password = passwordSchema.parse(await hiddenQuestion("Admin password: "));
  const confirmation = await hiddenQuestion("Confirm password: ");
  if (password !== confirmation) throw new Error("Passwords do not match.");
  await connectToDatabase();
  const existing = await User.findOne({ email }).select("_id role").lean() as unknown as { _id: unknown; role: string } | null;
  const anotherAdmin = await User.findOne({ role: "ADMIN", ...(existing ? { _id: { $ne: existing._id } } : {}) }).select("_id").lean();
  if (anotherAdmin) throw new Error("An ADMIN user already exists with a different email. Sign in as that administrator to manage users.");
  const passwordHash = await bcrypt.hash(password, 12);
  if (existing) await User.updateOne({ _id: existing._id }, { $set: { email, passwordHash, role: "ADMIN" }, $unset: { disabledAt: 1 } });
  else await User.create({ name: email.split("@")[0], email, passwordHash, role: "ADMIN", permissionOverrides: [] });
  console.log(existing ? "ADMIN credentials updated." : "ADMIN user created.");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Admin provisioning failed."); process.exitCode = 1; });
