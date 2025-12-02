const db = require('./src/db');

console.log('Starting challenge cleanup...');

// Delete all existing challenges and their participants
db.serialize(() => {
    // Delete all challenge participants first (foreign key constraint)
    db.run('DELETE FROM challenge_participants', (err) => {
        if (err) {
            console.error('Error deleting challenge participants:', err);
            return;
        }
        console.log('✓ Deleted all challenge participants');
    });

    // Delete all challenges
    db.run('DELETE FROM challenges', (err) => {
        if (err) {
            console.error('Error deleting challenges:', err);
            return;
        }
        console.log('✓ Deleted all challenges');
    });

    // Reset challenge stats for all users
    db.run('DELETE FROM challenge_stats', (err) => {
        if (err) {
            console.error('Error resetting challenge stats:', err);
            return;
        }
        console.log('✓ Reset all challenge stats');
        console.log('\nCleanup complete! All challenges have been removed.');
        process.exit(0);
    });
});
