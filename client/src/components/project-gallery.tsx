import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Images } from "lucide-react";

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    alt: "Modern kitchen renovation",
    title: "Modern Kitchen Remodel",
    description: "Complete transformation with custom cabinets",
    category: "kitchen"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    alt: "Luxury bathroom renovation",
    title: "Spa-Style Bathroom",
    description: "Luxury finishes and modern fixtures",
    category: "bathroom"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    alt: "Contemporary living room design",
    title: "Living Room Makeover",
    description: "Custom accent wall and lighting design",
    category: "living"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    alt: "Home exterior painting project",
    title: "Exterior Transformation",
    description: "Professional painting and landscaping",
    category: "exterior"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    alt: "Master bedroom renovation",
    title: "Master Bedroom Suite",
    description: "Complete bedroom and closet renovation",
    category: "living"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1543138203-e3353322149e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    alt: "Chef's kitchen renovation",
    title: "Chef's Kitchen",
    description: "Professional-grade appliances and custom island",
    category: "kitchen"
  }
];

const filterTabs = [
  { id: "all", label: "All Projects" },
  { id: "kitchen", label: "Kitchens" },
  { id: "bathroom", label: "Bathrooms" },
  { id: "living", label: "Living Rooms" },
  { id: "exterior", label: "Exterior" }
];

export default function ProjectGallery() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredImages = galleryImages.filter(image =>
    activeFilter === "all" || image.category === activeFilter
  );

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold brand-navy mb-6">
            Our <span className="brand-orange">Portfolio</span>
          </h2>
          <p className="text-xl brand-gray max-w-3xl mx-auto">
            Discover the transformative power of expert craftsmanship through our
            completed projects.
          </p>
        </div>

        {/* Gallery Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 lg:mb-12">
          {filterTabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                activeFilter === tab.id
                  ? "bg-brand-orange text-white"
                  : "bg-gray-200 brand-dark hover:bg-brand-orange hover:text-white"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Project Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 project-gallery">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative overflow-hidden rounded-2xl shadow-lg group"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity p-4">
                  <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                  <p className="text-sm">{image.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="brand" size="lg" className="px-8 py-4">
            <Images className="mr-2 h-5 w-5" />
            View Complete Portfolio
          </Button>
        </div>
      </div>
    </section>
  );
}
