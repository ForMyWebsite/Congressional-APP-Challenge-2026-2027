'use client';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { ArrowRight, BookOpen, Plus, Trash2, Upload } from 'lucide-react';
import { z } from 'zod';
import { courseSchema, recurringSchema, taskSchema, type Workspace } from '../domain/models';
import { extractionSchema } from '../domain/max';
import { addDays, todayKey, minutesOf } from '../domain/dates';
export function SchoolSetup({
  workspace,
  update,
  notify,
  onComplete,
}: {
  workspace: Workspace;
  update: Dispatch<SetStateAction<Workspace>>;
  notify: (text: string) => void;
  onComplete: () => void;
}) {
  const [tab, setTab] = useState('Classes & grades');
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<z.infer<typeof extractionSchema> | null>(null);
  async function extract() {
    if (!file || !consent) return;
    setBusy(true);
    setError('');
    try {
      if (file.size > 4 * 1024 * 1024) throw new Error('Choose an image smaller than 4 MB.');
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Image could not be read.'));
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Acadia-Request': '1' },
        body: JSON.stringify({ image, consent: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Image extraction failed.');
      setDraft(extractionSchema.parse(data));
      setFile(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function approve() {
    if (!draft) return;
    try {
      const courses = draft.courses.map((c) =>
        courseSchema.parse({ ...c, id: crypto.randomUUID() }),
      );
      const assignments = draft.assignments.map((a) =>
        taskSchema.parse({
          ...a,
          id: crypto.randomUUID(),
          category: 'Assignment',
          done: false,
          pathwayId: null,
          stepId: null,
        }),
      );
      const uniqueCourses = courses.filter(
        (c) =>
          !workspace.school.courses.some(
            (old) => old.name.toLowerCase() === c.name.toLowerCase() && old.period === c.period,
          ),
      );
      const uniqueTasks = assignments.filter(
        (t) =>
          !workspace.tasks.some(
            (old) => old.title === t.title && old.date === t.date && old.time === t.time,
          ),
      );
      if (
        workspace.school.courses.length + uniqueCourses.length > 30 ||
        workspace.tasks.length + uniqueTasks.length > 1000
      )
        throw new Error('This import exceeds the planner capacity. Remove some rows.');
      update((current) => ({
        ...current,
        school: { ...current.school, courses: [...current.school.courses, ...uniqueCourses] },
        tasks: [...current.tasks, ...uniqueTasks],
      }));
      setDraft(null);
      notify('Reviewed classes and assignments imported. Any unreadable dates were not guessed.');
    } catch {
      setError(
        'Give every kept assignment a valid date and time, and each course a name. Remove rows you do not want.',
      );
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">LET’S BRING YOUR SCHOOL DAY TOGETHER</div>
          <h1>Your classes. Your commitments.</h1>
          <p>
            Add school details yourself or review a screenshot import. Then tell Max what you’re
            working toward.
          </p>
        </div>
        <button className="button primary" onClick={onComplete}>
          Save school setup & continue
          <ArrowRight size={16} />
        </button>
      </div>
      <section className="panel school-name">
        <label>
          School name
          <input
            maxLength={150}
            value={workspace.school.name}
            onChange={(e) =>
              update((current) => ({
                ...current,
                school: { ...current.school, name: e.target.value },
              }))
            }
            placeholder="Your school (self-reported)"
          />
        </label>
        <div className="info-box">
          <BookOpen size={18} />
          <p>
            <strong>Schoology / Alma: not connected.</strong> Your school must provide approved
            API/OAuth access before calendar or grade imports can be enabled. This app never asks
            for your school password. An email address does not authorize access. Manual entry works
            now.
          </p>
        </div>
      </section>
      <div className="tabs">
        {['Classes & grades', 'Weekly classes & clubs', 'Screenshot import'].map((value) => (
          <button
            key={value}
            className={tab === value ? 'active' : ''}
            aria-pressed={tab === value}
            onClick={() => {
              setTab(value);
              setError('');
            }}
          >
            {value}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="error-box">
          {error}
        </p>
      )}
      {tab === 'Classes & grades' && (
        <div className="school-grid">
          <section className="panel school-form">
            <h2>Add a course</h2>
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const values = Object.fromEntries(new FormData(e.currentTarget));
                const result = courseSchema.safeParse({ ...values, id: crypto.randomUUID() });
                if (!result.success) {
                  setError('Enter a course name and check your details.');
                  return;
                }
                update((current) => ({
                  ...current,
                  school: { ...current.school, courses: [...current.school.courses, result.data] },
                }));
                e.currentTarget.reset();
                setError('');
              }}
            >
              <label>
                Course name
                <input name="name" required maxLength={100} placeholder="e.g. Algebra II" />
              </label>
              <div className="form-row">
                <label>
                  Period
                  <input name="period" maxLength={30} placeholder="e.g. Period 3" />
                </label>
                <label>
                  Current grade (optional)
                  <input name="grade" maxLength={20} placeholder="e.g. B+ or 88%" />
                </label>
              </div>
              <button className="button primary" disabled={workspace.school.courses.length >= 30}>
                <Plus size={16} />
                Add course
              </button>
            </form>
            <p className="small-note">
              Grades are self-reported and optional. They help personalize advice only if you
              explicitly share them with Max.
            </p>
          </section>
          <section className="panel school-form">
            <h2>Your courses</h2>
            {!workspace.school.courses.length && <p className="muted">No classes added yet.</p>}
            {workspace.school.courses.map((course) => (
              <div className="course-row" key={course.id}>
                <label>
                  Course
                  <input
                    aria-label={`Course ${course.name}`}
                    value={course.name}
                    maxLength={100}
                    onChange={(e) => {
                      if (e.target.value.trim())
                        update((current) => ({
                          ...current,
                          school: {
                            ...current.school,
                            courses: current.school.courses.map((c) =>
                              c.id === course.id ? { ...c, name: e.target.value } : c,
                            ),
                          },
                        }));
                    }}
                  />
                </label>
                <label>
                  Period
                  <input
                    value={course.period}
                    maxLength={30}
                    onChange={(e) =>
                      update((current) => ({
                        ...current,
                        school: {
                          ...current.school,
                          courses: current.school.courses.map((c) =>
                            c.id === course.id ? { ...c, period: e.target.value } : c,
                          ),
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  Grade
                  <input
                    aria-label={`Grade for ${course.name}`}
                    value={course.grade}
                    maxLength={20}
                    onChange={(e) =>
                      update((current) => ({
                        ...current,
                        school: {
                          ...current.school,
                          courses: current.school.courses.map((c) =>
                            c.id === course.id ? { ...c, grade: e.target.value } : c,
                          ),
                        },
                      }))
                    }
                  />
                </label>
                <button
                  className="icon-button"
                  aria-label={`Remove course ${course.name}`}
                  onClick={() =>
                    update((current) => ({
                      ...current,
                      school: {
                        ...current.school,
                        courses: current.school.courses.filter((c) => c.id !== course.id),
                      },
                    }))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </section>
        </div>
      )}
      {tab === 'Weekly classes & clubs' && (
        <div className="school-grid">
          <section className="panel school-form">
            <h2>Add a weekly commitment</h2>
            <form
              className="form-stack"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const values = Object.fromEntries(form);
                const result = recurringSchema.safeParse({
                  ...values,
                  id: crypto.randomUUID(),
                  weekdays: form.getAll('weekdays').map(Number),
                  minutes: Number(values.minutes),
                });
                if (!result.success) {
                  setError(result.error.issues[0]?.message || 'Check the weekly times.');
                  return;
                }
                const item = result.data;
                const overlap = workspace.school.commitments.some(
                  (c) =>
                    c.startDate <= item.endDate &&
                    c.endDate >= item.startDate &&
                    c.weekdays.some((d) => item.weekdays.includes(d)) &&
                    minutesOf(c.time) < minutesOf(item.time) + item.minutes &&
                    minutesOf(c.time) + c.minutes > minutesOf(item.time),
                );
                if (overlap) {
                  setError('This overlaps another recurring commitment. Choose a different time.');
                  return;
                }
                update((current) => ({
                  ...current,
                  school: { ...current.school, commitments: [...current.school.commitments, item] },
                }));
                setError('');
                notify(
                  'Weekly commitment added. It now appears in your calendar and blocks scheduling suggestions.',
                );
              }}
            >
              <label>
                Class or club name
                <input
                  name="title"
                  required
                  maxLength={150}
                  placeholder="e.g. Biology · period 2 or Robotics"
                />
              </label>
              <label>
                Type
                <select name="category">
                  <option>Class</option>
                  <option>Club</option>
                </select>
              </label>
              <fieldset>
                <legend>Weekly days</legend>
                <div className="weekly-checks">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <label className="check-label" key={day}>
                      <input type="checkbox" name="weekdays" value={i} />
                      {day}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="form-row">
                <label>
                  Start time
                  <input type="time" name="time" defaultValue="08:00" required />
                </label>
                <label>
                  Minutes
                  <input
                    type="number"
                    name="minutes"
                    min={5}
                    max={180}
                    defaultValue={45}
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Starts
                  <input type="date" name="startDate" defaultValue={todayKey()} required />
                </label>
                <label>
                  Ends
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={addDays(todayKey(), 90)}
                    required
                  />
                </label>
              </div>
              <button
                className="button primary"
                disabled={workspace.school.commitments.length >= 100}
              >
                Add weekly commitment
              </button>
            </form>
          </section>
          <section className="panel school-form">
            <h2>Weekly rhythm</h2>
            {!workspace.school.commitments.length && (
              <p className="muted">
                Add class periods and weekly clubs. Add one-off competitions or exams in Calendar.
              </p>
            )}
            {workspace.school.commitments.map((item) => (
              <div className="integration-row" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>
                    {item.category} ·{' '}
                    {item.weekdays
                      .map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
                      .join(', ')}{' '}
                    · {item.time} · {item.minutes} min
                  </p>
                  <small>
                    {item.startDate} through {item.endDate}
                  </small>
                </div>
                <button
                  className="icon-button"
                  aria-label={`Remove ${item.title}`}
                  onClick={() =>
                    update((current) => ({
                      ...current,
                      school: {
                        ...current.school,
                        commitments: current.school.commitments.filter((c) => c.id !== item.id),
                      },
                    }))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </section>
        </div>
      )}
      {tab === 'Screenshot import' && (
        <section className="panel school-form">
          <h2>From screenshot to editable draft</h2>
          <p>
            Use a grades/classes screenshot or a monthly homework schedule. Crop out your name,
            school identifiers, email and student ID first. No screenshot is required; manual entry
            stays available.
          </p>
          <label className="file-upload">
            <Upload size={22} />
            Choose PNG, JPEG or WebP · up to 4 MB
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Choose school screenshot"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          {file && (
            <p>
              {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          )}
          <label className="check-label">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I agree to send this image to the configured AI provider for extraction. Acadia does not
            store the image; provider retention terms still apply. I will verify every extracted
            field.
          </label>
          <button
            className="button primary"
            disabled={!file || !consent || busy}
            onClick={() => void extract()}
          >
            {busy ? 'Reading screenshot…' : 'Read screenshot with Max'}
          </button>
          {draft && (
            <div className="extraction-review">
              <h3>Review before importing</h3>
              <p className="info-box">
                {draft.notes} Durations may be estimates. Missing dates and times must be filled or
                the row removed.
              </p>
              {draft.courses.map((course, index) => (
                <div className="course-row" key={index}>
                  <label>
                    Course
                    <input
                      value={course.name}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          courses: draft.courses.map((c, i) =>
                            i === index ? { ...c, name: e.target.value } : c,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Period
                    <input
                      value={course.period}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          courses: draft.courses.map((c, i) =>
                            i === index ? { ...c, period: e.target.value } : c,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Grade
                    <input
                      value={course.grade}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          courses: draft.courses.map((c, i) =>
                            i === index ? { ...c, grade: e.target.value } : c,
                          ),
                        })
                      }
                    />
                  </label>
                  <button
                    className="icon-button"
                    aria-label={`Discard extracted course ${index + 1}`}
                    onClick={() =>
                      setDraft({ ...draft, courses: draft.courses.filter((_, i) => i !== index) })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {draft.assignments.map((task, index) => (
                <div className="extracted-task" key={index}>
                  <label>
                    Assignment
                    <input
                      value={task.title}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          assignments: draft.assignments.map((t, i) =>
                            i === index ? { ...t, title: e.target.value } : t,
                          ),
                        })
                      }
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Date
                      <input
                        type="date"
                        value={task.date || ''}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            assignments: draft.assignments.map((t, i) =>
                              i === index ? { ...t, date: e.target.value || null } : t,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Time
                      <input
                        type="time"
                        value={task.time || ''}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            assignments: draft.assignments.map((t, i) =>
                              i === index ? { ...t, time: e.target.value || null } : t,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Minutes
                      <input
                        type="number"
                        min={5}
                        max={180}
                        value={task.minutes}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            assignments: draft.assignments.map((t, i) =>
                              i === index ? { ...t, minutes: Number(e.target.value) } : t,
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                  <button
                    className="text-button danger"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        assignments: draft.assignments.filter((_, i) => i !== index),
                      })
                    }
                  >
                    Discard assignment
                  </button>
                </div>
              ))}
              <button className="button primary" onClick={approve}>
                Approve reviewed import
              </button>
              <button className="text-button" onClick={() => setDraft(null)}>
                Discard entire draft
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
