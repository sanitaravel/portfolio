// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import HeroSection from "@/components/HeroSection";

// Mock next/image to render a plain img tag
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    priority?: boolean;
  }) => <img src={src} alt={alt} width={width} height={height} className={className} />,
}));

afterEach(() => {
  cleanup();
});

describe("HeroSection", () => {
  it("renders an h1 element containing the developer name", () => {
    render(<HeroSection />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Alexander Koshcheev");
  });

  it("renders View Projects CTA linking to #projects", () => {
    render(<HeroSection />);

    const projectsCta = screen.getAllByRole("link", { name: "View Projects" });
    expect(projectsCta.length).toBeGreaterThan(0);
    expect(projectsCta[0]).toHaveAttribute("href", "#projects");
  });

  it("renders Get in Touch CTA linking to #contact", () => {
    render(<HeroSection />);

    const contactCta = screen.getAllByRole("link", { name: "Get in Touch" });
    expect(contactCta.length).toBeGreaterThan(0);
    expect(contactCta[0]).toHaveAttribute("href", "#contact");
  });

  it("View Projects CTA has accent background color class", () => {
    render(<HeroSection />);

    const projectsCta = screen.getAllByRole("link", { name: "View Projects" });
    expect(projectsCta[0]).toHaveClass("bg-accent");
  });

  it("Get in Touch CTA has accent border and text color classes", () => {
    render(<HeroSection />);

    const contactCta = screen.getAllByRole("link", { name: "Get in Touch" });
    expect(contactCta[0]).toHaveClass("border-accent");
    expect(contactCta[0]).toHaveClass("text-accent");
  });
});
