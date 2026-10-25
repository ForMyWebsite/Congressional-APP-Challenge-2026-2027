'use client';
import { useState, type Dispatch, type SetStateAction } from 'react';
import {
  ArrowRight,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Flag,
  GitBranch,
  HelpCircle,
  Link2,
  Trash2,
} from 'lucide-react';
import { findOpportunity } from '../data/catalogue';
import { completeStep } from '../domain/pathways';
import { previewSchedule, type SchedulePreview } from '../domain/scheduling';
import { addDays, prettyDate, todayKey } from '../domain/dates';
import type { Opportunity, SavedPathway, Workspace } from '../domain/models';
import { Modal } from './Modal';
import { allTasks } from '../domain/school';
import { OpportunityDetails } from './Discover';
export function Pathways({
  workspace,
  update,
  notify,
  onDiscover,
  onSave,
}: {
  workspace: Workspace;
  update: Dispatch<SetStateAction<Workspace>>;
  notify: (message: string) => void;
  onDiscover: () => void;
  onSave: (o: Opportunity) => void;
}) {
  const [preview, setPreview] = useState<{ pathId: string; result: SchedulePreview } | null>(null);
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [remove, setRemove] = useState<SavedPathway | null>(null);
  function edit(pathId: string, changes: Partial<SavedPathway>) {
    setPreview(null);
    update((current) => ({
      ...current,
      pathways: current.pathways.map((p) => (p.id === pathId ? { ...p, ...changes } : p)),
    }));
  }
  function complete(pathId: string, stepId: string, done: boolean) {
    const result = completeStep(workspace, pathId, stepId, done);
    if (result.error) {
      notify(result.error);
      return;
    }
    setPreview(null);
    update(result.workspace);
    notify(
      done
        ? 'Preparation step completed.'
        : 'Step reopened. Dependent steps and their sessions were also reopened.',
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">TURN A POSSIBILITY INTO A PLAN</div>
          <h1>Your path. One step at a time.</h1>
          <p>Keep the big picture in view, and the next step within reach.</p>
        </div>
        <button className="button secondary" onClick={onDiscover}>
          Discover opportunities
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="notice-strip">
        <GitBranch size={18} />
        <p>
          Saving is not applying. Target dates are yours; application statuses are self-reported.
          Questions and suggestions are clearly separated from organizer requirements.
        </p>
      </div>
      {!workspace.pathways.length && (
        <div className="empty-state panel">
          <GitBranch size={38} />
          <h2>Your next chapter has room to grow.</h2>
          <p>
            Save something in Discover to turn it into a preparation pathway. You choose the pace
            and target date.
          </p>
          <button className="button primary" onClick={onDiscover}>
            Find a starting point
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      <div className="pathway-stack">
        {workspace.pathways.map((path) => {
          const opportunity = findOpportunity(path.opportunityId);
          const completed = path.steps.filter((s) => s.done).length;
          return (
            <section className="panel pathway-card" key={path.id}>
              <div className="pathway-heading">
                <div>
                  <div className="section-kicker">
                    {opportunity?.demo
                      ? 'FICTIONAL DEMONSTRATION · NO REAL APPLICATION'
                      : opportunity?.organizer || 'Catalogue record unavailable'}
                  </div>
                  <h2>{opportunity?.name || path.opportunityId}</h2>
                  <p>
                    {completed} of {path.steps.length} preparation steps complete
                  </p>
                </div>
                <div className="pathway-tools">
                  {opportunity && (
                    <button className="text-button" onClick={() => setDetail(opportunity)}>
                      Details & sources
                      <ExternalLink size={14} />
                    </button>
                  )}
                  <button
                    className="icon-button"
                    aria-label={`Remove pathway ${opportunity?.name || path.id}`}
                    onClick={() => setRemove(path)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div
                className="path-progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={path.steps.length}
                aria-valuenow={completed}
                aria-label={`${completed} of ${path.steps.length} steps complete`}
              >
                {path.steps.map((step) => (
                  <span key={step.id} className={step.done ? 'done' : ''} />
                ))}
              </div>
              <div className="pathway-controls">
                <label>
                  <span>
                    <Flag size={13} />
                    Your target date
                  </span>
                  <input
                    type="date"
                    aria-label={`Target date for ${opportunity?.name || path.id}`}
                    value={path.targetDate || ''}
                    onChange={(e) => edit(path.id, { targetDate: e.target.value || null })}
                  />
                  <small>Student chosen · not an official deadline</small>
                </label>
                <label>
                  Application status
                  <select
                    value={path.applicationStatus}
                    onChange={(e) =>
                      edit(path.id, {
                        applicationStatus: e.target.value as SavedPathway['applicationStatus'],
                      })
                    }
                  >
                    {['Exploring', 'Preparing', 'Submitted', 'Accepted', 'Not pursuing'].map(
                      (status) => (
                        <option key={status}>{status}</option>
                      ),
                    )}
                  </select>
                  <small>Self-reported{opportunity?.demo ? ' · example only' : ''}</small>
                </label>
                <button
                  className="button primary"
                  onClick={() =>
                    setPreview({
                      pathId: path.id,
                      result: previewSchedule(
                        path,
                        workspace.profile,
                        allTasks(
                          workspace,
                          addDays(todayKey(), 1),
                          path.targetDate || addDays(todayKey(), 1),
                        ),
                        addDays(todayKey(), 1),
                      ),
                    })
                  }
                >
                  <CalendarPlus size={16} />
                  Preview preparation schedule
                </button>
              </div>
              <div className="pathway-steps">
                {path.steps.map((step, index) => {
                  const source = opportunity?.sources.find((s) => s.id === step.sourceId);
                  return (
                    <div className={`pathway-step ${step.done ? 'completed' : ''}`} key={step.id}>
                      <div className="step-rail">
                        <span>{step.done ? <Check size={15} /> : index + 1}</span>
                        {index < path.steps.length - 1 && <i />}
                      </div>
                      <div className="step-content">
                        <div className="step-badges">
                          <span className={`step-kind ${step.kind}`}>
                            {step.kind === 'question'
                              ? 'Question to confirm'
                              : step.kind === 'suggestion'
                                ? 'Optional planning suggestion'
                                : opportunity?.demo
                                  ? 'Sample requirement · fictional'
                                  : source?.status === 'reviewed'
                                    ? 'Organizer requirement'
                                    : 'Unverified imported step'}
                          </span>
                          <span>{step.minutes} min planning block</span>
                        </div>
                        <h3>{step.title}</h3>
                        {step.dependsOn.length > 0 && (
                          <p className="depends-on">
                            <Link2 size={12} />
                            After:{' '}
                            {step.dependsOn
                              .map((id) => path.steps.find((s) => s.id === id)?.title)
                              .join('; ')}
                          </p>
                        )}
                        {source && (
                          <button
                            className="source-anchor"
                            onClick={() => opportunity && setDetail(opportunity)}
                          >
                            {source.title}
                            <ExternalLink size={12} />
                          </button>
                        )}
                        {step.kind === 'question' && (
                          <p className="small-note">
                            Mark answered only after checking. Record what you learned in your notes
                            below.
                          </p>
                        )}
                      </div>
                      <label className="step-completion">
                        <input
                          aria-label={`${step.done ? 'Reopen' : 'Complete'} ${step.title}`}
                          type="checkbox"
                          checked={step.done}
                          onChange={(e) => complete(path.id, step.id, e.target.checked)}
                        />
                        <span>{step.kind === 'question' ? 'Answered' : 'Done'}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
              <details className="pathway-notes">
                <summary>
                  Questions & notes <ChevronDown size={14} />
                </summary>
                <p className="small-note">
                  {opportunity?.unresolved.join(' ') ||
                    'Check requirements and dates directly with the organizer.'}
                </p>
                <label>
                  Your notes
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={path.notes}
                    onChange={(e) => edit(path.id, { notes: e.target.value })}
                    placeholder="What do you still need to ask? What have you confirmed?"
                  />
                </label>
              </details>
            </section>
          );
        })}
      </div>
      {preview && (
        <Modal title="A plan that fits your week" close={() => setPreview(null)}>
          <div className="detail-body">
            <div className="info-box">
              <HelpCircle size={18} />
              <p>
                Preview only. Starts tomorrow in America/New_York, respects your daily window and
                existing tasks, and finishes by your student target. No tasks are saved yet.
              </p>
            </div>
            {preview.result.conflicts.map((text) => (
              <p className="error-box" key={text}>
                {text}
              </p>
            ))}
            {preview.result.tasks.length > 0 && (
              <ul className="schedule-preview">
                {preview.result.tasks.map((task) => (
                  <li key={task.id}>
                    <span className="preview-date">
                      {prettyDate(task.date)}
                      <small>
                        {task.time} · {task.minutes} min
                      </small>
                    </span>
                    <strong>{task.title}</strong>
                  </li>
                ))}
              </ul>
            )}
            {preview.result.remainingSteps.length > 0 && (
              <div>
                <h3>Still unscheduled</h3>
                <ul>
                  {preview.result.remainingSteps.map((title) => (
                    <li key={title}>{title}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              className="button primary full-width"
              disabled={!preview.result.tasks.length}
              onClick={() => {
                update((current) => ({
                  ...current,
                  tasks: [...current.tasks, ...preview.result.tasks],
                  pathways: current.pathways.map((p) =>
                    p.id === preview.pathId && p.applicationStatus === 'Exploring'
                      ? { ...p, applicationStatus: 'Preparing' }
                      : p,
                  ),
                }));
                notify(
                  `${preview.result.tasks.length} preparation sessions approved and added. ${preview.result.remainingSteps.length ? 'Remaining steps are unscheduled.' : ''}`,
                );
                setPreview(null);
              }}
            >
              Approve {preview.result.tasks.length} session
              {preview.result.tasks.length === 1 ? '' : 's'}
              {preview.result.remainingSteps.length ? ' · partial plan' : ''}
              <CheckCircle2 size={17} />
            </button>
            <p className="small-note">
              You can edit, reschedule or remove approved sessions in Calendar.
            </p>
          </div>
        </Modal>
      )}
      {detail && (
        <OpportunityDetails
          opportunity={detail}
          workspace={workspace}
          onSave={onSave}
          onClose={() => setDetail(null)}
        />
      )}{' '}
      {remove && (
        <Modal title="Remove this pathway?" close={() => setRemove(null)}>
          <p className="modal-intro">
            This removes the saved pathway, its progress, and its preparation sessions. Your
            schoolwork and other commitments stay in your calendar.
          </p>
          <button
            className="button danger-button full-width"
            onClick={() => {
              update((current) => ({
                ...current,
                pathways: current.pathways.filter((p) => p.id !== remove.id),
                tasks: current.tasks.filter((t) => t.pathwayId !== remove.id),
              }));
              setRemove(null);
              notify('Pathway and its preparation sessions removed.');
            }}
          >
            Remove pathway
          </button>
        </Modal>
      )}
    </>
  );
}
