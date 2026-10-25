'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  GitBranch,
  LayoutDashboard,
  Leaf,
  Menu,
  Settings2,
  ShieldCheck,
  X,
  Sparkles,
  GraduationCap,
  Heart,
  Bell,
} from 'lucide-react';
import { useWorkspace } from '../lib/useWorkspace';
import { download } from '../lib/exports';
import { createPathway } from '../domain/pathways';
import type { Opportunity } from '../domain/models';
import { Today, type Section } from './Today';
import { Discover } from './Discover';
import { Pathways } from './Pathways';
import { Planner } from './Planner';
import { Settings } from './Settings';
import { Modal } from './Modal';
import { ProfileWizard } from './ProfileWizard';
import { MaxGuide } from './MaxGuide';
import { MaxPet } from './MaxPet';
import { SchoolSetup } from './SchoolSetup';
import { Reminders } from './Reminders';
import { browserSupabase } from '../lib/supabase';
const navigation = [
  { name: 'Today', icon: LayoutDashboard },
  { name: 'Discover', icon: Compass },
  { name: 'My Pathways', icon: GitBranch },
  { name: 'Calendar', icon: CalendarDays },
  { name: 'School & Classes', icon: GraduationCap },
  { name: 'Ask Max', icon: Sparkles },
  { name: 'Max & Rewards', icon: Heart },
  { name: 'Reminders', icon: Bell },
  { name: 'Profile & Settings', icon: Settings2 },
] as const;
export function WorkspaceApp({ userId = null }: { userId?: string | null }) {
  const { workspace, update, ready, warning, recovery, reset, syncStatus, deleteCloud } =
    useWorkspace(userId);
  const [selectedSection, setSection] = useState<Section>('Today');
  const section: Section =
    userId && ready && !workspace.school.setupDone ? 'School & Classes' : selectedSection;
  const [wizard, setWizard] = useState(false);
  const [demo, setDemo] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [remove, setRemove] = useState<Opportunity | null>(null);
  const sidebar = useRef<HTMLElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = matchMedia('(max-width: 760px)');
    const resize = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMobileOpen(false);
    };
    resize();
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 7000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!mobileOpen) return;
    const menuButton = menu.current;
    const controls = Array.from(sidebar.current?.querySelectorAll<HTMLElement>('button,a') || []);
    controls[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement === controls[0]) {
          event.preventDefault();
          controls.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === controls.at(-1)) {
          event.preventDefault();
          controls[0]?.focus();
        }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      menuButton?.focus();
    };
  }, [mobileOpen]);
  function navigate(page: Section) {
    setSection(page);
    setMobileOpen(false);
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }
  function save(opportunity: Opportunity) {
    if (workspace.pathways.some((path) => path.opportunityId === opportunity.id)) {
      setRemove(opportunity);
      return;
    }
    update((current) => ({
      ...current,
      pathways: [...current.pathways, createPathway(opportunity, crypto.randomUUID())],
    }));
    setNotice(
      'Pathway saved. Saving is not an application. Set a target and preview your preparation plan.',
    );
  }
  const profile = () => setWizard(true);
  const notify = (message: string) => setNotice(message);
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {mobileOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        ref={sidebar}
        inert={isMobile && !mobileOpen}
        className={`sidebar ${mobileOpen ? 'open' : ''}`}
      >
        <button className="brand" aria-label="Acadia Edu home" onClick={() => navigate('Today')}>
          <span className="brand-mark">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path
                d="M6 25 16 6l10 19M11 17h10M10 25l6-10 6 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>
            acadia<span className="brand-edu">edu</span>
          </span>
        </button>
        <div className="workspace-label">A WAY FORWARD</div>
        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              aria-current={section === item.name ? 'page' : undefined}
              className={`nav-item ${section === item.name ? 'active' : ''}`}
              onClick={() => {
                if (item.name === 'Discover') setDemo(false);
                navigate(item.name);
              }}
            >
              <item.icon size={19} strokeWidth={1.6} />
              {item.name}
              {item.name === 'My Pathways' && workspace.pathways.length > 0 && (
                <span>{workspace.pathways.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Leaf size={24} />
            <h3>Big futures start small.</h3>
            <p>
              Curiosity is a beginning.
              <br />A next step makes it yours.
            </p>
            <button onClick={profile}>
              Shape your direction
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="sidebar-profile">
            <span className="avatar">
              {workspace.profile.nickname?.[0]?.toUpperCase() || <Leaf size={18} />}
            </span>
            <div>
              <strong>{workspace.profile.nickname || 'Your guest space'}</strong>
              <small>{userId ? 'Private account' : 'Device-local · guest'}</small>
            </div>
            <ShieldCheck size={16} />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              ref={menu}
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span>My workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{section}</strong>
          </div>
          <div className="topbar-right">
            <span className="timezone-label">PENNSYLVANIA · GRADES 9–12</span>
            <button className="guest-chip" onClick={() => navigate('Profile & Settings')}>
              <ShieldCheck size={14} />
              {userId ? 'Your account' : 'Guest workspace'}
            </button>
          </div>
        </header>
        <main id="main-content" ref={main} tabIndex={-1}>
          <div className="guest-banner">
            <span className="green-dot" />
            <span>
              {userId ? syncStatus : 'Saved in this browser only. No account or school connection.'}
            </span>
            <button onClick={() => navigate('Profile & Settings')}>
              Your data & choices
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="session-actions">
            {userId ? (
              <button
                className="text-button"
                onClick={async () => {
                  if (syncStatus.includes('Saving') || syncStatus === 'Not saved') {
                    notify(
                      'Wait for cloud save to finish, or export your planner before signing out.',
                    );
                    return;
                  }
                  const result = await browserSupabase()?.auth.signOut();
                  if (result?.error) {
                    notify(result.error.message);
                    return;
                  }
                  window.location.reload();
                }}
              >
                Sign out
              </button>
            ) : (
              <button
                className="text-button"
                onClick={() => {
                  try {
                    sessionStorage.removeItem('acadia-guest');
                  } catch {}
                  window.location.reload();
                }}
              >
                Sign in or create account
              </button>
            )}
          </div>
          {warning && (
            <div className="storage-warning" role="alert">
              <p>{warning}</p>
              {recovery !== null && (
                <>
                  <button
                    className="button secondary"
                    onClick={() => download('acadia-recovery.txt', recovery, 'text/plain')}
                  >
                    <ArrowDownToLine size={14} />
                    Download recovery copy
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => {
                      if (
                        window.confirm(
                          'Replace the unreadable saved planner with an empty workspace?',
                        )
                      )
                        reset();
                    }}
                  >
                    Start fresh
                  </button>
                </>
              )}
            </div>
          )}
          {!ready ? (
            <div className="loading-state" role="status">
              Opening your student workspace…
            </div>
          ) : (
            <>
              {section === 'Today' && (
                <Today
                  workspace={workspace}
                  update={update}
                  navigate={navigate}
                  onProfile={profile}
                  onDemo={() => {
                    setDemo(true);
                    navigate('Discover');
                  }}
                  notify={notify}
                />
              )}{' '}
              {section === 'Discover' && (
                <Discover
                  key={demo ? 'demo' : 'catalogue'}
                  workspace={workspace}
                  onSave={save}
                  initialDemo={demo}
                />
              )}{' '}
              {section === 'My Pathways' && (
                <Pathways
                  workspace={workspace}
                  update={update}
                  notify={notify}
                  onDiscover={() => navigate('Discover')}
                  onSave={save}
                />
              )}{' '}
              {section === 'Calendar' && (
                <Planner workspace={workspace} update={update} notify={notify} />
              )}{' '}
              {section === 'School & Classes' && (
                <SchoolSetup
                  workspace={workspace}
                  update={update}
                  notify={notify}
                  onComplete={() => {
                    update((current) => ({
                      ...current,
                      school: { ...current.school, setupDone: true },
                    }));
                    setWizard(true);
                  }}
                />
              )}
              {section === 'Ask Max' && (
                <MaxGuide workspace={workspace} update={update} userId={userId} notify={notify} />
              )}
              {section === 'Max & Rewards' && (
                <MaxPet workspace={workspace} update={update} notify={notify} />
              )}
              <div hidden={section !== 'Reminders'}>
                <Reminders workspace={workspace} />
              </div>
              {section === 'Profile & Settings' && (
                <Settings
                  workspace={workspace}
                  update={update}
                  onEdit={profile}
                  userId={userId}
                  reset={reset}
                  deleteCloud={deleteCloud}
                  notify={notify}
                />
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              <Leaf size={14} />
              Opportunity, with a way forward.
            </span>
            <span>Your choices. Your pace. Your next chapter.</span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Dismiss message"
            onClick={() => setNotice('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {wizard && (
        <Modal title="Let’s find your starting point" close={() => setWizard(false)}>
          <ProfileWizard
            profile={workspace.profile}
            onSave={(profile) => {
              update((current) => ({ ...current, profile, onboarded: true }));
              setWizard(false);
              navigate('Today');
              notify('Your preferences are saved. You can change direction anytime.');
            }}
          />
        </Modal>
      )}
      {remove && (
        <Modal title="Remove this saved pathway?" close={() => setRemove(null)}>
          <div className="form-stack">
            <p>
              Removing {remove.name} also removes its preparation steps and scheduled sessions. Your
              other tasks are kept.
            </p>
            <button
              className="button danger-button"
              onClick={() => {
                update((current) => {
                  const ids = new Set(
                    current.pathways.filter((p) => p.opportunityId === remove.id).map((p) => p.id),
                  );
                  return {
                    ...current,
                    pathways: current.pathways.filter((p) => !ids.has(p.id)),
                    tasks: current.tasks.filter((t) => !t.pathwayId || !ids.has(t.pathwayId)),
                  };
                });
                setRemove(null);
                notify('Saved pathway removed.');
              }}
            >
              Remove pathway and sessions
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
