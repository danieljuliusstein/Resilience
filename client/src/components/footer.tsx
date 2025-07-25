import { Facebook, Instagram, Linkedin } from "lucide-react";
import resilienceLogoPath from "@assets/RESILIENCELOGO.jpg";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-brand-navy text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={resilienceLogoPath}
                alt="Resilience Solutions"
                className="w-10 h-10 rounded-lg object-contain"
              />
              <div>
                <div className="text-xl font-bold">Resilience Solutions</div>
                <div className="text-sm text-gray-400">
                  Quality Remodeling & Finishing
                </div>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Transforming homes with exceptional craftsmanship, innovative
              design, and unwavering commitment to quality.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <button
                  onClick={() => scrollToSection("services")}
                  className="hover:brand-orange transition-colors"
                >
                  Full Home Remodeling
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("services")}
                  className="hover:brand-orange transition-colors"
                >
                  Kitchen Renovation
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("services")}
                  className="hover:brand-orange transition-colors"
                >
                  Bathroom Renovation
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("services")}
                  className="hover:brand-orange transition-colors"
                >
                  Interior Painting
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("services")}
                  className="hover:brand-orange transition-colors"
                >
                  Drywall Repair
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("services")}
                  className="hover:brand-orange transition-colors"
                >
                  Interior Design
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <button
                  onClick={() => scrollToSection("home")}
                  className="hover:brand-orange transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="hover:brand-orange transition-colors"
                >
                  Testimonials
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("gallery")}
                  className="hover:brand-orange transition-colors"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="hover:brand-orange transition-colors"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="hover:brand-orange transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Get In Touch</h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center gap-3">
                <i className="fas fa-phone brand-orange"></i>
                <span>(555) RESILIENCE</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-envelope brand-orange"></i>
                <span>hello@resiliencesolutions.com</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-map-marker-alt brand-orange"></i>
                <span>
                  123 Renovation Ave
                  <br />
                  Your City, State 12345
                </span>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                <Linkedin className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Resilience Solutions. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:brand-orange text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:brand-orange text-sm transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:brand-orange text-sm transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
