#!/usr/bin/env node

/**
 * Run All Load Tests
 * Executes all test scenarios sequentially
 */

const { spawn } = require('child_process');
const path = require('path');

const SCENARIOS = [
    { name: 'Baseline Test', script: 'load-test:baseline' },
    { name: 'Authentication Load Test', script: 'load-test:auth' },
    { name: 'Quiz Load Test', script: 'load-test:quiz' },
    { name: 'Leaderboard Load Test', script: 'load-test:leaderboard' },
    { name: 'Profile Load Test', script: 'load-test:profile' },
    { name: 'Full User Journey', script: 'load-test:journey' },
];

async function runTest(scenario) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${scenario.name}`);
    console.log(`${'='.repeat(60)}\n`);

    return new Promise((resolve, reject) => {
        const npm = spawn('npm', ['run', scenario.script], {
            stdio: 'inherit',
            cwd: path.join(__dirname, '../..')
        });

        npm.on('close', (code) => {
            if (code === 0) {
                console.log(`\n✓ ${scenario.name} completed successfully\n`);
                resolve({ scenario, success: true });
            } else {
                console.log(`\n✗ ${scenario.name} failed with code ${code}\n`);
                resolve({ scenario, success: false, exitCode: code });
            }
        });

        npm.on('error', (err) => {
            console.error(`Error running ${scenario.name}:`, err);
            reject(err);
        });
    });
}

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('RUNNING ALL LOAD TESTS');
    console.log('='.repeat(60));
    console.log(`\nTotal scenarios: ${SCENARIOS.length}\n`);

    const results = [];
    const startTime = Date.now();

    for (const scenario of SCENARIOS) {
        const result = await runTest(scenario);
        results.push(result);

        // Cool down between tests
        console.log('Cooling down for 5 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    const endTime = Date.now();
    const totalDuration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUITE SUMMARY');
    console.log('='.repeat(60) + '\n');

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    results.forEach((result, index) => {
        const status = result.success ? '✓ PASSED' : '✗ FAILED';
        console.log(`${index + 1}. ${result.scenario.name}: ${status}`);
    });

    console.log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Duration: ${totalDuration} minutes\n`);
    console.log('='.repeat(60) + '\n');

    if (failed > 0) {
        console.log('⚠️  Some tests failed. Check the output above for details.\n');
        process.exit(1);
    } else {
        console.log('✓ All tests passed successfully!\n');
    }
}

main().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
