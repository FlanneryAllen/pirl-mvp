/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '../../../lib/supabaseClient';
import ProgressRing from '../_components/ProgressRing';
import CelebrationModal from '../_components/CelebrationModal';
import { Sprout } from 'lucide-react';
import confetti from 'canvas-confetti';

type MissionRow = {
  id: string;
  slug: 'daily_mission' | 'three_day_streak' | string;
  title: string;
  goal_json: { days: number; per_day_steps: number };
};

type EnrollmentRow = {
  id: string;
  mission_id: string;
  kid_id: string;
  status: 'active' | 'completed';
  missions: MissionRow;
};

export default function Checkin() {
  const [enr, setEnr] = useState<EnrollmentRow | null>(null);
  const [mission, setMission] = useState<MissionRow | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [stepsInput, setStepsInput] = useState<number>(0);
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [seedUnlocked, setSeedUnlocked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);

  // (debug) simple status line while loading
  const [status, setStatus] = useState('starting…');

  // Ensure session + auto-enroll Daily + load current progress
  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabase();

        setStatus('ensuring session…');
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) await supabase.auth.signInAnonymously();

        setStatus('getting user…');
        const uid = (await supabase.auth.getUser()).data.user?.id;
        if (!uid) { setStatus('no user id; redirecting…'); window.location.href = '/'; return; }

        setStatus('checking enrollment…');
        const { data: active } = await supabase
          .from('enrollments')
          .select('id, status, missions!inner(slug, title, goal_json)')
          .eq('kid_id', uid)
          .eq('status', 'active')
          .maybeSingle();

        let enrollment = active;

        if (!enrollment) {
          setStatus('auto-enrolling daily…');
          const { data: daily } = await supabase
            .from('missions')
            .select('id, slug, title, goal_json')
            .eq('slug', 'daily_mission')
            .maybeSingle();

          if (!daily?.id) { setStatus('daily mission not found'); return; }

          const { error: insErr } = await supabase
            .from('enrollments')
            .insert({ mission_id: daily.id, kid_id: uid });
          if (insErr) { setStatus(`enroll error: ${insErr.message}`); return; }

          const { data: nowActive } = await supabase
            .from('enrollments')
            .select('id, status, missions!inner(slug, title, goal_json)')
            .eq('kid_id', uid)
            .eq('status', 'active')
            .maybeSingle();

          enrollment = nowActive ?? null;
        }

        if (!enrollment) { setStatus('enrollment null'); return; }

        setEnr(enrollment as any);
        const m = (enrollment as any).missions as MissionRow;
        setMission(m);

        setStatus('loading check-ins…');
        const { data: checks } = await supabase
          .from('checkins')
          .select('day_index, data_json')
          .eq('enrollment_id', (enrollment as any).id)
          .order('day_index', { ascending: true });

        const len = checks?.length ?? 0;
        setDayIndex(len);
        if (len > 0) {
          const last = checks![len - 1]?.data_json?.steps ?? 0;
          setTodayTotal(last);
        }

        setSeedUnlocked(m.slug === 'daily_mission' && (enrollment as any).status === 'completed');
        setStreak(m.slug === 'three_day_streak' ? len : 0);

        setStatus('ready');
      } catch (e: any) {
        setStatus(`exception: ${e?.message || 'unknown'}`);
      }
    })();
  }, []);

  // Save today's check-in (one per day enforced by DB unique index)
  const saveCheckin = async () => {
    if (!enr || !mission) return;
    const supabase = getSupabase();
    const min = mission.goal_json?.per_day_steps ?? 5000;

    if (stepsInput < min) {
      // allow partials if you ever want; for MVP insist on goal entry
      alert(`Enter at least ${min} steps`);
      return;
    }

    const { error } = await supabase.from('checkins').insert({
      enrollment_id: enr.id,
      day_index: dayIndex,
      data_json: { steps: stepsInput, source: 'manual' },
      day_key: new Date().toISOString().slice(0, 10), // UTC day
    });

    if (error) {
      if ((error as any).code === '23505') {
        alert("Looks like you've already checked in today. Come back tomorrow!");
      } else {
        alert(error.message);
      }
      return;
    }

    // Update UI
    setTodayTotal(stepsInput);
    setStepsInput(0);
    setDayIndex((d) => d + 1);
    if (mission.slug === 'three_day_streak') setStreak((s) => s + 1);

    // 🎉 Auto-celebrate now (no mint yet)
    setShowCelebrate(true);
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  };

  // Mint when the player taps “Add to My Locker” in the celebration modal
  const mintIfReady = async () => {
    if (!enr || !mission) return;
    const supabase = getSupabase();
    const targetDays = mission.goal_json?.days ?? 1;

    // Double-check eligibility (defensive)
    const { data: checks } = await supabase
      .from('checkins')
      .select('id')
      .eq('enrollment_id', enr.id);

    if ((checks?.length || 0) < targetDays) {
      alert(`Finish ${targetDays} day(s) first`);
      return;
    }

    const uid = (await supabase.auth.getUser()).data.user?.id;

    await supabase
      .from('enrollments')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', enr.id);

    const rewardTitle =
      mission.slug === 'daily_mission'
        ? 'Grow a Garden PIRL Seed'
        : mission.slug === 'three_day_streak'
        ? 'Exclusive Fortnite Banner'
        : 'Unlocked Reward';

    // optional idempotency: prevent dupes (one artifact per mission per kid)
    // add a unique index on (kid_id, mission_id) if you want hard guarantees.
    const { error: artErr } = await supabase.from('artifacts').insert({
      kid_id: uid,
      mission_id: mission.id,
      title: rewardTitle,
      type: 'badge',
    });
    if (artErr) { alert(artErr.message); return; }

    // Go to LOCKR
    setShowCelebrate(false);
    window.location.href = '/kid/lockr';
  };

  if (!mission) {
    return (
      <div className="p-6 text-white">
        Loading… <span className="text-white/70">{status}</span>
      </div>
    );
  }

  const targetDays = mission.goal_json?.days ?? 1;
  const min = mission.goal_json?.per_day_steps ?? 5000;
  const percent = Math.min(100, Math.round((todayTotal / min) * 100));

  return (
    <div className="p-6 max-w-md mx-auto text-white">
      <h1 className="text-2xl font-bold">
        {mission.slug === 'daily_mission'
          ? 'Grow a Garden PIRL Seed'
          : mission.slug === 'three_day_streak'
          ? 'Exclusive Fortnite Banner'
          : mission.title}
      </h1>

      <div className="text-sm text-white/70 mt-1">
        Day {dayIndex} of {targetDays}
      </div>

      {/* Mission progress card */}
      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="text-center text-sm text-cyan-300 font-semibold">
          Walk {min.toLocaleString()} steps
        </div>
        <div className="mt-3 flex items-center justify-center">
          <ProgressRing value={todayTotal} max={min} />
        </div>
        <div className="text-center text-xs text-white/70 mt-2">
          {percent}% Complete
        </div>
      </div>

      {/* Input + Add (no Mint button) */}
      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 rounded-md bg-white/10 border border-white/20 p-3 text-white placeholder:text-white/50"
          placeholder="Enter steps (≥ 5000)"
          type="number"
          value={stepsInput}
          onChange={(e) => setStepsInput(+e.target.value)}
        />
        <button
          onClick={saveCheckin}
          className="px-4 rounded-md bg-white text-black font-semibold"
        >
          Add
        </button>
      </div>

      {/* Seed card */}
      <div
        className={`mt-6 rounded-xl p-4 flex items-center justify-between border ${
          seedUnlocked
            ? 'border-emerald-400 bg-emerald-500/20'
            : 'border-emerald-500/40 bg-emerald-500/10'
        }`}
      >
        <div>
          <div className="text-sm font-semibold text-emerald-300">
            {seedUnlocked ? 'Unlocked:' : 'Complete today to unlock:'}
          </div>
          <div className="text-base font-bold text-white">PIRL Seed</div>
        </div>
        <div
          className={`rounded-full p-2 ${
            seedUnlocked ? 'bg-emerald-500/30' : 'bg-emerald-500/15'
          }`}
        >
          <Sprout className="h-7 w-7 text-emerald-300" />
        </div>
      </div>

      {/* Streak reward card */}
      <div className="mt-6 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 p-4 text-center">
        <div className="text-sm font-semibold text-fuchsia-300 mb-1">
          3-day streak unlocks:
        </div>
        <div className="text-base font-bold text-white">
          Exclusive Fortnite Banner
        </div>
        <div className="text-xs text-white/70 mt-1">
          Current streak: {streak} day{streak === 1 ? '' : 's'}
        </div>
      </div>

      {/* Celebration Modal (mint happens on CTA) */}
      <CelebrationModal
        open={showCelebrate}
        onAddToLockr={mintIfReady}          // <-- mint on button tap
        onClose={() => setShowCelebrate(false)}
        title="Mission Complete!"
        rewardTitle={
          mission?.slug === 'daily_mission'
            ? 'Grow a Garden PIRL Seed'
            : mission?.slug === 'three_day_streak'
            ? 'Exclusive Fortnite Banner'
            : 'Unlocked Reward'
        }
      />
    </div>
  );
}
