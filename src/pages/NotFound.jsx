import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import '../styles/NotFound.css';

function NotFound() {
  return (
    <div className="page not-found-page">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="home-link">Back to Home</Link>
    </div>
  );
}

export default NotFound;
