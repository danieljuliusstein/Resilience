import { Button } from "@/components/ui/button";
import { Calculator, Play, Star, Award, Users, ChevronDown } from "lucide-react";

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center"
    >
      {/* Optimized Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80')",
        }}
      />
      
      {/* Preload critical background image */}
      <link
        rel="preload"
        as="image"
        href="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80"
      />
      
      <div className="absolute inset-0 hero-overlay" />

      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Transform Your{" "}
          <span className="brand-orange">Dream Home</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200 font-light max-w-2xl mx-auto leading-relaxed">
          Professional remodeling, painting, drywall, and interior design
          services that bring your vision to life with unmatched craftsmanship.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => scrollToSection("calculator")}
            className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Calculator className="mr-2 h-5 w-5" />
            Get Free Estimate
          </Button>
          <Button
            onClick={() => scrollToSection("gallery")}
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-brand-navy px-8 py-4 text-lg font-semibold bg-transparent"
          >
            <Play className="mr-2 h-5 w-5" />
            View Our Work
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 lg:mt-12 flex flex-wrap justify-center items-center gap-4 lg:gap-8 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>4.9/5 Customer Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 brand-orange" />
            <span>Licensed & Insured</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            <span>500+ Happy Customers</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce-gentle">
        <ChevronDown className="h-8 w-8" />
      </div>
    </section>
  );
}
