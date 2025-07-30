import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, PaintBucket, Wrench, Palette, Check } from "lucide-react";

const services = [
  {
    id: "remodeling",
    icon: Home,
    title: "Full Remodeling",
    description: "Complete home transformation",
    features: [
      "Kitchen & Bathroom",
      "Flooring & Fixtures", 
      "Electrical & Plumbing",
      "Design Consultation"
    ],
    price: "$15K",
    timeline: "4-8 weeks",
    categories: ["premium"]
  },
  {
    id: "painting",
    icon: PaintBucket,
    title: "Professional Painting",
    description: "Interior & exterior painting",
    features: [
      "Premium Paint & Materials",
      "Surface Preparation",
      "Color Consultation", 
      "Clean-up Included"
    ],
    price: "$2K",
    timeline: "3-5 days",
    categories: ["budget", "quick"]
  },
  {
    id: "drywall",
    icon: Wrench,
    title: "Drywall Repair",
    description: "Expert wall restoration",
    features: [
      "Hole & Crack Repair",
      "Texture Matching",
      "Priming & Finishing",
      "Same-Day Service"
    ],
    price: "$500",
    timeline: "1-2 days", 
    categories: ["budget"]
  },
  {
    id: "design",
    icon: Palette,
    title: "Interior Design",
    description: "Complete design makeover",
    features: [
      "3D Design Mockups",
      "Furniture Selection",
      "Color & Material Guide",
      "Project Management"
    ],
    price: "$5K",
    timeline: "2-4 weeks",
    categories: ["premium"]
  }
];

const filters = [
  { id: "all", label: "All Services" },
  { id: "budget", label: "Budget Friendly" },
  { id: "premium", label: "Premium Services" },
  { id: "quick", label: "Quick Turnaround" }
];

export default function ServiceComparison() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredServices = services.filter(service => 
    activeFilter === "all" || service.categories.includes(activeFilter)
  );

  const scrollToContact = () => {
    const section = document.getElementById("contact");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="services" className="py-20 bg-brand-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold brand-navy mb-6">
            Compare Our <span className="brand-orange">Services</span>
          </h2>
          <p className="text-xl brand-gray max-w-3xl mx-auto">
            Choose the perfect service package for your home transformation. Our
            expert team delivers exceptional results across all renovation needs.
          </p>
        </div>

        {/* Filter System */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                variant="outline"
                className={`px-6 py-3 rounded-full border-2 font-medium transition-all ${
                  activeFilter === filter.id
                    ? "filter-active border-brand-orange bg-brand-orange text-white"
                    : "border-brand-gray brand-gray hover:border-brand-orange hover:brand-orange"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredServices.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={service.id}
                className="service-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="text-white h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold brand-navy">
                      {service.title}
                    </h3>
                    <p className="brand-gray mt-2">{service.description}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="brand-dark">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold brand-navy mb-2">
                      Starting at{" "}
                      <span className="brand-orange">{service.price}</span>
                    </div>
                    <div className="text-sm brand-gray mb-6">
                      Timeline: {service.timeline}
                    </div>
                    <Button
                      onClick={scrollToContact}
                      className="w-full bg-brand-orange text-white hover:bg-orange-600"
                    >
                      Get Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
