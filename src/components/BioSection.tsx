export default function BioSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="px-6 py-20 flex flex-col items-center"
    >
      <div className="max-w-5xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left column: description and education */}
          <div className="space-y-6">
            <h2
              id="about-heading"
              className="text-3xl md:text-4xl font-bold text-text"
            >
              About Me
            </h2>
            <p className="text-text/80 text-base md:text-lg leading-relaxed">
              Second-year Web Development student at SRH Berlin University of
              Applied Sciences with skills in React, TypeScript, Nest.js, Python,
              and computer vision. I approach problems analytically, derive
              well-founded decisions, and translate theoretical concepts into
              practical, well-structured solutions. Currently seeking internship
              opportunities in web and software development.
            </p>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-accent">Skills</h3>
              <p className="text-text/80">
                HTML/CSS/JS · React · Vue · Vite · REST APIs · Node.js · Nest · Flutter · Python
              </p>
              <p className="text-text/80">
                Russian (Native) · English (C1, IELTS 8.0) · German (Goethe-Zertifikat B2)
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-accent">Education</h3>
              <p className="text-text/80">
                SRH Berlin University of Applied Sciences
              </p>
              <p className="text-text/80">
                Bachelor&apos;s in Web Development · GPA 1.2
              </p>
              <p className="text-text/60 text-sm">
                Oct 2024 – Mar 2028, Berlin
              </p>
            </div>  
          </div>

          {/* Right column: documents and social links */}
          <div className="space-y-8 md:text-right">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-bold text-text">Documents</h3>
              <ul className="space-y-3 md:flex md:flex-col md:items-end">
                <li>
                  <a
                    href="/Resume Koshcheev Alexander.pdf"
                    download
                    aria-label="Download Resume"
                    className="inline-flex items-center gap-2 min-h-11 min-w-11 text-accent hover:text-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg rounded"
                  >
                    Resume
                    <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </a>
                </li>
                <li>
                  <a
                    href="/Transcript+of+Records_Modules_passedOnly.pdf"
                    download
                    aria-label="Download Transcript of Records"
                    className="inline-flex items-center gap-2 min-h-11 min-w-11 text-accent hover:text-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg rounded"
                  >
                    Transcript of Records
                    <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </a>
                </li>
                <li>
                  <a
                    href="/LoR-koshcheev.pdf"
                    download
                    aria-label="Download Letter of Recommendation"
                    className="inline-flex items-center gap-2 min-h-11 min-w-11 text-accent hover:text-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg rounded"
                  >
                    Letter of Recommendation
                    <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-accent">Connect</h3>
              <div className="flex flex-wrap gap-4 md:justify-end">
                <a
                  href="https://github.com/sanitaravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile (opens in new tab)"
                  className="inline-flex items-center justify-center min-h-11 min-w-11 p-2 text-accent hover:text-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg rounded"
                >
                  <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com/sanitaravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter profile (opens in new tab)"
                  className="inline-flex items-center justify-center min-h-11 min-w-11 p-2 text-accent hover:text-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg rounded"
                >
                  <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/alexander-koshcheev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn profile (opens in new tab)"
                  className="inline-flex items-center justify-center min-h-11 min-w-11 p-2 text-accent hover:text-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg rounded"
                >
                  <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://t.me/sanitaravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram profile (opens in new tab)"
                  className="inline-flex items-center justify-center min-h-11 min-w-11 p-2 text-accent hover:text-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg rounded"
                >
                  <svg aria-hidden="true" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
