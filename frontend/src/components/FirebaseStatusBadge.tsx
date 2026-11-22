import React, { useState } from 'react';
import { Flame, Settings2 } from 'lucide-react';
import { isFirebaseConfigured, getActiveFirebaseConfig } from '../services/firebase';
import { FirebaseConfigModal } from './FirebaseConfigModal';

interface FirebaseStatusBadgeProps {
  compact?: boolean;
  className?: string;
}

export const FirebaseStatusBadge: React.FC<FirebaseStatusBadgeProps> = ({ compact = false, className = '' }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const configured = isFirebaseConfigured();
  const { config } = getActiveFirebaseConfig();

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 transition-all cursor-pointer group ${
          configured
            ? 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60'
            : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60'
        } ${
          compact
            ? 'px-2.5 py-1 rounded-full text-[10.5px] font-bold'
            : 'px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs'
        } ${className}`}
        title="Click to view or update Firebase Authentication configuration"
      >
        <Flame className={`w-3.5 h-3.5 ${configured ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500'} group-hover:scale-110 transition-transform`} />
        {compact ? (
          <span>{configured ? 'Firebase Active' : 'Firebase Setup'}</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <span>
              {configured
                ? `Firebase Auth: Online (${config.projectId})`
                : 'Firebase Auth: Setup / Demo Mode'}
            </span>
            <Settings2 className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
          </div>
        )}
      </button>

      <FirebaseConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
