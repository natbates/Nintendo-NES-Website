import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';

import "../styles/Navbar.css";

function Navigation() {
  const navigate = useNavigate();

  return (
    <nav id="nav-bar">

      <div className="nav-left">
        <img
          src={process.env.PUBLIC_URL + '/icon.svg'}
          alt="NES Logo"
          className="nav-logo"
          onClick={() => navigate('/')}
        />

        <div className="nav-title">
          <span>The</span> <em>1985</em> NES <span>set</span>
        </div>
      </div>

      <div className="nav-menu">

        <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          About
        </NavLink>

        <NavLink to="/statement" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Statement
        </NavLink>

        <NavLink to="/references" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          References
        </NavLink>

        <a
          href="https://github.com/natbates/Nintendo-NES-Website"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-github"
        >
          <FaGithub size={20} />
        </a>

      </div>

    </nav>
  );
}

export default Navigation;