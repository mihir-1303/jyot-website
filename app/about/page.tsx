import Image from "next/image";
import Link from "next/link";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { aboutContent } from "../../lib/about-content";
import { editorialMetadata } from "../../lib/seo";

export const metadata = editorialMetadata({ title: "About Jyot", description: aboutContent.introduction, path: "/about" });

function AboutImage({ image, className = "" }: { image: { src: string; alt: string }; className?: string }) {
  return <Image src={image.src} alt={image.alt} width={1200} height={900} className={className} sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 31vw" />;
}

export default function AboutPage() {
  return <>
    <Header />
    <main className="about-page">
      <section className="about-hero-dark" aria-labelledby="about-title">
        <div className="page-shell about-hero-inner">
          <div className="about-breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>About</span></div>
          <p className="about-hero-kicker">{aboutContent.eyebrow} JYOT</p>
          <h1 id="about-title" className="about-hero-title">{aboutContent.statement}</h1>
        </div>
      </section>
      <section className="about-intro page-shell" aria-label="About Jyot introduction">
        <blockquote className="about-quote">“{aboutContent.quote}”</blockquote>
        <p className="about-introduction">{aboutContent.introduction}</p>
      </section>
      <section className="about-fundamentals page-shell" aria-labelledby="fundamentals-title">
        <h2 id="fundamentals-title" className="about-section-heading">The Fundamentals of Jyot</h2>
        <div className="about-fundamentals-grid">{aboutContent.fundamentals.map((image) => <div className="about-fundamental" key={image.src}><AboutImage image={image} /></div>)}</div>
      </section>
      <section className="about-established page-shell" aria-labelledby="established-title">
        <div className="about-year"><div className="about-year-card"><span className="serif">{aboutContent.established.year}</span></div><p id="established-title">{aboutContent.established.label}</p></div>
        {aboutContent.established.paragraphs.map((paragraph) => <p className="about-established-copy" key={paragraph}>{paragraph}</p>)}
      </section>
      <section className="about-beliefs page-shell" aria-label="Jyot's vision and mission">
        <article className="about-belief-card"><h2 className="about-section-heading">{aboutContent.vision.title}</h2><p>{aboutContent.vision.text}</p></article>
        <article className="about-belief-card"><h2 className="about-section-heading">{aboutContent.mission.title}</h2><p>{aboutContent.mission.text}</p></article>
      </section>
      <section className="about-testimonials page-shell" aria-labelledby="testimonials-title">
        <h2 id="testimonials-title" className="about-section-heading">What People Say</h2>
        <div className="about-testimonial-grid">{aboutContent.testimonials.map((testimonial) => <figure className="about-testimonial" key={testimonial.name}><AboutImage image={testimonial.image} className="about-testimonial-image" /><figcaption><h3>{testimonial.name}</h3><p className="about-testimonial-designation">{testimonial.designation}</p><span className="about-testimonial-rule" aria-hidden="true" /><blockquote>“{testimonial.quote}”</blockquote></figcaption></figure>)}</div>
      </section>
    </main>
    <Footer />
  </>;
}
