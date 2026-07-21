// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import BioSection from "@/components/BioSection";

afterEach(() => {
  cleanup();
});

describe("BioSection", () => {
  // Task 3.1: Structure tests
  describe("structure", () => {
    it("renders a section with id 'about'", () => {
      const { container } = render(<BioSection />);
      const section = container.querySelector("section#about");
      expect(section).toBeInTheDocument();
    });

    it("renders an h2 heading with text 'About Me'", () => {
      render(<BioSection />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("About Me");
    });

    it("renders a personal description paragraph", () => {
      render(<BioSection />);
      const description = screen.getByText(/Second-year Web Development student/i);
      expect(description).toBeInTheDocument();
    });

    it("renders education information", () => {
      render(<BioSection />);
      const educationHeading = screen.getByText("Education");
      expect(educationHeading).toBeInTheDocument();
      const educationDetails = screen.getByText(/Bachelor's in Web Development/i);
      expect(educationDetails).toBeInTheDocument();
    });
  });

  // Task 3.2: Document link tests
  describe("document links", () => {
    it("renders three document links with correct href values", () => {
      render(<BioSection />);
      const resumeLink = screen.getByRole("link", { name: /Download Resume/i });
      const transcriptLink = screen.getByRole("link", { name: /Download Transcript/i });
      const lorLink = screen.getByRole("link", { name: /Download Letter of Recommendation/i });

      expect(resumeLink).toHaveAttribute("href", "/resume.pdf");
      expect(transcriptLink).toHaveAttribute("href", "/transcript_of_records.pdf");
      expect(lorLink).toHaveAttribute("href", "/letter_of_recommendation.pdf");
    });

    it("each document link has the download attribute", () => {
      render(<BioSection />);
      const resumeLink = screen.getByRole("link", { name: /Download Resume/i });
      const transcriptLink = screen.getByRole("link", { name: /Download Transcript/i });
      const lorLink = screen.getByRole("link", { name: /Download Letter of Recommendation/i });

      expect(resumeLink).toHaveAttribute("download");
      expect(transcriptLink).toHaveAttribute("download");
      expect(lorLink).toHaveAttribute("download");
    });

    it("each document link has an accessible label containing 'Download'", () => {
      render(<BioSection />);
      const resumeLink = screen.getByRole("link", { name: /Download Resume/i });
      const transcriptLink = screen.getByRole("link", { name: /Download Transcript/i });
      const lorLink = screen.getByRole("link", { name: /Download Letter of Recommendation/i });

      expect(resumeLink.getAttribute("aria-label")).toContain("Download");
      expect(transcriptLink.getAttribute("aria-label")).toContain("Download");
      expect(lorLink.getAttribute("aria-label")).toContain("Download");
    });
  });

  // Task 3.3: Social link tests
  describe("social links", () => {
    it("renders four social links with correct href values", () => {
      render(<BioSection />);
      const githubLink = screen.getByRole("link", { name: /GitHub/i });
      const twitterLink = screen.getByRole("link", { name: /Twitter/i });
      const linkedinLink = screen.getByRole("link", { name: /LinkedIn/i });
      const telegramLink = screen.getByRole("link", { name: /Telegram/i });

      expect(githubLink).toHaveAttribute("href", "https://github.com/sanitaravel");
      expect(twitterLink).toHaveAttribute("href", "https://x.com/sanitaravel");
      expect(linkedinLink).toHaveAttribute("href", "https://www.linkedin.com/in/alexander-koshcheev/");
      expect(telegramLink).toHaveAttribute("href", "https://t.me/sanitaravel");
    });

    it("each social link has target='_blank' and rel='noopener noreferrer'", () => {
      render(<BioSection />);
      const socialLinks = [
        screen.getByRole("link", { name: /GitHub/i }),
        screen.getByRole("link", { name: /Twitter/i }),
        screen.getByRole("link", { name: /LinkedIn/i }),
        screen.getByRole("link", { name: /Telegram/i }),
      ];

      for (const link of socialLinks) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    });

    it("each social link has an aria-label containing the platform name and 'opens in new tab'", () => {
      render(<BioSection />);
      const githubLink = screen.getByRole("link", { name: /GitHub/i });
      const twitterLink = screen.getByRole("link", { name: /Twitter/i });
      const linkedinLink = screen.getByRole("link", { name: /LinkedIn/i });
      const telegramLink = screen.getByRole("link", { name: /Telegram/i });

      expect(githubLink.getAttribute("aria-label")).toContain("opens in new tab");
      expect(twitterLink.getAttribute("aria-label")).toContain("opens in new tab");
      expect(linkedinLink.getAttribute("aria-label")).toContain("opens in new tab");
      expect(telegramLink.getAttribute("aria-label")).toContain("opens in new tab");
    });
  });
});
