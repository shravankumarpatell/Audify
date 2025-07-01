import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Waveform from './Waveform';

// Full endpoint including path
const ENHANCE_ENDPOINT = 'https://audify-backend-ktwu.onrender.com/enhance';

export default function EnhancedPage() {
  const { useSample, file, originalUrl } = useLocation().state;
  const [enhancedUrl, setEnhancedUrl] = useState(null);
  const origAudioRef = useRef(null);
  const enhAudioRef = useRef(null);

  useEffect(() => {
    const uploadAndEnhance = async () => {
      const form = new FormData();
      if (useSample) {
        const respSample = await fetch(originalUrl);
        const blobSample = await respSample.blob();
        form.append('file', blobSample, 'sample.wav');
      } else {
        form.append('file', file);
      }

      try {
        const resp = await fetch(ENHANCE_ENDPOINT, {
          method: 'POST',
          body: form,
        });
        if (!resp.ok) {
          console.error('Server responded with', resp.status);
          throw new Error(`Enhance API error: ${resp.status}`);
        }
        const blob = await resp.blob();
        setEnhancedUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error('Enhancement failed:', err);
        alert('Could not reach enhancement service. Please check CORS and endpoint URL.');
      }
    };
    uploadAndEnhance();
  }, [useSample, file, originalUrl]);

  return (
    <div className="container">
      <h2 className="title">Enhanced Audio</h2>
      {originalUrl && (
        <div className="players">
          <div className="player-block">
            <h3>Original Audio</h3>
            <audio controls src={originalUrl} ref={origAudioRef} className="audio-player" />
            <Waveform audioRef={origAudioRef} />
          </div>
          {enhancedUrl ? (
            <div className="player-block">
              <h3>Enhanced Audio</h3>
              <audio controls src={enhancedUrl} ref={enhAudioRef} className="audio-player" />
              <Waveform audioRef={enhAudioRef} />
            </div>
          ) : (
            <p>Enhancing... please wait.</p>
          )}
        </div>
      )}
      <Link to="/" className="nav-button">Enhance Another</Link>
    </div>
  );
}