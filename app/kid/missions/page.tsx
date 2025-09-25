'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function MissionsPage() {
  const [msg, setMsg] = useState('Setting up your mission…');

  useEffect(() => {
    (async () => {
      // Ensure a session (anonymous)
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) await supabase.auth.signInAnonymously();
      const uid = (await supabase.auth.getUser()).data.user?.id;
      if (!uid) return setMsg('Could not create a session. Refresh to try again.');

      // If an active mission already exists, go to check-in
      const { data: active } = await supabase
        .from('enrollments')
        .select('id')
        .eq('kid_id', uid)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (active) {
        window.location.href = '/kid/checkin';
        return;
      }

      // Auto-enroll Daily Mission
      const { data: daily } = await supabase
        .from('missions')
        .select('id')
        .eq('slug', 'daily_mission')
        .maybeSingle();

      if (!daily?.id) {
        setMsg('Daily mission not found. Ask an adult for help.');
        return;
      }

      const { error } = await supabase
        .from('enrollments')
        .insert({ mission_id: daily.id, kid_id: uid });

      if (error) {
        setMsg('Could not start your mission. Refresh and try again.');
        return;
      }

      window.location.href = '/kid/checkin';
    })();
  }, []);

  return <div className="p-6 max-w-xl mx-auto">{msg}</div>;
}
