const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const analyticsService = require('../services/analyticsService');
const achievementService = require('../services/achievementService');

const router = express.Router();

// Get user profile with comprehensive stats
router.get('/stats/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        // Get all stats in parallel
        const [
            userStats,
            categoryStats,
            rank,
            improvementRate,
            difficultyDist
        ] = await Promise.all([
            analyticsService.getUserStats(userId),
            analyticsService.getCategoryStats(userId),
            analyticsService.getUserRank(userId),
            analyticsService.getImprovementRate(userId),
            analyticsService.getDifficultyDistribution(userId)
        ]);

        res.json({
            userStats,
            categoryStats,
            rank,
            improvementRate,
            difficultyDist
        });
    } catch (err) {
        console.error('Error fetching profile stats:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get activity heatmap data
router.get('/activity/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const [heatmapData, recentAttempts] = await Promise.all([
            analyticsService.getActivityHeatmap(userId),
            analyticsService.getRecentAttempts(userId, 10)
        ]);

        res.json({
            heatmap: heatmapData,
            recentAttempts
        });
    } catch (err) {
        console.error('Error fetching activity data:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get performance trends
router.get('/trends/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const days = parseInt(req.query.days) || 30;

        const trends = await analyticsService.getPerformanceTrends(userId, days);

        res.json({ trends });
    } catch (err) {
        console.error('Error fetching trends:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get achievements
router.get('/achievements/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const achievementProgress = await achievementService.getAchievementProgress(userId);

        // Separate unlocked and locked achievements
        const unlocked = achievementProgress.filter(a => a.unlocked);
        const locked = achievementProgress.filter(a => !a.unlocked);

        res.json({
            unlocked,
            locked,
            totalAchievements: achievementProgress.length,
            unlockedCount: unlocked.length
        });
    } catch (err) {
        console.error('Error fetching achievements:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get personalized recommendations
router.get('/recommendations/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const recommendations = await analyticsService.getRecommendations(userId);

        res.json({ recommendations });
    } catch (err) {
        console.error('Error fetching recommendations:', err);
        res.status(500).json({ error: err.message });
    }
});

// Compare with another user
router.get('/compare/:userId/:compareUserId', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const compareUserId = parseInt(req.params.compareUserId);

        const [user1Stats, user2Stats, user1Rank, user2Rank] = await Promise.all([
            analyticsService.getUserStats(userId),
            analyticsService.getUserStats(compareUserId),
            analyticsService.getUserRank(userId),
            analyticsService.getUserRank(compareUserId)
        ]);

        res.json({
            user1: { ...user1Stats, rank: user1Rank },
            user2: { ...user2Stats, rank: user2Rank },
            comparison: {
                quizzesDiff: user1Stats.totalQuizzes - user2Stats.totalQuizzes,
                scoreDiff: user1Stats.avgScore - user2Stats.avgScore,
                rankDiff: user1Rank.rank - user2Rank.rank
            }
        });
    } catch (err) {
        console.error('Error comparing users:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update user avatar
router.put('/avatar', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { avatarUrl } = req.body;

        const db = require('../db');

        db.run(
            'UPDATE users SET avatar_url = ? WHERE id = ?',
            [avatarUrl, userId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Avatar updated successfully', avatarUrl });
            }
        );
    } catch (err) {
        console.error('Error updating avatar:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete user account
router.delete('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const db = require('../db');

    try {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // 1. Delete question attempts linked to user's results
            db.run(`DELETE FROM question_attempts WHERE user_id = ?`, [userId]);

            // 2. Delete user's results
            db.run(`DELETE FROM results WHERE user_id = ?`, [userId]);

            // 3. Delete user stats
            db.run(`DELETE FROM user_stats WHERE user_id = ?`, [userId]);

            // 4. Delete user achievements
            db.run(`DELETE FROM user_achievements WHERE user_id = ?`, [userId]);

            // 5. Delete questions linked to quizzes created by user
            db.run(`DELETE FROM questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE creator_id = ?)`, [userId]);

            // 6. Delete quizzes created by user
            db.run(`DELETE FROM quizzes WHERE creator_id = ?`, [userId]);

            // 7. Delete the user
            db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
                if (err) {
                    console.error('Error deleting user:', err);
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Failed to delete account' });
                }

                db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        console.error('Error committing transaction:', commitErr);
                        return res.status(500).json({ error: 'Failed to commit deletion' });
                    }
                    res.json({ message: 'Account deleted successfully' });
                });
            });
        });
    } catch (err) {
        console.error('Error in delete account route:', err);
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
