import React from 'react';

const CategoryMastery = ({ categoryStats, loading, error }) => {
    const getScoreColor = (score) => {
        if (score >= 90) return '#22c55e';
        if (score >= 70) return '#3b82f6';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const getMasteryColor = (level) => {
        if (level >= 90) return 'linear-gradient(135deg, #22c55e, #16a34a)';
        if (level >= 70) return 'linear-gradient(135deg, #3b82f6, #2563eb)';
        if (level >= 50) return 'linear-gradient(135deg, #f59e0b, #d97706)';
        return 'linear-gradient(135deg, #ef4444, #dc2626)';
    };

    if (loading) {
        return (
            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>🎯 Category Mastery</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>🎯 Category Mastery</h3>
                <div style={{ color: '#ef4444' }}>Failed to load category data</div>
            </div>
        );
    }

    if (!categoryStats || categoryStats.length === 0) return null;

    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem' }}>🎯 Category Mastery</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {categoryStats.map((cat, idx) => (
                    <div key={idx} style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ fontWeight: '600' }}>
                                {cat.category}
                                {cat.isMastered && <span style={{ marginLeft: '0.5rem' }}>🏆</span>}
                                {cat.needsImprovement && <span style={{ marginLeft: '0.5rem' }}>⚠️</span>}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: getScoreColor(cat.avgScore) }}>
                                {Math.round(cat.avgScore)}% avg
                            </div>
                        </div>
                        <div style={{
                            height: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${cat.masteryLevel}%`,
                                background: getMasteryColor(cat.masteryLevel),
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '0.5rem',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)'
                        }}>
                            <span>{cat.quizzesCompleted} quizzes</span>
                            <span>•</span>
                            <span>{cat.totalAttempts} attempts</span>
                            <span>•</span>
                            <span>Best: {cat.bestScore}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryMastery;
