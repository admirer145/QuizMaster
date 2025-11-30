const SocialRepository = require('../repositories/SocialRepository');
const QuizRepository = require('../repositories/QuizRepository');
const UserRepository = require('../repositories/UserRepository');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

class SocialService {
    /**
     * Follow a user
     * @param {number} followerId 
     * @param {number} followingId 
     * @returns {Promise<Object>}
     */
    async followUser(followerId, followingId) {
        // Validate users exist
        const [follower, following] = await Promise.all([
            UserRepository.findById(followerId),
            UserRepository.findById(followingId)
        ]);

        if (!follower || !following) {
            throw new Error('User not found');
        }

        const result = await SocialRepository.followUser(followerId, followingId);

        // Update social stats for both users
        await Promise.all([
            SocialRepository.updateSocialStats(followerId),
            SocialRepository.updateSocialStats(followingId)
        ]);

        // Invalidate caches
        cache.delete(`user_profile_${followerId}`);
        cache.delete(`user_profile_${followingId}`);
        cache.delete('top_creators');

        return result;
    }

    /**
     * Unfollow a user
     * @param {number} followerId 
     * @param {number} followingId 
     * @returns {Promise<boolean>}
     */
    async unfollowUser(followerId, followingId) {
        const result = await SocialRepository.unfollowUser(followerId, followingId);

        if (result) {
            // Update social stats for both users
            await Promise.all([
                SocialRepository.updateSocialStats(followerId),
                SocialRepository.updateSocialStats(followingId)
            ]);

            // Invalidate caches
            cache.delete(`user_profile_${followerId}`);
            cache.delete(`user_profile_${followingId}`);
            cache.delete('top_creators');
        }

        return result;
    }

    /**
     * Like a quiz
     * @param {number} userId 
     * @param {number} quizId 
     * @returns {Promise<Object>}
     */
    async likeQuiz(userId, quizId) {
        // Validate quiz exists and is public
        const quiz = await QuizRepository.findById(quizId, false);

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        if (!quiz.is_public || quiz.status !== 'approved') {
            throw new Error('Can only like public quizzes');
        }

        const result = await SocialRepository.likeQuiz(userId, quizId);

        // Update creator's social stats
        if (quiz.creator_id) {
            await SocialRepository.updateSocialStats(quiz.creator_id);
            cache.delete(`user_profile_${quiz.creator_id}`);
        }

        // Invalidate caches
        cache.delete(`quiz_likes_${quizId}`);
        cache.delete('trending_quizzes');
        cache.delete('top_creators');

        return result;
    }

    /**
     * Unlike a quiz
     * @param {number} userId 
     * @param {number} quizId 
     * @returns {Promise<boolean>}
     */
    async unlikeQuiz(userId, quizId) {
        const result = await SocialRepository.unlikeQuiz(userId, quizId);

        if (result) {
            // Get quiz to update creator stats
            const quiz = await QuizRepository.findById(quizId, false);
            if (quiz && quiz.creator_id) {
                await SocialRepository.updateSocialStats(quiz.creator_id);
                cache.delete(`user_profile_${quiz.creator_id}`);
            }

            // Invalidate caches
            cache.delete(`quiz_likes_${quizId}`);
            cache.delete('trending_quizzes');
            cache.delete('top_creators');
        }

        return result;
    }

    /**
     * Get trending quizzes with caching
     * @param {number} limit 
     * @param {number} days 
     * @returns {Promise<Array>}
     */
    async getTrendingQuizzes(limit = 10, days = 30) {
        const cacheKey = `trending_quizzes_${limit}_${days}`;

        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        const quizzes = await SocialRepository.getTrendingQuizzes(limit, days);

        // Cache for 5 minutes
        cache.set(cacheKey, quizzes, 5 * 60 * 1000);

        return quizzes;
    }

    /**
     * Get top creators with caching
     * @param {number} limit 
     * @returns {Promise<Array>}
     */
    async getTopCreators(limit = 10) {
        const cacheKey = `top_creators_${limit}`;

        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        const creators = await SocialRepository.getTopCreators(limit);

        // Cache for 5 minutes
        cache.set(cacheKey, creators, 5 * 60 * 1000);

        return creators;
    }

    /**
     * Get comprehensive user profile
     * @param {number} userId 
     * @param {number} currentUserId - The user viewing the profile
     * @returns {Promise<Object>}
     */
    async getUserProfile(userId, currentUserId = null) {
        const cacheKey = `user_profile_${userId}`;

        let profile = cache.get(cacheKey);

        if (!profile) {
            const [user, socialStats] = await Promise.all([
                UserRepository.getPublicUserData(userId),
                SocialRepository.getUserSocialStats(userId)
            ]);

            if (!user) {
                throw new Error('User not found');
            }

            profile = {
                ...user,
                socialStats: {
                    followers: socialStats.followers_count,
                    following: socialStats.following_count,
                    quizzesCreated: socialStats.quizzes_created_count,
                    totalLikes: socialStats.total_likes_received
                }
            };

            // Cache for 2 minutes
            cache.set(cacheKey, profile, 2 * 60 * 1000);
        }

        // Add follow status if currentUserId is provided
        if (currentUserId && currentUserId !== userId) {
            profile.isFollowing = await SocialRepository.isFollowing(currentUserId, userId);
        }

        return profile;
    }

    /**
     * Get user's public quizzes
     * @param {number} userId 
     * @param {number} limit 
     * @param {number} offset 
     * @returns {Promise<Array>}
     */
    async getUserQuizzes(userId, limit = 10, offset = 0) {
        return await QuizRepository.findByCreatorPublic(userId, limit, offset);
    }
}

module.exports = new SocialService();
