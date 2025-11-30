const db = require('../db');
const logger = require('../utils/logger');

/**
 * Migration: Social Features
 * Creates tables for user follows, quiz likes, and social stats
 */

function up() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create user_follows table
            db.run(`CREATE TABLE IF NOT EXISTS user_follows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                follower_id INTEGER NOT NULL,
                following_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(following_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(follower_id, following_id),
                CHECK(follower_id != following_id)
            )`, (err) => {
                if (err) {
                    logger.error('Failed to create user_follows table', { error: err });
                    return reject(err);
                }
                logger.info('Created user_follows table');
            });

            // Create quiz_likes table
            db.run(`CREATE TABLE IF NOT EXISTS quiz_likes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                quiz_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
                UNIQUE(user_id, quiz_id)
            )`, (err) => {
                if (err) {
                    logger.error('Failed to create quiz_likes table', { error: err });
                    return reject(err);
                }
                logger.info('Created quiz_likes table');
            });

            // Create user_social_stats table
            db.run(`CREATE TABLE IF NOT EXISTS user_social_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                followers_count INTEGER DEFAULT 0,
                following_count INTEGER DEFAULT 0,
                total_likes_received INTEGER DEFAULT 0,
                quizzes_created_count INTEGER DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )`, (err) => {
                if (err) {
                    logger.error('Failed to create user_social_stats table', { error: err });
                    return reject(err);
                }
                logger.info('Created user_social_stats table');
            });

            // Create indexes for performance
            const indexes = [
                "CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id)",
                "CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id)",
                "CREATE INDEX IF NOT EXISTS idx_quiz_likes_user ON quiz_likes(user_id)",
                "CREATE INDEX IF NOT EXISTS idx_quiz_likes_quiz ON quiz_likes(quiz_id)",
                "CREATE INDEX IF NOT EXISTS idx_quiz_likes_created_at ON quiz_likes(created_at DESC)",
                "CREATE INDEX IF NOT EXISTS idx_user_social_stats_user ON user_social_stats(user_id)"
            ];

            let indexCount = 0;
            indexes.forEach((indexQuery, i) => {
                db.run(indexQuery, (err) => {
                    if (err) {
                        logger.error('Failed to create index', { error: err, query: indexQuery });
                        return reject(err);
                    }
                    indexCount++;
                    if (indexCount === indexes.length) {
                        logger.info('Created all social features indexes');
                        resolve();
                    }
                });
            });
        });
    });
}

function down() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('DROP TABLE IF EXISTS quiz_likes', (err) => {
                if (err) {
                    logger.error('Failed to drop quiz_likes table', { error: err });
                    return reject(err);
                }
            });

            db.run('DROP TABLE IF EXISTS user_follows', (err) => {
                if (err) {
                    logger.error('Failed to drop user_follows table', { error: err });
                    return reject(err);
                }
            });

            db.run('DROP TABLE IF EXISTS user_social_stats', (err) => {
                if (err) {
                    logger.error('Failed to drop user_social_stats table', { error: err });
                    return reject(err);
                }
                logger.info('Rolled back social features migration');
                resolve();
            });
        });
    });
}

module.exports = { up, down };
