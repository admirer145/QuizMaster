import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API_URL from '../config';
import DataManagement from './DataManagement';
import ProfileHeader from './profile/ProfileHeader';
import QuickStats from './profile/QuickStats';
import PerformanceOverview from './profile/PerformanceOverview';
import PerformanceTrend from './profile/PerformanceTrend';
import CategoryMastery from './profile/CategoryMastery';
import AchievementsSection from './profile/AchievementsSection';
import RecommendationsSection from './profile/RecommendationsSection';
import RecentActivitySection from './profile/RecentActivitySection';

const UserProfile = ({ onBack }) => {
    const { user, logout, fetchWithAuth } = useAuth();
    const { showError } = useToast();

    const [statsState, setStatsState] = useState({ data: null, loading: true, error: null });
    const [activityState, setActivityState] = useState({ data: null, loading: true, error: null });
    const [trendsState, setTrendsState] = useState({ data: [], loading: true, error: null });
    const [achievementsState, setAchievementsState] = useState({ data: null, loading: true, error: null });
    const [recommendationsState, setRecommendationsState] = useState({ data: [], loading: true, error: null });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, data-privacy

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/api/profile`, {
                method: 'DELETE'
            });

            if (res.ok) {
                logout();
            } else {
                const data = await res.json();
                showError(data.error || 'Failed to delete account');
                setShowDeleteConfirm(false);
            }
        } catch (err) {
            showError('Failed to delete account');
            console.error(err);
            setShowDeleteConfirm(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAllData();
        }
    }, [user]);

    const fetchAllData = () => {
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

    const fetchStats = async () => {
        try {
            setStatsState(prev => ({ ...prev, loading: true, error: null }));
            const res = await fetchWithAuth(`${API_URL}/api/profile/stats/${user.id}`);
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
            const res = await fetchWithAuth(`${API_URL}/api/profile/activity/${user.id}`);
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
            const res = await fetchWithAuth(`${API_URL}/api/profile/trends/${user.id}?days=30`);
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
            const res = await fetchWithAuth(`${API_URL}/api/profile/achievements/${user.id}`);
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
            const res = await fetchWithAuth(`${API_URL}/api/profile/recommendations/${user.id}`);
            if (handleFetchError(res)) return;
            if (!res.ok) throw new Error('Failed to fetch recommendations');
            const data = await res.json();
            setRecommendationsState({ data: data.recommendations || [], loading: false, error: null });
        } catch (err) {
            console.error(err);
            setRecommendationsState(prev => ({ ...prev, loading: false, error: err.message }));
        }
    };

    return (
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="glass-card" style={{
                        maxWidth: '400px',
                        width: '100%',
                        textAlign: 'center',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Delete Account?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
                            Are you sure you want to delete your account? This action <strong>cannot be undone</strong> and will permanently delete all your quizzes, results, and stats.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#ef4444',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Yes, Delete Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header & Quick Stats */}
            <div className="glass-card">
                <ProfileHeader
                    user={user}
                    userStats={statsState.data?.userStats}
                    onBack={onBack}
                />
                <QuickStats
                    stats={statsState.data}
                    loading={statsState.loading}
                    error={statsState.error}
                />
            </div>

            {/* Tabs */}
            <div className="glass-card" style={{ padding: '0' }}>
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'auto'
                }}>
                    <button
                        onClick={() => setActiveTab('overview')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            border: 'none',
                            background: activeTab === 'overview' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            color: activeTab === 'overview' ? '#818cf8' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            borderBottom: activeTab === 'overview' ? '2px solid #818cf8' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        📊 Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('data-privacy')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            border: 'none',
                            background: activeTab === 'data-privacy' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            color: activeTab === 'data-privacy' ? '#818cf8' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            borderBottom: activeTab === 'data-privacy' ? '2px solid #818cf8' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        🔒 Data & Privacy
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <>
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

                    {/* Delete Account Section */}
                    <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#ef4444' }}>Danger Zone</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Deleting your account is permanent. All your quizzes, results, and stats will be wiped out.
                        </p>
                        <button
                            onClick={handleDeleteClick}
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                        >
                            Delete Account
                        </button>
                    </div>
                </>
            )}

            {/* Data & Privacy Tab */}
            {activeTab === 'data-privacy' && (
                <div className="glass-card">
                    <DataManagement />
                </div>
            )}
        </div>
    );
};

export default UserProfile;

