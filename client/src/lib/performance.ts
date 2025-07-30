// Performance monitoring and Core Web Vitals tracking

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta?: number;
  entries?: any[];
}

interface PerformanceBudget {
  maxImageSize: number; // in KB
  maxBundleSize: number; // in KB
  maxLCP: number; // in ms
  maxFID: number; // in ms
  maxCLS: number; // score
}

// Default performance budgets
const DEFAULT_BUDGETS: PerformanceBudget = {
  maxImageSize: 500, // 500KB
  maxBundleSize: 1000, // 1MB
  maxLCP: 2500, // 2.5 seconds
  maxFID: 100, // 100ms
  maxCLS: 0.1 // 0.1 score
};

class PerformanceMonitor {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private budgets: PerformanceBudget;
  private observer: PerformanceObserver | null = null;

  constructor(budgets: Partial<PerformanceBudget> = {}) {
    this.budgets = { ...DEFAULT_BUDGETS, ...budgets };
    this.setupPerformanceObserver();
    this.setupWebVitalsTracking();
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.handlePerformanceEntry(entry);
        });
      });

      // Observe different entry types
      try {
        this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] });
      } catch (e) {
        // Fallback for older browsers
        console.warn('Performance Observer not fully supported');
      }
    }
  }

  private setupWebVitalsTracking() {
    // Track LCP (Largest Contentful Paint)
    this.trackLCP();
    
    // Track FID (First Input Delay)
    this.trackFID();
    
    // Track CLS (Cumulative Layout Shift)
    this.trackCLS();
    
    // Track custom metrics
    this.trackImageLoad();
  }

  private trackLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        const metric: WebVitalsMetric = {
          name: 'LCP',
          value: lastEntry.startTime,
          id: this.generateId(),
          entries: [lastEntry]
        };
        
        this.reportMetric(metric);
        this.checkBudget('LCP', metric.value, this.budgets.maxLCP);
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP tracking not supported');
      }
    }
  }

  private trackFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          const metric: WebVitalsMetric = {
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            id: this.generateId(),
            entries: [entry]
          };
          
          this.reportMetric(metric);
          this.checkBudget('FID', metric.value, this.budgets.maxFID);
        });
      });
      
      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID tracking not supported');
      }
    }
  }

  private trackCLS() {
    let clsValue = 0;
    let clsEntries: any[] = [];

    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        });
        
        const metric: WebVitalsMetric = {
          name: 'CLS',
          value: clsValue,
          id: this.generateId(),
          entries: clsEntries
        };
        
        this.reportMetric(metric);
        this.checkBudget('CLS', metric.value, this.budgets.maxCLS);
      });
      
      try {
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS tracking not supported');
      }
    }
  }

  private trackImageLoad() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.initiatorType === 'img' || entry.name.includes('images.unsplash.com')) {
            const metric: WebVitalsMetric = {
              name: 'image_load',
              value: entry.responseEnd - entry.startTime,
              id: this.generateId(),
              entries: [entry]
            };
            
            this.reportMetric(metric);
            
            // Check image size budget
            if (entry.transferSize) {
              const sizeKB = entry.transferSize / 1024;
              this.checkBudget('Image Size', sizeKB, this.budgets.maxImageSize);
            }
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('Resource timing not supported');
      }
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry) {
    // Custom handling for different entry types
    if (entry.entryType === 'navigation') {
      this.trackNavigationTiming(entry as PerformanceNavigationTiming);
    } else if (entry.entryType === 'resource') {
      this.trackResourceTiming(entry as PerformanceResourceTiming);
    }
  }

  private trackNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics = {
      'DNS Lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'TCP Connection': entry.connectEnd - entry.connectStart,
      'Request': entry.responseStart - entry.requestStart,
      'Response': entry.responseEnd - entry.responseStart,
      'DOM Processing': entry.domComplete - entry.domContentLoadedEventStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      const metric: WebVitalsMetric = {
        name,
        value,
        id: this.generateId()
      };
      this.reportMetric(metric);
    });
  }

  private trackResourceTiming(entry: PerformanceResourceTiming) {
    // Track only image resources for detailed analysis
    if (entry.initiatorType === 'img' || entry.name.includes('image')) {
      const metric: WebVitalsMetric = {
        name: 'resource_timing',
        value: entry.responseEnd - entry.startTime,
        id: this.generateId(),
        entries: [entry]
      };
      this.reportMetric(metric);
    }
  }

  private reportMetric(metric: WebVitalsMetric) {
    this.metrics.set(metric.id, metric);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vital', {
        custom_parameter_1: metric.name,
        custom_parameter_2: metric.value,
        custom_parameter_3: metric.id,
      });
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${metric.name}:`, metric.value, metric);
    }
  }

  private checkBudget(name: string, value: number, budget: number) {
    if (value > budget) {
      console.warn(`Performance Budget Exceeded - ${name}: ${value} > ${budget}`);
      
      // Report budget violation
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_budget_exceeded', {
          custom_parameter_1: name,
          custom_parameter_2: value,
          custom_parameter_3: budget,
        });
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods
  public getMetrics(): Map<string, WebVitalsMetric> {
    return this.metrics;
  }

  public getMetricsByName(name: string): WebVitalsMetric[] {
    return Array.from(this.metrics.values()).filter(metric => metric.name === name);
  }

  public updateBudgets(newBudgets: Partial<PerformanceBudget>) {
    this.budgets = { ...this.budgets, ...newBudgets };
  }

  public exportMetrics(): any {
    const metricsArray = Array.from(this.metrics.entries()).map(([metricId, metric]) => ({
      id: metricId,
      ...metric
    }));
    
    return {
      metrics: metricsArray,
      budgets: this.budgets,
      timestamp: Date.now()
    };
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export const getPerformanceMonitor = (budgets?: Partial<PerformanceBudget>): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor(budgets);
  }
  return performanceMonitor;
};

// Utility functions
export const trackImageLoadTime = (imageUrl: string, startTime: number) => {
  const loadTime = Date.now() - startTime;
  const monitor = getPerformanceMonitor();
  
  const metric: WebVitalsMetric = {
    name: 'custom_image_load',
    value: loadTime,
    id: `img-${Date.now()}`,
  };
  
  (monitor as any).reportMetric(metric);
  return loadTime;
};

export const preloadCriticalImages = (imageUrls: string[]) => {
  imageUrls.forEach((url, index) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    
    // Add priority hint for first few images
    if (index < 3) {
      link.setAttribute('fetchpriority', 'high');
    }
    
    document.head.appendChild(link);
  });
};