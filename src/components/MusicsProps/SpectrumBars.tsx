import React, { useEffect, useRef, useCallback } from 'react';
import './SpectrumBars.css';

interface SpectrumBarsProps {
  barCount?: number;
  isPlaying?: boolean;
  audioElement?: HTMLAudioElement | null;
}

const SpectrumBars: React.FC<SpectrumBarsProps> = ({
  barCount = 20,
  isPlaying = false,
  audioElement,
}) => {
  /* ────────────────────────────
   * Refs
   * ────────────────────────────*/
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  /**
   * Cache of MediaElementAudioSourceNode keyed by <audio> element.
   * WeakMap ensures automatic GC when elements are gone.
   */
  const sourceCacheRef = useRef(
    new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>()
  );
  /** The source node that is *currently* feeding the analyser. */
  const currentSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  /* ────────────────────────────
   * Initialise bar refs
   * ────────────────────────────*/
  useEffect(() => {
    barsRef.current = Array(barCount).fill(null);
  }, [barCount]);

  /* eslint-disable react-hooks/exhaustive-deps */
  const setBarRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      barsRef.current[index] = el;
    },
    []
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  /* ────────────────────────────
   * Core effect: connect / animate when playing
   * ────────────────────────────*/
  useEffect(() => {
    /** Reset bar visuals to idle state. */
    const resetBars = () => {
      barsRef.current.forEach((bar) => {
        if (bar) {
          bar.style.height = '10%';
          bar.style.opacity = '0.4';
        }
      });
    };

    // Not playing or no element → ensure cleanup + idle bars.
    if (!isPlaying || !audioElement) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      resetBars();
      return;
    }

    /** Lazy‑create AudioContext. */
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current =
        new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    /** Lazy‑create Analyser. */
    if (!analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }

    /** Obtain (or create once) a source node for this <audio>. */
    let sourceNode = sourceCacheRef.current.get(audioElement);
    if (!sourceNode) {
      sourceNode = audioContextRef.current.createMediaElementSource(audioElement);
      sourceCacheRef.current.set(audioElement, sourceNode);
    }

    /** Ensure the analyser is only fed by *one* source at a time. */
    if (currentSourceRef.current && currentSourceRef.current !== sourceNode) {
      currentSourceRef.current.disconnect();
    }

    // Connect graph: source → analyser → destination (for audible playback)
    sourceNode.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
    currentSourceRef.current = sourceNode;

    /** Resume context if it was suspended (mobile autoplay policies, etc.) */
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(console.error);
    }

    /** Animation loop */
    const animate = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const { current: bars } = barsRef;
      const { current: dataArray } = dataArrayRef;
      const bufferLength = dataArray.length;

      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        if (!bar) continue;
        const bandIndex = Math.floor((i / bars.length) * bufferLength);
        const value = dataArray[bandIndex];
        bar.style.height = `${10 + (value / 255) * 90}%`;
        bar.style.opacity = `${0.4 + (value / 255) * 0.6}`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    /** Cleanup for this playing session */
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (currentSourceRef.current) {
        currentSourceRef.current.disconnect();
        currentSourceRef.current = null;
      }
      resetBars();
    };
  }, [isPlaying, audioElement]);

  /* ────────────────────────────
   * Final cleanup on unmount
   * ────────────────────────────*/
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (currentSourceRef.current) {
        currentSourceRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((e) => console.error('Failed to close AudioContext', e));
      }
    };
  }, []);

  /* ────────────────────────────
   * Render
   * ────────────────────────────*/
  return (
    <div className="spectrum-container">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          ref={setBarRef(i)}
          className="spectrum-bar"
          style={{
            animation: isPlaying ? 'none' : `bounce 1s infinite ease-in-out ${i * 0.05}s`,
            background: 'linear-gradient(180deg, #320336 0%, #ef05df 100%)',
          }}
        />
      ))}
    </div>
  );
};

export default SpectrumBars;
