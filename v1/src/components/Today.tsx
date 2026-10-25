'use client';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  Flag,
  GitBranch,
  Leaf,
  Plus,
} from 'lucide-react';
import { findOpportunity } from '../data/catalogue';
import { effectiveStatus, prettyDate, todayKey } from '../domain/dates';
import { completeStep } from '../domain/pathways';
import type { Workspace } from '../domain/models';
import type { Dispatch, SetStateAction } from 'react';
import { Scenery } from './Scenery';
export type Section = 'Today' | 'Discover' | 'My Pathways' | 'Calendar' | 'Profile & Settings';
export function Today({
  workspace,
  update,
  navigate,
  onProfile,
  onDemo,
  notify,
}: {
  workspace: Workspace;
  update: Dispatch<SetStateAction<Workspace>>;
  navigate: (section: Section) => void;
  onProfile: () => void;
  onDemo: () => void;
  notify: (message: string) => void;
}) {
  const today = todayKey();
  const due = workspace.tasks
    .filter((t) => t.date <= today && !t.done)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const completed = workspace.tasks.filter((t) => t.date === today && t.done);
  const deadlines = workspace.pathways
    .map((path) => ({ path, opportunity: findOpportunity(path.opportunityId) }))
    .filter(
      ({ opportunity: o }) =>
        o &&
        !o.demo &&
        o.sources.every((s) => s.status === 'reviewed') &&
        o.deadline &&
        o.deadline.date >= today &&
        effectiveStatus(o, today) !== 'closed',
    );
  const next = !workspace.onboarded
    ? {
        title: 'Start with what matters to you',
        description: 'Choose interests, preferences and a realistic amount of preparation time.',
        action: 'Set up my profile',
        run: onProfile,
      }
    : !workspace.pathways.length
      ? {
          title: 'Find a possibility worth exploring',
          description: 'Read the details, check what is unknown, and save a starting point.',
          action: 'Explore opportunities',
          run: () => navigate('Discover'),
        }
      : {
          title: 'Give a saved pathway its next small step',
          description: 'Review its questions, choose your own target date, and preview a plan.',
          action: 'Continue my pathways',
          run: () => navigate('My Pathways'),
        };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            {new Date(`${today}T12:00:00Z`).toLocaleDateString('en-US', {
              timeZone: 'UTC',
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}{' '}
            · EASTERN TIME
          </div>
          <h1>
            {workspace.profile.nickname
              ? `A little progress, ${workspace.profile.nickname}.`
              : 'Your next chapter starts here.'}
          </h1>
          <p>You don’t need every answer. Just a way to take your next step.</p>
        </div>
        <button className="button secondary" onClick={() => navigate('Calendar')}>
          <CalendarDays size={16} />
          Your calendar
        </button>
      </div>
      <section className="welcome-hero">
        <div>
          <span className="section-kicker">
            <span className="green-dot" /> OPPORTUNITY, WITH A WAY FORWARD
          </span>
          <h2>
            A bigger future.
            <br />A doable next step.
          </h2>
          <p>
            Discover what’s possible. Understand what it takes.
            <br />
            Make a plan that fits your life.
          </p>
          <button className="button primary" onClick={next.run}>
            {next.action}
            <ArrowRight size={16} />
          </button>
        </div>
        <Scenery />
      </section>
      <section className="next-action">
        <span className="round-icon">
          <Leaf size={23} />
        </span>
        <div>
          <span className="section-kicker">YOUR NEXT RECOMMENDED ACTION</span>
          <h2>{next.title}</h2>
          <p>{next.description}</p>
        </div>
        <button className="icon-button" aria-label={next.action} onClick={next.run}>
          <ArrowRight size={20} />
        </button>
      </section>
      <div className="today-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>
              Your daily game plan <span className="count-chip">{due.length}</span>
            </h2>
            <button className="text-button" onClick={() => navigate('Calendar')}>
              <Plus size={14} />
              Add a task
            </button>
          </div>
          <div className="panel-subtitle">
            Your entries only · {completed.length} completed today
          </div>
          {due.length ? (
            <div className="today-tasks">
              {due.map((task) => (
                <label key={task.id} className="today-task">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => {
                      if (task.pathwayId && task.stepId) {
                        const result = completeStep(workspace, task.pathwayId, task.stepId, true);
                        if (result.error) {
                          notify(result.error);
                          return;
                        }
                        update(result.workspace);
                      } else
                        update((current) => ({
                          ...current,
                          tasks: current.tasks.map((t) =>
                            t.id === task.id ? { ...t, done: true } : t,
                          ),
                        }));
                    }}
                  />
                  <span>
                    <strong>{task.title}</strong>
                    <small>
                      {task.date < today
                        ? `Overdue · ${prettyDate(task.date)}`
                        : `Today · ${task.time}`}{' '}
                      · {task.minutes} min · {task.category}
                    </small>
                  </span>
                  <span className="task-arrow">
                    {task.pathwayId ? <GitBranch size={16} /> : <CalendarDays size={16} />}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <Check size={26} />
              <h3>A clear page, ready for you.</h3>
              <p>
                No unfinished tasks are due. Add your actual schoolwork or approve preparation
                sessions from a saved pathway.
              </p>
              <button className="text-button" onClick={() => navigate('Calendar')}>
                Plan a first task
                <ArrowRight size={14} />
              </button>
            </div>
          )}
          <div className="panel-footnote">Small steps still move you forward.</div>
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>Confirmed deadlines</h2>
            <Flag size={17} />
          </div>
          {deadlines.length ? (
            deadlines.map(({ path, opportunity: o }) => (
              <div className="deadline-row" key={path.id}>
                <strong>{o!.name}</strong>
                <p>
                  {prettyDate(o!.deadline!.date)} ·{' '}
                  {o!.deadline!.timezone || 'Timezone not published'}
                </p>
              </div>
            ))
          ) : (
            <div className="empty-state compact">
              <Flag size={26} />
              <h3>No confirmed deadlines yet.</h3>
              <p>
                We won’t invent dates. Check organizer sources, and keep your own target dates in My
                Pathways.
              </p>
            </div>
          )}
        </section>
      </div>
      <div className="section-heading outside-heading">
        <div>
          <div className="section-kicker">YOUR BIG PICTURE</div>
          <h2>Paths you’re making your own.</h2>
        </div>
        <button className="text-button" onClick={() => navigate('My Pathways')}>
          My Pathways
          <ArrowRight size={14} />
        </button>
      </div>
      {workspace.pathways.length ? (
        <div className="path-summary-grid">
          {workspace.pathways.map((path) => (
            <button
              className="panel path-summary"
              key={path.id}
              onClick={() => navigate('My Pathways')}
            >
              <div className="round-icon">
                <GitBranch size={20} />
              </div>
              <div>
                <span className="section-kicker">
                  {findOpportunity(path.opportunityId)?.demo
                    ? 'FICTIONAL EXAMPLE'
                    : 'SAVED PATHWAY'}
                </span>
                <h3>{findOpportunity(path.opportunityId)?.name || path.opportunityId}</h3>
                <p>
                  {path.steps.filter((s) => s.done).length}/{path.steps.length} steps ·{' '}
                  {path.targetDate
                    ? `Your target: ${prettyDate(path.targetDate)}`
                    : 'No target chosen'}
                </p>
              </div>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
      ) : (
        <section className="pathway-empty">
          <div>
            <Compass size={28} />
            <h3>You bring the curiosity. We’ll help with the next step.</h3>
            <p>
              Explore real organizer links with unknowns clearly marked, or try a fictional example
              from start to finish.
            </p>
          </div>
          <div>
            <button className="button primary" onClick={() => navigate('Discover')}>
              Discover opportunities
              <ArrowRight size={15} />
            </button>
            <button className="text-button" onClick={onDemo}>
              Try the fictional engineering example
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}
    </>
  );
}
