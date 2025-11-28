import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const PerformanceTrend = ({ trends, loading, error }) => {
    if (loading) {
        return (
            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>📈 Performance Trend (Last 30 Days)</h3>
                <div className="skeleton" style={{ height: '300px' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem' }}>📈 Performance Trend (Last 30 Days)</h3>
                <div style={{ color: '#ef4444' }}>Failed to load trends data</div>
            </div>
        );
    }

    if (!trends || trends.length === 0) return null;

    return (
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
    );
};

export default PerformanceTrend;
