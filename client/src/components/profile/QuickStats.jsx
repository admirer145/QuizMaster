import React from 'react';

const QuickStats = ({ stats, loading, error }) => {
    const getScoreColor = (score) => {
        if (score >= 90) return '#22c55e';
        if (score >= 70) return '#3b82f6';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
                ))}
            </div>
        );
    }

    if (error) {
        return <div style={{ color: '#ef4444', textAlign: 'center', padding: '1rem' }}>Failed to load stats</div>;
    }

    if (!stats) return null;

    const { userStats, rank } = stats;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{userStats.totalQuizzes}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Quizzes</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getScoreColor(userStats.avgScore) }}>
                    {Math.round(userStats.avgScore)}%
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avg Score</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>#{rank.rank || '-'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Global Rank</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>🔥 {userStats.currentStreak}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Day Streak</div>
            </div>
        </div>
    );
};

export default QuickStats;
