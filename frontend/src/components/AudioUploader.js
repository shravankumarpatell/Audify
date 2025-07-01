import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhanceButton from './EnhanceButton';

export default function AudioUploader() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [useSample, setUseSample] = useState(false);    
//   const [useUpload, setUseUpload] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Handle physical file selection
  const onFileSelect = e => {
    setUseSample(false);
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setOriginalUrl(URL.createObjectURL(selected));
  };

  // Programmatically click hidden input
  const handleUploadClick = () => {
    fileInputRef.current.click();
    // setUseUpload(true);
  };

  // Use bundled sample
  const handleUseSample = () => {
    setUseSample(true);
    setFile(null);
    setOriginalUrl('/sample.wav');
  };

  // Navigate to enhancement page
  const handleEnhance = () => {
    navigate('/enhanced', { state: { file: useSample ? null : file, originalUrl, useSample } });
  };

  return (
    <div className="container">
      <h2 className="title">Upload Your Noisy Audio</h2>
      <div className="button-group">
        <button
          className="upload-button"
          onClick={handleUploadClick}
        //   disabled={useSample}
        >
          Upload File
        </button>
        <button
          className="sample-button"
          onClick={handleUseSample}
        //   disabled={useUpload}
        >
          Use Sample Audio
        </button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="audio/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onFileSelect}
      />

      {originalUrl && (
        <div className="players">
          <h4>{useSample ? 'Sample_Audio' : 'Your_Audio'}</h4>
          <audio controls src={originalUrl} className="audio-player" />
        </div>
      )}

      <EnhanceButton onClick={handleEnhance} disabled={!originalUrl} />
    </div>
  );
}