const db = require('./src/db');

console.log('Clearing results table...');

db.run('DELETE FROM results', [], (err) => {
    if (err) {
        console.error('Error clearing results:', err.message);
        process.exit(1);
    }
    console.log('Results table cleared successfully.');

    // Verify count
    db.get('SELECT COUNT(*) as count FROM results', [], (err, row) => {
        if (err) console.error(err);
        else console.log(`Remaining records: ${row.count}`);
        process.exit(0);
    });
});
