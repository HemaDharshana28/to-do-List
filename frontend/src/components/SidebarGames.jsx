import { useState, useEffect, useRef, useCallback } from 'react';
import { Wind, Zap, BookOpen, RotateCcw, Trophy } from 'lucide-react';

/* ─── 1. Breathing Exercise ─── */
function BreathingGame() {
  const [phase, setPhase] = useState('idle'); // idle | inhale | hold | exhale
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);

  const PHASES = [
    { name: 'inhale', label: 'Breathe In',  duration: 4, color: '#d4af37' },
    { name: 'hold',   label: 'Hold',        duration: 4, color: '#f5d020' },
    { name: 'exhale', label: 'Breathe Out', duration: 6, color: '#b8860b' },
  ];
  const phaseIdx = useRef(0);

  const runPhase = useCallback(() => {
    const p = PHASES[phaseIdx.current % 3];
    setPhase(p.name);
    setCount(p.duration);

    let remaining = p.duration;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setCount(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        phaseIdx.current += 1;
        if (phaseIdx.current % 3 === 0) setCycles(c => c + 1);
        runPhase();
      }
    }, 1000);
  }, []);

  const start = () => {
    clearInterval(timerRef.current);
    phaseIdx.current = 0;
    setCycles(0);
    runPhase();
  };

  const stop = () => {
    clearInterval(timerRef.current);
    setPhase('idle');
    setCount(0);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const currentPhase = PHASES.find(p => p.name === phase);
  const isActive = phase !== 'idle';
  const progress = isActive ? (count / currentPhase.duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Animated orb */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Ripple rings */}
        {isActive && (
          <>
            <div className="absolute inset-0 rounded-full" style={{
              border: '1px solid rgba(212,175,55,0.3)',
              animation: phase === 'inhale' ? 'none' : 'ripple 2s ease-out infinite',
            }} />
            <div className="absolute inset-0 rounded-full" style={{
              border: '1px solid rgba(212,175,55,0.2)',
              animation: phase === 'inhale' ? 'none' : 'ripple 2s ease-out 0.5s infinite',
            }} />
          </>
        )}
        {/* Main orb */}
        <div className="rounded-full flex items-center justify-center transition-all duration-1000"
          style={{
            width:  isActive && phase === 'inhale' ? '90px' : isActive && phase === 'hold' ? '90px' : '60px',
            height: isActive && phase === 'inhale' ? '90px' : isActive && phase === 'hold' ? '90px' : '60px',
            background: isActive
              ? `radial-gradient(circle, ${currentPhase.color}55 0%, ${currentPhase.color}22 60%, transparent 80%)`
              : 'rgba(212,175,55,0.12)',
            border: `2px solid ${isActive ? currentPhase.color + '88' : 'rgba(212,175,55,0.3)'}`,
            boxShadow: isActive ? `0 0 30px ${currentPhase.color}33` : 'none',
          }}>
          <span className="font-display font-bold text-2xl" style={{ color: isActive ? currentPhase.color : 'rgba(212,175,55,0.5)' }}>
            {isActive ? count : '•'}
          </span>
        </div>
      </div>

      {/* Phase label */}
      <p className="text-sm font-semibold tracking-wide" style={{ color: isActive ? currentPhase?.color : 'rgba(255,255,255,0.35)' }}>
        {isActive ? currentPhase.label.toUpperCase() : 'READY'}
      </p>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${progress}%`,
            background: isActive ? `linear-gradient(90deg, ${currentPhase.color}, ${currentPhase.color}aa)` : '0%',
          }} />
      </div>

      {cycles > 0 && (
        <p className="text-xs" style={{ color: 'rgba(212,175,55,0.6)' }}>✦ {cycles} cycle{cycles > 1 ? 's' : ''} complete</p>
      )}

      <div className="flex gap-2">
        {!isActive
          ? <button onClick={start} className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}>
              Start Breathing
            </button>
          : <button onClick={stop} className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Stop
            </button>
        }
      </div>
    </div>
  );
}

/* ─── 2. Tap-the-Dot Reflex Game ─── */
function ReflexGame() {
  const [state, setGameState] = useState('idle'); // idle | playing | result
  const [dot, setDot] = useState(null); // {x, y, id}
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [best, setBest] = useState(0);
  const timerRef = useRef(null);
  const dotTimerRef = useRef(null);

  const spawnDot = () => {
    const margin = 18;
    setDot({
      x: margin + Math.random() * (100 - 2 * margin),
      y: margin + Math.random() * (100 - 2 * margin),
      id: Math.random(),
    });
  };

  const start = () => {
    setScore(0);
    setTimeLeft(15);
    setGameState('playing');
    spawnDot();

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          clearTimeout(dotTimerRef.current);
          setDot(null);
          setGameState('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    dotTimerRef.current = setTimeout(function miss() {
      setScore(s => Math.max(0, s - 1));
      spawnDot();
      dotTimerRef.current = setTimeout(miss, 1800);
    }, 1800);
  };

  const hitDot = () => {
    setScore(s => {
      const next = s + 1;
      setBest(b => Math.max(b, next));
      return next;
    });
    clearTimeout(dotTimerRef.current);
    spawnDot();
    dotTimerRef.current = setTimeout(function miss() {
      setScore(s => Math.max(0, s - 1));
      spawnDot();
      dotTimerRef.current = setTimeout(miss, 1600);
    }, 1600);
  };

  useEffect(() => () => { clearInterval(timerRef.current); clearTimeout(dotTimerRef.current); }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Arena */}
      <div className="relative w-full rounded-xl overflow-hidden cursor-crosshair select-none"
        style={{ height: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.15)' }}>

        {state === 'playing' && dot && (
          <button
            key={dot.id}
            onClick={hitDot}
            className="absolute rounded-full transition-all"
            style={{
              left: `${dot.x}%`, top: `${dot.y}%`,
              transform: 'translate(-50%,-50%)',
              width: '28px', height: '28px',
              background: 'radial-gradient(circle, #f5d020, #b8860b)',
              boxShadow: '0 0 12px rgba(212,175,55,0.6)',
              animation: 'scaleIn 0.15s ease-out',
            }} />
        )}

        {state === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={start} className="px-4 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}>
              Tap to Play
            </button>
          </div>
        )}

        {state === 'result' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <p className="text-xs" style={{ color: 'rgba(212,175,55,0.6)' }}>Score</p>
            <p className="font-display font-bold text-2xl" style={{ color: '#f5d020' }}>{score}</p>
            <button onClick={start} className="mt-1 flex items-center gap-1 px-3 py-1 rounded-lg text-xs"
              style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}>
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Timer bar */}
        {state === 'playing' && (
          <div className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full transition-all duration-1000"
              style={{
                width: `${(timeLeft / 15) * 100}%`,
                background: 'linear-gradient(90deg, #d4af37, #f5d020)',
              }} />
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-xs px-1">
        {state === 'playing'
          ? <>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Score <span style={{ color: '#f5d020', fontWeight: 700 }}>{score}</span></span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{timeLeft}s left</span>
            </>
          : <span style={{ color: 'rgba(212,175,55,0.4)' }}>
              {best > 0 && <><Trophy className="w-3 h-3 inline mr-1" />Best: {best}</>}
            </span>
        }
      </div>
    </div>
  );
}

/* ─── 3. Word Scramble ─── */
const WORDS = [
  { word: 'FOCUS',   hint: 'Concentration' },
  { word: 'ACHIEVE', hint: 'Reach a goal' },
  { word: 'MOMENTUM',hint: 'Forward motion' },
  { word: 'CLARITY', hint: 'Clear thinking' },
  { word: 'THRIVE',  hint: 'Flourish' },
  { word: 'CREATE',  hint: 'Make something' },
  { word: 'BALANCE', hint: 'Equilibrium' },
  { word: 'MINDFUL', hint: 'Present-aware' },
];

function scramble(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('') === word ? scramble(word) : arr.join('');
}

function WordScramble() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * WORDS.length));
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState('idle'); // idle | correct | wrong
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setScrambled(scramble(WORDS[idx].word));
    setGuess('');
    setStatus('idle');
  }, [idx]);

  const check = () => {
    if (guess.toUpperCase() === WORDS[idx].word) {
      setStatus('correct');
      setStreak(s => s + 1);
      setTimeout(() => setIdx(i => (i + 1) % WORDS.length), 900);
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus('idle'), 700);
    }
  };

  const skip = () => {
    setStreak(0);
    setIdx(i => (i + 1) % WORDS.length);
  };

  const borderColor = status === 'correct' ? '#22c55e' : status === 'wrong' ? '#ef4444' : 'rgba(212,175,55,0.25)';

  return (
    <div className="flex flex-col gap-3">
      {/* Hint */}
      <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Hint: <span style={{ color: 'rgba(212,175,55,0.7)' }}>{WORDS[idx].hint}</span>
      </p>

      {/* Scrambled letters */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {scrambled.split('').map((ch, i) => (
          <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm"
            style={{
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.2)',
              color: '#d4af37',
            }}>
            {ch}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={guess}
          onChange={e => { setGuess(e.target.value.toUpperCase()); setStatus('idle'); }}
          onKeyDown={e => e.key === 'Enter' && check()}
          maxLength={WORDS[idx].word.length}
          placeholder="Your answer…"
          className="flex-1 px-3 py-1.5 rounded-lg text-sm font-display font-semibold text-center outline-none transition-all"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: `1.5px solid ${borderColor}`,
            color: status === 'correct' ? '#22c55e' : status === 'wrong' ? '#ef4444' : '#f5d020',
            letterSpacing: '0.1em',
          }}
        />
        <button onClick={check} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.25)' }}>
          Check
        </button>
      </div>

      <div className="flex justify-between items-center text-xs px-1">
        <button onClick={skip} style={{ color: 'rgba(255,255,255,0.3)' }} className="hover:text-white/50 transition-colors">
          Skip →
        </button>
        {streak > 0 && (
          <span style={{ color: '#d4af37' }}>🔥 {streak} in a row</span>
        )}
      </div>
    </div>
  );
}

/* ─── Main SidebarGames component ─── */
const GAMES = [
  { id: 'breathe', icon: Wind,     label: 'Breathe',  sub: 'Box breathing' },
  { id: 'reflex',  icon: Zap,      label: 'Reflexes', sub: 'Tap the dot'   },
  { id: 'words',   icon: BookOpen, label: 'Words',    sub: 'Unscramble'    },
];

export default function SidebarGames() {
  const [active, setActive] = useState('breathe');

  return (
    <div className="relative z-10 flex flex-col gap-4">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: 'rgba(212,175,55,0.45)' }}>
          Take a break
        </p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          A quick pause sharpens focus.
        </p>
      </div>

      {/* Game tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212,175,55,0.1)' }}>
        {GAMES.map(g => {
          const Icon = g.icon;
          const isActive = active === g.id;
          return (
            <button key={g.id} onClick={() => setActive(g.id)}
              className="flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 gap-1"
              style={{
                background: isActive ? 'rgba(212,175,55,0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
              }}>
              <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#d4af37' : 'rgba(255,255,255,0.3)' }} />
              <span className="text-xs font-semibold leading-none" style={{ color: isActive ? '#d4af37' : 'rgba(255,255,255,0.3)' }}>
                {g.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Game content */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(212,175,55,0.1)' }}>
        {active === 'breathe' && <BreathingGame />}
        {active === 'reflex'  && <ReflexGame />}
        {active === 'words'   && <WordScramble />}
      </div>
    </div>
  );
}
