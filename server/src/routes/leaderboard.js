const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
    const filter = req.query.filter || 'best'; // 'best' or 'all'

    let query;
    if (filter === 'all') {
        query = `
        SELECT 
            u.username, 
            r.score, 
            q.title as quizTitle, 
            r.completed_at,
            (
                SELECT COUNT(*) 
                FROM results r2 
                WHERE r2.user_id = r.user_id 
                AND r2.quiz_id = r.quiz_id 
                AND r2.completed_at <= r.completed_at
            ) as attemptNumber
        FROM results r
        JOIN users u ON r.user_id = u.id
        JOIN quizzes q ON r.quiz_id = q.id
        ORDER BY r.completed_at DESC
        LIMIT 50
        `;
    } else {
        // Best score per user per quiz - join with derived table of max scores
        query = `
        SELECT 
            u.username, 
            r.score, 
            q.title as quizTitle, 
            r.completed_at
        FROM results r
        JOIN users u ON r.user_id = u.id
        JOIN quizzes q ON r.quiz_id = q.id
        JOIN (
            SELECT user_id, quiz_id, MAX(score) as max_score
            FROM results
            GROUP BY user_id, quiz_id
        ) best ON r.user_id = best.user_id 
            AND r.quiz_id = best.quiz_id 
            AND r.score = best.max_score
        GROUP BY r.user_id, r.quiz_id
        ORDER BY r.score DESC
        LIMIT 50
        `;
    }

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
