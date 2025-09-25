'use client';

import { Sprout, X } from 'lucide-react';

export default function CelebrationModal({
  open,
  title = 'Mission Complete!',
  rewardTitle = 'Grow a Garden PIRL Seed',
  onAddToLockr,
  onClose,
}: {
  open: boolean;
  title?: string;
  rewardTitle?: string;
  onAddToLockr: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/15 bg-gradient-to-br from-[#24114a] to-[#141c3a] p-6 text-white shadow-2xl">
        {/* Close */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md bg-white/10 p-1 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Sprout className="h-10 w-10 text-emerald-300 mb-2" />
          <h2 className="text-2xl font-extrabold leading-tight">{title}</h2>
          <p className="mt-2 text-sm text-white/80">Reward Earned:</p>

          {/* Reward pill */}
          <div className="mt-3 w-full rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-3">
            <div className="flex items-center justify-center gap-2">
              <Sprout className="h-5 w-5 text-emerald-300" />
              <span className="font-semibold">{rewardTitle}</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onAddToLockr}
            className="mt-5 w-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 py-3 font-semibold text-black hover:from-emerald-400 hover:to-cyan-300"
          >
            🔒 Add to My Locker
          </button>
        </div>
      </div>
    </div>
  );
}
