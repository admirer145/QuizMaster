import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API_URL from '../config';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const UserProfile = ({ onBack }) => {
    const { user, token } = useAuth();
    const { showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState(null);
    const [trends, setTrends] = useState([]);
    const [achievements, setAchievements] = useState({ unlocked: [], locked: [] });
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            const [statsRes, activityRes, trendsRes, achievementsRes, recommendationsRes] = await Promise.all([
                fetch(`${API_URL}/api/profile/stats/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/profile/activity/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/profile/trends/${user.id}?days=30`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/profile/achievements/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/profile/recommendations/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const statsData = await statsRes.json();
            const activityData = await activityRes.json();
            const trendsData = await trendsRes.json();
            const achievementsData = await achievementsRes.json();
            const recommendationsData = await recommendationsRes.json();

            setStats(statsData);
            setActivity(activityData);
            setTrends(trendsData.trends || []);
            setAchievements(achievementsData);
            setRecommendations(recommendationsData.recommendations || []);
        } catch (err) {
            showError('Failed to load profile data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
            <div className="glass-card" style={{ maxWidth: '1200px', width: '100%' }}>
                <h2>Loading Profile...</h2>
                <div className="skeleton" style={{ height: '400px' }} />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="glass-card" style={{ maxWidth: '1200px', width: '100%' }}>
                <h2>Profile</h2>
                <p>No profile data available</p>
                <button onClick={onBack}>← Back</button>
            </div>
        );
    }

    const { userStats, categoryStats, rank, improvementRate, difficultyDist } = stats;

    return (
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'white'
                        }}>
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>{user.username}</h2>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <span>Level {userStats.level || 1}</span>
                                <span>•</span>
                                <span>Joined {new Date(userStats.joinedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)' }}>
                        ← Back
                    </button>
                </div>

                {/* Quick Stats */}
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
            </div>

            {/* Performance Overview */}
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
                            color: improvementRate.improvementRate >= 0 ? '#22c55e' : '#ef4444'
                        }}>
                            {improvementRate.improvementRate >= 0 ? '↑' : '↓'} {Math.abs(improvementRate.improvementRate).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Trend Chart */}
            {trends.length > 0 && (
                <div className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem' }}>📈 Performance Trend (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(0,0,0,0.8)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} name="Avg Score" />
                            <Line type="monotone" dataKey="bestScore" stroke="#22c55e" strokeWidth={2} name="Best Score" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Category Mastery */}
            {categoryStats && categoryStats.length > 0 && (
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
            )}

            {/* Achievements */}
            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>
                    🏆 Achievements ({achievements.unlockedCount}/{achievements.totalAchievements})
                </h3>

                {/* Unlocked Achievements */}
                {achievements.unlocked.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#22c55e' }}>✓ Unlocked</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {achievements.unlocked.map((achievement, idx) => (
                                <div key={idx} style={{
                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{achievement.icon}</div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{achievement.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{achievement.description}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.5rem' }}>
                                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked Achievements */}
                {achievements.locked.length > 0 && (
                    <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>🔒 Locked</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {achievements.locked.slice(0, 6).map((achievement, idx) => (
                                <div key={idx} style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    opacity: 0.6
                                }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', filter: 'grayscale(100%)' }}>
                                        {achievement.icon}
                                    </div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{achievement.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        {achievement.description}
                                    </div>
                                    <div style={{
                                        height: '4px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '2px',
                                        overflow: 'hidden',
                                        marginTop: '0.5rem'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${achievement.progress}%`,
                                            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {Math.round(achievement.progress)}% complete
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
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
            )}

            {/* Recent Activity */}
            {activity && activity.recentAttempts && activity.recentAttempts.length > 0 && (
                <div className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem' }}>📝 Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {activity.recentAttempts.map((attempt, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{attempt.quizTitle}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {attempt.category} • {attempt.difficulty} • {attempt.questionCount} questions
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    color: getScoreColor(attempt.score),
                                    marginRight: '1rem'
                                }}>
                                    {attempt.score}%
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: '100px', textAlign: 'right' }}>
                                    {new Date(attempt.completed_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
