'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [storedName, setStoredName] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('pirlName') : null;
    if (saved) setStoredName(saved);
  }, []);

  const handleSave = () => {
    const cleaned = name.trim();
    if (!cleaned) return;
    localStorage.setItem('pirlName', cleaned);
    // Best practice: client-side navigation
    router.push('/kid/missions');
  };

  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#1b0b38] via-[#2a0f54] to-[#0b2347] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <motion.img
          src="/pirl-logo.png"
          alt="PIRL"
          className="mx-auto mb-6 h-16 w-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Tagline */}
        <h1 className="text-xl font-semibold">Prove In Real Life</h1>
        <p className="text-sm text-white/70">
          Turn real-world progress into exclusive digital rewards.
        </p>

        {/* Animated content */}
        <AnimatePresence mode="wait">
          {!storedName ? (
            <motion.div
              key="name-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mt-8 space-y-3"
            >
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md bg-white/10 border border-white/20 p-3 text-white placeholder:text-white/50"
              />
              <button
                onClick={handleSave}
                className="w-full rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-400 py-3 font-semibold hover:from-fuchsia-500 hover:to-cyan-300"
              >
                Let’s Go!
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="welcome-back"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mt-8 space-y-4"
            >
              <h2 className="text-lg font-bold">
                Welcome back, {storedName}! 👋
              </h2>

              <a
                href="/kid/checkin"
                className="block w-full rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-400 py-3 font-semibold hover:from-fuchsia-500 hover:to-cyan-300"
              >
                Let’s Go!
              </a>

              <button
                onClick={() => {
                  localStorage.removeItem('pirlName');
                  window.location.reload();
                }}
                className="text-xs text-white/60 underline"
              >
                Not you? Change name
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer links */}
        <div className="mt-10 text-[11px] text-white/60 space-x-4">
          <a href="/privacy" className="underline">Privacy</a>
          <a href="/terms" className="underline">Terms</a>
        </div>
      </div>
    </main>
  );
}
