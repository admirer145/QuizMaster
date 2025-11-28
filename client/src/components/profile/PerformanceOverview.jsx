import React from 'react';

const PerformanceOverview = ({ stats, loading, error }) => {
    if (loading) {
        return (
            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>📊 Performance Overview</h3>
                <div className="skeleton" style={{ height: '100px' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>📊 Performance Overview</h3>
                <div style={{ color: '#ef4444' }}>Failed to load performance data</div>
            </div>
        );
    }

    if (!stats) return null;

    const { userStats, improvementRate } = stats;

    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem' }}>📊 Performance Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Best Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{userStats.bestScore}%</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Perfect Scores</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a855f7' }}>⭐ {userStats.perfectScores}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Longest Streak</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>🔥 {userStats.longestStreak}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Improvement Rate</div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: improvementRate?.improvementRate >= 0 ? '#22c55e' : '#ef4444'
                    }}>
                        {improvementRate?.improvementRate >= 0 ? '↑' : '↓'} {Math.abs(improvementRate?.improvementRate || 0).toFixed(1)}%
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceOverview;
