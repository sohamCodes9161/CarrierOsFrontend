import { useEffect, useRef, useState } from 'react';

import FormField, { fieldProps, textareaClass } from '../../components/forms/FormField.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { LIMITS } from '../../utils/constants.js';
import { formatSeconds } from '../../utils/format.js';

const SpeechRecognitionImpl =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;
const canRecord =
  typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof window.MediaRecorder !== 'undefined';

const EXTENSIONS = { 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/wav': 'wav' };

function pickMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return candidates.find((type) => window.MediaRecorder.isTypeSupported?.(type)) || '';
}

/**
 * Answer box with optional voice input.
 *
 * Voice path (interview started with voice enabled):
 *  - Where the browser supports live speech recognition, the transcript streams into the
 *    text box as you talk, and you review it before submitting (text endpoint - fastest).
 *  - Otherwise the recording itself is uploaded and transcribed by the server.
 */
export default function AnswerComposer({ voiceEnabled, disabled, onSubmitText, onSubmitAudio }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [micError, setMicError] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | recording | recorded
  const [seconds, setSeconds] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [hasRecording, setHasRecording] = useState(false);

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

  const showMic = voiceEnabled && canRecord;
  const recording = phase === 'recording';

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
      // Permission/service problems: stop retrying and fall back to server-side transcription.
      if (['not-allowed', 'service-not-allowed', 'audio-capture', 'network'].includes(event.error)) s.wantRecognition = false;
    };
    recognition.onend = () => {
      if (s.wantRecognition) {
        try {
          recognition.start(); // Chrome ends sessions after silence; keep listening while recording
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
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setMicError(
        err?.name === 'NotAllowedError'
          ? 'Microphone access is blocked. Allow it in your browser settings to record an answer.'
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
      setMicError('Recording isn’t supported in this browser. You can type your answer instead.');
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

  async function handleSubmit(event) {
    event.preventDefault();
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

  const canSubmit = !disabled && !recording && (text.trim().length > 0 || hasRecording);
  const usingRecordingOnly = !text.trim() && hasRecording;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <FormField
        id="answer"
        label="Your answer"
        error={error}
        counter={`${text.length}/${LIMITS.answer}`}
        hint={showMic ? 'Type your answer, or record it and review the transcript before sending.' : undefined}
      >
        <textarea
          {...fieldProps('answer', error, showMic)}
          rows={7}
          maxLength={LIMITS.answer}
          className={textareaClass(error)}
          placeholder="Type your answer here…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          readOnly={recording}
          disabled={disabled}
        />
      </FormField>

      {showMic && (
        <div className="rounded-btn border border-base-300 bg-base-200/60 p-3">
          {recording ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-sm font-medium text-error" role="status">
                <span className="rec-dot h-2.5 w-2.5 rounded-full bg-error" aria-hidden="true" />
                Recording {formatSeconds(seconds)}
              </span>
              <Button variant="neutral" size="sm" onClick={stopRecording}>
                <Icon name="stop" className="h-4 w-4" />
                Stop
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={startRecording} disabled={disabled}>
                <Icon name="microphone" className="h-4 w-4" />
                {hasRecording ? 'Record again' : 'Record answer'}
              </Button>
              {hasRecording && (
                <>
                  <audio controls src={recordingUrl} className="h-9 max-w-full" aria-label="Your recording" />
                  <button type="button" className="btn btn-ghost btn-xs" onClick={discardRecording} disabled={disabled}>
                    Discard
                  </button>
                </>
              )}
            </div>
          )}
          {micError && (
            <p role="alert" className="mt-2 text-sm text-error">
              {micError}
            </p>
          )}
          {usingRecordingOnly && (
            <p className="mt-2 text-xs text-muted">No live transcript was captured, so the recording will be transcribed on the server.</p>
          )}
          {SpeechRecognitionImpl && (
            <p className="mt-2 text-xs text-muted">Live transcription uses your browser’s speech service (in Chrome, audio is processed by Google).</p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit} loading={disabled}>
          {disabled ? 'Submitting…' : usingRecordingOnly ? 'Submit recording' : 'Submit answer'}
        </Button>
      </div>
    </form>
  );
}
