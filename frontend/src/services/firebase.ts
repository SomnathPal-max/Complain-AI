import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

export interface FirebaseRuntimeConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

const RUNTIME_CONFIG_KEY = 'complainai_firebase_config';

/**
 * Retrieve saved runtime Firebase configuration from localStorage.
 */
export const getStoredFirebaseConfig = (): FirebaseRuntimeConfig | null => {
  try {
    const raw = localStorage.getItem(RUNTIME_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse localStorage firebase config', err);
  }
  return null;
};

/**
 * Returns active configuration and its origin source.
 */
export const getActiveFirebaseConfig = (): {
  config: FirebaseRuntimeConfig;
  source: 'env' | 'custom' | 'none';
} => {
  const custom = getStoredFirebaseConfig();
  if (custom && custom.apiKey && custom.projectId) {
    return { config: custom, source: 'custom' };
  }

  const envConfig: FirebaseRuntimeConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return { config: envConfig, source: 'env' };
  }

  return { config: envConfig, source: 'none' };
};

/**
 * Check if a valid Firebase configuration is active.
 */
export const isFirebaseConfigured = (): boolean => {
  const { config } = getActiveFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
};

/**
 * Save user-entered Firebase configuration into localStorage and reload application.
 */
export const saveRuntimeFirebaseConfig = (cfg: Partial<FirebaseRuntimeConfig>) => {
  const projectId = (cfg.projectId || '').trim();
  const clean: FirebaseRuntimeConfig = {
    apiKey: (cfg.apiKey || '').trim(),
    authDomain: (cfg.authDomain || '').trim() || (projectId ? `${projectId}.firebaseapp.com` : ''),
    projectId: projectId,
    storageBucket: (cfg.storageBucket || '').trim() || (projectId ? `${projectId}.appspot.com` : ''),
    messagingSenderId: (cfg.messagingSenderId || '').trim(),
    appId: (cfg.appId || '').trim(),
    measurementId: (cfg.measurementId || '').trim()
  };
  localStorage.setItem(RUNTIME_CONFIG_KEY, JSON.stringify(clean));
  window.location.reload();
};

/**
 * Reset runtime Firebase configuration back to environment variables.
 */
export const clearRuntimeFirebaseConfig = () => {
  localStorage.removeItem(RUNTIME_CONFIG_KEY);
  window.location.reload();
};

// Initialize Firebase App safely (singleton)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

const { config: activeConfig, source: activeSource } = getActiveFirebaseConfig();

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
    auth = getAuth(app);
    // Set local persistence
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Firebase persistence initialization warning:', err);
    });
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    console.info(`[ComplainAI] Firebase initialized successfully via source: ${activeSource} (Project: ${activeConfig.projectId})`);
  } catch (err) {
    console.error('Failed to initialize Firebase SDK:', err);
  }
} else {
  console.info(
    '[ComplainAI] Firebase environment variables not set. Running in demo/local mode. Click Firebase status pill to connect.'
  );
}

export { app, auth, googleProvider };

/**
 * Maps Firebase Auth error codes into clean, user-friendly messages.
 */
export const mapFirebaseError = (error: any): string => {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact administrator.';
    case 'auth/user-not-found':
      return 'No account was found with this email address. Please register first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again or reset your password.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose at least 6 characters with letters and numbers.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request was cancelled. Please try again.';
    case 'auth/network-request-failed':
      return 'Network error occurred. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Access is temporarily disabled. Please reset your password or try again later.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Please sign in again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled in your Firebase Console. Please enable Email/Password or Google in Authentication -> Sign-in method.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth operations in your Firebase project. Add localhost or your Vercel domain in Firebase Console -> Authentication -> Settings -> Authorized domains.';
    default:
      if (message.includes('auth/')) {
        return message.replace(/^Firebase:\s*/, '');
      }
      return message || 'Authentication failed. Please check your credentials.';
  }
};

/**
 * Register a new user with Email and Password.
 */
export const registerWithEmail = async (
  name: string,
  email: string,
  pass: string
): Promise<FirebaseUser> => {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Please supply VITE_FIREBASE_* environment variables or click the Firebase setup button.');
  }

  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (name.trim()) {
    try {
      await updateProfile(credential.user, { displayName: name.trim() });
    } catch (err) {
      console.warn('Could not update Firebase displayName:', err);
    }
  }

  try {
    await sendEmailVerification(credential.user);
  } catch (err) {
    console.warn('Could not send verification email:', err);
  }

  return credential.user;
};

/**
 * Sign in with Email and Password.
 */
export const loginWithEmail = async (
  email: string,
  pass: string
): Promise<FirebaseUser> => {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Please supply VITE_FIREBASE_* environment variables or click the Firebase setup button.');
  }
  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return credential.user;
};

/**
 * Sign in with Google Popup.
 */
export const loginWithGoogle = async (): Promise<FirebaseUser> => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is not configured. Please supply VITE_FIREBASE_* environment variables or click the Firebase setup button.');
  }
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
};

/**
 * Send password reset email.
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Please supply VITE_FIREBASE_* environment variables or click the Firebase setup button.');
  }
  await sendPasswordResetEmail(auth, email.trim());
};

/**
 * Send email verification to current user.
 */
export const triggerEmailVerification = async (user: FirebaseUser): Promise<void> => {
  await sendEmailVerification(user);
};

/**
 * Sign out from Firebase.
 */
export const logoutFirebase = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};

/**
 * Get current Firebase ID Token.
 */
export const getFirebaseIdToken = async (forceRefresh = false): Promise<string | null> => {
  if (!auth || !auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(forceRefresh);
  } catch (err) {
    console.error('Failed to get Firebase ID token:', err);
    return null;
  }
};
