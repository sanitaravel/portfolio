import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center px-6 pt-16"
    >
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-5xl w-full">
        {/* Text content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
          <h1 className="text-4xl md:text-6xl font-bold text-text">
            Alexander Koshcheev
          </h1>
          <p className="mt-4 text-lg md:text-xl text-text/80 max-w-xl">
            Junior full-stack developer: React, TypeScript, Nest.js, and Python.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="inline-flex items-center justify-center min-h-11 min-w-11 px-6 py-3 bg-accent text-bg font-semibold rounded hover:bg-accent/90 transition-colors"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center min-h-11 min-w-11 px-6 py-3 border border-accent text-accent font-semibold rounded hover:bg-accent/10 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>

        {/* Photo */}
        <div className="shrink-0">
          <Image
            src="/face.png"
            alt="Alexander Koshcheev"
            width={480}
            height={480}
            className="rounded border-4 border-accent/30 object-cover w-72 h-72 md:w-md md:h-112"
            priority
          />
        </div>
      </div>
    </section>
  );
}
