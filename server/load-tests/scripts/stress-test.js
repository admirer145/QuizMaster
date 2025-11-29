#!/usr/bin/env node

/**
 * Stress Test Script
 * Progressively increases load to find system breaking points
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const RESULTS_DIR = path.join(__dirname, '../reports');

// Test configuration
const STRESS_LEVELS = [
    { duration: 30, arrivalRate: 5, name: 'Light Load' },
    { duration: 30, arrivalRate: 10, name: 'Moderate Load' },
    { duration: 30, arrivalRate: 20, name: 'Heavy Load' },
    { duration: 30, arrivalRate: 40, name: 'Very Heavy Load' },
    { duration: 30, arrivalRate: 60, name: 'Extreme Load' },
    { duration: 30, arrivalRate: 100, name: 'Breaking Point Test' },
];

async function ensureReportsDir() {
    try {
        await fs.mkdir(RESULTS_DIR, { recursive: true });
    } catch (err) {
        console.error('Failed to create reports directory:', err);
    }
}

async function createStressTestConfig(level) {
    const config = {
        config: {
            target: BASE_URL,
            phases: [
                {
                    duration: level.duration,
                    arrivalRate: level.arrivalRate,
                    name: level.name
                }
            ]
        },
        scenarios: [
            {
                name: 'Stress Test Scenario',
                flow: [
                    {
                        get: {
                            url: '/api/quizzes/public',
                            expect: [
                                { statusCode: [200, 429, 500, 503] } // Accept rate limit and error responses
                            ]
                        }
                    },
                    { think: 1 }
                ]
            }
        ]
    };

    const configPath = path.join(__dirname, '../scenarios/stress-test-temp.yml');
    const yaml = require('js-yaml');
    await fs.writeFile(configPath, yaml.dump(config));
    return configPath;
}

async function runStressLevel(level, index) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running Stress Level ${index + 1}/${STRESS_LEVELS.length}: ${level.name}`);
    console.log(`Duration: ${level.duration}s, Arrival Rate: ${level.arrivalRate} users/sec`);
    console.log(`${'='.repeat(60)}\n`);

    const configPath = await createStressTestConfig(level);
    const reportPath = path.join(RESULTS_DIR, `stress-test-level-${index + 1}.json`);

    return new Promise((resolve, reject) => {
        const artillery = spawn('npx', [
            'artillery',
            'run',
            '--output',
            reportPath,
            configPath
        ], {
            stdio: 'inherit',
            cwd: path.join(__dirname, '../..')
        });

        artillery.on('close', (code) => {
            if (code === 0) {
                console.log(`✓ Stress level ${index + 1} completed successfully\n`);
                resolve({ level, reportPath, success: true });
            } else {
                console.log(`✗ Stress level ${index + 1} failed with code ${code}\n`);
                resolve({ level, reportPath, success: false, exitCode: code });
            }
        });

        artillery.on('error', (err) => {
            console.error(`Error running stress test:`, err);
            reject(err);
        });
    });
}

async function analyzeResults(results) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('STRESS TEST SUMMARY');
    console.log(`${'='.repeat(60)}\n`);

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const status = result.success ? '✓ PASSED' : '✗ FAILED';
        console.log(`Level ${i + 1}: ${result.level.name} (${result.level.arrivalRate} users/sec) - ${status}`);
    }

    // Find breaking point
    const firstFailure = results.findIndex(r => !r.success);
    if (firstFailure !== -1) {
        console.log(`\n⚠️  Breaking point detected at Level ${firstFailure + 1}: ${results[firstFailure].level.name}`);
        console.log(`   Maximum sustainable load: ~${results[firstFailure - 1]?.level.arrivalRate || 'Unknown'} users/sec`);
    } else {
        console.log(`\n✓ System handled all stress levels successfully!`);
        console.log(`   Maximum tested load: ${results[results.length - 1].level.arrivalRate} users/sec`);
    }

    console.log(`\n${'='.repeat(60)}\n`);
}

async function main() {
    console.log('Starting Progressive Stress Test...\n');

    await ensureReportsDir();

    const results = [];

    for (let i = 0; i < STRESS_LEVELS.length; i++) {
        const result = await runStressLevel(STRESS_LEVELS[i], i);
        results.push(result);

        // Stop if we hit a breaking point
        if (!result.success) {
            console.log('\n⚠️  Breaking point reached. Stopping stress test.\n');
            break;
        }

        // Cool down between tests
        if (i < STRESS_LEVELS.length - 1) {
            console.log('Cooling down for 10 seconds...\n');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    await analyzeResults(results);

    // Save summary
    const summaryPath = path.join(RESULTS_DIR, 'stress-test-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(results, null, 2));
    console.log(`Full results saved to: ${summaryPath}\n`);
}

main().catch(err => {
    console.error('Stress test failed:', err);
    process.exit(1);
});
