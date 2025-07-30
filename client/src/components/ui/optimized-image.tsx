import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  sizes?: string;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  retryCount?: number;
  enableModernFormats?: boolean;
}

// Performance monitoring for Core Web Vitals
const reportWebVitals = (metric: any) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      custom_parameter_1: metric.value,
      custom_parameter_2: metric.id,
      custom_parameter_3: metric.name,
    });
  }
};

// Image format detection
const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

const supportsAVIF = () => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

export function OptimizedImage({
  src,
  alt,
  className,
  loading = "lazy",
  sizes = "100vw",
  priority = false,
  placeholder,
  onLoad,
  onError,
  retryCount = 3,
  enableModernFormats = true,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentRetry, setCurrentRetry] = useState(0);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pictureRef = useRef<HTMLDivElement>(null);

  // Generate responsive image URLs with modern formats
  const generateSrcSet = (url: string, format: 'webp' | 'avif' | 'jpeg' = 'jpeg') => {
    const sizes = [320, 640, 1280, 1920];
    const formatParam = format !== 'jpeg' ? `&fm=${format}` : '';
    return sizes
      .map(size => `${url}?w=${size}&h=${Math.round(size * 0.75)}&fit=crop&crop=center&auto=format&q=80${formatParam} ${size}w`)
      .join(", ");
  };

  // Generate blur placeholder
  const generatePlaceholder = (url: string) => {
    return `${url}?w=20&h=15&fit=crop&crop=center&auto=format&q=20&blur=20`;
  };

  // Performance monitoring
  const trackImageLoad = (loadTime: number, success: boolean) => {
    if (typeof window !== 'undefined') {
      // Track LCP for above-the-fold images
      if (priority) {
        reportWebVitals({
          name: 'LCP',
          value: loadTime,
          id: `img-${src}`,
        });
      }
      
      // Track general image performance
      reportWebVitals({
        name: 'image_load_time',
        value: loadTime,
        id: `img-load-${success ? 'success' : 'failure'}`,
      });
    }
  };

  // Intersection Observer for lazy loading with smart preloading
  useEffect(() => {
    if (priority) {
      setLoadStartTime(Date.now());
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setLoadStartTime(Date.now());
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Increased for better UX
        threshold: 0.1,
      }
    );

    if (pictureRef.current) {
      observer.observe(pictureRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Preload critical images
  useEffect(() => {
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if (enableModernFormats && supportsWebP()) {
        link.href = `${src}?auto=format&fm=webp&q=80`;
      }
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [src, priority, enableModernFormats]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (loadStartTime) {
      const loadTime = Date.now() - loadStartTime;
      trackImageLoad(loadTime, true);
    }
    onLoad?.();
  };

  const handleError = () => {
    if (currentRetry < retryCount) {
      // Retry with exponential backoff
      setTimeout(() => {
        setCurrentRetry(prev => prev + 1);
        setHasError(false);
      }, Math.pow(2, currentRetry) * 1000);
    } else {
      setHasError(true);
      if (loadStartTime) {
        const loadTime = Date.now() - loadStartTime;
        trackImageLoad(loadTime, false);
      }
      onError?.();
    }
  };

  if (hasError) {
    return (
      <div className={cn("bg-gray-200 flex items-center justify-center", className)}>
        <div className="text-gray-500 text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Image failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pictureRef} className={cn("relative overflow-hidden", className)}>
      {/* Blur placeholder with auto-generated low-quality image */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${placeholder || generatePlaceholder(src)})`,
          }}
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !placeholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
        </div>
      )}

      {/* Modern format image with fallbacks */}
      {isInView && enableModernFormats ? (
        <picture>
          {/* AVIF for modern browsers */}
          {supportsAVIF() && (
            <source
              srcSet={generateSrcSet(src, 'avif')}
              sizes={sizes}
              type="image/avif"
            />
          )}
          {/* WebP for supported browsers */}
          {supportsWebP() && (
            <source
              srcSet={generateSrcSet(src, 'webp')}
              sizes={sizes}
              type="image/webp"
            />
          )}
          {/* JPEG fallback */}
          <img
            ref={imgRef}
            src={`${src}?auto=format&fit=crop&crop=center&q=80`}
            alt={alt}
            loading={loading}
            sizes={sizes}
            srcSet={generateSrcSet(src)}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      ) : isInView ? (
        <img
          ref={imgRef}
          src={`${src}?auto=format&fit=crop&crop=center&q=80`}
          alt={alt}
          loading={loading}
          sizes={sizes}
          srcSet={generateSrcSet(src)}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : null}

      {/* Retry indicator */}
      {currentRetry > 0 && currentRetry < retryCount && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Retrying... ({currentRetry}/{retryCount})
        </div>
      )}
    </div>
  );
}