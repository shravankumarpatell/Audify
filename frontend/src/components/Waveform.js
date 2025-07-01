import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

export default function Waveform({ audioRef }) {
  const containerRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (!audioRef?.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      backend: 'MediaElement',
      media: audioRef.current,
      waveColor: '#fff',
      progressColor: '#4caf50',
      cursorColor: '#fff',
      height: 80,
    });

    return () => {
      wavesurfer.current && wavesurfer.current.destroy();
      wavesurfer.current = null;
    };
  }, [audioRef]);

  return <div ref={containerRef} className="waveform-container" />;
}