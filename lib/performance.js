// Performance monitoring and optimization utilities
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.init()
  }

  init() {
    if (typeof window !== 'undefined') {
      // Collect Core Web Vitals
      getCLS(this.onMetric.bind(this))
      getFID(this.onMetric.bind(this))
      getFCP(this.onMetric.bind(this))
      getLCP(this.onMetric.bind(this))
      getTTFB(this.onMetric.bind(this))

      // Monitor custom metrics
      this.monitorPageLoadTime()
      this.monitorMemoryUsage()
      this.monitorNetworkConditions()
    }
  }

  onMetric(metric) {
    this.metrics[metric.name] = metric

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendMetric(metric)
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metric: ${metric.name}`, metric)
    }
  }

  sendMetric(metric) {
    // Send to your analytics service (Google Analytics, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      })
    }
  }

  monitorPageLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.now()
      this.metrics.pageLoadTime = loadTime

      if (loadTime > 3000) {
        console.warn(`Slow page load: ${loadTime}ms`)
      }
    })
  }

  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory
        this.metrics.memoryUsage = {
          used: memInfo.usedJSHeapSize,
          total: memInfo.totalJSHeapSize,
          limit: memInfo.jsHeapSizeLimit
        }

        // Warn if memory usage is high
        if (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit > 0.8) {
          console.warn('High memory usage detected')
        }
      }, 30000) // Check every 30 seconds
    }
  }

  monitorNetworkConditions() {
    if ('connection' in navigator) {
      const connection = navigator.connection
      this.metrics.networkCondition = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      }

      // Adjust behavior for slow connections
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.enableLowBandwidthMode()
      }
    }
  }

  enableLowBandwidthMode() {
    // Reduce image quality, disable animations, etc.
    document.documentElement.classList.add('low-bandwidth')
  }

  getMetrics() {
    return this.metrics
  }
}

// Debounce function for performance
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

// Throttle function for performance
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Lazy loading hook for components
export const useLazyLoad = (callback, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          callback()
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [callback, options])

  return [ref, isIntersecting]
}

// Memoization utility
export const memoize = (fn, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map()

  return (...args) => {
    const key = getKey(...args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)
    cache.set(key, result)

    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    return result
  }
}

// Image optimization utility
export const optimizeImage = (src, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options

  // Use Next.js Image optimization or custom service
  const params = new URLSearchParams()
  if (width) params.append('w', width)
  if (height) params.append('h', height)
  params.append('q', quality)
  params.append('f', format)

  return `${src}?${params.toString()}`
}

// Bundle analyzer helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
      console.log('Bundle analysis available')
    })
  }
}

// Create performance monitor instance
const performanceMonitor = new PerformanceMonitor()

export default performanceMonitor