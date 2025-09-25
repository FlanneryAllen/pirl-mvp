'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../../../lib/supabaseClient';
import {
  Sprout,
  Lock,
  Flag,
  Gift,
  LucideIcon,
} from 'lucide-react';

type Artifact = {
  id: string;
  title: string;
  created_at: string;
  mission_id: string | null;
  missions: { title: string; slug: string } | null;
};

function getRewardMeta(title: string): {
  Icon: LucideIcon;
  cardRing: string;
  cardBg: string;
  pillBg: string;
  accentText: string;
  actionLabel: string;
} {
  const t = title.toLowerCase();
  if (t.includes('seed')) {
    return {
      Icon: Sprout,
      cardRing: 'ring-emerald-300/30',
      cardBg: 'from-emerald-700/30 to-emerald-900/30',
      pillBg: 'bg-emerald-700/60 hover:bg-emerald-600/60',
      accentText: 'text-emerald-300',
      actionLabel: 'PLANT',
    };
  }
  if (t.includes('banner')) {
    return {
      Icon: Flag,
      cardRing: 'ring-fuchsia-300/30',
      cardBg: 'from-fuchsia-700/30 to-cyan-900/30',
      pillBg: 'bg-fuchsia-700/60 hover:bg-fuchsia-600/60',
      accentText: 'text-fuchsia-300',
      actionLabel: 'EQUIP',
    };
  }
  return {
    Icon: Gift,
    cardRing: 'ring-cyan-300/30',
    cardBg: 'from-cyan-700/30 to-violet-900/30',
    pillBg: 'bg-cyan-700/60 hover:bg-cyan-600/60',
    accentText: 'text-cyan-300',
    actionLabel: 'USE',
  };
}

export default function Lockr() {
  const [items, setItems] = useState<Artifact[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      const uid = (await supabase.auth.getUser()).data.user?.id;
      if (!uid) return;

      const { data: artifacts } = await supabase
        .from('artifacts')
        .select('id, title, created_at, mission_id, missions(title,slug)')
        .eq('kid_id', uid)
        .order('created_at', { ascending: false });

      setItems(artifacts || []);

      const uniqueMissionIds = Array.from(
        new Set((artifacts || []).map((a) => a.mission_id).filter(Boolean))
      ) as string[];

      const entries: Array<[string, number]> = [];
      for (const mid of uniqueMissionIds) {
        const { count } = await supabase
          .from('artifacts')
          .select('id', { head: true, count: 'exact' })
          .eq('mission_id', mid);
        entries.push([mid, count ?? 0]);
      }
      setCounts(Object.fromEntries(entries));

      const { data: checks } = await supabase
        .from('checkins')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(3);
      setStreak(checks?.length || 0);
    })();
  }, []);

  const discoverables = useMemo(
    () => [
      { title: 'Fortnite Banner' },
      { title: 'Griddy Emote' },
      { title: 'Rocket League Wheels' },
      { title: 'Gubby Companion' },
      { title: 'Nike DigiSneaks' },
      { title: 'Team Player Badge' },
      { title: 'Diamond Collector' },
      { title: 'Reading Hero' },
      { title: 'Tech Explorer' },
    ],
    []
  );

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h1 className="text-2xl font-bold mb-1">My LOCKR</h1>
      <p className="text-sm text-white/70">Your digital reward vault</p>

      <div className="mt-6 space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex justify-between items-center">
          <div>
            <div className="text-lg font-bold">{items.length}</div>
            <div className="text-xs text-white/70">Rewards Unlocked</div>
          </div>
          <div className="text-xs text-cyan-300">∞ more to discover!</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex justify-between items-center">
          <div>
            <div className="text-lg font-bold">{streak}</div>
            <div className="text-xs text-white/70">Day Streak</div>
          </div>
          <div className="text-xs text-fuchsia-300">Keep it up!</div>
        </div>
      </div>

      <h2 className="mt-6 mb-2 font-semibold flex items-center gap-2">
        <span>🏆 My Unlocked Rewards</span>
      </h2>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((a) => {
            const owners = a.mission_id ? counts[a.mission_id] ?? 1 : 1;
            const meta = getRewardMeta(a.title || '');
            const { Icon, cardRing, cardBg, pillBg, accentText, actionLabel } = meta;

            return (
              <div key={a.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/70">
                  {owners} player{owners === 1 ? '' : 's'} earned this
                </div>

                <div className={`mt-2 rounded-xl overflow-hidden bg-gradient-to-br ${cardBg} ring-1 ${cardRing}`}>
                  <div className="p-4 flex items-center gap-3">
                    <div className="shrink-0 rounded-full bg-white/10 p-2">
                      <Icon className={`h-6 w-6 ${accentText}`} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        {a.title || 'Unlocked Reward'}
                      </div>
                      <div className="text-[11px] text-white/60">
                        {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      className={`w-full rounded-full py-2 text-[11px] tracking-wide font-semibold transition ${pillBg}`}
                    >
                      {actionLabel}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-white/50">No rewards yet.</div>
        )}
      </div>

      <h2 className="mt-8 mb-2 font-semibold flex items-center gap-2">
        <span>✨ Discoverable Rewards</span>
        <span className="text-xs text-white/60">(9 visible)</span>
      </h2>

      <p className="text-xs text-white/70 mb-3">
        Complete more missions to discover new rewards • Infinite collection awaits!
      </p>

      <div className="grid grid-cols-2 gap-3">
        {discoverables.map((r, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center justify-center text-center text-white/65">
            <Lock className="h-5 w-5 mb-1" />
            <div className="text-sm font-semibold">{r.title}</div>
            <div className="text-[10px] mt-1">LOCKED</div>
          </div>
        ))}
      </div>
    </div>
  );
}
