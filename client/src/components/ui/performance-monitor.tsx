import { useState, useEffect } from "react";
import { getPerformanceMonitor } from "@/lib/performance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Download, Zap, Gauge } from "lucide-react";

interface PerformanceStats {
  lcp: number;
  fid: number;
  cls: number;
  imageLoadTime: number;
  bundleSize: number;
  cacheHitRate: number;
}

export function PerformanceMonitor({ 
  isVisible = false,
  onToggle 
}: { 
  isVisible?: boolean;
  onToggle?: () => void;
}) {
  const [stats, setStats] = useState<PerformanceStats>({
    lcp: 0,
    fid: 0,
    cls: 0,
    imageLoadTime: 0,
    bundleSize: 0,
    cacheHitRate: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const monitor = getPerformanceMonitor();
    const updateStats = () => {
      const metrics = monitor.getMetrics();
      const lcpMetrics = monitor.getMetricsByName('LCP');
      const fidMetrics = monitor.getMetricsByName('FID');
      const clsMetrics = monitor.getMetricsByName('CLS');
      const imageMetrics = monitor.getMetricsByName('image_load');

      setStats({
        lcp: lcpMetrics.length > 0 ? lcpMetrics[lcpMetrics.length - 1].value : 0,
        fid: fidMetrics.length > 0 ? fidMetrics[fidMetrics.length - 1].value : 0,
        cls: clsMetrics.length > 0 ? clsMetrics[clsMetrics.length - 1].value : 0,
        imageLoadTime: imageMetrics.length > 0 ? 
          imageMetrics.reduce((acc, m) => acc + m.value, 0) / imageMetrics.length : 0,
        bundleSize: 0, // Would be calculated from network metrics
        cacheHitRate: 85 // Example value
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return "text-green-600";
    if (value <= thresholds.poor) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return <Badge className="bg-green-100 text-green-800">Good</Badge>;
    if (value <= thresholds.poor) return <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  const exportReport = () => {
    const monitor = getPerformanceMonitor();
    const report = monitor.exportMetrics();
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-20 z-40 w-80">
      <Card className="bg-white/95 backdrop-blur-sm border shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance Monitor
            </CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {isExpanded ? '−' : '+'}
              </Button>
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Core Web Vitals - Always Visible */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">LCP</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${getScoreColor(stats.lcp, { good: 2500, poor: 4000 })}`}>
                  {stats.lcp.toFixed(0)}ms
                </span>
                {getScoreBadge(stats.lcp, { good: 2500, poor: 4000 })}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">FID</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${getScoreColor(stats.fid, { good: 100, poor: 300 })}`}>
                  {stats.fid.toFixed(0)}ms
                </span>
                {getScoreBadge(stats.fid, { good: 100, poor: 300 })}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">CLS</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${getScoreColor(stats.cls, { good: 0.1, poor: 0.25 })}`}>
                  {stats.cls.toFixed(3)}
                </span>
                {getScoreBadge(stats.cls, { good: 0.1, poor: 0.25 })}
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Avg Image Load</span>
                <span className="text-xs font-mono text-blue-600">
                  {stats.imageLoadTime.toFixed(0)}ms
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Cache Hit Rate</span>
                <div className="flex items-center gap-2">
                  <Progress value={stats.cacheHitRate} className="w-16 h-2" />
                  <span className="text-xs font-mono text-green-600">
                    {stats.cacheHitRate}%
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  onClick={exportReport}
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Global performance monitoring component for development
export function GlobalPerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development with keyboard shortcut
    if (process.env.NODE_ENV === 'development') {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ctrl/Cmd + Shift + P to toggle performance monitor
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
          e.preventDefault();
          setIsVisible(prev => !prev);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <PerformanceMonitor
      isVisible={isVisible}
      onToggle={() => setIsVisible(!isVisible)}
    />
  );
}