import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API_URL from '../config';
import ProfileHeader from './profile/ProfileHeader';
import QuickStats from './profile/QuickStats';
import PerformanceOverview from './profile/PerformanceOverview';
import PerformanceTrend from './profile/PerformanceTrend';
import CategoryMastery from './profile/CategoryMastery';
import AchievementsSection from './profile/AchievementsSection';
import RecommendationsSection from './profile/RecommendationsSection';
import RecentActivitySection from './profile/RecentActivitySection';

const PublicUserProfile = ({ userId, onBack }) => {
    const { user: currentUser, logout, fetchWithAuth } = useAuth();
    const { showError } = useToast();

    const [userData, setUserData] = useState(null);
    const [statsState, setStatsState] = useState({ data: null, loading: true, error: null });
    const [activityState, setActivityState] = useState({ data: null, loading: true, error: null });
    const [trendsState, setTrendsState] = useState({ data: [], loading: true, error: null });
    const [achievementsState, setAchievementsState] = useState({ data: null, loading: true, error: null });
    const [recommendationsState, setRecommendationsState] = useState({ data: [], loading: true, error: null });
    const [showComparison, setShowComparison] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchAllData();
        }
    }, [userId]);

    const fetchAllData = () => {
        fetchUserData();
        fetchStats();
        fetchActivity();
        fetchTrends();
        fetchAchievements();
        fetchRecommendations();
    };

    const handleFetchError = (res) => {
        if (res.status === 401 || res.status === 403) {
            showError('Session expired. Please login again.');
            logout();
            return true;
        }
        return false;
    };

    const fetchUserData = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/api/profile/user/${userId}`);
            if (handleFetchError(res)) return;
            if (!res.ok) throw new Error('Failed to fetch user data');
            const data = await res.json();
            setUserData(data);
        } catch (err) {
            console.error(err);
            showError('Failed to load user profile');
        }
    };

    const fetchStats = async () => {
        try {
            setStatsState(prev => ({ ...prev, loading: true, error: null }));
            const res = await fetchWithAuth(`${API_URL}/api/profile/stats/${userId}`);
            if (handleFetchError(res)) return;
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStatsState({ data, loading: false, error: null });
        } catch (err) {
            console.error(err);
            setStatsState(prev => ({ ...prev, loading: false, error: err.message }));
        }
    };

    const fetchActivity = async () => {
        try {
            setActivityState(prev => ({ ...prev, loading: true, error: null }));
            const res = await fetchWithAuth(`${API_URL}/api/profile/activity/${userId}`);
            if (handleFetchError(res)) return;
            if (!res.ok) throw new Error('Failed to fetch activity');
            const data = await res.json();
            setActivityState({ data, loading: false, error: null });
        } catch (err) {
            console.error(err);
            setActivityState(prev => ({ ...prev, loading: false, error: err.message }));
        }
    };

    const fetchTrends = async () => {
        try {
            setTrendsState(prev => ({ ...prev, loading: true, error: null }));
            const res = await fetchWithAuth(`${API_URL}/api/profile/trends/${userId}?days=30`);
            if (handleFetchError(res)) return;
            if (!res.ok) throw new Error('Failed to fetch trends');
            const data = await res.json();
            setTrendsState({ data: data.trends || [], loading: false, error: null });
        } catch (err) {
            console.error(err);
            setTrendsState(prev => ({ ...prev, loading: false, error: err.message }));
        }
    };

    const fetchAchievements = async () => {
        try {
            setAchievementsState(prev => ({ ...prev, loading: true, error: null }));
            const res = await fetchWithAuth(`${API_URL}/api/profile/achievements/${userId}`);
            if (handleFetchError(res)) return;
            if (!res.ok) throw new Error('Failed to fetch achievements');
            const data = await res.json();
            setAchievementsState({ data, loading: false, error: null });
        } catch (err) {
            console.error(err);
            setAchievementsState(prev => ({ ...prev, loading: false, error: err.message }));
        }
    };

    const fetchRecommendations = async () => {
        try {
            setRecommendationsState(prev => ({ ...prev, loading: true, error: null }));
            const res = await fetchWithAuth(`${API_URL}/api/profile/recommendations/${userId}`);
            if (handleFetchError(res)) return;
            if (!res.ok) throw new Error('Failed to fetch recommendations');
            const data = await res.json();
            setRecommendationsState({ data: data.recommendations || [], loading: false, error: null });
        } catch (err) {
            console.error(err);
            setRecommendationsState(prev => ({ ...prev, loading: false, error: err.message }));
        }
    };

    const handleCompareWithMe = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/api/profile/compare/${currentUser.id}/${userId}`);
            if (handleFetchError(res)) return;
            if (!res.ok) throw new Error('Failed to fetch comparison data');
            const data = await res.json();
            setComparisonData(data);
            setShowComparison(true);
        } catch (err) {
            console.error(err);
            showError('Failed to load comparison data');
        }
    };

    if (!userData) {
        return (
            <div className="glass-card" style={{ maxWidth: '1200px', width: '100%', textAlign: 'center', padding: '3rem' }}>
                <div className="loading-spinner" style={{ margin: '0 auto' }}>Loading profile...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>

            {/* Header & Quick Stats */}
            <div className="glass-card">
                <ProfileHeader
                    user={userData}
                    userStats={statsState.data?.userStats}
                    onBack={onBack}
                    isPublicView={true}
                />
                <QuickStats
                    stats={statsState.data}
                    loading={statsState.loading}
                    error={statsState.error}
                />
            </div>

            {/* Compare Button */}
            {currentUser.id !== userId && (
                <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                        onClick={handleCompareWithMe}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }}
                    >
                        📊 Compare with Me
                    </button>
                </div>
            )}

            {/* Comparison Results */}
            {showComparison && comparisonData && (
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>📊 Comparison</h3>
                        <button
                            onClick={() => setShowComparison(false)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'var(--text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Quizzes Completed</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: comparisonData.comparison.quizzesDiff >= 0 ? '#10b981' : '#ef4444' }}>
                                {comparisonData.comparison.quizzesDiff >= 0 ? '+' : ''}{comparisonData.comparison.quizzesDiff}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                You: {comparisonData.user1.totalQuizzes} | Them: {comparisonData.user2.totalQuizzes}
                            </div>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Avg Score</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: comparisonData.comparison.scoreDiff >= 0 ? '#10b981' : '#ef4444' }}>
                                {comparisonData.comparison.scoreDiff >= 0 ? '+' : ''}{comparisonData.comparison.scoreDiff.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                You: {comparisonData.user1.avgScore}% | Them: {comparisonData.user2.avgScore}%
                            </div>
                        </div>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rank Difference</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: comparisonData.comparison.rankDiff <= 0 ? '#10b981' : '#ef4444' }}>
                                {comparisonData.comparison.rankDiff <= 0 ? '' : '+'}{comparisonData.comparison.rankDiff}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                You: #{comparisonData.user1.rank.rank} | Them: #{comparisonData.user2.rank.rank}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Content */}
            <PerformanceOverview
                stats={statsState.data}
                loading={statsState.loading}
                error={statsState.error}
            />

            <PerformanceTrend
                trends={trendsState.data}
                loading={trendsState.loading}
                error={trendsState.error}
            />

            <CategoryMastery
                categoryStats={statsState.data?.categoryStats}
                loading={statsState.loading}
                error={statsState.error}
            />

            <AchievementsSection
                achievements={achievementsState.data}
                loading={achievementsState.loading}
                error={achievementsState.error}
            />

            <RecommendationsSection
                recommendations={recommendationsState.data}
                loading={recommendationsState.loading}
                error={recommendationsState.error}
            />

            <RecentActivitySection
                activity={activityState.data}
                loading={activityState.loading}
                error={activityState.error}
            />
        </div>
    );
};

export default PublicUserProfile;
