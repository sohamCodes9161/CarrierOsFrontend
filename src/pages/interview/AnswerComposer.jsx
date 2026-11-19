import { useEffect, useRef, useState } from 'react';

import FormField, { fieldProps, textareaClass } from '../../components/forms/FormField.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import VoiceOrb from '../../components/ui/VoiceOrb.jsx';
import { audioLevelSupported, resumeAudioContext, useMicLevel } from '../../hooks/useAudioLevel.js';
import { LIMITS } from '../../utils/constants.js';
import { formatSeconds } from '../../utils/format.js';

const SpeechRecognitionImpl =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;
const canRecord =
  typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof window.MediaRecorder !== 'undefined';

const EXTENSIONS = { 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/wav': 'wav' };

const SILENCE_THRESHOLD = 0.045;
const SILENCE_MS = 5000;

function pickMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return candidates.find((type) => window.MediaRecorder.isTypeSupported?.(type)) || '';
}

export default function AnswerComposer({ voiceEnabled, disabled, onSubmitText, onSubmitAudio }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [micError, setMicError] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | recording | recorded
  const [seconds, setSeconds] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [hasRecording, setHasRecording] = useState(false);
  const [micStream, setMicStream] = useState(null);
  const [silenceCountdown, setSilenceCountdown] = useState(null);

  const r = useRef({
    stream: null,
    recorder: null,
    recognition: null,
    wantRecognition: false,
    chunks: [],
    blob: null,
    url: '',
    timer: 0,
    startedAt: 0,
    baseText: '',
    finalText: '',
  });
  const silenceStartRef = useRef(null);
  const autoSubmitRef = useRef(false);

  const showMic = voiceEnabled && canRecord;
  const recording = phase === 'recording';
  const detectSilence = showMic && audioLevelSupported;
  const micLevel = useMicLevel(recording ? micStream : null);

  function cleanupMedia() {
    const s = r.current;
    s.wantRecognition = false;
    try {
      s.recognition?.abort();
    } catch {
      /* already stopped */
    }
    clearInterval(s.timer);
    if (s.recorder && s.recorder.state !== 'inactive') {
      s.recorder.onstop = null;
      try {
        s.recorder.stop();
      } catch {
        /* already stopped */
      }
    }
    s.stream?.getTracks().forEach((track) => track.stop());
    s.stream = null;
  }

  useEffect(
    () => () => {
      cleanupMedia();
      if (r.current.url) URL.revokeObjectURL(r.current.url);
    },
    []
  );

  useEffect(() => {
    if (!detectSilence || !recording) {
      silenceStartRef.current = null;
      setSilenceCountdown((prev) => (prev === null ? prev : null));
      return;
    }
    const now = Date.now();
    if (micLevel > SILENCE_THRESHOLD) {
      if (silenceStartRef.current !== null) silenceStartRef.current = null;
      setSilenceCountdown((prev) => (prev === null ? prev : null));
      return;
    }
    if (silenceStartRef.current === null) silenceStartRef.current = now;
    const remaining = SILENCE_MS - (now - silenceStartRef.current);
    if (remaining <= 0) {
      if (!autoSubmitRef.current) {
        autoSubmitRef.current = true;
        setSilenceCountdown(null);
        stopRecording();
      }
      return;
    }
    const secs = Math.ceil(remaining / 1000);
    setSilenceCountdown((prev) => (prev === secs ? prev : secs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micLevel, recording, detectSilence]);

  useEffect(() => {
    if (phase === 'recorded' && autoSubmitRef.current) {
      autoSubmitRef.current = false;
      doSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function cancelAutoSubmit() {
    silenceStartRef.current = Date.now();
    setSilenceCountdown(Math.round(SILENCE_MS / 1000));
  }

  function startRecognition() {
    const s = r.current;
    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) s.finalText += `${result[0].transcript} `;
        else interim += result[0].transcript;
      }
      setText((s.baseText + s.finalText + interim).slice(0, LIMITS.answer));
    };
    recognition.onerror = (event) => {
      if (['not-allowed', 'service-not-allowed', 'audio-capture', 'network'].includes(event.error)) s.wantRecognition = false;
    };
    recognition.onend = () => {
      if (s.wantRecognition) {
        try {
          recognition.start();
        } catch {
          s.wantRecognition = false;
        }
      }
    };

    s.recognition = recognition;
    s.wantRecognition = true;
    try {
      recognition.start();
    } catch {
      s.wantRecognition = false;
    }
  }

  async function startRecording() {
    setMicError('');
    setError('');
    // Pause any active AI TTS playback so the mic doesn't pick up the AI's voice
    window.dispatchEvent(new Event('careeros:mic-recording-start'));
    await resumeAudioContext();

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setMicError(
        err?.name === 'NotAllowedError'
          ? 'Microphone access is blocked. Allow it in browser settings to record.'
          : 'Could not access a microphone.'
      );
      return;
    }

    const mimeType = pickMimeType();
    let recorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch {
      stream.getTracks().forEach((track) => track.stop());
      setMicError('Recording isn’t supported in this browser. Type your answer instead.');
      return;
    }

    const s = r.current;
    if (s.url) URL.revokeObjectURL(s.url);
    s.url = '';
    s.blob = null;
    setRecordingUrl('');
    setHasRecording(false);

    s.stream = stream;
    s.recorder = recorder;
    s.chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) s.chunks.push(event.data);
    };
    recorder.onstop = () => {
      const type = (recorder.mimeType || mimeType || 'audio/webm').split(';')[0];
      s.blob = new Blob(s.chunks, { type });
      s.url = URL.createObjectURL(s.blob);
      s.stream?.getTracks().forEach((track) => track.stop());
      s.stream = null;
      setRecordingUrl(s.url);
      setHasRecording(true);
      setPhase('recorded');
    };
    recorder.start();

    s.baseText = text ? `${text.replace(/\s+$/, '')} ` : '';
    s.finalText = '';
    if (SpeechRecognitionImpl) startRecognition();

    silenceStartRef.current = null;
    autoSubmitRef.current = false;
    setSilenceCountdown(null);
    setMicStream(stream);

    s.startedAt = Date.now();
    setSeconds(0);
    s.timer = setInterval(() => setSeconds(Math.floor((Date.now() - s.startedAt) / 1000)), 500);
    setPhase('recording');
  }

  function stopRecording() {
    const s = r.current;
    s.wantRecognition = false;
    try {
      s.recognition?.stop();
    } catch {
      /* already stopped */
    }
    clearInterval(s.timer);
    if (s.recorder && s.recorder.state !== 'inactive') s.recorder.stop();
  }

  function discardRecording() {
    const s = r.current;
    if (s.url) URL.revokeObjectURL(s.url);
    s.url = '';
    s.blob = null;
    setRecordingUrl('');
    setHasRecording(false);
    setPhase('idle');
  }

  async function doSubmit() {
    const trimmed = text.trim();
    setError('');

    if (trimmed) {
      if (trimmed.length > LIMITS.answer) {
        setError(`Answer is too long (max ${LIMITS.answer} characters).`);
        return;
      }
      await onSubmitText(trimmed);
      return;
    }

    const blob = r.current.blob;
    if (blob) {
      if (blob.size > LIMITS.audioBytes) {
        setError('That recording is too large (max 15 MB). Record a shorter answer.');
        return;
      }
      const type = blob.type || 'audio/webm';
      const file = new File([blob], `answer.${EXTENSIONS[type] || 'webm'}`, { type });
      await onSubmitAudio(file);
      return;
    }

    setError('Write or record an answer first.');
  }

  function handleSubmit(event) {
    event.preventDefault();
    doSubmit();
  }

  const canSubmit = !disabled && !recording && (text.trim().length > 0 || hasRecording);
  const usingRecordingOnly = !text.trim() && hasRecording;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
      <FormField
        id="answer"
        label="Your answer"
        error={error}
        counter={`${text.length}/${LIMITS.answer}`}
      >
        <textarea
          {...fieldProps('answer', error, false)}
          rows={5}
          maxLength={LIMITS.answer}
          className={textareaClass(error)}
          placeholder={recording ? 'Listening… speak your answer aloud' : 'Type your answer here, or tap Record below…'}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          readOnly={recording}
          disabled={disabled}
        />
      </FormField>

      {/* Compact single-row portable action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          {showMic && (
            recording ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-error/30 bg-error/10 px-2.5 py-1">
                {audioLevelSupported && <VoiceOrb level={micLevel} active variant="user" size={24} className="flex-shrink-0" />}
                <span className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-error" role="status">
                  <span className="rec-dot h-2 w-2 rounded-full bg-error" aria-hidden="true" />
                  {formatSeconds(seconds)}
                </span>
                {silenceCountdown !== null && (
                  <button
                    type="button"
                    onClick={cancelAutoSubmit}
                    title="Auto-submitting on silence — click to keep talking"
                    className="rounded-full bg-warning/20 px-2 py-0.5 text-[11px] font-medium text-warning hover:bg-warning/30"
                  >
                    Auto-send {silenceCountdown}s
                  </button>
                )}
                <button
                  type="button"
                  onClick={stopRecording}
                  className="btn btn-error btn-xs rounded-full px-2.5 text-white"
                >
                  <Icon name="stop" className="h-3 w-3" />
                  Stop
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={disabled}
                  className="btn btn-outline btn-sm gap-1.5 rounded-full px-3.5"
                >
                  <Icon name="microphone" className="h-3.5 w-3.5 text-primary" />
                  <span>{hasRecording ? 'Re-record' : 'Record'}</span>
                </button>

                {hasRecording && (
                  <div className="inline-flex items-center gap-1 rounded-full border border-base-300 bg-base-200/70 px-2 py-0.5">
                    <audio controls src={recordingUrl} className="h-7 w-36 sm:w-44" aria-label="Your recording" />
                    <button
                      type="button"
                      onClick={discardRecording}
                      disabled={disabled}
                      aria-label="Discard recording"
                      className="btn btn-ghost btn-xs btn-circle text-muted hover:text-error"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        <Button type="submit" size="sm" disabled={!canSubmit} loading={disabled}>
          {disabled ? 'Submitting…' : usingRecordingOnly ? 'Submit recording' : 'Submit answer'}
        </Button>
      </div>

      {micError && (
        <p role="alert" className="text-xs text-error">
          {micError}
        </p>
      )}
    </form>
  );
}