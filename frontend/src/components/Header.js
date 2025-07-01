import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <img src="/logo.png" alt="Audify Logo" className="logo" />
      <Link to="/" className="site-title-link">
        <h1 className="site-title">Audify</h1>
      </Link>
    </header>
  );
}