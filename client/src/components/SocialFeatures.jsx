import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API_URL from '../config';

// Follow/Unfollow Button Component
export const FollowButton = ({ userId, initialFollowing = false, onFollowChange }) => {
    const { fetchWithAuth } = useAuth();
    const { showSuccess, showError } = useToast();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    const handleToggleFollow = async () => {
        setLoading(true);
        try {
            const endpoint = isFollowing
                ? `${API_URL}/api/social/unfollow/${userId}`
                : `${API_URL}/api/social/follow/${userId}`;

            const response = await fetchWithAuth(endpoint, {
                method: isFollowing ? 'DELETE' : 'POST'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update follow status');
            }

            const newFollowState = !isFollowing;
            setIsFollowing(newFollowState);
            showSuccess(newFollowState ? 'Following user!' : 'Unfollowed user');

            if (onFollowChange) {
                onFollowChange(newFollowState);
            }
        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleFollow}
            disabled={loading}
            style={{
                background: isFollowing
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                border: isFollowing ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                color: isFollowing ? '#ef4444' : 'white',
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
                if (!loading) {
                    e.target.style.transform = 'scale(1.05)';
                }
            }}
            onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
            }}
        >
            {loading ? '...' : isFollowing ? '✓ Following' : '+ Follow'}
        </button>
    );
};

// Like Button Component with Heart Animation
export const LikeButton = ({ quizId, initialLiked = false, initialCount = 0, onLikeChange }) => {
    const { fetchWithAuth } = useAuth();
    const { showSuccess, showError } = useToast();
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);

    const handleToggleLike = async () => {
        if (loading) return;

        setLoading(true);
        setAnimating(true);

        // Optimistic update
        const newLikedState = !isLiked;
        const newCount = newLikedState ? likeCount + 1 : likeCount - 1;
        setIsLiked(newLikedState);
        setLikeCount(newCount);

        try {
            const endpoint = isLiked
                ? `${API_URL}/api/social/quizzes/${quizId}/unlike`
                : `${API_URL}/api/social/quizzes/${quizId}/like`;

            const response = await fetchWithAuth(endpoint, {
                method: isLiked ? 'DELETE' : 'POST'
            });

            if (!response.ok) {
                // Revert on error
                setIsLiked(!newLikedState);
                setLikeCount(likeCount);

                const error = await response.json();
                throw new Error(error.error || 'Failed to update like status');
            }

            if (onLikeChange) {
                onLikeChange(newLikedState, newCount);
            }
        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setAnimating(false), 300);
        }
    };

    return (
        <button
            onClick={handleToggleLike}
            disabled={loading}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: isLiked ? '#ef4444' : 'var(--text-muted)',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transform: animating ? 'scale(1.1)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
                if (!loading) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }
            }}
            onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
        >
            <span style={{ fontSize: '1.1rem' }}>{isLiked ? '❤️' : '🤍'}</span>
            <span>{likeCount}</span>
        </button>
    );
};

// Social Stats Display Component
export const SocialStats = ({ followers = 0, following = 0, quizzesCreated = 0, totalLikes = 0 }) => {
    const stats = [
        { label: 'Followers', value: followers, icon: '👥' },
        { label: 'Following', value: following, icon: '➕' },
        { label: 'Quizzes', value: quizzesCreated, icon: '📝' },
        { label: 'Total Likes', value: totalLikes, icon: '❤️' },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
        }}>
            {stats.map((stat, index) => (
                <div
                    key={index}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        {stat.icon}
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '0.25rem'
                    }}>
                        {stat.value}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default { FollowButton, LikeButton, SocialStats };
