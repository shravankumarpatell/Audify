import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Waveform from './Waveform';

export default function EnhancedPage() {
  const { originalUrl, file, useSample } = useLocation().state;
  const [enhancedUrl, setEnhancedUrl] = useState(null);
  const origAudioRef = useRef(null);
  const enhAudioRef = useRef(null);

  useEffect(() => {
    // always upload through backend, sample or user file
    const uploadAndEnhance = async () => {
      const form = new FormData();
      if (useSample) {
        // fetch sample file as Blob and append
        const respSample = await fetch(originalUrl);
        const blobSample = await respSample.blob();
        form.append('file', blobSample, 'sample.wav');
      } else {
        form.append('file', file);
      }

      const resp = await fetch('http://localhost:8000/enhance', {
        method: 'POST',
        body: form,
      });
      const blob = await resp.blob();
      setEnhancedUrl(URL.createObjectURL(blob));
    };
    uploadAndEnhance();
  }, [originalUrl, file, useSample]);

  return (
    <div className="container">
      <h2 className="title">Enhanced Audio</h2>
      {enhancedUrl ? (
        <>
          <div className="players">
            <div className="player-block">
              <h3>Original Audio</h3>
              <audio controls src={originalUrl} ref={origAudioRef} className="audio-player" />
              <Waveform audioRef={origAudioRef} />
            </div>
            <div className="player-block">
              <h3>Enhanced Audio</h3>
              <audio controls src={enhancedUrl} ref={enhAudioRef} className="audio-player" />
              <Waveform audioRef={enhAudioRef} />
            </div>
          </div>
          <Link to="/" className="nav-button">Enhance Another</Link>
        </>
      ) : (
        <p>Enhancing... please wait.</p>
      )}
    </div>
  );
}