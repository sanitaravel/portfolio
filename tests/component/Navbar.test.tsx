// @vitest-environment jsdom
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import Navbar from "@/components/Navbar";

// Mock IntersectionObserver as a class since jsdom doesn't support it
let intersectionCallback: IntersectionObserverCallback;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = "";
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

beforeEach(() => {
  mockObserve.mockClear();
  mockDisconnect.mockClear();

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

  // Provide stub elements for document.getElementById used by the component
  vi.spyOn(document, "getElementById").mockImplementation((id: string) => {
    if (["home", "projects", "contact"].includes(id)) {
      const el = document.createElement("section");
      el.id = id;
      return el;
    }
    return null;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Navbar", () => {
  describe("renders navigation links", () => {
    it("renders Home, Projects, and Contact links", () => {
      render(<Navbar />);

      const homeLinks = screen.getAllByRole("link", { name: "Home" });
      const projectsLinks = screen.getAllByRole("link", { name: "Projects" });
      const contactLinks = screen.getAllByRole("link", { name: "Contact" });

      expect(homeLinks.length).toBeGreaterThan(0);
      expect(projectsLinks.length).toBeGreaterThan(0);
      expect(contactLinks.length).toBeGreaterThan(0);
    });

    it("links point to correct hash targets", () => {
      render(<Navbar />);

      const homeLinks = screen.getAllByRole("link", { name: "Home" });
      const projectsLinks = screen.getAllByRole("link", { name: "Projects" });
      const contactLinks = screen.getAllByRole("link", { name: "Contact" });

      expect(homeLinks[0]).toHaveAttribute("href", "#home");
      expect(projectsLinks[0]).toHaveAttribute("href", "#projects");
      expect(contactLinks[0]).toHaveAttribute("href", "#contact");
    });
  });

  describe("hamburger menu toggle", () => {
    it("does not show mobile menu by default", () => {
      render(<Navbar />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      expect(menuButton).toHaveAttribute("aria-expanded", "false");

      // Only desktop links should be present
      const homeLinks = screen.getAllByRole("link", { name: "Home" });
      expect(homeLinks).toHaveLength(1);
    });

    it("shows mobile menu when hamburger button is clicked", () => {
      render(<Navbar />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      fireEvent.click(menuButton);

      // After opening, aria-expanded should be true
      expect(menuButton).toHaveAttribute("aria-expanded", "true");

      // Now mobile menu links should also be rendered (desktop + mobile)
      const homeLinks = screen.getAllByRole("link", { name: "Home" });
      expect(homeLinks).toHaveLength(2);
    });

    it("hides mobile menu when hamburger button is clicked again", () => {
      render(<Navbar />);

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      fireEvent.click(menuButton); // open
      fireEvent.click(menuButton); // close

      expect(menuButton).toHaveAttribute("aria-expanded", "false");

      // Back to just desktop links
      const homeLinks = screen.getAllByRole("link", { name: "Home" });
      expect(homeLinks).toHaveLength(1);
    });
  });

  describe("active section highlighting", () => {
    it("highlights Home link with text-accent class by default", () => {
      render(<Navbar />);

      // Desktop nav Home link
      const homeLinks = screen.getAllByRole("link", { name: "Home" });
      expect(homeLinks[0]).toHaveClass("text-accent");
    });

    it("applies text-accent to the active section link when IntersectionObserver fires", async () => {
      render(<Navbar />);

      // Simulate "projects" section becoming visible
      const projectsSection = document.createElement("section");
      projectsSection.id = "projects";

      await act(async () => {
        intersectionCallback(
          [
            {
              isIntersecting: true,
              target: projectsSection,
              boundingClientRect: {} as DOMRectReadOnly,
              intersectionRatio: 0,
              intersectionRect: {} as DOMRectReadOnly,
              rootBounds: null,
              time: 0,
            },
          ] as IntersectionObserverEntry[],
          new MockIntersectionObserver(() => {})
        );
      });

      // Check that Projects link now has text-accent
      const projectsLinks = screen.getAllByRole("link", { name: "Projects" });
      expect(projectsLinks[0]).toHaveClass("text-accent");

      // Home link should no longer have text-accent
      const homeLinks = screen.getAllByRole("link", { name: "Home" });
      expect(homeLinks[0]).not.toHaveClass("text-accent");
    });
  });
});
