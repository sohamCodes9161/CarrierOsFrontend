import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

/**
 * Compact AI voice player with Play / Pause / Resume / Replay controls.
 */
export default function AudioPlayer({
  url,
  preparing = false,
  unavailable = false,
  autoPlay = false,
  onPlayingChange,
  label = 'AI voice',
}) {
  const audioRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | playing | paused | ended

  useEffect(() => {
    setStatus('idle');
    const el = audioRef.current;
    if (!el || !url) return;

    if (autoPlay) {
      el.play().catch(() => {
        // Browser blocked autoplay before user gesture; user can tap Listen
        setStatus('idle');
      });
    }
  }, [url, autoPlay]);

  useEffect(() => {
    onPlayingChange?.(status === 'playing');
  }, [status, onPlayingChange]);

  // Pause AI speech automatically if the user starts recording an answer
  useEffect(() => {
    const handleMicStart = () => {
      const el = audioRef.current;
      if (el && !el.paused) {
        el.pause();
      }
    };
    window.addEventListener('careeros:mic-recording-start', handleMicStart);
    return () => window.removeEventListener('careeros:mic-recording-start', handleMicStart);
  }, []);

  function togglePlayback() {
    const el = audioRef.current;
    if (!el) return;

    if (status === 'playing') {
      el.pause();
    } else {
      if (status === 'ended') el.currentTime = 0;
      el.play().catch(() => {});
    }
  }

  function handleRestart() {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play().catch(() => {});
  }

  if (url) {
    const isPlaying = status === 'playing';
    const isPaused = status === 'paused';

    return (
      <div className="inline-flex items-center gap-1.5">
        <audio
          ref={audioRef}
          preload="metadata"
          src={url}
          aria-label={label}
          onPlay={() => setStatus('playing')}
          onPause={() => {
            if (audioRef.current && !audioRef.current.ended) {
              setStatus('paused');
            }
          }}
          onEnded={() => setStatus('ended')}
        />

        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? 'Pause AI voice' : isPaused ? 'Resume AI voice' : 'Listen to question'}
          className={`btn btn-xs gap-1.5 rounded-full px-3 font-medium transition-all ${
            isPlaying
              ? 'btn-primary'
              : isPaused
                ? 'btn-outline border-primary/50 text-primary'
                : 'btn-ghost border border-base-300 bg-base-200/70 hover:bg-base-200'
          }`}
        >
          <Icon name={isPlaying ? 'pause' : isPaused ? 'play' : 'volume'} className="h-3.5 w-3.5" />
          <span>{isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Listen Again'}</span>
        </button>

        {(isPlaying || isPaused) && (
          <button
            type="button"
            onClick={handleRestart}
            title="Restart audio"
            aria-label="Restart audio"
            className="btn btn-ghost btn-xs btn-circle text-muted hover:text-base-content"
          >
            <Icon name="refresh" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  if (preparing) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted" role="status">
        <span className="loading loading-spinner loading-xs" aria-hidden="true" />
        Preparing voice…
      </span>
    );
  }

  if (unavailable) {
    return <span className="text-xs text-muted">Voice unavailable</span>;
  }

  return null;
}