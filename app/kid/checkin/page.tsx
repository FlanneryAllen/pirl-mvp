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
  const [justCompletedDaily, setJustCompletedDaily] = useState(false);
  const [seedUnlocked, setSeedUnlocked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showCelebrate, setShowCelebrate] = useState(false);

  // DEBUG STATUS
  const [status, setStatus] = useState('starting…');

  // Ensure session + auto-enroll Daily (fast path) + load data
  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabase();

        // 1) Ensure anon session
        setStatus('ensuring session…');
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) await supabase.auth.signInAnonymously();

        // 2) Get user id
        setStatus('getting user…');
        const uid = (await supabase.auth.getUser()).data.user?.id;
        if (!uid) { setStatus('no user id; redirecting…'); window.location.href = '/'; return; }

        // 3) Check for active enrollment
        setStatus('checking active enrollment…');
        const { data: active, error: activeErr } = await supabase
          .from('enrollments')
          .select('id, status, missions!inner(slug, title, goal_json)')
          .eq('kid_id', uid)
          .eq('status', 'active')
          .maybeSingle();
        if (activeErr) { setStatus(`active err: ${activeErr.message}`); return; }

        let enrollment = active;

        // 4) If none, auto-enroll Daily Mission here
        if (!enrollment) {
          setStatus('auto-enrolling daily mission…');
          const { data: daily, error: dailyErr } = await supabase
            .from('missions')
            .select('id, slug, title, goal_json')
            .eq('slug', 'daily_mission')
            .maybeSingle();
          if (dailyErr) { setStatus(`daily mission err: ${dailyErr.message}`); return; }
          if (!daily?.id) { setStatus('daily mission not found'); return; }

          const { error: insErr } = await supabase
            .from('enrollments')
            .insert({ mission_id: daily.id, kid_id: uid });
          if (insErr) { setStatus(`enroll insert err: ${insErr.message}`); return; }

          setStatus('refetching active enrollment…');
          const { data: nowActive, error: nowErr } = await supabase
            .from('enrollments')
            .select('id, status, missions!inner(slug, title, goal_json)')
            .eq('kid_id', uid)
            .eq('status', 'active')
            .maybeSingle();
          if (nowErr) { setStatus(`refetch err: ${nowErr.message}`); return; }

          enrollment = nowActive ?? null;
        }

        if (!enrollment) { setStatus('enrollment still null'); return; }

        // 5) Set mission + enrollment state
        setEnr(enrollment as any);
        const m = (enrollment as any).missions as MissionRow;
        setMission(m);

        // 6) Load check-ins once
        setStatus('loading check-ins…');
        const { data: checks, error: chkErr } = await supabase
          .from('checkins')
          .select('day_index, data_json')
          .eq('enrollment_id', (enrollment as any).id)
          .order('day_index', { ascending: true });
        if (chkErr) { setStatus(`checks err: ${chkErr.message}`); return; }

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
        setStatus(`exception: ${e?.message || 'unknown error'}`);
      }
    })();
  }, []);

  // Save today's check-in (one per day enforced by DB)
  const saveCheckin = async () => {
    if (!enr || !mission) return;
    const supabase = getSupabase();
    const min = mission.goal_json?.per_day_steps ?? 5000;
    if (stepsInput < min) return alert(`Enter at least ${min} steps`);

    const { error } = await supabase.from('checkins').insert({
      enrollment_id: enr.id,
      day_index: dayIndex,
      data_json: { steps: stepsInput },
      day_key: new Date().toISOString().slice(0, 10), // UTC date
    });

    if (error) {
      if ((error as any).code === '23505') {
        alert("Looks like you've already checked in today. Come back tomorrow!");
      } else {
        alert(error.message);
      }
      return;
    }

    setTodayTotal(stepsInput);
    setStepsInput(0);
    setDayIndex((d) => d + 1);
    if (mission.slug === 'three_day_streak') setStreak((s) => s + 1);
    alert('Saved! Now mint your reward if you hit the goal.');
  };

  // Mint reward
  const mintIfReady = async () => {
    if (!enr || !mission) return;
    const supabase = getSupabase();
    const targetDays = mission.goal_json?.days ?? 1;

    const { data: checks } = await supabase
      .from('checkins')
      .select('id')
      .eq('enrollment_id', enr.id);

    if ((checks?.length || 0) < targetDays) {
      return alert(`Finish ${targetDays} day(s) first`);
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

    const { error: artErr } = await supabase.from('artifacts').insert({
      kid_id: uid,
      mission_id: mission.id,
      title: rewardTitle,
      type: 'badge',
    });
    if (artErr) { alert(artErr.message); return; }

    setShowCelebrate(true);
    confetti({
      particleCount: mission.slug === 'daily_mission' ? 120 : 150,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (mission.slug === 'daily_mission') {
      setSeedUnlocked(true);
      setJustCompletedDaily(true);
    }
  };

  // Close modal and go to LOCKR
  const addToLockr = () => {
    setShowCelebrate(false);
    window.location.href = '/kid/lockr';
  };

  // Start 3-day streak after Daily
  const startThreeDayStreak = async () => {
    const supabase = getSupabase();
    const uid = (await supabase.auth.getUser()).data.user?.id;
    const { data: three } = await supabase
      .from('missions')
      .select('id')
      .eq('slug', 'three_day_streak')
      .maybeSingle();
    if (!three?.id) return alert('3-Day Streak mission not found.');

    const { error } = await supabase
      .from('enrollments')
      .insert({ mission_id: three.id, kid_id: uid });
    if (error) return alert(error.message);

    alert('3-Day Streak started! Let’s keep it going.');
    window.location.href = '/kid/checkin';
  };

  if (!mission) return (
    <div className="p-6 text-white">
      Loading… <span className="text-white/70">{status}</span>
    </div>
  );

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

      {/* Input + add */}
      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 rounded-md bg-white/10 border border-white/20 p-3 text-white placeholder:text-white/50"
          placeholder="Enter steps"
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

      {/* PIRL Seed card */}
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

      {/* Mint + next step */}
      {!justCompletedDaily ? (
        <div className="mt-4">
          <button
            onClick={mintIfReady}
            className="w-full rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3"
          >
            Mint reward
          </button>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <div className="font-semibold mb-2">
            Great job — Daily Mission complete!
          </div>
          <p className="text-sm mb-3">
            Keep it up for 3 days to earn a new reward.
          </p>
          <button
            onClick={startThreeDayStreak}
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3"
          >
            Go for 3-Day Streak!
          </button>
          <a
            href="/kid/lockr"
            className="mt-2 block text-center underline text-sm"
          >
            See your LOCKR
          </a>
        </div>
      )}

      {/* Celebration Modal */}
      <CelebrationModal
        open={showCelebrate}
        onAddToLockr={addToLockr}
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
