'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Leaf } from 'lucide-react';
import { INTERESTS, profileSchema, type StudentProfile } from '../domain/models';
export function ProfileWizard({
  profile,
  onSave,
}: {
  profile: StudentProfile;
  onSave: (profile: StudentProfile) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const change = (value: Partial<StudentProfile>) =>
    setDraft((current) => ({ ...current, ...value }));
  const names = [
    'Your starting point',
    'What interests you',
    'Time & access',
    'Review your answers',
  ];
  return (
    <div className="wizard">
      <div className="wizard-progress" aria-label={`Step ${step + 1} of 4`}>
        {names.map((name, index) => (
          <span key={name} className={index <= step ? 'filled' : ''}>
            <i>{index < step ? <Check size={12} /> : index + 1}</i>
            <span>{name}</span>
          </span>
        ))}
      </div>
      <div className="section-kicker">STEP {step + 1} OF 4 · EVERY ANSWER IS OPTIONAL</div>
      <h3 className="wizard-title">{names[step]}</h3>
      <p className="muted">Your answers guide suggestions. They never determine your potential.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 3) {
            setStep(step + 1);
            return;
          }
          const result = profileSchema.safeParse(draft);
          if (!result.success) {
            setError(result.error.issues[0]?.message || 'Check your answers.');
            return;
          }
          onSave(result.data);
        }}
      >
        {step === 0 && (
          <div className="form-stack">
            <label>
              Nickname <span className="optional">optional</span>
              <input
                maxLength={60}
                value={draft.nickname}
                onChange={(e) => change({ nickname: e.target.value })}
                placeholder="What would you like us to call you?"
              />
            </label>
            <div className="form-row">
              <label>
                Grade
                <select
                  aria-label="Grade"
                  value={draft.grade || ''}
                  onChange={(e) =>
                    change({ grade: (e.target.value || null) as StudentProfile['grade'] })
                  }
                >
                  <option value="">Not sure / skip</option>
                  {['9', '10', '11', '12'].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                Broad location
                <select
                  aria-label="Broad location"
                  value={draft.region || ''}
                  onChange={(e) =>
                    change({ region: (e.target.value || null) as StudentProfile['region'] })
                  }
                >
                  <option value="">Not sure / skip</option>
                  <option>Pennsylvania</option>
                  <option>Other US state</option>
                  <option>Outside US</option>
                </select>
              </label>
            </div>
            <div className="info-box">
              <Leaf size={18} />
              <p>
                We’re starting with Pennsylvania grades 9–12. Other students are welcome to browse;
                coverage is limited. No exact address or school records needed.
              </p>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="form-stack">
            <fieldset>
              <legend>What sparks your curiosity?</legend>
              <div className="interest-options">
                {INTERESTS.map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={draft.interests.includes(value)}
                    className={draft.interests.includes(value) ? 'selected' : ''}
                    onClick={() =>
                      change({
                        interests: draft.interests.includes(value)
                          ? draft.interests.filter((i) => i !== value)
                          : [...draft.interests, value],
                      })
                    }
                  >
                    {value}
                    {draft.interests.includes(value) && <Check size={14} />}
                  </button>
                ))}
              </div>
            </fieldset>
            <label>
              Possible ambitions
              <textarea
                rows={2}
                maxLength={300}
                value={draft.ambition}
                onChange={(e) => change({ ambition: e.target.value })}
                placeholder="A career, a cause, or ‘I’m still exploring’…"
              />
            </label>
            <label>
              Activities or skills
              <textarea
                rows={2}
                maxLength={300}
                value={draft.activities}
                onChange={(e) => change({ activities: e.target.value })}
                placeholder="Clubs, caring for others, hobbies, projects…"
              />
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="form-stack">
            <div className="form-row">
              <label>
                Preparation minutes per day
                <select
                  aria-label="Preparation minutes per day"
                  value={draft.availableMinutes}
                  onChange={(e) => change({ availableMinutes: Number(e.target.value) })}
                >
                  {[0, 15, 30, 45, 60, 90, 120, 180].map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? 'Not sure / no time yet' : `${n} minutes`}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Start of your prep window
                <input
                  type="time"
                  value={draft.startTime}
                  onChange={(e) => change({ startTime: e.target.value })}
                  required
                />
              </label>
            </div>
            <fieldset>
              <legend>
                Available days <span className="optional">Eastern time</span>
              </legend>
              <div className="weekday-options">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, index) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={draft.weekdays.includes(index)}
                    className={draft.weekdays.includes(index) ? 'selected' : ''}
                    onClick={() =>
                      change({
                        weekdays: draft.weekdays.includes(index)
                          ? draft.weekdays.filter((day) => day !== index)
                          : [...draft.weekdays, index],
                      })
                    }
                  >
                    {name}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="check-label">
              <input
                type="checkbox"
                checked={draft.preferFree}
                onChange={(e) => change({ preferFree: e.target.checked })}
              />
              Prefer free participation
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={draft.preferRemote}
                onChange={(e) => change({ preferRemote: e.target.checked })}
              />
              Prefer remote participation
            </label>
            <label>
              Transportation
              <select
                value={draft.transportation}
                onChange={(e) =>
                  change({ transportation: e.target.value as StudentProfile['transportation'] })
                }
              >
                <option value="unsure">Not sure / skip</option>
                <option value="available">I can arrange transportation</option>
                <option value="limited">Transportation may be a barrier</option>
              </select>
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={draft.accessibilityInfo}
                onChange={(e) => change({ accessibilityInfo: e.target.checked })}
              />
              Help me find accessibility information (no health details)
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="review-answers">
            <dl>
              <div>
                <dt>Nickname</dt>
                <dd>{draft.nickname || 'Not shared'}</dd>
              </div>
              <div>
                <dt>Grade & location</dt>
                <dd>
                  {draft.grade ? `Grade ${draft.grade}` : 'Grade not sure'} ·{' '}
                  {draft.region || 'Location not shared'}
                </dd>
              </div>
              <div>
                <dt>Interests</dt>
                <dd>{draft.interests.join(', ') || 'Still exploring'}</dd>
              </div>
              <div>
                <dt>Ambitions / activities</dt>
                <dd>
                  {draft.ambition || 'Not shared'} / {draft.activities || 'Not shared'}
                </dd>
              </div>
              <div>
                <dt>Your preparation time</dt>
                <dd>
                  {draft.availableMinutes} min/day from {draft.startTime}, {draft.weekdays.length}{' '}
                  days/week · America/New_York
                </dd>
              </div>
              <div>
                <dt>Preferences</dt>
                <dd>
                  {[
                    draft.preferFree ? 'Prefer free' : null,
                    draft.preferRemote ? 'Prefer remote' : null,
                    draft.accessibilityInfo ? 'Ask about accessibility' : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'No preferences'}{' '}
                  · Transportation: {draft.transportation}
                </dd>
              </div>
            </dl>
            <p className="info-box">
              This guest profile is stored in this browser only. It is not authenticated and will
              not synchronize across devices. Clearing site data removes it. You can export or
              delete it in Settings.
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="error-box">
            {error}
          </p>
        )}
        <div className="wizard-actions">
          {step > 0 ? (
            <button type="button" className="button secondary" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={15} />
              Back
            </button>
          ) : (
            <span />
          )}
          <div>
            {step < 3 && (
              <button type="button" className="text-button" onClick={() => setStep(step + 1)}>
                Skip for now
              </button>
            )}
            <button className="button primary" type="submit">
              {step === 3 ? 'Save my preferences' : 'Continue'}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
