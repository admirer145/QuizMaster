const fetch = require('node-fetch');

async function testLeaderboard() {
    console.log('Testing Best Scores:');
    const bestResponse = await fetch('http://localhost:3001/api/leaderboard?filter=best');
    const bestData = await bestResponse.json();
    console.log(JSON.stringify(bestData, null, 2));

    console.log('\n\nTesting All Attempts:');
    const allResponse = await fetch('http://localhost:3001/api/leaderboard?filter=all');
    const allData = await allResponse.json();
    console.log(JSON.stringify(allData, null, 2));
}

testLeaderboard().catch(console.error);
