import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import resilienceLogoPath from "@assets/RESILIENCELOGO.jpg";

import RESILIENCELOGO from "@assets/RESILIENCELOGO.png";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 py-4 px-6 transition-all duration-300 ${
        isScrolled ? "sticky-nav" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative group cursor-pointer">
            <img 
              src={resilienceLogoPath} 
              alt="Resilience Solutions Logo" 
              className="w-12 h-12 rounded-xl object-contain transition-all duration-300 group-hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => scrollToSection("home")}
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-orange-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => scrollToSection("home")}
            className="brand-navy hover:brand-orange transition-colors font-medium"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("services")}
            className="brand-navy hover:brand-orange transition-colors font-medium"
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection("gallery")}
            className="brand-navy hover:brand-orange transition-colors font-medium"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollToSection("testimonials")}
            className="brand-navy hover:brand-orange transition-colors font-medium"
          >
            Reviews
          </button>
          <button
            onClick={() => scrollToSection("resources")}
            className="brand-navy hover:brand-orange transition-colors font-medium"
          >
            Resources
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="brand-navy hover:brand-orange transition-colors font-medium"
          >
            Contact
          </button>
          <Button
            onClick={() => scrollToSection("contact")}
            className="bg-brand-orange text-white hover:bg-orange-600"
          >
            Get Free Quote
          </Button>
        </div>

        <button
          className="md:hidden brand-navy text-2xl"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t">
          <div className="px-6 py-4 space-y-4">
            <button
              onClick={() => scrollToSection("home")}
              className="block w-full text-left brand-navy hover:brand-orange transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="block w-full text-left brand-navy hover:brand-orange transition-colors font-medium"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("gallery")}
              className="block w-full text-left brand-navy hover:brand-orange transition-colors font-medium"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="block w-full text-left brand-navy hover:brand-orange transition-colors font-medium"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection("resources")}
              className="block w-full text-left brand-navy hover:brand-orange transition-colors font-medium"
            >
              Resources
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full text-left brand-navy hover:brand-orange transition-colors font-medium"
            >
              Contact
            </button>
            <Button
              onClick={() => scrollToSection("contact")}
              className="w-full bg-brand-orange text-white hover:bg-orange-600"
            >
              Get Free Quote
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
