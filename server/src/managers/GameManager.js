class GameManager {
    constructor() {
        this.activeSessions = new Map(); // socketId -> { userId, quizId, score, currentQuestionIndex }
    }

    startSession(socketId, userId, quizId) {
        this.activeSessions.set(socketId, {
            userId,
            quizId,
            score: 0,
            currentQuestionIndex: 0,
            startTime: Date.now()
        });
        return this.activeSessions.get(socketId);
    }

    getSession(socketId) {
        return this.activeSessions.get(socketId);
    }

    updateScore(socketId, points) {
        const session = this.activeSessions.get(socketId);
        if (session) {
            session.score += points;
            return session.score;
        }
        return 0;
    }

    endSession(socketId) {
        const session = this.activeSessions.get(socketId);
        this.activeSessions.delete(socketId);
        return session;
    }
}

module.exports = new GameManager();
