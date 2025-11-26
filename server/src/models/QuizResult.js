const db = require('../db');

class QuizResult {
    /**
     * Save a question attempt with detailed metrics
     */
    static async saveQuestionAttempt(attemptData) {
        const { userId, quizId, questionId, resultId, userAnswer, isCorrect, timeTakenSeconds } = attemptData;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO question_attempts 
                (user_id, quiz_id, question_id, result_id, user_answer, is_correct, time_taken_seconds) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, quizId, questionId, resultId, userAnswer, isCorrect ? 1 : 0, timeTakenSeconds],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    /**
     * Get comprehensive quiz report with all question attempts
     */
    static async getQuizReport(resultId) {
        // Get result details first to get the quiz_id
        const result = await new Promise((resolve, reject) => {
            db.get(
                `SELECT r.*, q.title as quiz_title, q.category, q.difficulty, u.username
                FROM results r
                JOIN quizzes q ON r.quiz_id = q.id
                JOIN users u ON r.user_id = u.id
                WHERE r.id = ?`,
                [resultId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });

        if (!result) return null;

        // Get all questions for this quiz and join with attempts
        const questionsWithAttempts = await new Promise((resolve, reject) => {
            db.all(
                `SELECT q.id as question_id, q.question_text, q.type, q.options, q.correct_answer,
                        qa.id as attempt_id, qa.user_answer, qa.is_correct, qa.time_taken_seconds, qa.attempted_at
                FROM questions q
                LEFT JOIN question_attempts qa ON q.id = qa.question_id AND qa.result_id = ?
                WHERE q.quiz_id = ?
                ORDER BY q.id ASC`,
                [resultId, result.quiz_id],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                }
            );
        });

        // Parse options and format attempts
        const formattedAttempts = questionsWithAttempts.map(row => ({
            id: row.attempt_id || `unattempted-${row.question_id}`, // Generate ID for unattempted
            question_id: row.question_id,
            question_text: row.question_text,
            type: row.type,
            options: row.options ? JSON.parse(row.options) : null,
            correct_answer: row.correct_answer,
            user_answer: row.user_answer,
            is_correct: Boolean(row.is_correct),
            time_taken_seconds: row.time_taken_seconds || 0,
            attempted_at: row.attempted_at,
            status: row.attempt_id ? (row.is_correct ? 'correct' : 'incorrect') : 'unattempted'
        }));

        return {
            ...result,
            attempts: formattedAttempts,
            totalQuestions: formattedAttempts.length,
            correctAnswers: formattedAttempts.filter(a => a.is_correct).length,
            totalTime: formattedAttempts.reduce((sum, a) => sum + a.time_taken_seconds, 0)
        };
    }

    /**
     * Get analysis data for a specific question
     * This is a placeholder that can be extended with AI/LLM analysis
     */
    static async getQuestionAnalysis(questionId, userId = null) {
        // Get question details
        const questionPromise = new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM questions WHERE id = ?`,
                [questionId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });

        // Get user's performance on this question (if userId provided)
        let userPerformancePromise = Promise.resolve(null);
        if (userId) {
            userPerformancePromise = new Promise((resolve, reject) => {
                db.all(
                    `SELECT * FROM question_attempts 
                    WHERE question_id = ? AND user_id = ?
                    ORDER BY attempted_at DESC`,
                    [questionId, userId],
                    (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows);
                    }
                );
            });
        }

        // Get overall statistics for this question
        const statsPromise = new Promise((resolve, reject) => {
            db.get(
                `SELECT 
                    COUNT(*) as total_attempts,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
                    AVG(time_taken_seconds) as avg_time
                FROM question_attempts
                WHERE question_id = ?`,
                [questionId],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                }
            );
        });

        const [question, userPerformance, stats] = await Promise.all([
            questionPromise,
            userPerformancePromise,
            statsPromise
        ]);

        if (!question) return null;

        return {
            question: {
                ...question,
                options: question.options ? JSON.parse(question.options) : null
            },
            userPerformance: userPerformance ? userPerformance.map(p => ({
                ...p,
                is_correct: Boolean(p.is_correct)
            })) : null,
            statistics: {
                totalAttempts: stats.total_attempts || 0,
                correctAttempts: stats.correct_attempts || 0,
                successRate: stats.total_attempts > 0
                    ? ((stats.correct_attempts / stats.total_attempts) * 100).toFixed(1)
                    : 0,
                averageTime: stats.avg_time ? Math.round(stats.avg_time) : 0
            },
            // Placeholder for future AI-generated insights
            insights: {
                explanation: "Detailed explanation will be available soon.",
                commonMistakes: [],
                relatedTopics: [],
                difficulty: question.difficulty || "medium"
            }
        };
    }

    /**
     * Get all attempts for a specific quiz by a user
     */
    static async getUserQuizAttempts(quizId, userId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT r.*, q.title as quiz_title, q.category, q.difficulty,
                        COALESCE(COUNT(DISTINCT qa.id), 0) as total_questions,
                        COALESCE(SUM(CASE WHEN qa.is_correct = 1 THEN 1 ELSE 0 END), 0) as correct_answers,
                        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as quiz_question_count
                FROM results r
                JOIN quizzes q ON r.quiz_id = q.id
                LEFT JOIN question_attempts qa ON r.id = qa.result_id
                WHERE r.quiz_id = ? AND r.user_id = ?
                GROUP BY r.id
                ORDER BY r.completed_at DESC`,
                [quizId, userId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows.map(row => {
                        // Use quiz_question_count if no attempts were recorded
                        const totalQuestions = row.total_questions > 0 ? row.total_questions : row.quiz_question_count;
                        const correctAnswers = row.correct_answers || 0;

                        return {
                            ...row,
                            total_questions: totalQuestions,
                            correct_answers: correctAnswers,
                            accuracy: totalQuestions > 0
                                ? ((correctAnswers / totalQuestions) * 100).toFixed(1)
                                : 0
                        };
                    }));
                }
            );
        });
    }
}

module.exports = QuizResult;
