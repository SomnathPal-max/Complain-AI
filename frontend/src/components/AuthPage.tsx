import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mapFirebaseError } from '../services/firebase';
export function AuthPage({
  admin = false,
  register = false,
}: {
  admin?: boolean;
  register?: boolean;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; message?: string } | null;
  const prefix = admin ? '/admin' : '';
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const destination = admin ? '/admin' : '/dashboard';
  const finish = () => {
    const from = state?.from;
    const safeFrom =
      from?.startsWith('/') &&
      !from.startsWith('//') &&
      !/^\/(admin\/)?(login|register)(\/|$)/.test(from) &&
      (admin || !from.startsWith('/admin'));
    navigate(safeFrom ? from! : destination, { replace: true });
  };
  const run = async (action: () => Promise<void>, label: string) => {
    setError('');
    setSuccess('');
    setBusy(label);
    try {
      await action();
    } catch (err) {
      setError(mapFirebaseError(err));
    } finally {
      setBusy('');
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (register && password !== confirmation) {
      setError('Passwords do not match. Please check both fields.');
      return;
    }
    if (register && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    void run(async () => {
      if (forgot) {
        await auth.resetPassword(email.trim());
        setSuccess(
          'Password reset instructions have been sent. Check your inbox.'
        );
        return;
      }
      if (register) {
        if (admin)
          await auth.registerAdmin(
            department.trim()
              ? `${name.trim()} (${department.trim()})`
              : name.trim(),
            email.trim().toLowerCase(),
            password
          );
        else
          await auth.register(
            name.trim(),
            email.trim().toLowerCase(),
            password
          );
      } else {
        const user = await auth.login(email.trim().toLowerCase(), password);
        if (admin && user.role !== 'admin') {
          auth.logout();
          throw new Error(
            'This account does not have administrator access. Please use student sign in.'
          );
        }
      }
      finish();
    }, 'submit');
  };
  return (
    <section className="auth-layout">
      <aside className="auth-story">
        <img
          src="/campus.jpg"
          alt="University academic building and landscaped campus grounds"
          width="800"
          height="1100"
        />
        <div className="auth-story-shade" />
        <div className="auth-story-content">
          <p className="eyebrow light">
            {admin
              ? 'For the people who keep campus running'
              : 'For the place you call campus'}
          </p>
          <h2>
            {admin ? (
              <>
                A better view.
                <br />A better response.
              </>
            ) : (
              <>
                Small reports.
                <br />
                Real change.
              </>
            )}
          </h2>
          <p>
            {admin
              ? 'Bring every report, priority, and campus team into one clear workspace.'
              : 'From your first report to the final fix, stay connected to the care of your campus.'}
          </p>
          <div className="auth-story-bottom">
            <ShieldCheck />
            <span>AI assisted. Human reviewed.</span>
          </div>
        </div>
      </aside>
      <div className="auth-form-wrap">
        <Link className="auth-back" to="/">
          <ArrowLeft />
          Back to campus
        </Link>
        <p className="eyebrow">
          {admin ? 'Campus administrator' : 'Student workspace'}
        </p>
        <h1>
          {forgot
            ? 'A fresh start.'
            : register
              ? 'Make yourself at home.'
              : 'Good to see you.'}
        </h1>
        <p className="auth-description">
          {forgot
            ? 'Enter your account email and we’ll send a reset link.'
            : register
              ? 'Create an account to report, track, and follow through.'
              : 'Sign in to pick up where you left off.'}
        </p>
        {state?.message && !error && (
          <div className="auth-notice">{state.message}</div>
        )}
        {error && (
          <div className="auth-alert" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="auth-success" role="status">
            <CheckCircle2 />
            {success}
          </div>
        )}
        <form onSubmit={submit} className="auth-form">
          {register && (
            <label>
              Full name
              <input
                autoComplete="name"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </label>
          )}
          {register && admin && (
            <label>
              Department <span className="field-optional">(optional)</span>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Campus facilities"
                maxLength={100}
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={admin ? 'you@campus.edu' : 'you@student.edu'}
            />
          </label>
          {!forgot && (
            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  required
                  minLength={register ? 6 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    register ? 'At least 6 characters' : 'Your password'
                  }
                />
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>
          )}
          {register && (
            <label>
              Confirm password
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Re-enter your password"
              />
            </label>
          )}
          {!register && !forgot && !admin && auth.isFirebaseActive && (
            <button
              type="button"
              className="forgot-link"
              onClick={() => {
                setForgot(true);
                setError('');
                setSuccess('');
              }}
            >
              Forgot password?
            </button>
          )}
          <button
            type="submit"
            className="button button-primary"
            disabled={Boolean(busy)}
          >
            {busy === 'submit' ? (
              <>
                <Loader2 className="spin" />
                Please wait…
              </>
            ) : (
              <>
                {forgot
                  ? 'Send reset link'
                  : register
                    ? 'Create account'
                    : 'Sign in'}
                <ArrowUpRight />
              </>
            )}
          </button>
        </form>
        {forgot ? (
          <button
            className="auth-switch"
            onClick={() => {
              setForgot(false);
              setError('');
              setSuccess('');
            }}
          >
            Back to sign in
          </button>
        ) : (
          <>
            <p className="auth-switch">
              {register ? 'Already have an account?' : 'New to ResolveX-AI?'}{' '}
              <Link to={`${prefix}/${register ? 'login' : 'register'}`}>
                {register ? 'Sign in' : 'Create an account'}
              </Link>
            </p>
            {!admin && auth.isFirebaseActive && (
              <button
                className="button button-outline auth-google"
                disabled={Boolean(busy)}
                onClick={() =>
                  void run(async () => {
                    await auth.loginWithGoogle();
                    finish();
                  }, 'google')
                }
              >
                {busy === 'google' ? (
                  <Loader2 className="spin" />
                ) : (
                  <span aria-hidden="true">G</span>
                )}
                Continue with Google
              </button>
            )}
            <div className="auth-demo">
              <span>Just looking around?</span>
              <button
                disabled={Boolean(busy)}
                onClick={() =>
                  void run(async () => {
                    await auth.loginDemo(admin ? 'admin' : 'student');
                    navigate(destination, { replace: true });
                  }, 'demo')
                }
              >
                {busy === 'demo'
                  ? 'Opening workspace…'
                  : `Explore the ${admin ? 'admin' : 'student'} demo`}
                <ArrowUpRight />
              </button>
              <p>
                The existing demo uses sample accounts. No personal account
                needed.
              </p>
            </div>
          </>
        )}
        <Link className="auth-role-link" to={admin ? '/login' : '/admin/login'}>
          {admin
            ? 'Looking for student sign in?'
            : 'Campus administrator? Sign in here'}
          <ArrowUpRight />
        </Link>
      </div>
    </section>
  );
}
