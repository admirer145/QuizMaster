#!/usr/bin/env node

/**
 * Quick Benchmark Script using autocannon
 * Fast HTTP benchmarking for individual endpoints
 */

const autocannon = require('autocannon');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const RESULTS_DIR = path.join(__dirname, '../reports');

// Endpoints to benchmark
const ENDPOINTS = [
    {
        name: 'Public Quizzes',
        method: 'GET',
        url: `${BASE_URL}/api/quizzes/public`,
    },
    {
        name: 'Leaderboard (First)',
        method: 'GET',
        url: `${BASE_URL}/api/leaderboard?filter=first&page=1&limit=10`,
        setupAuth: true
    },
    {
        name: 'Leaderboard (All)',
        method: 'GET',
        url: `${BASE_URL}/api/leaderboard?filter=all&page=1&limit=10`,
        setupAuth: true
    }
];

async function ensureReportsDir() {
    try {
        await fs.mkdir(RESULTS_DIR, { recursive: true });
    } catch (err) {
        // Directory already exists
    }
}

async function createTestUser() {
    const fetch = (await import('node-fetch')).default;
    const username = `bench_user_${Date.now()}`;

    try {
        const response = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password: 'TestPassword123!',
                acceptedTerms: true,
                acceptedPrivacy: true
            })
        });

        const data = await response.json();
        return data.token;
    } catch (err) {
        console.error('Failed to create test user:', err.message);
        return null;
    }
}

async function runBenchmark(endpoint, authToken) {
    console.log(`\nBenchmarking: ${endpoint.name}`);
    console.log(`URL: ${endpoint.url}`);
    console.log('-'.repeat(60));

    const options = {
        url: endpoint.url,
        method: endpoint.method || 'GET',
        connections: 10,
        pipelining: 1,
        duration: 10,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (endpoint.setupAuth && authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
    }

    return new Promise((resolve, reject) => {
        const instance = autocannon(options, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });

        autocannon.track(instance, { renderProgressBar: true });
    });
}

function formatResult(result) {
    return {
        requests: {
            average: result.requests.average,
            mean: result.requests.mean,
            total: result.requests.total,
            sent: result.requests.sent
        },
        latency: {
            mean: result.latency.mean,
            p50: result.latency.p50,
            p75: result.latency.p75,
            p90: result.latency.p90,
            p99: result.latency.p99,
            max: result.latency.max
        },
        throughput: {
            average: result.throughput.average,
            mean: result.throughput.mean,
            total: result.throughput.total
        },
        errors: result.errors,
        timeouts: result.timeouts,
        duration: result.duration
    };
}

function printSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('BENCHMARK SUMMARY');
    console.log('='.repeat(60) + '\n');

    results.forEach(({ endpoint, result }) => {
        console.log(`${endpoint.name}:`);
        console.log(`  Requests/sec: ${result.requests.average.toFixed(2)}`);
        console.log(`  Latency (avg): ${result.latency.mean.toFixed(2)}ms`);
        console.log(`  Latency (p99): ${result.latency.p99.toFixed(2)}ms`);
        console.log(`  Throughput: ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/sec`);
        console.log(`  Errors: ${result.errors}`);
        console.log(`  Timeouts: ${result.timeouts}`);
        console.log('');
    });

    console.log('='.repeat(60) + '\n');
}

async function main() {
    console.log('Starting Quick Benchmarks...\n');

    await ensureReportsDir();

    // Create test user for authenticated endpoints
    const authToken = await createTestUser();
    if (!authToken) {
        console.warn('⚠️  Could not create test user. Authenticated endpoints will be skipped.\n');
    }

    const results = [];

    for (const endpoint of ENDPOINTS) {
        if (endpoint.setupAuth && !authToken) {
            console.log(`\nSkipping ${endpoint.name} (requires authentication)\n`);
            continue;
        }

        try {
            const result = await runBenchmark(endpoint, authToken);
            const formatted = formatResult(result);
            results.push({ endpoint, result: formatted });

            console.log(`\n✓ Completed: ${endpoint.name}`);
            console.log(`  Avg Requests/sec: ${formatted.requests.average.toFixed(2)}`);
            console.log(`  Avg Latency: ${formatted.latency.mean.toFixed(2)}ms`);
        } catch (err) {
            console.error(`\n✗ Failed: ${endpoint.name}`, err.message);
        }

        // Small delay between benchmarks
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    printSummary(results);

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(RESULTS_DIR, `benchmark-${timestamp}.json`);
    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`Results saved to: ${resultsPath}\n`);
}

main().catch(err => {
    console.error('Benchmark failed:', err);
    process.exit(1);
});
