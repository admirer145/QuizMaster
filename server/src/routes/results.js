const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
    SELECT quiz_id, MAX(score) as best_score, COUNT(*) as attempts
    FROM results
    WHERE user_id = ?
    GROUP BY quiz_id
  `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
