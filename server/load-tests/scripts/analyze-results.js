#!/usr/bin/env node

/**
 * Load Test Analysis and Issue Detection
 * Analyzes test results and provides optimization recommendations
 */

const fs = require('fs').promises;
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../reports');

async function analyzeReports() {
    console.log('\n' + '='.repeat(70));
    console.log('LOAD TEST ANALYSIS & PERFORMANCE RECOMMENDATIONS');
    console.log('='.repeat(70) + '\n');

    try {
        const files = await fs.readdir(REPORTS_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('summary'));

        if (jsonFiles.length === 0) {
            console.log('❌ No test results found.');
            console.log('\nTo generate test results:');
            console.log('  1. Start your server: npm start');
            console.log('  2. Run tests: npm run load-test:baseline');
            console.log('  3. Run this analysis again\n');
            return;
        }

        console.log(`Found ${jsonFiles.length} test result(s)\n`);

        const issues = [];
        const recommendations = [];

        for (const file of jsonFiles) {
            const filePath = path.join(REPORTS_DIR, file);
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);

            console.log(`\n📊 Analyzing: ${file}`);
            console.log('-'.repeat(70));

            const analysis = analyzeTestResult(data, file);

            if (analysis.issues.length > 0) {
                issues.push(...analysis.issues.map(i => ({ file, ...i })));
            }

            if (analysis.recommendations.length > 0) {
                recommendations.push(...analysis.recommendations.map(r => ({ file, ...r })));
            }

            printAnalysis(analysis);
        }

        // Print summary
        printSummary(issues, recommendations);

    } catch (err) {
        console.error('Error analyzing reports:', err.message);
    }
}

function analyzeTestResult(data, filename) {
    const agg = data.aggregate || {};
    const counters = agg.counters || {};
    const latency = agg.latency || {};
    const errors = agg.errors || {};

    const issues = [];
    const recommendations = [];
    const metrics = {};

    // Calculate metrics
    const totalScenarios = (counters['vusers.completed'] || 0) + (counters['vusers.failed'] || 0);
    const failureRate = totalScenarios > 0
        ? ((counters['vusers.failed'] || 0) / totalScenarios * 100).toFixed(2)
        : 0;

    const errorCount = Object.values(errors).reduce((sum, count) => sum + count, 0);
    const errorRate = totalScenarios > 0
        ? (errorCount / totalScenarios * 100).toFixed(2)
        : 0;

    metrics.totalScenarios = totalScenarios;
    metrics.completed = counters['vusers.completed'] || 0;
    metrics.failed = counters['vusers.failed'] || 0;
    metrics.failureRate = failureRate;
    metrics.errorRate = errorRate;
    metrics.medianLatency = latency.median || 0;
    metrics.p95Latency = latency.p95 || 0;
    metrics.p99Latency = latency.p99 || 0;
    metrics.maxLatency = latency.max || 0;

    // Issue detection

    // 1. High failure rate
    if (failureRate > 5) {
        issues.push({
            severity: 'HIGH',
            type: 'High Failure Rate',
            description: `${failureRate}% of scenarios failed`,
            impact: 'System may be unstable or overloaded'
        });
        recommendations.push({
            priority: 'HIGH',
            action: 'Investigate server logs for errors',
            details: 'Check for database connection issues, memory leaks, or application crashes'
        });
    }

    // 2. High error rate
    if (errorRate > 1) {
        issues.push({
            severity: errorRate > 5 ? 'HIGH' : 'MEDIUM',
            type: 'High Error Rate',
            description: `${errorRate}% error rate detected`,
            impact: 'Users experiencing request failures'
        });
    }

    // 3. High latency
    if (latency.median > 500) {
        issues.push({
            severity: 'HIGH',
            type: 'High Median Latency',
            description: `Median latency: ${latency.median.toFixed(2)}ms`,
            impact: 'Poor user experience, slow response times'
        });
        recommendations.push({
            priority: 'HIGH',
            action: 'Optimize database queries',
            details: 'Add indexes, use query caching, optimize N+1 queries'
        });
    } else if (latency.median > 200) {
        issues.push({
            severity: 'MEDIUM',
            type: 'Elevated Median Latency',
            description: `Median latency: ${latency.median.toFixed(2)}ms`,
            impact: 'Acceptable but could be improved'
        });
    }

    if (latency.p95 > 1000) {
        issues.push({
            severity: 'HIGH',
            type: 'High P95 Latency',
            description: `P95 latency: ${latency.p95.toFixed(2)}ms`,
            impact: '5% of requests are very slow'
        });
        recommendations.push({
            priority: 'MEDIUM',
            action: 'Implement caching strategy',
            details: 'Use Redis or in-memory caching for frequently accessed data'
        });
    }

    // 4. Specific errors
    if (errors['ECONNREFUSED']) {
        issues.push({
            severity: 'CRITICAL',
            type: 'Connection Refused',
            description: 'Server not accepting connections',
            impact: 'Service unavailable'
        });
        recommendations.push({
            priority: 'CRITICAL',
            action: 'Start the server',
            details: 'Run: npm start'
        });
    }

    if (errors['ETIMEDOUT']) {
        issues.push({
            severity: 'HIGH',
            type: 'Request Timeouts',
            description: `${errors['ETIMEDOUT']} timeout errors`,
            impact: 'Requests taking too long to complete'
        });
        recommendations.push({
            priority: 'HIGH',
            action: 'Increase server resources or optimize slow endpoints',
            details: 'Check CPU/memory usage, optimize database queries'
        });
    }

    // 5. Rate limiting
    const rateLimitErrors = Object.keys(errors).filter(e => e.includes('429')).length;
    if (rateLimitErrors > 0 || errors['Too Many Requests']) {
        issues.push({
            severity: 'LOW',
            type: 'Rate Limiting Active',
            description: 'Requests being rate limited',
            impact: 'Expected behavior for high load'
        });
        recommendations.push({
            priority: 'LOW',
            action: 'Adjust rate limits for production',
            details: 'Current limits may be too restrictive for expected traffic'
        });
    }

    // General recommendations based on test type
    if (filename.includes('auth')) {
        recommendations.push({
            priority: 'MEDIUM',
            action: 'Monitor authentication performance',
            details: 'Bcrypt hashing is CPU-intensive. Consider using async workers for high load'
        });
    }

    if (filename.includes('leaderboard')) {
        recommendations.push({
            priority: 'MEDIUM',
            action: 'Optimize leaderboard queries',
            details: 'Complex sorting and filtering. Consider materialized views or pre-computed rankings'
        });
    }

    if (filename.includes('websocket')) {
        recommendations.push({
            priority: 'MEDIUM',
            action: 'Monitor WebSocket connection limits',
            details: 'Ensure server can handle expected concurrent connections'
        });
    }

    return { metrics, issues, recommendations };
}

function printAnalysis(analysis) {
    const { metrics, issues, recommendations } = analysis;

    console.log(`\n✓ Scenarios Completed: ${metrics.completed}`);
    console.log(`✗ Scenarios Failed: ${metrics.failed} (${metrics.failureRate}%)`);
    console.log(`⚠ Error Rate: ${metrics.errorRate}%`);
    console.log(`\nLatency Metrics:`);
    console.log(`  Median: ${metrics.medianLatency.toFixed(2)}ms`);
    console.log(`  P95: ${metrics.p95Latency.toFixed(2)}ms`);
    console.log(`  P99: ${metrics.p99Latency.toFixed(2)}ms`);
    console.log(`  Max: ${metrics.maxLatency.toFixed(2)}ms`);

    if (issues.length > 0) {
        console.log(`\n⚠️  Issues Detected: ${issues.length}`);
        issues.forEach((issue, i) => {
            const icon = issue.severity === 'CRITICAL' ? '🔴' :
                issue.severity === 'HIGH' ? '🟠' :
                    issue.severity === 'MEDIUM' ? '🟡' : '🟢';
            console.log(`  ${icon} [${issue.severity}] ${issue.type}: ${issue.description}`);
        });
    } else {
        console.log(`\n✅ No major issues detected`);
    }
}

function printSummary(issues, recommendations) {
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY & RECOMMENDATIONS');
    console.log('='.repeat(70) + '\n');

    if (issues.length === 0) {
        console.log('✅ All tests passed successfully!');
        console.log('   No critical issues detected.\n');
    } else {
        // Group by severity
        const critical = issues.filter(i => i.severity === 'CRITICAL');
        const high = issues.filter(i => i.severity === 'HIGH');
        const medium = issues.filter(i => i.severity === 'MEDIUM');
        const low = issues.filter(i => i.severity === 'LOW');

        if (critical.length > 0) {
            console.log('🔴 CRITICAL ISSUES:');
            critical.forEach(issue => {
                console.log(`   • ${issue.type} (${issue.file})`);
                console.log(`     ${issue.description}`);
                console.log(`     Impact: ${issue.impact}\n`);
            });
        }

        if (high.length > 0) {
            console.log('🟠 HIGH PRIORITY ISSUES:');
            high.forEach(issue => {
                console.log(`   • ${issue.type} (${issue.file})`);
                console.log(`     ${issue.description}\n`);
            });
        }

        if (medium.length > 0) {
            console.log('🟡 MEDIUM PRIORITY ISSUES:');
            medium.forEach(issue => {
                console.log(`   • ${issue.type} (${issue.file})\n`);
            });
        }
    }

    if (recommendations.length > 0) {
        console.log('\n📋 RECOMMENDED ACTIONS:\n');

        // Group by priority
        const highPriority = recommendations.filter(r => r.priority === 'CRITICAL' || r.priority === 'HIGH');
        const mediumPriority = recommendations.filter(r => r.priority === 'MEDIUM');
        const lowPriority = recommendations.filter(r => r.priority === 'LOW');

        if (highPriority.length > 0) {
            console.log('  HIGH PRIORITY:');
            highPriority.forEach((rec, i) => {
                console.log(`    ${i + 1}. ${rec.action}`);
                console.log(`       ${rec.details}\n`);
            });
        }

        if (mediumPriority.length > 0) {
            console.log('  MEDIUM PRIORITY:');
            mediumPriority.forEach((rec, i) => {
                console.log(`    ${i + 1}. ${rec.action}`);
                console.log(`       ${rec.details}\n`);
            });
        }

        if (lowPriority.length > 0) {
            console.log('  LOW PRIORITY:');
            lowPriority.forEach((rec, i) => {
                console.log(`    ${i + 1}. ${rec.action}\n`);
            });
        }
    }

    console.log('='.repeat(70) + '\n');
}

analyzeReports().catch(err => {
    console.error('Analysis failed:', err);
    process.exit(1);
});
