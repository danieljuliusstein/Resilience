import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, DollarSign, User, Star, Quote, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useLocation } from "wouter";
import type { Project, Testimonial } from "@shared/schema";

// Portfolio project data with images
const portfolioProjects = [
  {
    id: 1,
    title: "Modern Kitchen Transformation",
    category: "Kitchen Remodel",
    location: "Johnson Family Home, Chicago",
    timeline: "6 weeks",
    description: "Complete kitchen renovation featuring custom cabinetry, quartz countertops, and modern appliances with smart home integration.",
    beforeImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1556909263-4e6b1b9cfa59?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1556909114-8b9cd5c1e5e4?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1556909263-19c5fe7c4e4d?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1556909114-ca5d25c08c62?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1556908153-14ce2dd8e413?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 2,
    title: "Luxury Master Bathroom",
    category: "Bathroom Renovation",
    location: "Wilson Residence, Seattle",
    timeline: "4 weeks",
    description: "Spa-like bathroom with walk-in shower, freestanding tub, and premium finishes including heated floors.",
    beforeImage: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1620626011805-8b6ea9c1e4ed?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1620626011805-8b6ea9c1e4ed?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 3,
    title: "Open Concept Living Space",
    category: "Home Addition",
    location: "Martinez Family, Denver",
    timeline: "12 weeks",
    description: "Removed walls to create flowing open concept design with vaulted ceilings and natural light throughout.",
    beforeImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 4,
    title: "Basement Entertainment Center",
    category: "Basement Finishing",
    location: "Davis Family, Portland",
    timeline: "8 weeks",
    description: "Transformed unfinished basement into entertainment space with bar, theater area, and guest room.",
    beforeImage: "https://images.unsplash.com/photo-1582582621439-8e139b77cf8d?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1582582621542-4e45b7c9e5e4?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1582582621439-8e139b77cf8d?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1582582621542-4e45b7c9e5e4?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 5,
    title: "Outdoor Living Oasis",
    category: "Deck & Patio",
    location: "Thompson Residence, Austin",
    timeline: "5 weeks", 
    description: "Custom deck with built-in seating, outdoor kitchen, and landscape integration for year-round entertaining.",
    beforeImage: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1600298882163-c03e3bb27ed3?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600298882163-c03e3bb27ed3?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 6,
    title: "Victorian Home Restoration",
    category: "Whole Home Renovation",
    location: "Chen Family, San Francisco",
    timeline: "16 weeks",
    description: "Historic home restoration preserving original character while adding modern conveniences and energy efficiency.",
    beforeImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1613977257454-0a99bd4d7b7e?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1613977257454-0a99bd4d7b7e?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 7,
    title: "Contemporary Guest Suite",
    category: "Home Addition",
    location: "Rodriguez Family, Miami",
    timeline: "10 weeks",
    description: "Added detached guest suite with kitchenette, full bathroom, and private entrance for visiting family.",
    beforeImage: "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 8,
    title: "Rustic Farmhouse Kitchen",
    category: "Kitchen Remodel",
    location: "Anderson Farm, Nashville",
    timeline: "7 weeks",
    description: "Farmhouse-style kitchen renovation with custom barn wood cabinets, farmhouse sink, and vintage lighting.",
    beforeImage: "https://images.unsplash.com/photo-1556909263-4e6b1b9cfa59?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1556908153-14ce2dd8e413?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1556909263-4e6b1b9cfa59?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1556908153-14ce2dd8e413?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1556909114-8b9cd5c1e5e4?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1556909263-19c5fe7c4e4d?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 9,
    title: "Modern Powder Room",
    category: "Bathroom Renovation",
    location: "Kim Residence, Los Angeles",
    timeline: "3 weeks",
    description: "Small powder room makeover with dramatic wallpaper, floating vanity, and statement lighting.",
    beforeImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1620626011805-8b6ea9c1e4ed?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 10,
    title: "Home Office & Library",
    category: "Room Conversion",
    location: "Taylor Home, Boston",
    timeline: "6 weeks",
    description: "Converted spare bedroom into elegant home office with built-in bookcases and reading nook.",
    beforeImage: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 11,
    title: "Luxury Walk-in Closet",
    category: "Room Conversion", 
    location: "Parker Estate, Phoenix",
    timeline: "4 weeks",
    description: "Master bedroom closet conversion with custom shelving, island seating, and LED lighting system.",
    beforeImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop&crop=center"
    ]
  },
  {
    id: 12,
    title: "Pool House & Bar",
    category: "Deck & Patio",
    location: "Williams Estate, San Diego",
    timeline: "14 weeks",
    description: "Custom pool house with outdoor bar, changing rooms, and entertainment area overlooking the pool.",
    beforeImage: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600&fit=crop&crop=center",
    afterImage: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop&crop=center",
    gallery: [
      "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600298882163-c03e3bb27ed3?w=800&h=600&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&crop=center"
    ]
  }
];

export default function Portfolio() {
  const [, navigate] = useLocation();
  const [selectedProject, setSelectedProject] = useState<typeof portfolioProjects[0] | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Kitchen Remodel", "Bathroom Renovation", "Home Addition", "Basement Finishing", "Deck & Patio", "Whole Home Renovation", "Room Conversion"];
  
  const filteredProjects = selectedCategory === "All" 
    ? portfolioProjects 
    : portfolioProjects.filter(project => project.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consultation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Quote on Request';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const openLightbox = (project: typeof portfolioProjects[0], imageIndex: number = 0) => {
    setSelectedProject(project);
    setSelectedImageIndex(imageIndex);
  };

  const closeLightbox = () => {
    setSelectedProject(null);
    setSelectedImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject) {
      const totalImages = selectedProject.gallery.length + 2; // +2 for before/after
      setSelectedImageIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const prevImage = () => {
    if (selectedProject) {
      const totalImages = selectedProject.gallery.length + 2; // +2 for before/after
      setSelectedImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  };

  const getCurrentImage = () => {
    if (!selectedProject) return "";
    if (selectedImageIndex === 0) return selectedProject.beforeImage;
    if (selectedImageIndex === 1) return selectedProject.afterImage;
    return selectedProject.gallery[selectedImageIndex - 2];
  };

  const getImageLabel = () => {
    if (selectedImageIndex === 0) return "Before";
    if (selectedImageIndex === 1) return "After";
    return `Gallery Image ${selectedImageIndex - 1}`;
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-brand-light">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <Button
            variant="ghost"
            className="brand-navy hover:bg-brand-orange hover:text-white mb-6 transition-all duration-300"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold brand-navy mb-6">
              Our Complete <span className="brand-orange">Portfolio</span>
            </h1>
            <p className="text-xl brand-gray max-w-3xl mx-auto leading-relaxed">
              Discover the transformative power of expert craftsmanship through our
              completed projects and satisfied customer testimonials.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Projects Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold brand-navy mb-4">
              Featured <span className="brand-orange">Projects</span>
            </h2>
            <p className="text-lg brand-gray max-w-2xl mx-auto">
              Explore our gallery of stunning transformations and see the quality craftsmanship that sets us apart.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-brand-orange text-white hover:bg-orange-600"
                    : "border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="text-center p-6 bg-brand-light rounded-2xl">
              <div className="text-3xl font-bold brand-navy mb-2">{filteredProjects.length}</div>
              <div className="text-sm brand-gray uppercase tracking-wide">Completed Projects</div>
            </div>
            <div className="text-center p-6 bg-brand-light rounded-2xl">
              <div className="text-3xl font-bold brand-orange mb-2">100%</div>
              <div className="text-sm brand-gray uppercase tracking-wide">Client Satisfaction</div>
            </div>
            <div className="text-center p-6 bg-brand-light rounded-2xl">
              <div className="text-3xl font-bold brand-navy mb-2">8</div>
              <div className="text-sm brand-gray uppercase tracking-wide">Service Categories</div>
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <Card key={project.id} className="group hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-brand-orange/30 overflow-hidden bg-white rounded-2xl">
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={project.afterImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading={index < 6 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-brand-orange/90 backdrop-blur-sm text-white font-medium border border-white/20">
                      {project.category}
                    </Badge>
                  </div>
                  
                  {/* Timeline Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-brand-navy/90 backdrop-blur-sm text-white font-medium border border-white/20">
                      {project.timeline}
                    </Badge>
                  </div>
                  
                  {/* Hover Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Button
                          size="lg"
                          className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white hover:text-brand-navy rounded-full mb-3"
                          onClick={() => openLightbox(project, 1)}
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          View Project
                        </Button>
                        <p className="text-sm opacity-90">Click to explore gallery</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <div className="flex items-center text-sm opacity-90 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {project.location}
                      </div>
                      <div className="flex items-center text-sm opacity-90">
                        <Calendar className="w-4 h-4 mr-1" />
                        {project.timeline}
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold brand-navy mb-2 group-hover:text-brand-orange transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="brand-gray text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-center p-4 bg-brand-light rounded-lg">
                      <span className="text-xs brand-gray uppercase tracking-wide block mb-1">Project Timeline</span>
                      <p className="font-semibold brand-navy text-lg">{project.timeline}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-all duration-300"
                      onClick={() => openLightbox(project, 0)}
                    >
                      Before & After
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-brand-orange hover:bg-orange-600 text-white transition-all duration-300 hover:scale-105"
                      onClick={() => openLightbox(project, 1)}
                    >
                      View Gallery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Projects Message */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-300 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium brand-gray mb-3">No projects found in this category</h3>
              <p className="brand-gray mb-6">Try selecting a different category to see our work.</p>
              <Button
                onClick={() => setSelectedCategory("All")}
                className="bg-brand-orange hover:bg-orange-600 text-white"
              >
                View All Projects
              </Button>
            </div>
          )}
        </section>



        {/* Call to Action */}
        <section className="mt-20 text-center bg-brand-navy rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy to-blue-900 opacity-90"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Start Your <span className="brand-orange">Dream Project?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join our growing list of satisfied customers and transform your space with 
              Resilience Solutions' expert craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/#contact")}
              >
                Get Your Free Quote
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-brand-navy px-8 py-4 rounded-full font-semibold transition-all duration-300"
                onClick={() => navigate("/#calculator")}
              >
                Calculate Estimate
              </Button>
            </div>
          </div>
        </section>

        {/* Lightbox Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-black/96 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative max-w-7xl max-h-full w-full">
              
              {/* Close Button */}
              <Button
                size="lg"
                variant="ghost"
                className="absolute top-6 right-6 z-20 text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>
              
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={getCurrentImage()}
                  alt={`${selectedProject.title} - ${getImageLabel()}`}
                  className="w-full max-h-[75vh] object-contain"
                />
                
                {/* Enhanced Navigation Arrows */}
                <Button
                  size="lg"
                  variant="ghost"
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 w-16 h-16 p-0 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-full border border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl group"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8 group-hover:w-9 group-hover:h-9 transition-all duration-300" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 w-16 h-16 p-0 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-full border border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl group"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8 group-hover:w-9 group-hover:h-9 transition-all duration-300" />
                </Button>
                
                {/* Enhanced Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                  <div className="flex justify-between items-end">
                    <div className="text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-brand-orange/90 text-white font-medium px-3 py-1">
                          {getImageLabel()}
                        </Badge>
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-3 py-1">
                          {selectedImageIndex + 1} of {selectedProject.gallery.length + 2}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-1">{selectedProject.title}</h3>
                      <p className="text-sm opacity-90">{selectedProject.category}</p>
                    </div>
                    
                    {/* Navigation Dots */}
                    <div className="flex gap-2">
                      {Array.from({ length: selectedProject.gallery.length + 2 }).map((_, index) => (
                        <button
                          key={index}
                          className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                            index === selectedImageIndex 
                              ? 'bg-brand-orange shadow-lg shadow-brand-orange/50' 
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Project Details */}
              <div className="mt-6 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-navy to-blue-800 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{selectedProject.title}</h3>
                  <p className="opacity-90 leading-relaxed">{selectedProject.description}</p>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-brand-light rounded-xl">
                      <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs brand-gray uppercase tracking-wide block mb-1">Timeline</span>
                      <p className="font-bold brand-navy text-lg">{selectedProject.timeline}</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-brand-navy rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs brand-gray uppercase tracking-wide block mb-1">Location</span>
                      <p className="font-semibold brand-navy text-lg">{selectedProject.location}</p>
                    </div>
                    
                    <div className="text-center p-4 bg-brand-light rounded-xl">
                      <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-3">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs brand-gray uppercase tracking-wide block mb-1">Category</span>
                      <p className="font-semibold brand-navy text-lg">{selectedProject.category}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100">
                    <Button
                      className="flex-1 bg-brand-orange hover:bg-orange-600 text-white transition-all duration-300 hover:scale-105"
                      onClick={() => navigate("/#contact")}
                    >
                      Get Similar Quote
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-300"
                      onClick={() => navigate("/#calculator")}
                    >
                      Calculate Cost
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}