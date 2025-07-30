// Advanced image optimization utilities

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  blur?: number;
  progressive?: boolean;
}

export interface ResponsiveImageSizes {
  xs: number;  // 320px
  sm: number;  // 640px
  md: number;  // 768px
  lg: number;  // 1024px
  xl: number;  // 1280px
  xxl: number; // 1920px
}

const DEFAULT_SIZES: ResponsiveImageSizes = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1920
};

// Generate optimized URL for Unsplash images
export function generateOptimizedUrl(
  baseUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    quality = 80,
    format = 'auto',
    width,
    height,
    crop = 'center',
    blur,
    progressive = true
  } = options;

  const params = new URLSearchParams();
  
  // Auto format detection
  params.set('auto', 'format');
  
  // Quality
  params.set('q', quality.toString());
  
  // Dimensions
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  
  // Cropping
  params.set('fit', 'crop');
  params.set('crop', crop);
  
  // Format (if not auto)
  if (format !== 'auto') {
    params.set('fm', format);
  }
  
  // Blur effect
  if (blur) {
    params.set('blur', blur.toString());
  }
  
  // Progressive JPEG
  if (progressive && (format === 'jpeg' || format === 'auto')) {
    params.set('progressive', 'true');
  }

  return `${baseUrl}?${params.toString()}`;
}

// Generate responsive srcSet
export function generateResponsiveSrcSet(
  baseUrl: string,
  sizes: Partial<ResponsiveImageSizes> = {},
  options: ImageOptimizationOptions = {}
): string {
  const finalSizes = { ...DEFAULT_SIZES, ...sizes };
  
  return Object.entries(finalSizes)
    .map(([breakpoint, width]) => {
      const url = generateOptimizedUrl(baseUrl, {
        ...options,
        width,
        height: options.height ? Math.round((options.height * width) / (options.width || width)) : undefined
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

// Generate blur placeholder
export function generateBlurPlaceholder(
  baseUrl: string,
  width = 20,
  height = 15
): string {
  return generateOptimizedUrl(baseUrl, {
    width,
    height,
    quality: 20,
    blur: 20,
    crop: 'center'
  });
}

// Preload critical images
export function preloadImage(
  url: string,
  options: {
    priority?: 'high' | 'low';
    format?: 'webp' | 'avif' | 'jpeg';
    sizes?: string;
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    
    if (options.sizes) {
      link.setAttribute('imagesizes', options.sizes);
    }
    
    if (options.priority) {
      link.setAttribute('fetchpriority', options.priority);
    }
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    
    document.head.appendChild(link);
  });
}

// Optimize image for different formats with fallbacks
export function generatePictureSourceSet(
  baseUrl: string,
  options: ImageOptimizationOptions = {}
): {
  avif?: string;
  webp?: string;
  jpeg: string;
} {
  const sources: { avif?: string; webp?: string; jpeg: string } = {
    jpeg: generateOptimizedUrl(baseUrl, { ...options, format: 'jpeg' })
  };

  // Generate WebP version
  if (supportsWebP()) {
    sources.webp = generateOptimizedUrl(baseUrl, { ...options, format: 'webp' });
  }

  // Generate AVIF version
  if (supportsAVIF()) {
    sources.avif = generateOptimizedUrl(baseUrl, { ...options, format: 'avif' });
  }

  return sources;
}

// Format support detection
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for WebP support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

export function supportsAVIF(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for AVIF support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
}

// Calculate optimal image dimensions based on container and DPR
export function calculateOptimalDimensions(
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio = 1
): { width: number; height: number } {
  const dpr = Math.min(devicePixelRatio, 2); // Cap at 2x for performance
  
  return {
    width: Math.ceil(containerWidth * dpr),
    height: Math.ceil(containerHeight * dpr)
  };
}

// Image loading strategies
export const LOADING_STRATEGIES = {
  EAGER: 'eager' as const,
  LAZY: 'lazy' as const,
  AUTO: 'auto' as const
};

export function getOptimalLoadingStrategy(
  imageIndex: number,
  isAboveFold: boolean,
  totalImages: number
): 'eager' | 'lazy' {
  // Load first 3 images eagerly, especially if above the fold
  if (imageIndex < 3 || isAboveFold) {
    return LOADING_STRATEGIES.EAGER;
  }
  
  return LOADING_STRATEGIES.LAZY;
}

// Performance budgets for images
export const IMAGE_PERFORMANCE_BUDGETS = {
  HERO_IMAGE_MAX_SIZE: 500 * 1024,      // 500KB
  GALLERY_IMAGE_MAX_SIZE: 300 * 1024,   // 300KB
  THUMBNAIL_MAX_SIZE: 50 * 1024,        // 50KB
  PLACEHOLDER_MAX_SIZE: 5 * 1024,       // 5KB
  MAX_CONCURRENT_LOADS: 6,              // Concurrent image loads
  LAZY_LOAD_THRESHOLD: '100px',         // Intersection observer margin
} as const;

// Compress image client-side (for uploads)
export function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Image error handling and retry logic
export class ImageLoader {
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(
    private url: string,
    private options: { maxRetries?: number; retryDelay?: number } = {}
  ) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  async load(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(img);
      };
      
      img.onerror = () => {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          setTimeout(() => {
            this.load().then(resolve).catch(reject);
          }, this.retryDelay * Math.pow(2, this.retryCount - 1)); // Exponential backoff
        } else {
          reject(new Error(`Failed to load image after ${this.maxRetries} retries: ${this.url}`));
        }
      };
      
      img.src = this.url;
    });
  }
}