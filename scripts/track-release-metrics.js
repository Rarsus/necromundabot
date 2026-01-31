#!/usr/bin/env node

/**
 * Track Release Metrics
 * Collects workflow execution times, identifies bottlenecks
 * Stores metrics for trend analysis
 */

const fs = require('fs');
const path = require('path');

const METRICS_FILE = path.join(__dirname, '../.github/release-metrics.json');

/**
 * Parse workflow run times from GitHub Actions
 */
function parseWorkflowMetrics(workflowData) {
  const metrics = {
    timestamp: new Date().toISOString(),
    version: workflowData.version || 'unknown',
    totalTime: workflowData.totalTime || 0,
    jobs: {},
  };

  const jobTimings = {
    'publish-utils': workflowData.publishUtilsTime || 0,
    'publish-core': workflowData.publishCoreTime || 0,
    'publish-commands': workflowData.publishCommandsTime || 0,
    'publish-dashboard': workflowData.publishDashboardTime || 0,
    'build-bot-docker': workflowData.buildBotTime || 0,
    'build-dashboard-docker': workflowData.buildDashboardTime || 0,
    verify: workflowData.verifyTime || 0,
  };

  Object.entries(jobTimings).forEach(([job, time]) => {
    metrics.jobs[job] = {
      duration: time,
      percentage: ((time / metrics.totalTime) * 100).toFixed(2) + '%',
    };
  });

  return metrics;
}

/**
 * Identify bottlenecks
 */
function identifyBottlenecks(metrics) {
  const sorted = Object.entries(metrics.jobs)
    .sort((a, b) => b[1].duration - a[1].duration)
    .slice(0, 3);

  console.log(`\n⏱️  Top Bottlenecks:\n`);
  sorted.forEach(([job, data], idx) => {
    const icon = idx === 0 ? '🔴' : idx === 1 ? '🟠' : '🟡';
    console.log(`${icon} ${job.padEnd(25)} ${data.duration}s (${data.percentage})`);
  });

  return sorted;
}

/**
 * Calculate performance trend
 */
function calculateTrend(currentMetrics, historicalMetrics) {
  if (historicalMetrics.length < 2) {
    return {
      trend: 'insufficient_data',
      improvement: 0,
    };
  }

  const recent = historicalMetrics.slice(-5);
  const avgHistorical = recent.reduce((sum, m) => sum + m.totalTime, 0) / recent.length;
  const improvement = (((avgHistorical - currentMetrics.totalTime) / avgHistorical) * 100).toFixed(2);

  let trend = 'stable';
  if (improvement > 5) trend = 'improving';
  if (improvement < -5) trend = 'degrading';

  return {
    trend,
    improvement: parseFloat(improvement),
    comparison: avgHistorical,
    current: currentMetrics.totalTime,
  };
}

/**
 * Load historical metrics
 */
function loadMetricsHistory() {
  try {
    if (fs.existsSync(METRICS_FILE)) {
      const data = fs.readFileSync(METRICS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`⚠️ Could not load historical metrics:`, err.message);
  }
  return [];
}

/**
 * Save metrics
 */
function saveMetrics(metrics, history) {
  try {
    // Keep last 30 releases
    history = [metrics, ...history].slice(0, 30);
    fs.writeFileSync(METRICS_FILE, JSON.stringify(history, null, 2));
    console.log(`✅ Metrics saved (${history.length} releases tracked)`);
  } catch (err) {
    console.error(`❌ Error saving metrics:`, err.message);
  }
}

/**
 * Generate metrics report
 */
function generateReport(metrics, history) {
  const trend = calculateTrend(metrics, history);

  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║              📊 RELEASE PERFORMANCE METRICS               ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝\n`);

  console.log(`📦 Release: ${metrics.version}`);
  console.log(`⏱️  Total Time: ${metrics.totalTime}s`);
  console.log(`📅 Timestamp: ${metrics.timestamp}\n`);

  console.log(`📈 Trend: ${trend.trend.toUpperCase()}`);
  if (trend.trend !== 'insufficient_data') {
    const direction = trend.improvement >= 0 ? '↓ Faster' : '↑ Slower';
    console.log(`${direction} by ${Math.abs(trend.improvement)}% (was ${trend.comparison}s avg)\n`);
  }

  identifyBottlenecks(metrics);

  console.log(`\n📋 Job Breakdown:\n`);
  Object.entries(metrics.jobs)
    .sort((a, b) => b[1].duration - a[1].duration)
    .forEach(([job, data]) => {
      const bar = '█'.repeat(Math.ceil(parseFloat(data.percentage) / 5));
      console.log(`${job.padEnd(25)} ${bar.padEnd(20)} ${data.duration}s (${data.percentage})`);
    });

  console.log(`\n💡 Optimization Tips:\n`);
  console.log(`• Parallelize Docker builds (currently sequential)`);
  console.log(`• Cache dependencies between jobs`);
  console.log(`• Use matrix builds for multi-workspace testing`);
  console.log(`• Optimize publish job dependencies\n`);
}

/**
 * Main function
 */
function main() {
  const workflowData = {
    version: process.env.RELEASE_VERSION || 'v1.0.0',
    totalTime: parseInt(process.env.TOTAL_TIME || process.argv[2] || '0'),
    publishUtilsTime: parseInt(process.env.PUBLISH_UTILS_TIME || '0'),
    publishCoreTime: parseInt(process.env.PUBLISH_CORE_TIME || '0'),
    publishCommandsTime: parseInt(process.env.PUBLISH_COMMANDS_TIME || '0'),
    publishDashboardTime: parseInt(process.env.PUBLISH_DASHBOARD_TIME || '0'),
    buildBotTime: parseInt(process.env.BUILD_BOT_TIME || '0'),
    buildDashboardTime: parseInt(process.env.BUILD_DASHBOARD_TIME || '0'),
    verifyTime: parseInt(process.env.VERIFY_TIME || '0'),
  };

  if (workflowData.totalTime === 0) {
    console.error('❌ Total time required. Usage:');
    console.error('   RELEASE_VERSION=v1.0.0 TOTAL_TIME=600 node scripts/track-release-metrics.js');
    console.error('   Or: node scripts/track-release-metrics.js 600');
    process.exit(1);
  }

  const metrics = parseWorkflowMetrics(workflowData);
  const history = loadMetricsHistory();

  generateReport(metrics, history);
  saveMetrics(metrics, history);

  // Export for CI/CD consumption
  console.log(`\n📤 Metrics Summary (JSON):`);
  console.log(
    JSON.stringify(
      {
        version: metrics.version,
        totalTime: metrics.totalTime,
        bottleneck: Object.entries(metrics.jobs).sort((a, b) => b[1].duration - a[1].duration)[0][0],
        timestamp: metrics.timestamp,
      },
      null,
      2
    )
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  parseWorkflowMetrics,
  identifyBottlenecks,
  calculateTrend,
  loadMetricsHistory,
  saveMetrics,
  generateReport,
};
