import React from 'react';

export default function EnhanceButton({ onClick, disabled }) {
  return (
    <button
      className="enhance-button"
      onClick={onClick}
      disabled={disabled}
    >
      Enhance Audio
    </button>
  );
}