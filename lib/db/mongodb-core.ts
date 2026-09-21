import mongoose from "mongoose";

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalWithMongo = globalThis as typeof globalThis & { __jyotMongo?: Cached };
const cached = globalWithMongo.__jyotMongo ?? { conn: null, promise: null };
globalWithMongo.__jyotMongo = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Database setup required: configure MONGODB_URI before serving database-backed content.");

  cached.promise ??= mongoose.connect(uri, { bufferCommands: false });
  cached.conn = await cached.promise;
  return cached.conn;
}
