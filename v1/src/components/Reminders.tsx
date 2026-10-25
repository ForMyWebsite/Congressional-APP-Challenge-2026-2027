'use client';
import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { allTasks } from '../domain/school';
import { addDays, todayKey } from '../domain/dates';
import type { Workspace } from '../domain/models';
export function Reminders({ workspace }: { workspace: Workspace }) {
  const [permission, setPermission] = useState('default');
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const notified = useRef(new Set<string>());
  const today = todayKey();
  const upcoming = allTasks(workspace, today, addDays(today, 7))
    .filter((t) => !t.done)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  useEffect(() => {
    if (!enabled || permission !== 'granted') return;
    const tick = () => {
      const now = new Date();
      const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(
        now,
      );
      const localTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now);
      const current = Number(localTime.slice(0, 2)) * 60 + Number(localTime.slice(3));
      for (const task of allTasks(workspace, localDate, localDate)) {
        const delta = Number(task.time.slice(0, 2)) * 60 + Number(task.time.slice(3)) - current;
        if (!task.done && delta >= 0 && delta <= 15 && !notified.current.has(task.id)) {
          notified.current.add(task.id);
          try {
            new Notification('Acadia · coming up soon', {
              body: `${task.title} at ${task.time} (Eastern time)`,
            });
          } catch {
            setMessage(
              'This browser could not display notifications. In-app reminders are still available.',
            );
          }
        }
      }
    };
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, [enabled, permission, workspace]);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">A FRIENDLY HEADS-UP</div>
          <h1>Make room for what’s coming.</h1>
          <p>Your tasks and commitments for the next seven days. Times are Eastern.</p>
        </div>
      </div>
      <section className="panel school-form">
        <h2>
          <Bell size={19} />
          Reminders you control
        </h2>
        <p>
          In-app reminders work whenever you open Acadia. Optional browser alerts check for sessions
          starting within 15 minutes while this page remains open. Background push, email and alerts
          after closing the app are not configured.
        </p>
        <button
          className="button secondary"
          onClick={async () => {
            if (enabled) {
              setEnabled(false);
              return;
            }
            if (!('Notification' in window)) {
              setMessage('This browser does not support desktop notifications.');
              return;
            }
            const value = await Notification.requestPermission();
            setPermission(value);
            setEnabled(value === 'granted');
            if (value !== 'granted')
              setMessage('Notifications were not permitted. Use the in-app list below.');
          }}
        >
          {enabled ? 'Turn off browser alerts' : 'Enable browser alerts for this session'}
        </button>
        {message && (
          <p role="status" className="info-box">
            {message}
          </p>
        )}
      </section>
      <div className="reminder-list panel">
        {upcoming.length ? (
          upcoming.map((task) => (
            <article className="integration-row" key={task.id}>
              <Bell size={18} />
              <div>
                <h3>{task.title}</h3>
                <p>
                  {task.date} · {task.time} · {task.minutes} min ·{' '}
                  {task.id.startsWith('rec-') ? 'Weekly commitment' : task.category}
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <h2>A little room to breathe.</h2>
            <p>No upcoming tasks or weekly commitments.</p>
          </div>
        )}
      </div>
    </>
  );
}
