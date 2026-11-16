import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { Brand } from './Brand';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);
  return (
    <header className={`site-nav ${pathname === '/' ? 'site-nav-hero' : ''}`}>
      <Brand />
      <nav className="desktop-links" aria-label="Main navigation">
        <NavLink to="/submit">Report an issue</NavLink>
        <NavLink to="/track">Track a report</NavLink>
        <NavLink to="/model-eval">Our approach</NavLink>
      </nav>
      <div className="nav-actions">
        <button
          className="icon-button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
        <Link
          className="nav-signin"
          to={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'}
        >
          {user ? 'Dashboard' : 'Sign in'}
        </Link>
        <Link
          className="button button-light nav-cta"
          to={user ? '/submit' : '/register'}
        >
          {user ? 'New report' : 'Get started'}
          <ArrowUpRight />
        </Link>
        <button
          className="icon-button mobile-menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-site-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-site-menu"
          className="mobile-site-menu"
          aria-label="Mobile navigation"
        >
          <Link to="/submit">
            Report an issue
            <ArrowUpRight />
          </Link>
          <Link to="/track">
            Track a report
            <ArrowUpRight />
          </Link>
          <Link to="/model-eval">
            Our approach
            <ArrowUpRight />
          </Link>
          <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/login'}>
            {user ? 'Dashboard' : 'Sign in'}
            <ArrowUpRight />
          </Link>
          {!user && (
            <Link to="/register">
              Create an account
              <ArrowUpRight />
            </Link>
          )}
          <Link to="/admin/login">
            Administrator access
            <ArrowUpRight />
          </Link>
        </nav>
      )}
    </header>
  );
}
