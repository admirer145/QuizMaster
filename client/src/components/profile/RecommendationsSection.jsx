import React from 'react';

const RecommendationsSection = ({ recommendations, loading, error }) => {
    if (loading) {
        return (
            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>💡 Personalized Recommendations</h3>
                <div className="skeleton" style={{ height: '150px' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>💡 Personalized Recommendations</h3>
                <div style={{ color: '#ef4444' }}>Failed to load recommendations</div>
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) return null;

    return (
        <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem' }}>💡 Personalized Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recommendations.map((rec, idx) => (
                    <div key={idx} style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        padding: '1rem',
                        borderRadius: '12px'
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{rec.title}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{rec.message}</div>
                        {rec.categories && rec.categories.length > 0 && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {rec.categories.map((cat, i) => (
                                    <span key={i} style={{
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem'
                                    }}>
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendationsSection;
