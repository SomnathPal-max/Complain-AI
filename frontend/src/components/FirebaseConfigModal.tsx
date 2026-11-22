import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Key,
  ShieldCheck,
  X,
  Code,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import {
  getActiveFirebaseConfig,
  isFirebaseConfigured,
  saveRuntimeFirebaseConfig,
  clearRuntimeFirebaseConfig,
  FirebaseRuntimeConfig
} from '../services/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { config: activeConfig, source: activeSource } = getActiveFirebaseConfig();
  const configured = isFirebaseConfigured();

  const [activeTab, setActiveTab] = useState<'connect' | 'env' | 'guide'>('connect');
  const [pasteSnippet, setPasteSnippet] = useState('');
  const [apiKey, setApiKey] = useState(activeConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(activeConfig.authDomain || '');
  const [projectId, setProjectId] = useState(activeConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(activeConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(activeConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(activeConfig.appId || '');

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleParseSnippet = () => {
    if (!pasteSnippet.trim()) {
      setStatusMessage({ text: 'Please paste your Firebase configuration snippet or JSON above.', type: 'error' });
      return;
    }

    try {
      const text = pasteSnippet;
      const extract = (regex: RegExp) => {
        const m = text.match(regex);
        return m ? m[1].replace(/['",;]/g, '').trim() : '';
      };

      const extractedApiKey = extract(/apiKey["']?\s*:\s*["']([^"']+)["']/i) || extract(/"apiKey"\s*:\s*"([^"]+)"/i);
      const extractedAuthDomain = extract(/authDomain["']?\s*:\s*["']([^"']+)["']/i);
      const extractedProjectId = extract(/projectId["']?\s*:\s*["']([^"']+)["']/i);
      const extractedBucket = extract(/storageBucket["']?\s*:\s*["']([^"']+)["']/i);
      const extractedSenderId = extract(/messagingSenderId["']?\s*:\s*["']([^"']+)["']/i);
      const extractedAppId = extract(/appId["']?\s*:\s*["']([^"']+)["']/i);

      if (!extractedApiKey && !extractedProjectId) {
        setStatusMessage({ text: 'Could not extract Firebase keys. Please verify the format or fill fields manually below.', type: 'error' });
        return;
      }

      if (extractedApiKey) setApiKey(extractedApiKey);
      if (extractedAuthDomain) setAuthDomain(extractedAuthDomain);
      if (extractedProjectId) setProjectId(extractedProjectId);
      if (extractedBucket) setStorageBucket(extractedBucket);
      if (extractedSenderId) setMessagingSenderId(extractedSenderId);
      if (extractedAppId) setAppId(extractedAppId);

      setStatusMessage({ text: 'Successfully parsed Firebase configuration! Click "Save & Activate" below.', type: 'success' });
    } catch {
      setStatusMessage({ text: 'Parsing failed. Please verify the snippet.', type: 'error' });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setStatusMessage({ text: 'API Key and Project ID are required to initialize Firebase.', type: 'error' });
      return;
    }

    const newConfig: Partial<FirebaseRuntimeConfig> = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    saveRuntimeFirebaseConfig(newConfig);
  };

  const handleReset = () => {
    if (window.confirm('Reset Firebase configuration back to build environment variables?')) {
      clearRuntimeFirebaseConfig();
    }
  };

  const envSnippet = `# Firebase Web Client Configuration
VITE_FIREBASE_API_KEY=${apiKey || activeConfig.apiKey || 'AIzaSyYourApiKeyHere123456789'}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain || activeConfig.authDomain || (projectId ? `${projectId}.firebaseapp.com` : 'your-project.firebaseapp.com')}
VITE_FIREBASE_PROJECT_ID=${projectId || activeConfig.projectId || 'your-project-id'}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket || activeConfig.storageBucket || (projectId ? `${projectId}.appspot.com` : 'your-project.appspot.com')}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId || activeConfig.messagingSenderId || '123456789012'}
VITE_FIREBASE_APP_ID=${appId || activeConfig.appId || '1:123456789012:web:abcdef1234567890'}`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151D38] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 p-6 sm:p-7 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 text-white shadow-md">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#172033] dark:text-[#F8FAFC]">
                  Firebase Authentication System
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  configured
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                }`}>
                  {configured ? '● Active' : '○ Standby / Demo Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email/Password, Google OAuth & Admin Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Badge */}
        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          configured
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200'
            : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
        }`}>
          {configured ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 flex-1">
            <div className="font-bold text-[12.5px]">
              {configured
                ? `Firebase Connected (Project: ${activeConfig.projectId})`
                : 'Firebase is currently running in Standby / Demo Mode'}
            </div>
            <p className="text-[11.5px] leading-relaxed opacity-90">
              {configured
                ? `Active source: ${activeSource === 'custom' ? 'Browser Local Storage Override' : 'Vercel / Build Environment Variables'}. Google OAuth, Email/Password sign-ins, and token synchronizations are operational.`
                : 'Authentication automatically supports 1-Click Dean & Student logins. Connect your Firebase Web App credentials below to activate Google Sign-In and live cloud user accounts.'}
            </p>
          </div>
          {activeSource === 'custom' && (
            <button
              onClick={handleReset}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 shrink-0"
              title="Clear custom config"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Notification message */}
        {statusMessage && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
          }`}>
            {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 dark:border-white/10 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Connect Live Project</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('env')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'env'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Vercel / .env Snippet</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Setup Guide (3 Steps)</span>
          </button>
        </div>

        {/* Tab Content: Connect */}
        {activeTab === 'connect' && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F1530] border border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#172033] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>1-Click Paste from Firebase Console</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Paste entire <code>const firebaseConfig = &#123; ... &#125;</code>
                </span>
              </div>
              <textarea
                rows={2}
                value={pasteSnippet}
                onChange={(e) => setPasteSnippet(e.target.value)}
                placeholder='const firebaseConfig = { apiKey: "AIzaSy...", projectId: "my-college-caa", ... };'
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#151D38] border border-slate-200 dark:border-white/10 text-xs font-mono text-[#172033] dark:text-[#F8FAFC] focus:outline-none focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={handleParseSnippet}
                className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-white/10 hover:bg-indigo-100 dark:hover:bg-white/15 text-indigo-700 dark:text-cyanAccent font-bold text-xs transition-all cursor-pointer"
              >
                Auto-Extract Fields From Snippet
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  API Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0F1530] border border-slate-200 dark:border-white/10 text-xs text-[#172033] dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#151D38] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Project ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="my-project-12345"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0F1530] border border-slate-200 dark:border-white/10 text-xs text-[#172033] dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#151D38] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Auth Domain
                </label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="my-project.firebaseapp.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0F1530] border border-slate-200 dark:border-white/10 text-xs text-[#172033] dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#151D38] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  App ID
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456789:web:abcdef"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0F1530] border border-slate-200 dark:border-white/10 text-xs text-[#172033] dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#151D38] focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-brightBlue text-white font-black text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Save & Activate Firebase Integration</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Tab Content: Environment Variables */}
        {activeTab === 'env' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Paste these environment variables in your <strong>Vercel Project Settings &gt; Environment Variables</strong> or in your local <code>frontend/.env</code> file:
            </p>
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11.5px] leading-relaxed overflow-x-auto border border-slate-800">
                {envSnippet}
              </pre>
              <button
                type="button"
                onClick={handleCopyEnv}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy .env'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content: Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F1530] border border-slate-200 dark:border-white/10 space-y-1">
                <div className="font-extrabold text-[#172033] dark:text-[#F8FAFC] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Create / Select Firebase Project</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 pl-7 text-[11.5px]">
                  Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-cyanAccent underline font-bold inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a> and create or open your college project.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F1530] border border-slate-200 dark:border-white/10 space-y-1">
                <div className="font-extrabold text-[#172033] dark:text-[#F8FAFC] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Enable Authentication Sign-in Providers</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 pl-7 text-[11.5px]">
                  Under <strong>Build &gt; Authentication &gt; Sign-in method</strong>, enable <strong>Email/Password</strong> and <strong>Google</strong>.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F1530] border border-slate-200 dark:border-white/10 space-y-1">
                <div className="font-extrabold text-[#172033] dark:text-[#F8FAFC] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Register Web App &amp; Add Authorized Domain</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 pl-7 text-[11.5px]">
                  Under <strong>Project settings &gt; General &gt; Your apps</strong>, click <strong>Web (&lt;/&gt;)</strong> to get your config object. Under <strong>Authentication &gt; Settings &gt; Authorized domains</strong>, ensure <code>localhost</code> and your deployed Vercel domain are listed.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
