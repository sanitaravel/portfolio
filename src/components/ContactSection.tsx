import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <section id="contact" className="min-h-screen px-6 py-20 flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-bold text-text mb-4 text-center">
        Get in Touch
      </h2>
      <p className="text-text/70 mb-10 text-center max-w-md">
        Have a question or want to work together? Send me a message and I&apos;ll get back to you.
      </p>
      <ContactForm />
    </section>
  );
}
