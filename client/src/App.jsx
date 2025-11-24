import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import QuizSetup from './components/QuizSetup';
import QuizGame from './components/QuizGame';
import Leaderboard from './components/Leaderboard';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('menu'); // menu, game, leaderboard
  const [activeQuizId, setActiveQuizId] = useState(null);

  if (!user) {
    return (
      <div className="container">
        <h1>QuizMaster</h1>
        <AuthForm />
      </div>
    );
  }

  const startQuiz = (quizId) => {
    setActiveQuizId(quizId);
    setView('game');
  };

  const endGame = () => {
    setActiveQuizId(null);
    setView('menu');
  };

  return (
    <div className="container">
      <header style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '0 2rem'
      }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>QuizMaster</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>Hello, {user.username}</span>
          <button onClick={() => setView('leaderboard')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Leaderboard</button>
          <button onClick={logout} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)' }}>Logout</button>
        </div>
      </header>

      {view === 'menu' && <QuizSetup onStartQuiz={startQuiz} />}
      {view === 'game' && <QuizGame quizId={activeQuizId} onEndGame={endGame} />}
      {view === 'leaderboard' && <Leaderboard onBack={() => setView('menu')} />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
