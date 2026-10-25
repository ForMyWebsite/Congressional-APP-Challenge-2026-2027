import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  X,
  ExternalLink,
  Link2,
  CheckCircle2,
} from 'lucide-react';
import {
  addDays,
  dateKey,
  getReminders,
  makeDemoState,
  parseDate,
  rankOpportunities,
  stateSchema,
  type CalendarEvent,
  type Page,
  type StudentState,
  type Task,
} from './domain';
import { Modal } from './components/Modal';
import { Scenery } from './components/Scenery';
import { OpportunityCard } from './components/OpportunityCard';
import { PlannerForm, AuthForm, ProfileForm, DeleteForm } from './components/Forms';
import { api } from './lib/api';
import { GuidePage } from './pages/GuidePage';
import { TaskList, EventList } from './components/PlannerLists';
import { Calendar } from './components/Calendar';

const nav = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My planner', icon: CalendarDays },
  { label: 'Opportunities', icon: Compass },
  { label: 'Acadia guide', icon: Sparkles },
  { label: 'Inbox', icon: MessageCircle },
] as const;
const storageKey = 'acadia-demo-v1';
function readDemo(): StudentState {
  try {
    const parsed = stateSchema.safeParse(JSON.parse(localStorage.getItem(storageKey) || 'null'));
    if (parsed.success) return parsed.data;
  } catch {
    /* Browser storage may be unavailable. */
  }
  return makeDemoState();
}

export default function App() {
  const [state, setState] = useState<StudentState>(readDemo);
  const [email, setEmail] = useState<string | null>(null);
  const [page, setPage] = useState<Page>('Overview');
  const [modal, setModal] = useState<'task' | 'event' | 'auth' | 'connections' | 'delete' | null>(
    null,
  );
  const [mobileNav, setMobileNav] = useState(false);
  const [isMobile, setIsMobile] = useState(() => matchMedia('(max-width: 700px)').matches);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const [notice, setNotice] = useState('');
  const [saveStatus, setSaveStatus] = useState('Saved on this device');
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [month, setMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [taskPeriod, setTaskPeriod] = useState('All tasks');
  const [opportunityFilter, setOpportunityFilter] = useState('For you');
  const [aiConfigured, setAiConfigured] = useState(false);
  const saveQueue = useRef(Promise.resolve());
  const userGeneration = useRef(0);
  const firstName = state.profile.name.split(' ')[0];
  const today = dateKey(new Date());
  const todayTasks = state.tasks.filter((task) => task.date === today);
  const done = todayTasks.filter((task) => task.done).length;
  const progress = todayTasks.length ? Math.round((done / todayTasks.length) * 100) : 0;
  const upcoming = [...state.events]
    .filter((event) => event.date >= today)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const ranked = rankOpportunities(state.profile.interests);
  const reminders = getReminders(state);
  const unread = reminders.filter((item) => !state.readMessages.includes(item.id)).length;
  const announce = useCallback((message: string) => setNotice(message), []);
  useEffect(() => {
    const media = matchMedia('(max-width: 700px)');
    const resize = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMobileNav(false);
    };
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    if (!isMobile || !mobileNav) return;
    const sidebar = sidebarRef.current!;
    const controls = Array.from(sidebar.querySelectorAll<HTMLElement>('a, button'));
    controls[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNav(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      menuRef.current?.focus();
    };
  }, [mobileNav, isMobile]);
  useEffect(() => {
    let active = true;
    api('/session')
      .then((result) => {
        if (active && result.email) {
          setEmail(result.email);
          setState(stateSchema.parse(result.state));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    api('/health')
      .then((result) => {
        if (active) setAiConfigured(result.aiConfigured);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    if (!email) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
        setSaveStatus('Saved on this device');
      } catch {
        setSaveStatus('Storage unavailable — changes will not persist');
      }
      return;
    }
    setSaveStatus('Saving…');
    const generation = userGeneration.current;
    const timer = setTimeout(() => {
      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(async () => {
          if (generation !== userGeneration.current) return;
          try {
            await api('/state', 'PUT', state);
            if (generation === userGeneration.current) setSaveStatus('All changes saved');
          } catch (error) {
            if (generation === userGeneration.current) {
              setSaveStatus('Not saved');
              announce(
                (error as Error).message +
                  ' Your changes remain on screen; export them from your profile before leaving.',
              );
            }
          }
        });
    }, 350);
    return () => clearTimeout(timer);
  }, [state, email, ready, announce]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 7000);
    return () => clearTimeout(timer);
  }, [notice]);
  function navigate(next: Page) {
    setPage(next);
    setMobileNav(false);
    setSearchOpen(false);
    setQuery('');
    window.scrollTo(0, 0);
  }
  function toggleTask(id: string) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    }));
  }
  function toggleSaved(id: string) {
    setState((current) => ({
      ...current,
      saved: current.saved.includes(id)
        ? current.saved.filter((item) => item !== id)
        : [...current.saved, id],
    }));
  }
  async function logout() {
    try {
      await saveQueue.current;
      await api('/state', 'PUT', state);
      await api('/auth/logout', 'POST');
      userGeneration.current++;
      setEmail(null);
      setState(readDemo());
      navigate('Overview');
      announce('Signed out. You’re back in the sample workspace.');
    } catch (error) {
      announce((error as Error).message);
    }
  }
  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          { exportedAt: new Date().toISOString(), mode: email ? 'account' : 'demo', ...state },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'acadia-student-data.json';
    link.click();
    URL.revokeObjectURL(url);
    announce('Your data export is ready.');
  }
  const selectedEvents = state.events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  const filteredTasks = state.tasks.filter(
    (task) =>
      task.date === selectedDate && (taskPeriod === 'All tasks' || task.time === taskPeriod),
  );
  const searchResults = query.trim()
    ? [
        ...state.tasks
          .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
          .map((item) => ({
            title: item.title,
            detail: 'Task',
            page: 'My planner' as Page,
            date: item.date,
          })),
        ...state.events
          .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
          .map((item) => ({
            title: item.title,
            detail: 'Event',
            page: 'My planner' as Page,
            date: item.date,
          })),
        ...ranked
          .filter((item) =>
            `${item.title} ${item.organization}`.toLowerCase().includes(query.toLowerCase()),
          )
          .map((item) => ({
            title: item.title,
            detail: 'Opportunity',
            page: 'Opportunities' as Page,
            date: '',
          })),
      ].slice(0, 6)
    : [];

  const taskList = (items: Task[], allowDelete = false) => (
    <TaskList
      items={items}
      onToggle={toggleTask}
      onRemove={
        allowDelete
          ? (id) =>
              setState((current) => ({
                ...current,
                tasks: current.tasks.filter((item) => item.id !== id),
              }))
          : undefined
      }
    />
  );
  const eventList = (events: CalendarEvent[], removable = false) => (
    <EventList
      events={events}
      onRemove={
        removable
          ? (id) =>
              setState((current) => ({
                ...current,
                events: current.events.filter((item) => item.id !== id),
              }))
          : undefined
      }
    />
  );
  const calendar = (compact = false) => (
    <Calendar
      month={month}
      setMonth={setMonth}
      selectedDate={selectedDate}
      allEvents={state.events}
      compact={compact}
      onSelect={(date) => {
        setSelectedDate(date);
        if (compact) navigate('My planner');
      }}
    />
  );

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {mobileNav && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        inert={isMobile && !mobileNav}
        className={`sidebar ${mobileNav ? 'open' : ''}`}
      >
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            navigate('Overview');
          }}
        >
          <span className="brand-icon">
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
        </a>
        <div className="workspace-label">YOUR STUDENT SPACE</div>
        <nav aria-label="Main navigation">
          {nav.map((item) => (
            <button
              key={item.label}
              aria-label={item.label}
              className={`nav-item ${page === item.label ? 'active' : ''}`}
              aria-current={page === item.label ? 'page' : undefined}
              onClick={() => navigate(item.label)}
            >
              <item.icon size={19} strokeWidth={1.65} />
              {item.label}
              {item.label === 'Acadia guide' && <span className="tiny-spark">✦</span>}
              {item.label === 'Inbox' && unread > 0 && <span className="nav-count">{unread}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="seed-icon">
              <Leaf size={22} />
            </span>
            <h3>Big futures start small.</h3>
            <p>
              A little progress today.
              <br />
              More possibility tomorrow.
            </p>
            <button onClick={() => navigate('My profile')}>
              Explore your path <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setModal('connections')}>
            <Link2 size={18} />
            School connections
          </button>
          <button
            className={`nav-item ${page === 'My profile' ? 'active' : ''}`}
            onClick={() => navigate('My profile')}
          >
            <Settings2 size={18} />
            Profile & settings
          </button>
          <div className="sidebar-profile">
            <span className="avatar">
              {state.profile.name
                .split(' ')
                .map((word) => word[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div>
              <strong>{state.profile.name}</strong>
              <span>
                Grade {state.profile.grade} <span>·</span> {email ? 'Student' : 'Demo student'}
              </span>
            </div>
            <button
              className="icon-button"
              aria-label={email ? 'Sign out' : 'Sign in'}
              onClick={() => (email ? void logout() : setModal('auth'))}
            >
              {email ? <LogOut size={17} /> : <ChevronDown size={17} />}
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              ref={menuRef}
              aria-label="Open navigation"
              aria-expanded={mobileNav}
              onClick={() => setMobileNav(true)}
            >
              <Menu size={22} />
            </button>
            <span>My workspace</span>
            <ChevronRight size={13} />
            <strong>{page}</strong>
          </div>
          <div className="topbar-actions">
            <div className="search-wrap">
              <label className="search-box">
                <Search size={16} />
                <input
                  aria-label="Search your workspace"
                  placeholder="Search anything…"
                  value={query}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                />
                <kbd>⌕</kbd>
              </label>
              {searchOpen && query && (
                <div className="search-results">
                  <div className="search-heading">
                    Workspace results{' '}
                    <button
                      className="icon-button"
                      aria-label="Close search"
                      onClick={() => setSearchOpen(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {searchResults.length ? (
                    searchResults.map((result, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (result.date) {
                            setSelectedDate(result.date);
                            setMonth(
                              new Date(
                                parseDate(result.date).getFullYear(),
                                parseDate(result.date).getMonth(),
                                1,
                              ),
                            );
                          }
                          navigate(result.page);
                        }}
                      >
                        <span>{result.title}</span>
                        <small>{result.detail}</small>
                      </button>
                    ))
                  ) : (
                    <p>No matching tasks, events, or opportunities.</p>
                  )}
                </div>
              )}
            </div>
            <button
              className="notification-button icon-button"
              aria-label={`Open inbox, ${unread} unread reminders`}
              onClick={() => navigate('Inbox')}
            >
              <Bell size={19} />
              {unread > 0 && <i />}
            </button>
            <span className="top-divider" />
            <button
              className="help-button icon-button"
              aria-label="About Acadia"
              onClick={() =>
                announce(
                  'Acadia brings your plans and possibilities together. Start with your profile, add a task, or explore an opportunity. Demo data is illustrative; school systems are not connected.',
                )
              }
            >
              <CircleHelp size={19} />
            </button>
            <button
              className="avatar small"
              aria-label="Open your profile"
              onClick={() => navigate('My profile')}
            >
              {firstName[0]}
            </button>
          </div>
        </header>
        <main id="main-content">
          <div className="demo-banner">
            {email ? (
              <>
                <ShieldCheck size={14} />
                <span>
                  Your private workspace{' '}
                  <span className="banner-detail">· School affiliation is self-reported</span>
                </span>
                <span className="save-status">{saveStatus}</span>
              </>
            ) : (
              <>
                <span className="demo-dot" />
                <span>
                  You’re exploring a sample student workspace.
                  <span className="banner-detail"> Make yourself at home.</span>
                </span>
                <button onClick={() => setModal('auth')}>
                  Create your free account <ArrowRight size={13} />
                </button>
              </>
            )}
          </div>
          {page === 'Overview' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow greeting-date">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <h1>
                    A little progress. A bigger future<span className="green-period">.</span>
                  </h1>
                  <p>Welcome back, {firstName}. Let’s make today a step in the right direction.</p>
                </div>
                <button
                  className="button secondary date-button"
                  onClick={() => navigate('My planner')}
                >
                  <CalendarDays size={16} />
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </button>
              </div>
              <section className="hero-card">
                <div className="hero-copy">
                  <div className="hero-label">
                    <span /> YOUR PATH, YOUR PACE
                  </div>
                  <h2>
                    There’s a whole world
                    <br />
                    ahead of you.
                  </h2>
                  <p>
                    You don’t have to figure it out all at once.
                    <br />
                    Your next step is a great place to start.
                  </p>
                  <button className="button primary" onClick={() => navigate('Opportunities')}>
                    Find your next opportunity <ArrowUpRight size={16} />
                  </button>
                </div>
                <Scenery />
                <span className="hero-footnote">
                  <Sparkles size={12} /> A future that feels like you.
                </span>
              </section>
              <div className="stats-grid">
                <button
                  className="stat-card"
                  onClick={() => {
                    setSelectedDate(today);
                    navigate('My planner');
                  }}
                >
                  <span className="stat-icon sage">
                    <CheckCheck size={20} />
                  </span>
                  <div>
                    <span>Today’s to-dos</span>
                    <strong>
                      {todayTasks.length - done}
                      <small>left to do</small>
                    </strong>
                    <p>
                      {done} of {todayTasks.length} completed
                    </p>
                  </div>
                  <span
                    className="stat-mini-progress"
                    style={{ '--progress': `${progress}%` } as React.CSSProperties}
                  />
                </button>
                <button className="stat-card" onClick={() => navigate('My planner')}>
                  <span className="stat-icon peach">
                    <CalendarDays size={20} />
                  </span>
                  <div>
                    <span>On the horizon</span>
                    <strong>
                      {
                        upcoming.filter((event) => event.date <= dateKey(addDays(new Date(), 7)))
                          .length
                      }
                      <small>upcoming events</small>
                    </strong>
                    <p>In the next 7 days</p>
                  </div>
                  <ArrowUpRight className="stat-arrow" size={17} />
                </button>
                <button className="stat-card" onClick={() => navigate('Opportunities')}>
                  <span className="stat-icon lavender">
                    <Compass size={20} />
                  </span>
                  <div>
                    <span>A world of possibility</span>
                    <strong>
                      {ranked.filter((item) => item.score > 0).length}
                      <small>interest matches</small>
                    </strong>
                    <p>Curated starting points for you</p>
                  </div>
                  <ArrowUpRight className="stat-arrow" size={17} />
                </button>
              </div>
              <div className="dashboard-grid">
                <div className="dashboard-primary">
                  <section className="panel tasks-panel">
                    <div className="section-heading">
                      <h2>
                        Your daily game plan <span className="count-pill">{todayTasks.length}</span>
                      </h2>
                      <button
                        className="text-button"
                        onClick={() => {
                          setSelectedDate(today);
                          setModal('task');
                        }}
                      >
                        <Plus size={15} />
                        Add a task
                      </button>
                    </div>
                    <div className="task-tabs" role="group" aria-label="Daily task period">
                      {['All tasks', 'Before school', 'After school'].map((period) => (
                        <button
                          key={period}
                          className={taskPeriod === period ? 'active' : ''}
                          onClick={() => setTaskPeriod(period)}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                    {taskList(
                      todayTasks.filter(
                        (task) => taskPeriod === 'All tasks' || task.time === taskPeriod,
                      ),
                    )}
                    <div className="task-footer">
                      <span>
                        <span className="small-green-dot" />
                        {progress === 100 && todayTasks.length
                          ? 'Everything checked off. You earned a breather.'
                          : 'Small steps still move you forward.'}
                      </span>
                      <span>
                        {done}/{todayTasks.length}
                      </span>
                    </div>
                  </section>
                  <section className="opportunities-section">
                    <div className="section-heading">
                      <div>
                        <h2>
                          Open doors, just for you <span className="new-pill">EXPLORE</span>
                        </h2>
                        <p>Good things happen when curiosity meets opportunity.</p>
                      </div>
                      <button className="text-button" onClick={() => navigate('Opportunities')}>
                        View all <ArrowRight size={15} />
                      </button>
                    </div>
                    <div className="opportunities-grid compact-grid">
                      {ranked.slice(0, 2).map((item) => (
                        <OpportunityCard
                          key={item.id}
                          item={item}
                          saved={state.saved.includes(item.id)}
                          toggle={() => toggleSaved(item.id)}
                          compact
                        />
                      ))}
                    </div>
                  </section>
                </div>
                <div className="dashboard-secondary">
                  <section className="panel calendar-panel">
                    <div className="section-heading">
                      <h2>Your calendar</h2>
                      <button
                        className="icon-button"
                        aria-label="Open full calendar"
                        onClick={() => navigate('My planner')}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                    {calendar(true)}
                    <div className="calendar-legend">
                      <span>
                        <i className="legend-green" />
                        School
                      </span>
                      <span>
                        <i className="legend-orange" />
                        Clubs & more
                      </span>
                    </div>
                  </section>
                  <section className="panel upcoming-panel">
                    <div className="section-heading">
                      <h2>Coming up next</h2>
                      <span className="live-dot" />
                    </div>
                    {eventList(upcoming.slice(0, 3))}
                    <button
                      className="text-button schedule-link"
                      onClick={() => navigate('My planner')}
                    >
                      See your full schedule <ArrowRight size={15} />
                    </button>
                  </section>
                  <button className="guide-nudge" onClick={() => navigate('Acadia guide')}>
                    <span className="guide-icon">
                      <Sparkles size={20} />
                    </span>
                    <span>
                      <strong>A little guidance?</strong>
                      <small>Let’s figure out your next step.</small>
                    </span>
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
          {page === 'My planner' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">MAKE SPACE FOR WHAT MATTERS</div>
                  <h1>Your plans, in perspective.</h1>
                  <p>A clear view of today. A little more confidence about tomorrow.</p>
                </div>
                <button className="button primary" onClick={() => setModal('event')}>
                  <Plus size={16} />
                  Add event
                </button>
              </div>
              <div className="planner-layout">
                <section className="panel full-calendar">
                  <div className="section-heading">
                    <h2>Your calendar</h2>
                    <button
                      className="text-button"
                      onClick={() => {
                        setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                        setSelectedDate(today);
                      }}
                    >
                      Today
                    </button>
                  </div>
                  {calendar()}
                </section>
                <div className="planner-day">
                  <section className="panel">
                    <div className="section-heading">
                      <h2>
                        {parseDate(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </h2>
                      <button
                        className="icon-button"
                        aria-label="Add event on selected date"
                        onClick={() => setModal('event')}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {eventList(selectedEvents, true)}
                  </section>
                  <section className="panel">
                    <div className="section-heading">
                      <h2>Your checklist</h2>
                      <button className="text-button" onClick={() => setModal('task')}>
                        <Plus size={14} />
                        Add task
                      </button>
                    </div>
                    <div className="task-tabs">
                      {['All tasks', 'Before school', 'After school'].map((period) => (
                        <button
                          key={period}
                          className={taskPeriod === period ? 'active' : ''}
                          onClick={() => setTaskPeriod(period)}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                    {taskList(filteredTasks, true)}
                  </section>
                </div>
              </div>
              <div className="information-note">
                <CircleHelp size={16} />
                Dates come from your entries. Confirm school exams and deadlines with your counselor
                before adding them.
              </div>
            </>
          )}
          {page === 'Opportunities' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">CURIOSITY LOOKS GOOD ON YOU</div>
                  <h1>Your next door is open.</h1>
                  <p>Explore programs, experiences, and possibilities that fit your interests.</p>
                </div>
                <button className="button secondary" onClick={() => navigate('My profile')}>
                  <Settings2 size={16} />
                  Tune your interests
                </button>
              </div>
              <div className="discovery-banner">
                <Compass size={28} />
                <div>
                  <strong>Potential isn’t limited by your ZIP code.</strong>
                  <p>
                    Start with free resources. Explore at your pace. Your interests are a compass,
                    not a limit.
                  </p>
                </div>
                <span className="tag club">YOUR NEXT CHAPTER</span>
              </div>
              <div className="filter-bar" role="group" aria-label="Opportunity filters">
                {[
                  'For you',
                  'All opportunities',
                  'Saved',
                  'Competition',
                  'Internship',
                  'Learning',
                ].map((filter) => (
                  <button
                    key={filter}
                    className={opportunityFilter === filter ? 'active' : ''}
                    onClick={() => setOpportunityFilter(filter)}
                  >
                    {filter}
                    {filter === 'Saved' && ` (${state.saved.length})`}
                  </button>
                ))}
              </div>
              <div className="opportunities-grid directory">
                {ranked
                  .filter((item) =>
                    opportunityFilter === 'For you'
                      ? item.score > 0 || state.profile.interests.length === 0
                      : opportunityFilter === 'Saved'
                        ? state.saved.includes(item.id)
                        : opportunityFilter === 'All opportunities' ||
                          item.type === opportunityFilter,
                  )
                  .map((item) => (
                    <OpportunityCard
                      key={item.id}
                      item={item}
                      saved={state.saved.includes(item.id)}
                      toggle={() => toggleSaved(item.id)}
                    />
                  ))}
              </div>
              {opportunityFilter === 'Saved' && !state.saved.length && (
                <div className="empty-state">
                  <Compass size={35} />
                  <h2>Your next chapter is waiting.</h2>
                  <p>Tap a bookmark on an opportunity to keep it here.</p>
                  <button
                    className="button primary"
                    onClick={() => setOpportunityFilter('All opportunities')}
                  >
                    Explore opportunities
                  </button>
                </div>
              )}
              <div className="information-note">
                <ExternalLink size={16} />
                Curated discovery links, not live listings. Check each provider’s availability,
                cost, eligibility, and deadlines. Acadia has no affiliation with these providers.
              </div>
            </>
          )}
          {page === 'Acadia guide' && (
            <GuidePage
              key={email || 'demo'}
              state={state}
              email={email}
              aiConfigured={aiConfigured}
              navigate={navigate}
              announce={announce}
            />
          )}
          {page === 'Inbox' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">A FRIENDLY HEADS-UP</div>
                  <h1>A little nudge. Right on time.</h1>
                  <p>Planner reminders and helpful starting points, all in one place.</p>
                </div>
                <button
                  className="button secondary"
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      readMessages: reminders.map((item) => item.id),
                    }))
                  }
                >
                  <CheckCheck size={16} />
                  Mark all as read
                </button>
              </div>
              <div className="inbox-list panel">
                {reminders.map((item) => (
                  <button
                    key={item.id}
                    className={`inbox-item ${state.readMessages.includes(item.id) ? 'read' : ''}`}
                    onClick={() => {
                      setState((current) => ({
                        ...current,
                        readMessages: [...new Set([...current.readMessages, item.id])].slice(-100),
                      }));
                      announce(item.body);
                    }}
                  >
                    <span className="inbox-icon">
                      {item.label === 'Planner reminder' ? (
                        <CalendarDays size={21} />
                      ) : (
                        <Sparkles size={21} />
                      )}
                    </span>
                    <span>
                      <span className="eyebrow">{item.label}</span>
                      <strong>{item.title}</strong>
                      <span className="inbox-body">{item.body}</span>
                    </span>
                    <span className="inbox-date">
                      {item.date}
                      {!state.readMessages.includes(item.id) && <i />}
                    </span>
                  </button>
                ))}
              </div>
              <div className="information-note">
                <Bell size={16} />
                This is your in-app reminder center. Email, push notifications, and messages between
                students are not enabled.
              </div>
            </>
          )}
          {page === 'My profile' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR STORY IS STILL UNFOLDING</div>
                  <h1>Let’s get to know you.</h1>
                  <p>
                    The more you share about your interests, the more useful your starting points
                    become.
                  </p>
                </div>
                <span className="status-pill">
                  <ShieldCheck size={14} />
                  {email ? 'Private account' : 'Sample profile'}
                </span>
              </div>
              <ProfileForm
                key={email || 'demo'}
                state={state}
                email={email}
                save={(profile) => {
                  setState((current) => ({ ...current, profile, onboarded: true }));
                  announce(
                    'Your profile is updated. Your recommendations now reflect your interests.',
                  );
                }}
                connect={() => setModal('connections')}
              />
              <section className="panel data-panel">
                <div>
                  <h2>Your data, your choice.</h2>
                  <p>
                    {email
                      ? `Signed in as ${email}. Email and school membership are not verified.`
                      : 'Demo changes are stored in this browser. Create an account for a separate, persistent workspace.'}
                  </p>
                  <p>
                    We don’t collect report cards or school passwords. Conversations are kept only
                    while this page is open.
                  </p>
                </div>
                <div className="data-actions">
                  <button className="button secondary" onClick={exportData}>
                    <ArrowDownToLine size={16} />
                    Export my data
                  </button>
                  {email ? (
                    <>
                      <button className="button secondary" onClick={() => void logout()}>
                        <LogOut size={16} />
                        Sign out
                      </button>
                      <button className="text-button danger" onClick={() => setModal('delete')}>
                        Delete account
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="button primary" onClick={() => setModal('auth')}>
                        Create account <ArrowRight size={16} />
                      </button>
                      <button className="text-button danger" onClick={() => setModal('delete')}>
                        Reset demo data
                      </button>
                    </>
                  )}
                </div>
              </section>
            </>
          )}
          <footer className="page-footer">
            <span>
              <Leaf size={13} /> A little direction. A world of possibility.
            </span>
            <span>
              Made for your next chapter <span className="footer-spark">✦</span>
            </span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {modal === 'task' && (
        <Modal title="One small step" close={() => setModal(null)}>
          <PlannerForm
            kind="task"
            date={selectedDate}
            submit={(values) => {
              const task: Task = {
                id: crypto.randomUUID(),
                title: values.title,
                subject: values.subject,
                date: values.date,
                time: values.period as Task['time'],
                done: false,
              };
              setState((current) => ({ ...current, tasks: [...current.tasks, task] }));
              setModal(null);
              announce('Task added to your game plan.');
            }}
          />
        </Modal>
      )}
      {modal === 'event' && (
        <Modal title="Make room for what’s next" close={() => setModal(null)}>
          <PlannerForm
            kind="event"
            date={selectedDate}
            submit={(values) => {
              const event: CalendarEvent = {
                id: crypto.randomUUID(),
                title: values.title,
                date: values.date,
                time: values.time,
                category: values.category as CalendarEvent['category'],
                location: values.location,
              };
              setState((current) => ({ ...current, events: [...current.events, event] }));
              setSelectedDate(values.date);
              setMonth(
                new Date(
                  parseDate(values.date).getFullYear(),
                  parseDate(values.date).getMonth(),
                  1,
                ),
              );
              setModal(null);
              announce('Event added. You’ll see it in your planner and upcoming reminders.');
            }}
          />
        </Modal>
      )}
      {modal === 'auth' && (
        <Modal title="Your next chapter starts here." close={() => setModal(null)}>
          <AuthForm
            authenticated={(result) => {
              userGeneration.current++;
              setEmail(result.email);
              setState(stateSchema.parse(result.state));
              setModal(null);
              navigate(result.state.onboarded ? 'Overview' : 'My profile');
              announce(
                result.state.onboarded
                  ? 'Welcome back to your workspace.'
                  : 'Account created. Tell us a little about your goals.',
              );
            }}
          />
        </Modal>
      )}
      {modal === 'connections' && (
        <Modal title="Bring your school day together" close={() => setModal(null)}>
          <p className="modal-intro">
            School connections need your school’s approval and official API access. They aren’t
            connected in this release.
          </p>
          {['Schoology', 'Alma'].map((provider) => (
            <div className="connection-row" key={provider}>
              <span className="connection-logo">
                <GraduationCap size={23} />
              </span>
              <div>
                <strong>{provider}</strong>
                <p>Official school integration required</p>
              </div>
              <span className="tag">Not connected</span>
            </div>
          ))}
          <div className="privacy-note">
            <ShieldCheck size={20} />
            <p>
              Never enter a school password here. When supported, connections will redirect you to
              your school’s official sign-in page.
            </p>
          </div>
          <button
            className="button primary full-width"
            onClick={() => {
              setModal(null);
              navigate('My planner');
            }}
          >
            Use my planner manually <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal
          title={email ? 'Delete your Acadia account?' : 'Reset this demo workspace?'}
          close={() => setModal(null)}
        >
          <DeleteForm
            account={Boolean(email)}
            remove={async (password) => {
              if (email) {
                await saveQueue.current;
                await api('/account', 'DELETE', { password });
                userGeneration.current++;
                setEmail(null);
              }
              localStorage.removeItem(storageKey);
              setState(makeDemoState());
              setModal(null);
              navigate('Overview');
              announce(
                email
                  ? 'Your account and active student data have been deleted.'
                  : 'The demo is back to its starting point.',
              );
            }}
          />
        </Modal>
      )}
    </div>
  );
}
