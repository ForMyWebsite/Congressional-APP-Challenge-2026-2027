'use client';
import { useState, type Dispatch, type SetStateAction } from 'react';
import {
  ArrowDownToLine,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { addDays, prettyDate, todayKey, weekday } from '../domain/dates';
import { taskSchema, type ScheduledTask, type Workspace } from '../domain/models';
import { completeStep } from '../domain/pathways';
import { preparationOrderConflict, taskConflicts } from '../domain/scheduling';
import { calendarICS, download } from '../lib/exports';
import { Modal } from './Modal';
export function TaskForm({
  task,
  date,
  workspace,
  onSave,
}: {
  task: ScheduledTask | null;
  date: string;
  workspace: Workspace;
  onSave: (task: ScheduledTask) => void;
}) {
  const [error, setError] = useState<string[]>([]);
  return (
    <form
      className="form-stack"
      onSubmit={(event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget));
        const result = taskSchema.safeParse({
          id: task?.id || crypto.randomUUID(),
          title: values.title,
          date: values.date,
          time: values.time,
          minutes: Number(values.minutes),
          category: task?.pathwayId ? 'Preparation' : values.category,
          done: task?.done || false,
          pathwayId: task?.pathwayId || null,
          stepId: task?.stepId || null,
        });
        if (!result.success) {
          setError(result.error.issues.map((i) => i.message));
          return;
        }
        const collisions = taskConflicts(result.data, workspace.tasks);
        const order = preparationOrderConflict(
          result.data,
          workspace.pathways.find((p) => p.id === task?.pathwayId),
          workspace.tasks,
        );
        if (order) collisions.push(order);
        if (result.data.category === 'Preparation') {
          const used = workspace.tasks
            .filter(
              (t) =>
                t.id !== result.data.id &&
                t.date === result.data.date &&
                t.category === 'Preparation',
            )
            .reduce((sum, t) => sum + t.minutes, 0);
          if (used + result.data.minutes > workspace.profile.availableMinutes)
            collisions.push(
              'This exceeds your chosen daily preparation budget. Edit your available time first.',
            );
        }
        if (collisions.length) {
          setError(collisions);
          return;
        }
        onSave(result.data);
      }}
    >
      <p className="muted">
        Your own assignment, test, club, or commitment. Times use America/New_York.
      </p>
      <label>
        Task title
        <input
          name="title"
          defaultValue={task?.title || ''}
          required
          maxLength={160}
          autoFocus
          placeholder="e.g. Finish physics problem set"
        />
      </label>
      <div className="form-row">
        <label>
          Date
          <input type="date" name="date" defaultValue={task?.date || date} required />
        </label>
        <label>
          Start time
          <input type="time" name="time" defaultValue={task?.time || '16:00'} required />
        </label>
      </div>
      <div className="form-row">
        <label>
          Duration (minutes)
          <input
            type="number"
            name="minutes"
            defaultValue={task?.minutes || 30}
            min={5}
            max={180}
            required
          />
        </label>
        <label>
          Category
          <select
            name="category"
            defaultValue={task?.category || 'Assignment'}
            disabled={Boolean(task?.pathwayId)}
          >
            {(task?.pathwayId ? ['Preparation'] : ['Assignment', 'Test', 'Club', 'Personal']).map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
        </label>
      </div>
      {error.length > 0 && (
        <div className="error-box" role="alert">
          <strong>This session needs a different time.</strong>
          <ul>
            {error.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      <button className="button primary full-width" type="submit">
        {task ? 'Save changes' : 'Add to my calendar'}
        <Check size={16} />
      </button>
    </form>
  );
}
export function Planner({
  workspace,
  update,
  notify,
}: {
  workspace: Workspace;
  update: Dispatch<SetStateAction<Workspace>>;
  notify: (message: string) => void;
}) {
  const today = todayKey();
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [editing, setEditing] = useState<ScheduledTask | null | false>(false);
  const first = `${month}-01`;
  const gridStart = addDays(first, -((weekday(first) + 6) % 7));
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const dayTasks = workspace.tasks
    .filter((t) => t.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));
  function moveMonth(delta: number) {
    const date = new Date(`${first}T12:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + delta);
    setMonth(date.toISOString().slice(0, 7));
  }
  function toggle(task: ScheduledTask) {
    if (task.pathwayId && task.stepId) {
      const result = completeStep(workspace, task.pathwayId, task.stepId, !task.done);
      if (result.error) {
        notify(result.error);
        return;
      }
      update(result.workspace);
    } else
      update((current) => ({
        ...current,
        tasks: current.tasks.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
      }));
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">MAKE ROOM FOR WHAT MATTERS</div>
          <h1>Your week, with a little breathing room.</h1>
          <p>Schoolwork and next steps, together. All times are Eastern (America/New_York).</p>
        </div>
        <div className="heading-actions">
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
          <button className="button primary" onClick={() => setEditing(null)}>
            <Plus size={16} />
            Add task
          </button>
        </div>
      </div>
      <div className="planner-layout">
        <section className="panel full-calendar">
          <div className="section-heading">
            <h2>
              {new Date(`${first}T12:00:00Z`).toLocaleDateString('en-US', {
                timeZone: 'UTC',
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <div className="calendar-tools">
              <button
                className="text-button"
                onClick={() => {
                  setMonth(today.slice(0, 7));
                  setSelected(today);
                }}
              >
                Today
              </button>
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() => moveMonth(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button className="icon-button" aria-label="Next month" onClick={() => moveMonth(1)}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="month-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span className="day-label" key={day}>
                {day}
              </span>
            ))}
            {days.map((date) => {
              const tasks = workspace.tasks.filter((t) => t.date === date);
              return (
                <button
                  className={`month-day ${date === selected ? 'selected' : ''} ${date.slice(0, 7) !== month ? 'outside' : ''}`}
                  key={date}
                  aria-label={`${date}, ${tasks.length} tasks`}
                  aria-pressed={date === selected}
                  onClick={() => setSelected(date)}
                >
                  <span className={date === today ? 'is-today' : ''}>{Number(date.slice(-2))}</span>
                  <div>
                    {tasks.slice(0, 2).map((task) => (
                      <small
                        key={task.id}
                        className={task.category === 'Preparation' ? 'prep' : ''}
                      >
                        {task.title}
                      </small>
                    ))}
                    {tasks.length > 2 && <small>+{tasks.length - 2} more</small>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
        <section className="panel day-panel">
          <div className="section-heading">
            <h2>{prettyDate(selected)} · your plan</h2>
            <button
              className="icon-button"
              aria-label="Add task on selected day"
              onClick={() => setEditing(null)}
            >
              <Plus size={18} />
            </button>
          </div>
          <label className="day-picker">
            Choose a date
            <input
              type="date"
              value={selected}
              onChange={(e) => {
                if (e.target.value) {
                  setSelected(e.target.value);
                  setMonth(e.target.value.slice(0, 7));
                }
              }}
            />
          </label>
          {dayTasks.length ? (
            <div className="scheduled-tasks">
              {dayTasks.map((task) => (
                <article className={`scheduled-task ${task.done ? 'completed' : ''}`} key={task.id}>
                  <label className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggle(task)}
                      aria-label={`Complete ${task.title}`}
                    />
                    <span className="task-time">
                      {task.time}
                      <small>{task.minutes} min</small>
                    </span>
                    <span>
                      <strong>{task.title}</strong>
                      <span className={`badge ${task.pathwayId ? 'green' : ''}`}>
                        {task.category}
                      </span>
                    </span>
                  </label>
                  <div className="task-actions">
                    <button
                      className="icon-button"
                      aria-label={`Edit ${task.title}`}
                      onClick={() => setEditing(task)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Delete ${task.title}`}
                      onClick={() => {
                        update((current) => ({
                          ...current,
                          tasks: current.tasks.filter((t) => t.id !== task.id),
                        }));
                        notify('Session removed. Its pathway step is still available.');
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state compact">
              <CalendarDays size={28} />
              <h3>A little room to breathe.</h3>
              <p>No tasks on this date. Add your own commitments or approve a pathway schedule.</p>
            </div>
          )}
        </section>
      </div>
      <div className="info-box">
        <CalendarDays size={18} />
        <p>
          In-app reminders appear on Today when tasks are due. Email and push notifications are not
          configured. Dates come from your entries, not a school connection.
        </p>
      </div>
      {editing !== false && (
        <Modal
          title={editing ? 'Edit or reschedule' : 'Make room for a next step'}
          close={() => setEditing(false)}
        >
          <TaskForm
            task={editing}
            date={selected}
            workspace={workspace}
            onSave={(task) => {
              update((current) => ({
                ...current,
                tasks: editing
                  ? current.tasks.map((t) => (t.id === task.id ? task : t))
                  : [...current.tasks, task],
              }));
              setSelected(task.date);
              setMonth(task.date.slice(0, 7));
              setEditing(false);
              notify(editing ? 'Task updated.' : 'Task added to your calendar.');
            }}
          />
        </Modal>
      )}
    </>
  );
}
