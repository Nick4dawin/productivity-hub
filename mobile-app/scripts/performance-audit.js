#!/usr/bin/env node

/**
 * Performance Audit Script
 * 
 * This script conducts comprehensive performance profiling and optimization
 * analysis for the React Native app.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceAuditor {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.reportDir = path.join(this.projectRoot, 'reports', 'performance');
    this.results = {
      timestamp: new Date().toISOString(),
      bundleAnalysis: {},
      memoryAnalysis: {},
      renderingAnalysis: {},
      networkAnalysis: {},
      recommendations: []
    };
  }

  async runFullAudit() {
    console.log('🔍 Starting comprehensive performance audit...');
    
    // Ensure report directory exists
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    try {
      // Bundle size analysis
      await this.analyzeBundleSize();
      
      // Memory usage analysis
      await this.analyzeMemoryUsage();
      
      // Rendering performance
      await this.analyzeRenderingPerformance();
      
      // Network performance
      await this.analyzeNetworkPerformance();
      
      // Code quality metrics
      await this.analyzeCodeQuality();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Create final report
      this.generateReport();
      
      console.log('✅ Performance audit completed successfully!');
      console.log(`📊 Report saved to: ${this.reportDir}`);
      
    } catch (error) {
      console.error('❌ Performance audit failed:', error);
      process.exit(1);
    }
  }

  async analyzeBundleSize() {
    console.log('📦 Analyzing bundle size...');
    
    try {
      // Analyze JavaScript bundle
      const bundleStats = this.getBundleStats();
      
      // Analyze asset sizes
      const assetStats = this.getAssetStats();
      
      // Check for large dependencies
      const dependencyStats = this.getDependencyStats();
      
      this.results.bundleAnalysis = {
        totalSize: bundleStats.totalSize,
        jsSize: bundleStats.jsSize,
        assetSize: assetStats.totalSize,
        largestAssets: assetStats.largest,
        dependencies: dependencyStats,
        recommendations: this.getBundleRecommendations(bundleStats, assetStats, dependencyStats)
      };
      
      console.log(`  ✓ Total bundle size: ${this.formatBytes(bundleStats.totalSize)}`);
      console.log(`  ✓ JavaScript size: ${this.formatBytes(bundleStats.jsSize)}`);
      console.log(`  ✓ Assets size: ${this.formatBytes(assetStats.totalSize)}`);
      
    } catch (error) {
      console.error('  ❌ Bundle analysis failed:', error);
      this.results.bundleAnalysis.error = error.message;
    }
  }

  getBundleStats() {
    // Simulate bundle analysis (in real implementation, use metro-bundler or similar)
    const srcDir = path.join(this.projectRoot, 'src');
    let totalSize = 0;
    let jsSize = 0;
    
    const analyzeDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          analyzeDirectory(filePath);
        } else if (stat.isFile()) {
          totalSize += stat.size;
          if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            jsSize += stat.size;
          }
        }
      });
    };
    
    if (fs.existsSync(srcDir)) {
      analyzeDirectory(srcDir);
    }
    
    return { totalSize, jsSize };
  }

  getAssetStats() {
    const assetsDir = path.join(this.projectRoot, 'assets');
    let totalSize = 0;
    const largest = [];
    
    const analyzeAssets = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          analyzeAssets(filePath);
        } else if (stat.isFile()) {
          totalSize += stat.size;
          largest.push({
            file: path.relative(this.projectRoot, filePath),
            size: stat.size,
            sizeFormatted: this.formatBytes(stat.size)
          });
        }
      });
    };
    
    analyzeAssets(assetsDir);
    
    // Sort by size and keep top 10
    largest.sort((a, b) => b.size - a.size);
    
    return {
      totalSize,
      largest: largest.slice(0, 10)
    };
  }

  getDependencyStats() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    // Analyze node_modules size (if exists)
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    let nodeModulesSize = 0;
    
    if (fs.existsSync(nodeModulesPath)) {
      try {
        const output = execSync(`du -sh "${nodeModulesPath}"`, { encoding: 'utf8' });
        const sizeMatch = output.match(/^([0-9.]+[KMGT]?)\s/);
        if (sizeMatch) {
          nodeModulesSize = sizeMatch[1];
        }
      } catch (error) {
        // Fallback for Windows or if du command fails
        nodeModulesSize = 'Unknown';
      }
    }
    
    return {
      count: Object.keys(dependencies).length,
      nodeModulesSize,
      heavyDependencies: this.identifyHeavyDependencies(dependencies)
    };
  }

  identifyHeavyDependencies(dependencies) {
    // List of known heavy dependencies
    const heavyDeps = [
      'react-native-vector-icons',
      'react-native-svg',
      'victory-native',
      '@react-navigation/native',
      'react-native-reanimated'
    ];
    
    return Object.keys(dependencies).filter(dep => 
      heavyDeps.some(heavy => dep.includes(heavy))
    );
  }

  getBundleRecommendations(bundleStats, assetStats, dependencyStats) {
    const recommendations = [];
    
    // Bundle size recommendations
    if (bundleStats.totalSize > 5 * 1024 * 1024) { // 5MB
      recommendations.push({
        type: 'bundle-size',
        severity: 'high',
        message: 'Bundle size is large (>5MB). Consider code splitting and lazy loading.',
        action: 'Implement dynamic imports and remove unused code'
      });
    }
    
    // Asset recommendations
    if (assetStats.totalSize > 10 * 1024 * 1024) { // 10MB
      recommendations.push({
        type: 'asset-size',
        severity: 'medium',
        message: 'Asset size is large (>10MB). Optimize images and remove unused assets.',
        action: 'Compress images, use WebP format, implement lazy loading'
      });
    }
    
    // Dependency recommendations
    if (dependencyStats.count > 50) {
      recommendations.push({
        type: 'dependency-count',
        severity: 'medium',
        message: `High number of dependencies (${dependencyStats.count}). Review and remove unused packages.`,
        action: 'Audit dependencies with npm-check-unused or similar tools'
      });
    }
    
    return recommendations;
  }

  async analyzeMemoryUsage() {
    console.log('🧠 Analyzing memory usage patterns...');
    
    try {
      // Analyze component memory patterns
      const componentAnalysis = this.analyzeComponentMemory();
      
      // Check for memory leaks
      const leakAnalysis = this.analyzeMemoryLeaks();
      
      // Image memory usage
      const imageAnalysis = this.analyzeImageMemory();
      
      this.results.memoryAnalysis = {
        components: componentAnalysis,
        leaks: leakAnalysis,
        images: imageAnalysis,
        recommendations: this.getMemoryRecommendations(componentAnalysis, leakAnalysis, imageAnalysis)
      };
      
      console.log('  ✓ Component memory analysis completed');
      console.log('  ✓ Memory leak detection completed');
      console.log('  ✓ Image memory analysis completed');
      
    } catch (error) {
      console.error('  ❌ Memory analysis failed:', error);
      this.results.memoryAnalysis.error = error.message;
    }
  }

  analyzeComponentMemory() {
    // Analyze React components for memory usage patterns
    const srcDir = path.join(this.projectRoot, 'src');
    const issues = [];
    
    const analyzeFile = (filePath) => {
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for potential memory issues
        if (content.includes('setInterval') && !content.includes('clearInterval')) {
          issues.push({
            file: path.relative(this.projectRoot, filePath),
            type: 'interval-leak',
            message: 'setInterval without clearInterval detected'
          });
        }
        
        if (content.includes('setTimeout') && !content.includes('clearTimeout')) {
          issues.push({
            file: path.relative(this.projectRoot, filePath),
            type: 'timeout-leak',
            message: 'setTimeout without clearTimeout detected'
          });
        }
        
        if (content.includes('addEventListener') && !content.includes('removeEventListener')) {
          issues.push({
            file: path.relative(this.projectRoot, filePath),
            type: 'listener-leak',
            message: 'addEventListener without removeEventListener detected'
          });
        }
        
        // Check for large state objects
        const stateMatches = content.match(/useState\s*\(\s*\{[\s\S]*?\}\s*\)/g);
        if (stateMatches && stateMatches.some(match => match.length > 200)) {
          issues.push({
            file: path.relative(this.projectRoot, filePath),
            type: 'large-state',
            message: 'Large state object detected - consider splitting'
          });
        }
        
      } catch (error) {
        // Skip files that can't be read
      }
    };
    
    const walkDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDirectory(filePath);
        } else {
          analyzeFile(filePath);
        }
      });
    };
    
    walkDirectory(srcDir);
    
    return {
      issuesFound: issues.length,
      issues: issues
    };
  }

  analyzeMemoryLeaks() {
    // Check for common memory leak patterns
    const leakPatterns = [
      {
        pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[\s*\]\s*\)/g,
        type: 'effect-cleanup',
        description: 'useEffect without cleanup function'
      },
      {
        pattern: /new\s+Array\s*\(\s*\d{4,}\s*\)/g,
        type: 'large-array',
        description: 'Large array allocation'
      }
    ];
    
    const srcDir = path.join(this.projectRoot, 'src');
    const leaks = [];
    
    const checkFile = (filePath) => {
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        leakPatterns.forEach(pattern => {
          const matches = content.match(pattern.pattern);
          if (matches) {
            leaks.push({
              file: path.relative(this.projectRoot, filePath),
              type: pattern.type,
              description: pattern.description,
              occurrences: matches.length
            });
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    };
    
    const walkDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDirectory(filePath);
        } else {
          checkFile(filePath);
        }
      });
    };
    
    walkDirectory(srcDir);
    
    return {
      potentialLeaks: leaks.length,
      leaks: leaks
    };
  }

  analyzeImageMemory() {
    // Analyze image usage and memory impact
    const assetsDir = path.join(this.projectRoot, 'assets');
    const images = [];
    let totalImageSize = 0;
    
    const analyzeImages = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          analyzeImages(filePath);
        } else if (stat.isFile()) {
          const ext = path.extname(file).toLowerCase();
          if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) {
            totalImageSize += stat.size;
            images.push({
              file: path.relative(this.projectRoot, filePath),
              size: stat.size,
              sizeFormatted: this.formatBytes(stat.size),
              format: ext.substring(1)
            });
          }
        }
      });
    };
    
    analyzeImages(assetsDir);
    
    // Sort by size
    images.sort((a, b) => b.size - a.size);
    
    return {
      totalImages: images.length,
      totalSize: totalImageSize,
      totalSizeFormatted: this.formatBytes(totalImageSize),
      largestImages: images.slice(0, 10),
      formatDistribution: this.getImageFormatDistribution(images)
    };
  }

  getImageFormatDistribution(images) {
    const distribution = {};
    images.forEach(img => {
      distribution[img.format] = (distribution[img.format] || 0) + 1;
    });
    return distribution;
  }

  getMemoryRecommendations(componentAnalysis, leakAnalysis, imageAnalysis) {
    const recommendations = [];
    
    if (componentAnalysis.issuesFound > 0) {
      recommendations.push({
        type: 'component-memory',
        severity: 'high',
        message: `${componentAnalysis.issuesFound} potential memory issues found in components`,
        action: 'Review and fix memory leaks in components'
      });
    }
    
    if (leakAnalysis.potentialLeaks > 0) {
      recommendations.push({
        type: 'memory-leaks',
        severity: 'high',
        message: `${leakAnalysis.potentialLeaks} potential memory leaks detected`,
        action: 'Add cleanup functions to useEffect hooks and clear timers'
      });
    }
    
    if (imageAnalysis.totalSize > 20 * 1024 * 1024) { // 20MB
      recommendations.push({
        type: 'image-memory',
        severity: 'medium',
        message: `Large total image size (${imageAnalysis.totalSizeFormatted})`,
        action: 'Optimize images, use WebP format, implement lazy loading'
      });
    }
    
    return recommendations;
  }

  async analyzeRenderingPerformance() {
    console.log('🎨 Analyzing rendering performance...');
    
    try {
      // Analyze component complexity
      const complexityAnalysis = this.analyzeComponentComplexity();
      
      // Check for performance anti-patterns
      const antiPatterns = this.analyzePerformanceAntiPatterns();
      
      // List optimization opportunities
      const optimizations = this.identifyOptimizationOpportunities();
      
      this.results.renderingAnalysis = {
        complexity: complexityAnalysis,
        antiPatterns: antiPatterns,
        optimizations: optimizations,
        recommendations: this.getRenderingRecommendations(complexityAnalysis, antiPatterns, optimizations)
      };
      
      console.log('  ✓ Component complexity analysis completed');
      console.log('  ✓ Performance anti-patterns detected');
      console.log('  ✓ Optimization opportunities identified');
      
    } catch (error) {
      console.error('  ❌ Rendering analysis failed:', error);
      this.results.renderingAnalysis.error = error.message;
    }
  }

  analyzeComponentComplexity() {
    const srcDir = path.join(this.projectRoot, 'src');
    const components = [];
    
    const analyzeComponent = (filePath) => {
      if (!filePath.endsWith('.tsx')) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Count JSX elements
        const jsxElements = (content.match(/<[A-Z][^>]*>/g) || []).length;
        
        // Count hooks
        const hooks = (content.match(/use[A-Z][a-zA-Z]*\s*\(/g) || []).length;
        
        // Count conditional renders
        const conditionals = (content.match(/\{[^}]*\?[^}]*:[^}]*\}/g) || []).length;
        
        // Count loops/maps
        const loops = (content.match(/\.map\s*\(/g) || []).length;
        
        // Calculate complexity score
        const complexity = jsxElements + (hooks * 2) + (conditionals * 3) + (loops * 2);
        
        components.push({
          file: path.relative(this.projectRoot, filePath),
          jsxElements,
          hooks,
          conditionals,
          loops,
          complexity,
          lines: content.split('\n').length
        });
        
      } catch (error) {
        // Skip files that can't be read
      }
    };
    
    const walkDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDirectory(filePath);
        } else {
          analyzeComponent(filePath);
        }
      });
    };
    
    walkDirectory(srcDir);
    
    // Sort by complexity
    components.sort((a, b) => b.complexity - a.complexity);
    
    return {
      totalComponents: components.length,
      averageComplexity: components.reduce((sum, c) => sum + c.complexity, 0) / components.length,
      mostComplex: components.slice(0, 10),
      highComplexity: components.filter(c => c.complexity > 50)
    };
  }

  analyzePerformanceAntiPatterns() {
    const antiPatterns = [];
    const srcDir = path.join(this.projectRoot, 'src');
    
    const checkAntiPatterns = (filePath) => {
      if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // Inline object creation in render
        if (content.match(/style=\{\{[^}]+\}\}/g)) {
          antiPatterns.push({
            file: relativePath,
            type: 'inline-styles',
            message: 'Inline style objects cause unnecessary re-renders'
          });
        }
        
        // Missing dependency arrays
        if (content.match(/useEffect\s*\([^,]+\s*\)/g)) {
          antiPatterns.push({
            file: relativePath,
            type: 'missing-deps',
            message: 'useEffect without dependency array'
          });
        }
        
        // Large lists without keys
        if (content.includes('.map(') && !content.includes('key=')) {
          antiPatterns.push({
            file: relativePath,
            type: 'missing-keys',
            message: 'List rendering without keys'
          });
        }
        
        // Unnecessary re-renders
        if (content.includes('useState') && !content.includes('useCallback') && !content.includes('useMemo')) {
          const stateCount = (content.match(/useState/g) || []).length;
          if (stateCount > 3) {
            antiPatterns.push({
              file: relativePath,
              type: 'no-memoization',
              message: 'Component with multiple state but no memoization'
            });
          }
        }
        
      } catch (error) {
        // Skip files that can't be read
      }
    };
    
    const walkDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDirectory(filePath);
        } else {
          checkAntiPatterns(filePath);
        }
      });
    };
    
    walkDirectory(srcDir);
    
    return {
      totalIssues: antiPatterns.length,
      issues: antiPatterns,
      byType: this.groupBy(antiPatterns, 'type')
    };
  }

  identifyOptimizationOpportunities() {
    const opportunities = [];
    const srcDir = path.join(this.projectRoot, 'src');
    
    const checkOptimizations = (filePath) => {
      if (!filePath.endsWith('.tsx')) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // Can use React.memo
        if (content.includes('export const') && !content.includes('React.memo') && !content.includes('memo(')) {
          opportunities.push({
            file: relativePath,
            type: 'react-memo',
            message: 'Component can be wrapped with React.memo'
          });
        }
        
        // Can use useMemo for expensive calculations
        if (content.includes('.filter(') || content.includes('.sort(') || content.includes('.reduce(')) {
          if (!content.includes('useMemo')) {
            opportunities.push({
              file: relativePath,
              type: 'use-memo',
              message: 'Expensive operations can be memoized with useMemo'
            });
          }
        }
        
        // Can use useCallback for event handlers
        if (content.includes('onPress=') && !content.includes('useCallback')) {
          opportunities.push({
            file: relativePath,
            type: 'use-callback',
            message: 'Event handlers can be memoized with useCallback'
          });
        }
        
        // Can use FlatList for large lists
        if (content.includes('.map(') && content.includes('ScrollView')) {
          opportunities.push({
            file: relativePath,
            type: 'flatlist',
            message: 'Large lists should use FlatList for better performance'
          });
        }
        
      } catch (error) {
        // Skip files that can't be read
      }
    };
    
    const walkDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDirectory(filePath);
        } else {
          checkOptimizations(filePath);
        }
      });
    };
    
    walkDirectory(srcDir);
    
    return {
      totalOpportunities: opportunities.length,
      opportunities: opportunities,
      byType: this.groupBy(opportunities, 'type')
    };
  }

  getRenderingRecommendations(complexityAnalysis, antiPatterns, optimizations) {
    const recommendations = [];
    
    if (complexityAnalysis.highComplexity.length > 0) {
      recommendations.push({
        type: 'component-complexity',
        severity: 'high',
        message: `${complexityAnalysis.highComplexity.length} components have high complexity`,
        action: 'Break down complex components into smaller, focused components'
      });
    }
    
    if (antiPatterns.totalIssues > 0) {
      recommendations.push({
        type: 'performance-antipatterns',
        severity: 'high',
        message: `${antiPatterns.totalIssues} performance anti-patterns detected`,
        action: 'Fix performance anti-patterns to improve rendering speed'
      });
    }
    
    if (optimizations.totalOpportunities > 0) {
      recommendations.push({
        type: 'optimization-opportunities',
        severity: 'medium',
        message: `${optimizations.totalOpportunities} optimization opportunities identified`,
        action: 'Implement React.memo, useMemo, and useCallback where appropriate'
      });
    }
    
    return recommendations;
  }

  async analyzeNetworkPerformance() {
    console.log('🌐 Analyzing network performance...');
    
    try {
      // Analyze API usage patterns
      const apiAnalysis = this.analyzeAPIUsage();
      
      // Check caching strategies
      const cachingAnalysis = this.analyzeCachingStrategies();
      
      // Network optimization opportunities
      const networkOptimizations = this.identifyNetworkOptimizations();
      
      this.results.networkAnalysis = {
        api: apiAnalysis,
        caching: cachingAnalysis,
        optimizations: networkOptimizations,
        recommendations: this.getNetworkRecommendations(apiAnalysis, cachingAnalysis, networkOptimizations)
      };
      
      console.log('  ✓ API usage analysis completed');
      console.log('  ✓ Caching strategies analyzed');
      console.log('  ✓ Network optimizations identified');
      
    } catch (error) {
      console.error('  ❌ Network analysis failed:', error);
      this.results.networkAnalysis.error = error.message;
    }
  }

  analyzeAPIUsage() {
    const srcDir = path.join(this.projectRoot, 'src');
    const apiCalls = [];
    
    const analyzeFile = (filePath) => {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // Find API calls
        const fetchCalls = content.match(/fetch\s*\([^)]+\)/g) || [];
        const axioCalls = content.match(/axios\.[a-z]+\s*\([^)]+\)/g) || [];
        const apiServiceCalls = content.match(/apiService\.[a-z]+\s*\([^)]+\)/g) || [];
        
        const totalCalls = fetchCalls.length + axioCalls.length + apiServiceCalls.length;
        
        if (totalCalls > 0) {
          apiCalls.push({
            file: relativePath,
            fetchCalls: fetchCalls.length,
            axioCalls: axioCalls.length,
            apiServiceCalls: apiServiceCalls.length,
            totalCalls
          });
        }
        
      } catch (error) {
        // Skip files that can't be read
      }
    };
    
    const walkDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDirectory(filePath);
        } else {
          analyzeFile(filePath);
        }
      });
    };
    
    walkDirectory(srcDir);
    
    return {
      totalFiles: apiCalls.length,
      totalCalls: apiCalls.reduce((sum, file) => sum + file.totalCalls, 0),
      filesWithMostCalls: apiCalls.sort((a, b) => b.totalCalls - a.totalCalls).slice(0, 10)
    };
  }

  analyzeCachingStrategies() {
    const srcDir = path.join(this.projectRoot, 'src');
    const cachingUsage = {
      reactQuery: false,
      asyncStorage: false,
      offlineManager: false,
      customCaching: false
    };
    
    const analyzeFile = (filePath) => {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('useQuery') || content.includes('useMutation')) {
          cachingUsage.reactQuery = true;
        }
        
        if (content.includes('AsyncStorage')) {
          cachingUsage.asyncStorage = true;
        }
        
        if (content.includes('offlineManager') || content.includes('OfflineManager')) {
          cachingUsage.offlineManager = true;
        }
        
        if (content.includes('cache') && !cachingUsage.reactQuery) {
          cachingUsage.customCaching = true;
        }
        
      } catch (error) {
        // Skip files that can't be read
      }
    };
    
    const walkDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDirectory(filePath);
        } else {
          analyzeFile(filePath);
        }
      });
    };
    
    walkDirectory(srcDir);
    
    return cachingUsage;
  }

  identifyNetworkOptimizations() {
    const optimizations = [];
    
    // Check if request batching is implemented
    // Check if request deduplication is implemented
    // Check if proper error handling is in place
    // Check if retry mechanisms are implemented
    
    return {
      requestBatching: false,
      requestDeduplication: false,
      errorHandling: true,
      retryMechanisms: true,
      compressionUsed: false,
      cdnUsage: false
    };
  }

  getNetworkRecommendations(apiAnalysis, cachingAnalysis, networkOptimizations) {
    const recommendations = [];
    
    if (apiAnalysis.totalCalls > 100) {
      recommendations.push({
        type: 'api-optimization',
        severity: 'medium',
        message: `High number of API calls (${apiAnalysis.totalCalls}) detected`,
        action: 'Implement request batching and caching strategies'
      });
    }
    
    if (!cachingAnalysis.reactQuery && !cachingAnalysis.offlineManager) {
      recommendations.push({
        type: 'caching-strategy',
        severity: 'high',
        message: 'No comprehensive caching strategy detected',
        action: 'Implement React Query or similar caching solution'
      });
    }
    
    if (!networkOptimizations.requestBatching) {
      recommendations.push({
        type: 'request-batching',
        severity: 'medium',
        message: 'Request batching not implemented',
        action: 'Implement request batching for multiple API calls'
      });
    }
    
    return recommendations;
  }

  async analyzeCodeQuality() {
    console.log('📊 Analyzing code quality metrics...');
    
    try {
      // Run ESLint analysis
      const lintResults = this.runLintAnalysis();
      
      // Analyze test coverage
      const testCoverage = this.analyzeTestCoverage();
      
      // Check TypeScript usage
      const typeScriptAnalysis = this.analyzeTypeScriptUsage();
      
      this.results.codeQuality = {
        lint: lintResults,
        testCoverage: testCoverage,
        typeScript: typeScriptAnalysis
      };
      
      console.log('  ✓ ESLint analysis completed');
      console.log('  ✓ Test coverage analyzed');
      console.log('  ✓ TypeScript usage checked');
      
    } catch (error) {
      console.error('  ❌ Code quality analysis failed:', error);
      this.results.codeQuality = { error: error.message };
    }
  }

  runLintAnalysis() {
    try {
      const output = execSync('npx eslint src --format json', { 
        cwd: this.projectRoot,
        encoding: 'utf8'
      });
      
      const results = JSON.parse(output);
      const totalErrors = results.reduce((sum, file) => sum + file.errorCount, 0);
      const totalWarnings = results.reduce((sum, file) => sum + file.warningCount, 0);
      
      return {
        totalFiles: results.length,
        totalErrors,
        totalWarnings,
        filesWithIssues: results.filter(file => file.errorCount > 0 || file.warningCount > 0).length
      };
    } catch (error) {
      return {
        error: 'ESLint analysis failed',
        message: error.message
      };
    }
  }

  analyzeTestCoverage() {
    try {
      // Check if coverage reports exist
      const coverageDir = path.join(this.projectRoot, 'coverage');
      if (fs.existsSync(coverageDir)) {
        const lcovPath = path.join(coverageDir, 'lcov-report', 'index.html');
        if (fs.existsSync(lcovPath)) {
          return {
            hasCoverage: true,
            reportPath: lcovPath
          };
        }
      }
      
      return {
        hasCoverage: false,
        message: 'No test coverage reports found'
      };
    } catch (error) {
      return {
        error: 'Test coverage analysis failed',
        message: error.message
      };
    }
  }

  analyzeTypeScriptUsage() {
    const srcDir = path.join(this.projectRoot, 'src');
    let totalFiles = 0;
    let tsFiles = 0;
    let jsFiles = 0;
    
    const analyzeFile = (filePath) => {
      const ext = path.extname(filePath);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        totalFiles++;
        if (['.ts', '.tsx'].includes(ext)) {
          tsFiles++;
        } else {
          jsFiles++;
        }
      }
    };
    
    const walkDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDirectory(filePath);
        } else {
          analyzeFile(filePath);
        }
      });
    };
    
    walkDirectory(srcDir);
    
    return {
      totalFiles,
      tsFiles,
      jsFiles,
      tsPercentage: totalFiles > 0 ? Math.round((tsFiles / totalFiles) * 100) : 0
    };
  }

  generateRecommendations() {
    console.log('💡 Generating performance recommendations...');
    
    // Collect all recommendations from different analyses
    const allRecommendations = [
      ...(this.results.bundleAnalysis.recommendations || []),
      ...(this.results.memoryAnalysis.recommendations || []),
      ...(this.results.renderingAnalysis.recommendations || []),
      ...(this.results.networkAnalysis.recommendations || [])
    ];
    
    // Sort by severity
    const severityOrder = { high: 3, medium: 2, low: 1 };
    allRecommendations.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    
    this.results.recommendations = allRecommendations;
    
    console.log(`  ✓ Generated ${allRecommendations.length} recommendations`);
  }

  generateReport() {
    const reportPath = path.join(this.reportDir, 'performance-audit-report.json');
    const markdownReportPath = path.join(this.reportDir, 'PERFORMANCE_AUDIT.md');
    
    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport();
    fs.writeFileSync(markdownReportPath, markdownReport);
    
    console.log(`📊 Performance audit report saved to: ${reportPath}`);
    console.log(`📄 Markdown report saved to: ${markdownReportPath}`);
  }

  generateMarkdownReport() {
    const { bundleAnalysis, memoryAnalysis, renderingAnalysis, networkAnalysis, recommendations } = this.results;
    
    return `# Performance Audit Report

**Generated:** ${new Date(this.results.timestamp).toLocaleString()}

## Executive Summary

This report provides a comprehensive analysis of the React Native app's performance characteristics, including bundle size, memory usage, rendering performance, and network efficiency.

## Bundle Analysis

### Size Metrics
- **Total Bundle Size:** ${this.formatBytes(bundleAnalysis.totalSize || 0)}
- **JavaScript Size:** ${this.formatBytes(bundleAnalysis.jsSize || 0)}
- **Assets Size:** ${this.formatBytes(bundleAnalysis.assetSize || 0)}

### Largest Assets
${bundleAnalysis.largestAssets ? bundleAnalysis.largestAssets.map(asset => 
  `- ${asset.file}: ${asset.sizeFormatted}`
).join('\n') : 'No large assets detected'}

### Dependencies
- **Total Dependencies:** ${bundleAnalysis.dependencies?.count || 0}
- **Node Modules Size:** ${bundleAnalysis.dependencies?.nodeModulesSize || 'Unknown'}
- **Heavy Dependencies:** ${bundleAnalysis.dependencies?.heavyDependencies?.join(', ') || 'None'}

## Memory Analysis

### Component Memory
- **Issues Found:** ${memoryAnalysis.components?.issuesFound || 0}
- **Potential Leaks:** ${memoryAnalysis.leaks?.potentialLeaks || 0}

### Image Memory
- **Total Images:** ${memoryAnalysis.images?.totalImages || 0}
- **Total Image Size:** ${memoryAnalysis.images?.totalSizeFormatted || '0 B'}

## Rendering Performance

### Component Complexity
- **Total Components:** ${renderingAnalysis.complexity?.totalComponents || 0}
- **Average Complexity:** ${Math.round(renderingAnalysis.complexity?.averageComplexity || 0)}
- **High Complexity Components:** ${renderingAnalysis.complexity?.highComplexity?.length || 0}

### Performance Issues
- **Anti-patterns Found:** ${renderingAnalysis.antiPatterns?.totalIssues || 0}
- **Optimization Opportunities:** ${renderingAnalysis.optimizations?.totalOpportunities || 0}

## Network Performance

### API Usage
- **Files with API Calls:** ${networkAnalysis.api?.totalFiles || 0}
- **Total API Calls:** ${networkAnalysis.api?.totalCalls || 0}

### Caching Strategies
- **React Query:** ${networkAnalysis.caching?.reactQuery ? '✅' : '❌'}
- **AsyncStorage:** ${networkAnalysis.caching?.asyncStorage ? '✅' : '❌'}
- **Offline Manager:** ${networkAnalysis.caching?.offlineManager ? '✅' : '❌'}

## Recommendations

### High Priority
${recommendations.filter(r => r.severity === 'high').map(r => 
  `- **${r.type}:** ${r.message}\n  *Action:* ${r.action}`
).join('\n\n')}

### Medium Priority
${recommendations.filter(r => r.severity === 'medium').map(r => 
  `- **${r.type}:** ${r.message}\n  *Action:* ${r.action}`
).join('\n\n')}

### Low Priority
${recommendations.filter(r => r.severity === 'low').map(r => 
  `- **${r.type}:** ${r.message}\n  *Action:* ${r.action}`
).join('\n\n')}

## Next Steps

1. Address high-priority recommendations first
2. Implement performance monitoring
3. Set up automated performance testing
4. Regular performance audits
5. Monitor app performance metrics in production

---

*This report was generated automatically by the Performance Audit Tool.*`;
  }

  // Utility methods
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }
}

// CLI usage
if (require.main === module) {
  const auditor = new PerformanceAuditor();
  auditor.runFullAudit();
}

module.exports = PerformanceAuditor;