import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Leaf, Link2, Plus, ShieldCheck } from 'lucide-react';
import { interests, profileSchema, type StudentState } from '../domain';
import { api } from '../lib/api';

export function PlannerForm({
  kind,
  date,
  submit,
}: {
  kind: 'task' | 'event';
  date: string;
  submit: (values: Record<string, string>) => void;
}) {
  const [error, setError] = useState('');
  return (
    <form
      className="stack-form"
      onSubmit={(event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<
          string,
          string
        >;
        if (!values.title.trim()) {
          setError('Give your next step a name.');
          return;
        }
        submit({ ...values, title: values.title.trim() });
      }}
    >
      <p className="modal-intro">
        {kind === 'task'
          ? 'Turn a good intention into a doable next step.'
          : 'Add a confirmed date, a club meeting, or time for yourself.'}
      </p>
      <label>
        {kind === 'task' ? 'What would you like to do?' : 'Event name'}
        <input
          name="title"
          required
          maxLength={160}
          autoFocus
          placeholder={
            kind === 'task' ? 'e.g. Review chemistry notes' : 'e.g. Robotics club meeting'
          }
        />
      </label>
      <div className="form-row">
        <label>
          Date
          <input name="date" type="date" defaultValue={date} required />
        </label>
        {kind === 'task' ? (
          <label>
            When
            <select name="period">
              <option>After school</option>
              <option>Before school</option>
            </select>
          </label>
        ) : (
          <label>
            Time
            <input name="time" type="time" required defaultValue="15:30" />
          </label>
        )}
      </div>
      {kind === 'task' ? (
        <label>
          Subject or focus
          <input name="subject" maxLength={60} placeholder="e.g. Chemistry" />
        </label>
      ) : (
        <>
          <label>
            Category
            <select name="category">
              <option>Class</option>
              <option>Club</option>
              <option>Exam</option>
              <option>Personal</option>
            </select>
          </label>
          <label>
            Location <span className="optional">(optional)</span>
            <input name="location" maxLength={100} placeholder="e.g. Library, room 204" />
          </label>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button primary full-width" type="submit">
        <Plus size={16} />
        Add {kind}
      </button>
    </form>
  );
}
export function AuthForm({
  authenticated,
}: {
  authenticated: (result: { email: string; state: StudentState }) => void;
}) {
  const [signup, setSignup] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      authenticated(await api(`/auth/${signup ? 'signup' : 'login'}`, 'POST', values));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="stack-form" onSubmit={submit}>
      <div className="auth-tabs">
        <button
          type="button"
          className={signup ? 'active' : ''}
          onClick={() => {
            setSignup(true);
            setError('');
          }}
        >
          Create account
        </button>
        <button
          type="button"
          className={!signup ? 'active' : ''}
          onClick={() => {
            setSignup(false);
            setError('');
          }}
        >
          Sign in
        </button>
      </div>
      <p className="modal-intro">
        A free space for your plans and possibilities. Use your school email if you have one; any
        email is welcome.
      </p>
      {signup && (
        <label>
          Your name
          <input name="name" required autoComplete="name" maxLength={80} />
        </label>
      )}
      <label>
        Email address
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="you@school.edu"
        />
      </label>
      <label>
        Password
        <input
          aria-label="Password"
          name="password"
          type="password"
          required
          minLength={10}
          maxLength={128}
          autoComplete={signup ? 'new-password' : 'current-password'}
        />
        <small>At least 10 characters. Use a unique password.</small>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="privacy-note">
        <ShieldCheck size={18} />
        <p>
          {signup
            ? 'Email is not verified in this development release. School affiliation is self-reported. Do not enter real student records or school passwords.'
            : 'Password recovery is not enabled in this development release. Use a test account.'}
        </p>
      </div>
      <button type="submit" className="button primary full-width" disabled={busy}>
        {busy ? 'Just a moment…' : signup ? 'Create my workspace' : 'Welcome back'}
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
export function ProfileForm({
  state,
  email,
  save,
  connect,
}: {
  state: StudentState;
  email: string | null;
  save: (profile: StudentState['profile']) => void;
  connect: () => void;
}) {
  const [selected, setSelected] = useState(state.profile.interests);
  const [error, setError] = useState('');
  return (
    <form
      className="profile-layout"
      onSubmit={(event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget));
        const result = profileSchema.safeParse({
          name: String(values.name).trim(),
          school: String(values.school).trim(),
          grade: values.grade as StudentState['profile']['grade'],
          ambition: String(values.ambition).trim(),
          clubs: String(values.clubs).trim(),
          interests: selected,
        });
        if (!result.success) {
          setError(result.error.issues[0]?.message || 'Check your profile details.');
          return;
        }
        setError('');
        save(result.data);
      }}
    >
      <section className="panel profile-main">
        <div className="section-heading">
          <h2>The basics</h2>
          <span className="tag">{email ? 'Your workspace' : 'Demo workspace'}</span>
        </div>
        <div className="stack-form">
          <div className="form-row">
            <label>
              Your name
              <input name="name" required maxLength={80} defaultValue={state.profile.name} />
            </label>
            <label>
              Grade
              <select name="grade" defaultValue={state.profile.grade}>
                {['8', '9', '10', '11', '12', 'Other'].map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            School <span className="optional">(self-reported)</span>
            <input
              name="school"
              maxLength={120}
              defaultValue={state.profile.school}
              placeholder="Your school’s name"
            />
            <small>
              An email domain alone doesn’t verify your school or give access to school records.
            </small>
          </label>
          <label>
            What does your future look like?
            <textarea
              name="ambition"
              maxLength={300}
              rows={3}
              defaultValue={state.profile.ambition}
              placeholder="A career, a cause, or just something you’re curious about…"
            />
            <small>Still exploring? That’s a perfectly good answer.</small>
          </label>
          <label>
            Clubs and activities
            <input
              name="clubs"
              maxLength={300}
              defaultValue={state.profile.clubs}
              placeholder="Robotics, art club, volunteering…"
            />
          </label>
        </div>
      </section>
      <section className="panel profile-interests">
        <span className="profile-leaf">
          <Leaf size={30} />
        </span>
        <h2>What sparks your curiosity?</h2>
        <p>Choose a few interests. There’s no wrong combination, and you can always change them.</p>
        <div className="interest-options">
          {interests.map((interest) => (
            <button
              key={interest}
              type="button"
              aria-pressed={selected.includes(interest)}
              className={selected.includes(interest) ? 'selected' : ''}
              onClick={() =>
                setSelected((current) =>
                  current.includes(interest)
                    ? current.filter((value) => value !== interest)
                    : [...current, interest],
                )
              }
            >
              {interest}
              {selected.includes(interest) ? <Check size={16} /> : <Plus size={16} />}
            </button>
          ))}
        </div>
        <button type="button" className="text-button" onClick={connect}>
          <Link2 size={16} />
          About school connections
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button primary full-width">
          Save my profile <ArrowRight size={16} />
        </button>
      </section>
    </form>
  );
}
export function DeleteForm({
  account,
  remove,
}: {
  account: boolean;
  remove: (password: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <form
      className="stack-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setBusy(true);
        try {
          await remove(String(form.get('password') || ''));
        } catch (err) {
          setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <p className="modal-intro">
        {account
          ? 'This permanently deletes your active account, profile, tasks, events, and saved opportunities. Export anything you want to keep first. This cannot be undone.'
          : 'Your local demo edits will be replaced with fresh sample data. Export anything you want to keep first.'}
      </p>
      {account && (
        <label>
          Confirm your password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            maxLength={128}
          />
        </label>
      )}
      <label className="consent-check">
        <input type="checkbox" required />
        <span>I understand this action cannot be undone.</span>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button danger-button" disabled={busy}>
        {busy ? 'Deleting…' : account ? 'Permanently delete account' : 'Reset demo workspace'}
      </button>
    </form>
  );
}
