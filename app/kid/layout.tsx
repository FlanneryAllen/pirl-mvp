'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Lock } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isMission =
    pathname?.startsWith('/kid/missions') ||
    pathname?.startsWith('/kid/checkin');
  const isLockr = pathname?.startsWith('/kid/lockr');

  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#1b0b38] via-[#2a0f54] to-[#0b2347] text-white">
      <div className="pb-20">{children}</div>

      {/* bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/60 backdrop-blur-md">
        <div className="mx-auto max-w-md grid grid-cols-2">
          {/* Mission */}
          <Link
            href="/kid/checkin"
            className={`flex flex-col items-center justify-center h-16 transition ${
              isMission ? 'text-cyan-300' : 'text-white/70 hover:text-white'
            }`}
          >
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center mb-1 ${
                isMission
                  ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-lg shadow-cyan-400/40'
                  : 'bg-white/10'
              }`}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">MISSION</span>
          </Link>

          {/* Lockr */}
          <Link
            href="/kid/lockr"
            className={`flex flex-col items-center justify-center h-16 transition ${
              isLockr ? 'text-fuchsia-300' : 'text-white/70 hover:text-white'
            }`}
          >
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center mb-1 ${
                isLockr
                  ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-lg shadow-fuchsia-400/40'
                  : 'bg-white/10'
              }`}
            >
              <Lock className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">LOCKR</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
