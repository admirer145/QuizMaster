import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthForm from './components/AuthForm';
import Home from './components/Home';
// import QuizSetup from './components/QuizSetup'; // Removed as per user request
import QuizGame from './components/QuizGame';
import Leaderboard from './components/Leaderboard';
import QuizReport from './components/QuizReport';
import QuizAttempts from './components/QuizAttempts';
import MyQuizzes from './components/MyQuizzes';
import QuizCreator from './components/QuizCreator';
import QuizHub from './components/QuizHub';
import AIGenerator from './components/AIGenerator';
import QuizReview from './components/QuizReview';
import UserProfile from './components/UserProfile';
import Logo from './components/Logo';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('home'); // home, menu, game, leaderboard, report, attempts, my-quizzes, creator, hub, ai-generator, review, profile
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [activeResultId, setActiveResultId] = useState(null);
  const [editQuizId, setEditQuizId] = useState(null);

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
    setView('home');
  };

  const showReport = (resultId) => {
    setActiveResultId(resultId);
    setView('report');
  };

  const viewAttempts = (quizId) => {
    setActiveQuizId(quizId);
    setView('attempts');
  };

  const backToMenu = () => {
    setActiveQuizId(null);
    setActiveResultId(null);
    setView('home');
  };

  const backToAttempts = (quizId) => {
    if (quizId) setActiveQuizId(quizId);
    setActiveResultId(null);
    setView('attempts');
  };

  return (
    <div className="container">
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        width: '100%',
        marginBottom: '2rem',
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.5rem)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: '100%'
        }}>
          {/* Top row: Logo and User greeting */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div
              onClick={() => setView('home')}
              className="hover-scale"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '0.5rem',
                borderRadius: '12px',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Logo size={48} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{
                  fontSize: 'clamp(1.5rem, 4vw, 1.8rem)',
                  margin: 0,
                  fontWeight: '800',
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1
                }}>
                  QuizMaster
                </h1>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  marginTop: '0.2rem'
                }}>
                  Master Every Topic
                </span>
              </div>
            </div>
            <span style={{
              fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}>
              Hello, {user.username}
            </span>
          </div>

          {/* Bottom row: Action buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setView('home')}
              style={{
                padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                minWidth: 'auto',
                background: view === 'home' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.1)'
              }}
            >
              🏠 Home
            </button>
            <button
              onClick={() => setView('hub')}
              style={{
                padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                minWidth: 'auto',
                background: view === 'hub' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
              }}
            >
              🌐 Quiz Hub
            </button>
            <button
              onClick={() => setView('my-quizzes')}
              style={{
                padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                minWidth: 'auto',
                background: view === 'my-quizzes' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
              }}
            >
              My Quizzes
            </button>
            <button
              onClick={() => setView('ai-generator')}
              style={{
                padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                minWidth: 'auto',
                background: view === 'ai-generator'
                  ? 'linear-gradient(45deg, #ff00cc, #3333ff)'
                  : 'rgba(255,255,255,0.1)',
                opacity: view === 'ai-generator' ? 1 : 0.7
              }}
            >
              ✨ AI Generate
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => setView('review')}
                style={{
                  padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                  fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                  minWidth: 'auto',
                  background: view === 'review' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
                }}
              >
                Review Quizzes
              </button>
            )}
            <button
              onClick={() => setView('profile')}
              style={{
                padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                minWidth: 'auto',
                background: view === 'profile'
                  ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                  : 'rgba(255,255,255,0.1)'
              }}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setView('leaderboard')}
              style={{
                padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                minWidth: 'auto',
                background: view === 'leaderboard'
                  ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                  : 'rgba(255,255,255,0.1)'
              }}
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={logout}
              style={{
                padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.75rem, 2vw, 1rem)',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                background: 'rgba(255,255,255,0.1)',
                minWidth: 'auto'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {view === 'home' && (
        <Home
          onStartQuiz={startQuiz}
          onViewReport={showReport}
        />
      )}
      {/* {view === 'menu' && <QuizSetup onStartQuiz={startQuiz} onViewAttempts={viewAttempts} />} */}
      {view === 'game' && <QuizGame quizId={activeQuizId} onEndGame={endGame} onShowReport={showReport} />}
      {view === 'leaderboard' && <Leaderboard onBack={backToMenu} />}
      {view === 'report' && <QuizReport resultId={activeResultId} onBackToMenu={() => setView('home')} onBackToAttempts={backToAttempts} />}
      {view === 'attempts' && <QuizAttempts quizId={activeQuizId} userId={user.id} onViewReport={showReport} onBack={() => setView('home')} />}

      {view === 'my-quizzes' && (
        <MyQuizzes
          onEdit={(id) => {
            setEditQuizId(id);
            setView('creator');
          }}
          onCreate={() => {
            setEditQuizId(null);
            setView('creator');
          }}
          onBack={backToMenu}
        />
      )}
      {view === 'creator' && (
        <QuizCreator
          editQuizId={editQuizId}
          onBack={() => {
            setEditQuizId(null);
            setView('my-quizzes');
          }}
          onCreated={() => {
            setEditQuizId(null);
            setView('my-quizzes');
          }}
        />
      )}
      {view === 'hub' && (
        <QuizHub
          onBack={backToMenu}
        />
      )}
      {view === 'ai-generator' && (
        <AIGenerator
          onBack={backToMenu}
          onCreated={() => setView('my-quizzes')}
        />
      )}
      {view === 'review' && (
        <QuizReview
          onBack={backToMenu}
        />
      )}
      {view === 'profile' && (
        <UserProfile
          onBack={backToMenu}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
