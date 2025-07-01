import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AudioUploader from './components/AudioUploader';
import EnhancedPage from './components/EnhancedPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-background">
        <Header />
        <Routes>
          <Route path="/" element={<AudioUploader />} />
          <Route path="/enhanced" element={<EnhancedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;