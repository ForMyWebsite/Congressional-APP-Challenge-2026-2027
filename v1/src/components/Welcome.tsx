'use client';
import { useState } from 'react';
import { ArrowRight, CalendarDays, GraduationCap, Heart, Sparkles } from 'lucide-react';
import { browserSupabase, authConfigured } from '../lib/supabase';
import { Scenery } from './Scenery';
export function Welcome({ onGuest }: { onGuest: () => void }) {
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const configured = authConfigured();
  return (
    <main className="welcome-page">
      <header className="welcome-header">
        <strong>
          acadia <small>edu</small>
        </strong>
        <span>A little direction. A world of possibility.</span>
      </header>
      <div className="welcome-layout">
        <section className="welcome-story">
          <div className="section-kicker">YOUR SCHOOL DAY. YOUR FUTURE. YOUR MAX.</div>
          <h1>
            A big future starts
            <br />
            with a good next step.
          </h1>
          <p>
            Meet Max, your study companion and AI guide. Bring your classes, homework, goals, and
            opportunities into one thoughtful plan.
          </p>
          <div className="welcome-landscape">
            <Scenery />
          </div>
          <div className="welcome-features">
            <span>
              <CalendarDays size={20} />A planner that fits your life
            </span>
            <span>
              <Sparkles size={20} />
              Real AI guidance when connected
            </span>
            <span>
              <Heart size={20} />
              Care for Max as you make progress
            </span>
          </div>
        </section>
        <section className="panel welcome-auth">
          <GraduationCap size={30} />
          <h2>{signup ? 'Make room for your future.' : 'Welcome to your next chapter.'}</h2>
          <p>Sign in to save your planner across devices.</p>
          <button
            className="button secondary full-width"
            disabled={busy || !configured}
            onClick={async () => {
              const client = browserSupabase();
              if (!client) return;
              setBusy(true);
              const { error } = await client.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${location.origin}/auth/callback` },
              });
              if (error) {
                setMessage(error.message);
                setBusy(false);
              }
            }}
          >
            Continue with Google
          </button>
          <div className="auth-divider">or use your email</div>
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const client = browserSupabase();
              if (!client) {
                setMessage('Account services are not configured yet. You can explore as a guest.');
                return;
              }
              const values = new FormData(e.currentTarget);
              setBusy(true);
              setMessage('');
              const input = {
                email: String(values.get('email')),
                password: String(values.get('password')),
              };
              const { data, error } = signup
                ? await client.auth.signUp({
                    ...input,
                    options: { emailRedirectTo: `${location.origin}/auth/callback` },
                  })
                : await client.auth.signInWithPassword(input);
              if (error) setMessage(error.message);
              else if (data.session) window.location.reload();
              else
                setMessage('Check your email to confirm your account. You are not signed in yet.');
              setBusy(false);
            }}
          >
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required maxLength={254} />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={signup ? 'new-password' : 'current-password'}
                minLength={10}
                maxLength={128}
                required
              />
            </label>
            <button className="button primary full-width" disabled={busy || !configured}>
              {busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}
              <ArrowRight size={16} />
            </button>
          </form>
          {message && (
            <p role="status" className="info-box">
              {message}
            </p>
          )}
          {!configured && (
            <p className="info-box">
              Google/email accounts need Supabase settings and the database migration. They are not
              connected in this preview.
            </p>
          )}
          <button
            className="text-button full-width"
            onClick={() => {
              setSignup(!signup);
              setMessage('');
            }}
          >
            {signup ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
          <button className="button secondary full-width" onClick={onGuest}>
            Explore as a guest
            <ArrowRight size={16} />
          </button>
          <small>
            Guest data stays in this browser. No fake sign-in, school connection, or AI response.
          </small>
        </section>
      </div>
    </main>
  );
}
