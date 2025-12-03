import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const ChallengeResults = ({ challengeId, onClose }) => {
    const { user, fetchWithAuth } = useAuth();
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showWinner, setShowWinner] = useState(false);

    useEffect(() => {
        fetchChallengeDetails();
    }, [challengeId]);

    useEffect(() => {
        if (challenge) {
            // Delay winner reveal for dramatic effect
            setTimeout(() => setShowWinner(true), 500);
        }
    }, [challenge]);

    const fetchChallengeDetails = async () => {
        try {
            const response = await fetchWithAuth(`${API_URL}/api/challenges/${challengeId}`);
            if (!response.ok) throw new Error('Failed to fetch challenge details');

            const data = await response.json();
            setChallenge(data.challenge);
        } catch (err) {
            console.error('Failed to fetch challenge:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="glass-card" style={{ textAlign: 'center' }}>
                <h2>Loading Results...</h2>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="glass-card" style={{ textAlign: 'center' }}>
                <h2>Challenge not found</h2>
                <button onClick={onClose}>Back</button>
            </div>
        );
    }

    const isCreator = challenge.creator_id === user.id;
    const myScore = isCreator ? challenge.creator_score : challenge.opponent_score;
    const opponentScore = isCreator ? challenge.opponent_score : challenge.creator_score;
    const myTime = isCreator ? challenge.creator_time : challenge.opponent_time;
    const opponentTime = isCreator ? challenge.opponent_time : challenge.creator_time;
    const opponentName = isCreator ? challenge.opponent_username : challenge.creator_username;

    const isWinner = challenge.winner_id === user.id;
    const isDraw = challenge.status === 'completed' && !challenge.winner_id;

    return (
        <div className="glass-card" style={{ maxWidth: '700px', width: '100%' }}>
            {/* Winner Announcement */}
            <div style={{
                textAlign: 'center',
                marginBottom: '2rem',
                padding: '1.5rem',
                background: isWinner
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))'
                    : isDraw
                        ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(249, 115, 22, 0.1))'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
                border: isWinner
                    ? '2px solid rgba(34, 197, 94, 0.3)'
                    : isDraw
                        ? '2px solid rgba(251, 146, 60, 0.3)'
                        : '2px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {showWinner && (
                    <>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '0.5rem',
                            animation: 'bounceIn 0.6s ease-out'
                        }}>
                            {isWinner ? '🏆' : isDraw ? '🤝' : '😔'}
                        </div>
                        <h1 style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.8rem',
                            color: isWinner ? '#22c55e' : isDraw ? '#fb923c' : '#ef4444',
                            animation: 'fadeIn 0.8s ease-out'
                        }}>
                            {isWinner ? 'Victory!' : isDraw ? 'Draw!' : 'Defeat'}
                        </h1>
                        <p style={{
                            fontSize: '1rem',
                            color: 'var(--text-muted)',
                            margin: 0
                        }}>
                            {isWinner
                                ? `You defeated ${opponentName}!`
                                : isDraw
                                    ? `You tied with ${opponentName}!`
                                    : `${opponentName} won this round!`
                            }
                        </p>
                        {/* Show tiebreaker explanation when scores are equal */}
                        {myScore === opponentScore && !isDraw && (
                            <p style={{
                                fontSize: '0.85rem',
                                color: isWinner ? '#22c55e' : '#fb923c',
                                margin: '0.5rem 0 0 0',
                                fontWeight: '600',
                                background: isWinner
                                    ? 'rgba(34, 197, 94, 0.15)'
                                    : 'rgba(251, 146, 60, 0.15)',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                display: 'inline-block'
                            }}>
                                ⚡ {isWinner
                                    ? `You completed it ${Math.abs(myTime - opponentTime)}s faster!`
                                    : `${opponentName} was ${Math.abs(myTime - opponentTime)}s faster!`
                                }
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Score Comparison */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '1.5rem',
                marginBottom: '2rem',
                alignItems: 'center'
            }}>
                {/* Your Score */}
                <div style={{
                    textAlign: 'center',
                    padding: '1.25rem',
                    background: isWinner
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border: isWinner
                        ? '2px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid var(--glass-border)',
                    borderRadius: '12px'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        You
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: isWinner ? '#22c55e' : 'white',
                        marginBottom: '0.25rem',
                        lineHeight: '1'
                    }}>
                        {myScore}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        ⏱️ {myTime}s
                    </div>
                </div>

                {/* VS */}
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--text-muted)',
                    opacity: 0.5
                }}>
                    VS
                </div>

                {/* Opponent Score */}
                <div style={{
                    textAlign: 'center',
                    padding: '1.25rem',
                    background: !isWinner && !isDraw
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border: !isWinner && !isDraw
                        ? '2px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid var(--glass-border)',
                    borderRadius: '12px'
                }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {opponentName}
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: !isWinner && !isDraw ? '#22c55e' : 'white',
                        marginBottom: '0.25rem',
                        lineHeight: '1'
                    }}>
                        {opponentScore}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        ⏱️ {opponentTime}s
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>📊 Match Details</h3>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {/* Score Difference */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px'
                    }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Score Difference</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                            {Math.abs(myScore - opponentScore)} points
                        </span>
                    </div>

                    {/* Time Difference */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px'
                    }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Time Difference</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                            {Math.abs(myTime - opponentTime)}s
                        </span>
                    </div>

                    {/* Quiz Info */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px'
                    }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Quiz</span>
                        <span style={{ fontWeight: '600', fontSize: '0.95rem', textAlign: 'right', maxWidth: '60%' }}>
                            {challenge.quiz_title}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                    onClick={onClose}
                    style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.2))',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(79, 70, 229, 0.3))';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.2))';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    ← Back to Challenges
                </button>
            </div>

            {/* Confetti Animation for Winners */}
            {isWinner && showWinner && (
                <style>{`
@keyframes bounceIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
}
@keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
}
`}</style>
            )}
        </div>
    );
};

export default ChallengeResults;
