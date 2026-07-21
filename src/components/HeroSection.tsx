export default function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-16"
    >
      <h1 className="text-4xl md:text-6xl font-bold text-text text-center">
        Alexander Koshcheev
      </h1>
      <p className="mt-4 text-lg md:text-xl text-text/80 text-center max-w-xl">
        Junior full-stack developer building modern web apps with React, TypeScrip, Nest.js, and Python.
      </p>
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <a
          href="#projects"
          className="inline-block px-6 py-3 bg-accent text-bg font-semibold rounded hover:bg-accent/90 transition-colors"
        >
          View Projects
        </a>
        <a
          href="#contact"
          className="inline-block px-6 py-3 border border-accent text-accent font-semibold rounded hover:bg-accent/10 transition-colors"
        >
          Get in Touch
        </a>
      </div>
    </section>
  );
}
