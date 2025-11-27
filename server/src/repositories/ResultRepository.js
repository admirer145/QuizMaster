const { Result, User, Quiz, Question, QuestionAttempt, sequelize } = require('../models/sequelize');
const { Op } = require('sequelize');

class ResultRepository {
    /**
     * Create a quiz result
     * @param {number} userId 
     * @param {number} quizId 
     * @param {number} score 
     * @returns {Promise<Object>}
     */
    async create(userId, quizId, score) {
        return await Result.create({
            user_id: userId,
            quiz_id: quizId,
            score,
        });
    }

    /**
     * Find result by ID
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        return await Result.findByPk(id, {
            include: [
                { model: User, as: 'user' },
                { model: Quiz, as: 'quiz' },
            ],
        });
    }

    /**
     * Get all attempts for a user on a specific quiz
     * @param {number} userId 
     * @param {number} quizId 
     * @returns {Promise<Array>}
     */
    async findByUserAndQuiz(userId, quizId) {
        return await Result.findAll({
            where: { user_id: userId, quiz_id: quizId },
            order: [['completed_at', 'DESC']],
        });
    }

    /**
     * Get best score for a user on a quiz
     * @param {number} userId 
     * @param {number} quizId 
     * @returns {Promise<Object|null>}
     */
    async getBestScore(userId, quizId) {
        return await Result.findOne({
            where: { user_id: userId, quiz_id: quizId },
            order: [['score', 'DESC']],
        });
    }

    /**
     * Get detailed quiz report for a result
     * @param {number} resultId 
     * @returns {Promise<Object|null>}
     */
    async getQuizReport(resultId) {
        const result = await Result.findByPk(resultId, {
            include: [
                {
                    model: Quiz,
                    as: 'quiz',
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                        }
                    ]
                },
                {
                    model: QuestionAttempt,
                    as: 'questionAttempts',
                    include: [
                        {
                            model: Question,
                            as: 'question',
                        }
                    ]
                }
            ]
        });

        if (!result) return null;

        // Format the report
        const quiz = result.quiz;
        const attempts = result.questionAttempts;

        return {
            resultId: result.id,
            score: result.score,
            completedAt: result.completed_at,
            quiz: {
                id: quiz.id,
                title: quiz.title,
                category: quiz.category,
                difficulty: quiz.difficulty,
            },
            questions: quiz.questions.map(q => {
                const attempt = attempts.find(a => a.question_id === q.id);
                return {
                    id: q.id,
                    type: q.type,
                    questionText: q.question_text,
                    options: q.options,
                    correctAnswer: q.correct_answer,
                    userAnswer: attempt?.user_answer,
                    isCorrect: attempt?.is_correct,
                    timeTaken: attempt?.time_taken_seconds,
                };
            }),
        };
    }

    /**
     * Get all attempts for a quiz by a user with details
     * @param {number} quizId 
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    async getUserQuizAttempts(quizId, userId) {
        const results = await Result.findAll({
            where: { quiz_id: quizId, user_id: userId },
            include: [
                {
                    model: Quiz,
                    as: 'quiz',
                }
            ],
            order: [['completed_at', 'DESC']],
        });

        // Get question count for the quiz
        const questionCount = await Question.count({ where: { quiz_id: quizId } });

        return results.map((result, index) => ({
            id: result.id,
            attemptNumber: results.length - index,
            score: result.score,
            maxScore: questionCount * 10,
            percentage: questionCount > 0 ? Math.round((result.score / (questionCount * 10)) * 100) : 0,
            completedAt: result.completed_at,
            quizTitle: result.quiz.title,
        }));
    }
}

module.exports = new ResultRepository();
