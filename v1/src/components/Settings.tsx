'use client';
import { useState, type Dispatch, type SetStateAction } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  CircleHelp,
  FileUp,
  Link2,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import type { Workspace } from '../domain/models';
import { download, calendarICS } from '../lib/exports';
import { importWorkspace } from '../lib/storage';
import { Modal } from './Modal';
export function Settings({
  workspace,
  update,
  onEdit,
  reset,
  notify,
  userId = null,
  deleteCloud,
}: {
  userId?: string | null;
  deleteCloud?: () => Promise<void>;
  workspace: Workspace;
  update: Dispatch<SetStateAction<Workspace>>;
  onEdit: () => void;
  reset: () => boolean;
  notify: (message: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [pending, setPending] = useState<Workspace | null>(null);
  const [error, setError] = useState('');
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">YOUR STORY. YOUR CHOICES.</div>
          <h1>A future that feels like you.</h1>
          <p>Change direction, update your preferences, and stay in control of your data.</p>
        </div>
        <button className="button primary" onClick={onEdit}>
          Edit my profile
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="settings-grid">
        <section className="panel settings-card">
          <div className="section-kicker">YOUR COMPASS</div>
          <h2>{workspace.profile.nickname || 'Your guest profile'}</h2>
          <dl className="facts">
            <div>
              <dt>Grade & location</dt>
              <dd>
                {workspace.profile.grade ? `Grade ${workspace.profile.grade}` : 'Grade not shared'}{' '}
                · {workspace.profile.region || 'Location not shared'}
              </dd>
            </div>
            <div>
              <dt>Interests</dt>
              <dd>{workspace.profile.interests.join(', ') || 'Still exploring'}</dd>
            </div>
            <div>
              <dt>Ambitions & activities</dt>
              <dd>
                {workspace.profile.ambition || 'Not shared'} ·{' '}
                {workspace.profile.activities || 'Not shared'}
              </dd>
            </div>
            <div>
              <dt>Preparation window</dt>
              <dd>
                {workspace.profile.availableMinutes} minutes/day from {workspace.profile.startTime}{' '}
                · {workspace.profile.weekdays.length} days/week · America/New_York
              </dd>
            </div>
            <div>
              <dt>Access preferences</dt>
              <dd>
                {workspace.profile.preferFree ? 'Prefer free. ' : ''}
                {workspace.profile.preferRemote ? 'Prefer remote. ' : ''}Transportation:{' '}
                {workspace.profile.transportation}.{' '}
                {workspace.profile.accessibilityInfo ? 'Ask for accessibility information.' : ''}
              </dd>
            </div>
          </dl>
          <button className="text-button" onClick={onEdit}>
            Review or change answers
            <ArrowRight size={14} />
          </button>
        </section>
        <section className="panel settings-card">
          <ShieldCheck className="settings-icon" size={28} />
          <h2>Your planner stays with you.</h2>
          <p>
            This is{' '}
            {userId ? (
              <strong>your private cloud workspace</strong>
            ) : (
              <strong>an unauthenticated guest workspace</strong>
            )}
            . Your profile, pathways, and tasks are{' '}
            {userId
              ? 'stored in your private Supabase account.'
              : 'stored in this browser only and do not sync across devices.'}
          </p>
          <p>
            Clearing site data, using a different browser, or deleting the Codespace’s forwarded
            origin can make a guest planner inaccessible. Export regularly. Questions and optional
            course grades are sent to the configured AI provider only when you consent to use Max.
            Screenshot images are sent only when you approve extraction.
          </p>
          <p>
            No exact address, school login, report card, financial document, or health detail is
            required.
          </p>
          <div className="settings-actions">
            <button
              className="button secondary"
              onClick={() => download('acadia-planner-v3.json', JSON.stringify(workspace, null, 2))}
            >
              <ArrowDownToLine size={15} />
              Export planner
            </button>
            <button
              className="button secondary"
              disabled={!workspace.tasks.length}
              onClick={() =>
                download(
                  'acadia-calendar.ics',
                  calendarICS(workspace.tasks),
                  'text/calendar;charset=utf-8',
                )
              }
            >
              <ArrowDownToLine size={15} />
              Export calendar
            </button>
            <label className="button secondary file-button">
              <FileUp size={15} />
              Import planner
              <input
                aria-label="Import planner JSON"
                type="file"
                accept=".json,application/json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setError('');
                  try {
                    if (file.size > 1_000_000)
                      throw new Error('Choose a planner smaller than 1 MB.');
                    setPending(importWorkspace(await file.text()));
                  } catch {
                    setError(
                      'This file is not a valid Acadia v2 planner. Your current data has not changed.',
                    );
                  }
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          {error && (
            <p className="error-box" role="alert">
              {error}
            </p>
          )}
          <button className="text-button danger" onClick={() => setDeleting(true)}>
            <Trash2 size={14} />
            {userId ? 'Delete cloud planner' : 'Delete guest data'}
          </button>
        </section>
      </div>
      <section className="panel integration-panel">
        <div className="section-heading">
          <h2>
            <Link2 size={18} />
            Connections & guidance
          </h2>
          <span className="badge">Manual entry works now</span>
        </div>
        {[
          {
            name: 'Email authentication & cross-device sync',
            status: userId ? 'Connected' : 'Guest mode',
            detail:
              'Supabase provides Google/email authentication and private account storage when configured. Guest mode is never a successful login. Previous local-account data is retained for recovery.',
          },
          {
            name: 'Schoology & Alma',
            status: 'Not connected',
            detail:
              'Official school agreements, documentation, credentials and permissions are required. Never enter school passwords here. School email alone cannot verify enrollment or authorize records.',
          },
          {
            name: 'Live AI guide · Ask Max',
            status: 'See Ask Max for connection status',
            detail:
              'Ask Max uses a real configured model when the server key is configured, with consent and approval before adding tasks. Screenshot extraction is also available with review. No fake responses are generated.',
          },
          {
            name: 'Email & push reminders',
            status: 'Not configured',
            detail:
              'Only working in-app task reminders are shown on Today. No external messages or delivery guarantees.',
          },
        ].map((item) => (
          <div className="integration-row" key={item.name}>
            <CircleHelp size={20} />
            <div>
              <h3>{item.name}</h3>
              <p>{item.detail}</p>
            </div>
            <span className="badge">{item.status}</span>
          </div>
        ))}
      </section>
      <div className="info-box">
        <ShieldCheck size={19} />
        <p>
          This development release has not been certified for student privacy or legal compliance. A
          real student launch needs qualified privacy/consent review, approved school access,
          verified authentication where used, retention policies and secure operations.
        </p>
      </div>
      {deleting && (
        <Modal
          title={userId ? 'Delete this cloud planner?' : 'Delete this guest workspace?'}
          close={() => setDeleting(false)}
        >
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              if (userId && deleteCloud) {
                try {
                  await deleteCloud();
                  setDeleting(false);
                  notify('Cloud planner deleted. Your authentication account remains.');
                } catch (error) {
                  notify((error as Error).message);
                }
                return;
              }
              if (!reset()) {
                notify('Deletion failed. Check the storage warning before trying again.');
                return;
              }
              setDeleting(false);
              notify(
                'Your guest data was deleted from this browser. Downloaded exports remain under your control.',
              );
            }}
          >
            <p>
              This permanently removes your stored profile, pathways, tasks, grades, chat history
              and pet data {userId ? 'from your account' : 'from this browser'}. Downloaded files
              are not deleted. Export first if you want a backup.
            </p>
            <label className="check-label">
              <input type="checkbox" required />I understand this cannot be undone.
            </label>
            <button className="button danger-button" type="submit">
              {userId ? 'Delete my cloud planner' : 'Delete my guest data'}
            </button>
          </form>
        </Modal>
      )}
      {pending && (
        <Modal title="Replace your current planner?" close={() => setPending(null)}>
          <div className="form-stack">
            <p>
              The file is valid. Importing will replace your current profile,{' '}
              {workspace.pathways.length} saved pathways and {workspace.tasks.length} tasks. Export
              a backup first if you need one.
            </p>
            <button
              className="button primary"
              onClick={() => {
                update(pending);
                setPending(null);
                notify('Planner imported and validated.');
              }}
            >
              Replace with imported planner
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
