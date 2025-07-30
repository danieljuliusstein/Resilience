import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Lightbox } from "@/components/ui/lightbox";
import { ImageSkeleton } from "@/components/ui/skeleton";
import { Images, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getPerformanceMonitor, preloadCriticalImages } from "@/lib/performance";
import { cn } from "@/lib/utils";

const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    alt: "Modern kitchen renovation",
    title: "Modern Kitchen Remodel",
    description: "Complete transformation with custom cabinets",
    category: "kitchen"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    alt: "Luxury bathroom renovation",
    title: "Spa-Style Bathroom",
    description: "Luxury finishes and modern fixtures",
    category: "bathroom"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    alt: "Contemporary living room design",
    title: "Living Room Makeover",
    description: "Custom accent wall and lighting design",
    category: "living"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    alt: "Home exterior painting project",
    title: "Exterior Transformation",
    description: "Professional painting and landscaping",
    category: "exterior"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    alt: "Master bedroom renovation",
    title: "Master Bedroom Suite",
    description: "Complete bedroom and closet renovation",
    category: "living"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1543138203-e3353322149e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Initialize performance monitoring
  const performanceMonitor = getPerformanceMonitor({
    maxImageSize: 500, // 500KB
    maxLCP: 2500, // 2.5 seconds
  });

  // Preload first 3 critical images
  useMemo(() => {
    const criticalImages = galleryImages.slice(0, 3).map(img => 
      `${img.src}?auto=format&fit=crop&crop=center&q=80&fm=webp`
    );
    preloadCriticalImages(criticalImages);
  }, []);

  const filteredImages = useMemo(() => {
    return galleryImages.filter(image => {
      const matchesFilter = activeFilter === "all" || image.category === activeFilter;
      const matchesSearch = searchQuery === "" || 
        image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleImagesLoaded = () => {
    setTimeout(() => setImagesLoading(false), 500);
  };

  // Carousel navigation functions
  const scrollToSlide = (slideIndex: number) => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const slideWidth = container.offsetWidth;
    const maxSlide = Math.max(0, filteredImages.length - Math.floor(slideWidth / 336)); // 336px per card with margin
    
    const targetSlide = Math.max(0, Math.min(slideIndex, maxSlide));
    setCurrentSlide(targetSlide);
    
    container.scrollTo({
      left: targetSlide * 336, // 320px card + 16px margin
      behavior: 'smooth'
    });
  };

  const scrollLeft = () => {
    scrollToSlide(currentSlide - 1);
  };

  const scrollRight = () => {
    scrollToSlide(currentSlide + 1);
  };

  // Update scroll button states
  const updateScrollButtons = () => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const maxScroll = container.scrollWidth - container.offsetWidth;
    
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < maxScroll - 10); // 10px tolerance
  };

  // Handle scroll events
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      updateScrollButtons();
      
      // Update current slide based on scroll position
      const slideWidth = 336; // 320px card + 16px margin
      const newSlide = Math.round(container.scrollLeft / slideWidth);
      setCurrentSlide(newSlide);
    };

    container.addEventListener('scroll', handleScroll);
    updateScrollButtons(); // Initial state

    return () => container.removeEventListener('scroll', handleScroll);
  }, [filteredImages.length]);

  // Handle touch/swipe for mobile
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    let startX: number | null = null;
    let scrollStart: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      scrollStart = container.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startX === null || scrollStart === null) return;
      
      const deltaX = startX - e.touches[0].clientX;
      container.scrollLeft = scrollStart + deltaX;
    };

    const handleTouchEnd = () => {
      startX = null;
      scrollStart = null;
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

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

        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-8 lg:mb-12">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            />
          </div>

          {/* Gallery Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
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
        </div>

        {/* Project Gallery Carousel */}
        <div className="relative">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Images className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          ) : (
            <>
              {/* Carousel Container */}
              <div
                ref={carouselRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative flex-shrink-0 w-80 h-64 overflow-hidden rounded-2xl shadow-lg group cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] mx-2"
                    onClick={() => handleImageClick(index)}
                  >
                    {imagesLoading ? (
                      <ImageSkeleton className="w-full h-full" aspectRatio="5/4" />
                    ) : (
                      <OptimizedImage
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading={index < 3 ? "eager" : "lazy"}
                        sizes="320px"
                        priority={index < 3}
                        enableModernFormats={true}
                        retryCount={3}
                        onLoad={index === filteredImages.length - 1 ? handleImagesLoaded : undefined}
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity p-4">
                        <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                        <p className="text-sm">{image.description}</p>
                        <div className="mt-3">
                          <span className="inline-block px-3 py-1 bg-brand-orange/90 text-white text-xs rounded-full">
                            {image.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Click to view indicator */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <Search className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {filteredImages.length > 3 && (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className={cn(
                      "absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 p-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-full border border-gray-200 transition-all duration-300 hover:bg-white hover:scale-110 z-10",
                      !canScrollLeft && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className={cn(
                      "absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 p-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-full border border-gray-200 transition-all duration-300 hover:bg-white hover:scale-110 z-10",
                      !canScrollRight && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </Button>
                </>
              )}

              {/* Scroll Indicators */}
              {filteredImages.length > 3 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {Array.from({ length: Math.ceil(filteredImages.length / 3) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToSlide(index * 3)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        Math.floor(currentSlide / 3) === index
                          ? "bg-brand-orange w-6"
                          : "bg-gray-300 hover:bg-gray-400"
                      )}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Lightbox */}
        <Lightbox
          images={filteredImages.map(img => ({
            src: img.src,
            alt: img.alt,
            title: img.title,
            description: img.description,
            category: img.category
          }))}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />

        {/* Navigation hint for mobile */}
        {filteredImages.length > 3 && (
          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              Swipe or use arrow keys to browse more projects
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
