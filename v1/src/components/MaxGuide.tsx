'use client';
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Check, Send, Sparkles } from 'lucide-react';
import { maxContext, maxReplySchema, type proposalSchema } from '../domain/max';
import { todayKey } from '../domain/dates';
import { allTasks } from '../domain/school';
import { taskConflicts } from '../domain/scheduling';
import { taskSchema, type Workspace } from '../domain/models';
import type { z } from 'zod';
import { MaxPortrait } from './MaxPet';
type Proposal = z.infer<typeof proposalSchema>;
type Message = { role: 'user' | 'assistant'; content: string; proposals?: Proposal[] };
export function MaxGuide({
  workspace,
  update,
  userId,
  notify,
}: {
  workspace: Workspace;
  update: Dispatch<SetStateAction<Workspace>>;
  userId: string | null;
  notify: (text: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>(workspace.maxChat);
  const [question, setQuestion] = useState('');
  const [consent, setConsent] = useState(false);
  const [shareGrades, setShareGrades] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [connection, setConnection] = useState<{
    configured: boolean;
    guestAllowed: boolean;
    provider?: string;
  } | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  const requestId = useRef(0);
  useEffect(() => {
    alive.current = true;
    fetch('/api/max')
      .then((r) => r.json())
      .then(setConnection)
      .catch(() => setError('Could not check Max’s connection.'));
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages]);
  async function ask(text: string) {
    if (!text.trim() || busy) return;
    setError('');
    if (!consent) {
      setError('Please review and accept the AI data-sharing choice first.');
      return;
    }
    const generation = ++requestId.current;
    const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    setQuestion('');
    setMessages((current) => [...current, { role: 'user', content: text }]);
    update((current) => ({
      ...current,
      maxChat: [...current.maxChat, { role: 'user' as const, content: text }].slice(-40),
    }));
    setBusy(true);
    try {
      const response = await fetch('/api/max', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Acadia-Request': '1' },
        body: JSON.stringify({
          question: text,
          history,
          consent: true,
          context: maxContext(workspace, shareGrades),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Max is unavailable.');
      const result = maxReplySchema.parse(data);
      if (alive.current && generation === requestId.current) {
        setMessages((current) => [
          ...current,
          { role: 'assistant', content: result.answer, proposals: result.proposals },
        ]);
        update((current) => ({
          ...current,
          maxChat: [
            ...current.maxChat,
            { role: 'assistant' as const, content: result.answer },
          ].slice(-40),
        }));
      }
    } catch (e) {
      if (alive.current && generation === requestId.current) setError((e as Error).message);
    } finally {
      if (alive.current && generation === requestId.current) setBusy(false);
    }
  }
  function approve(proposal: Proposal, index: number, messageIndex: number) {
    const result = taskSchema.safeParse({
      ...proposal,
      id: crypto.randomUUID(),
      done: false,
      pathwayId: null,
      stepId: null,
    });
    if (!result.success) {
      notify('Ask Max for a confirmed date and time before adding this suggestion.');
      return;
    }
    if (result.data.date < todayKey()) {
      notify('This suggestion is in the past. Ask Max for a future session.');
      return;
    }
    const conflicts = taskConflicts(
      result.data,
      allTasks(workspace, result.data.date, result.data.date),
    );
    if (conflicts.length) {
      notify(conflicts.join(' ') + ' Ask Max for a different time, or edit your calendar.');
      return;
    }
    update((current) => ({ ...current, tasks: [...current.tasks, result.data] }));
    setMessages((current) =>
      current.map((m, i) =>
        i === messageIndex ? { ...m, proposals: m.proposals?.filter((_, n) => n !== index) } : m,
      ),
    );
    notify('Suggested session approved and added to your calendar.');
  }
  const usable = connection?.configured && (userId || connection.guestAllowed);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">REAL CONVERSATIONS. THOUGHTFUL NEXT STEPS.</div>
          <h1>Ask Max.</h1>
          <p>
            Study tips, class questions, career ideas, club pros and cons—or help planning a busy
            week.
          </p>
        </div>
        <span className="badge">
          {connection?.configured
            ? 'AI key configured · responses use a live model'
            : 'AI provider not connected'}
        </span>
      </div>
      <div className="max-chat-layout">
        <section className="panel max-conversation">
          <div className="section-heading">
            <h2>
              <Sparkles size={19} />
              Your Acadia AI guide
            </h2>
            <button
              className="text-button"
              onClick={() => {
                requestId.current++;
                setBusy(false);
                setMessages([]);
                update((current) => ({ ...current, maxChat: [] }));
              }}
            >
              Clear chat
            </button>
          </div>
          <div className="max-messages">
            {!messages.length && (
              <div className="max-intro">
                <MaxPortrait gear={workspace.pet.equipped} />
                <h2>A little help from Max.</h2>
                <p>
                  Tell me what you’re working toward. I can suggest a next step, but you decide what
                  belongs in your plan.
                </p>
              </div>
            )}
            {messages.map((message, i) => (
              <article className={`max-message ${message.role}`} key={i}>
                <strong>{message.role === 'assistant' ? 'Max' : 'You'}</strong>
                <p>{message.content}</p>
                {message.proposals?.map((proposal, index) => (
                  <div className="ai-proposal" key={index}>
                    <strong>{proposal.title}</strong>
                    <span>
                      {proposal.date || 'Date needs confirmation'} ·{' '}
                      {proposal.time || 'Time needs confirmation'} · {proposal.minutes} min
                    </span>
                    <button
                      className="button secondary"
                      onClick={() => approve(proposal, index, i)}
                    >
                      <Check size={14} />
                      Approve & add
                    </button>
                  </div>
                ))}
              </article>
            ))}
            {busy && (
              <p role="status" className="thinking">
                Max is thinking…
              </p>
            )}
            <div ref={end} />
          </div>
          {error && (
            <p role="alert" className="error-box">
              {error}
            </p>
          )}
          <div className="suggestion-chips">
            {[
              'Help me plan SAT study time',
              'Should I join robotics club? Give pros and cons.',
              'What should I focus on this week?',
            ].map((text) => (
              <button key={text} disabled={!usable || busy} onClick={() => void ask(text)}>
                {text}
              </button>
            ))}
          </div>
          <form
            className="max-chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(question);
            }}
          >
            <label className="sr-only" htmlFor="max-question">
              Message Max
            </label>
            <textarea
              id="max-question"
              rows={2}
              maxLength={2500}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask Max a question…"
            />
            <button
              className="button primary"
              disabled={!usable || busy || !question.trim()}
              aria-label="Send message to Max"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="small-note">
            AI can make mistakes. Verify school rules, dates and important decisions. Chat is kept
            only while this screen is open.
          </p>
        </section>
        <aside className="panel max-consent">
          <h2>You choose what Max knows.</h2>
          <p>
            With your permission, questions, recent chat, interests, ambitions, planner tasks and
            commitment times are sent to the configured AI provider (
            {connection?.provider || 'OpenRouter'}). Your name and school name are not automatically
            included.
          </p>
          <label className="check-label">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I agree to this AI data sharing. I will avoid personal identifiers in questions.
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={shareGrades}
              onChange={(e) => setShareGrades(e.target.checked)}
            />
            Also share my course names, periods, and current grades for more relevant advice.
          </label>
          {!connection?.configured && (
            <p className="info-box">
              Add ACADIA_AI_API_KEY to Codespaces secrets and restart. Max will not invent a
              response while disconnected.
            </p>
          )}
          {connection?.configured && !userId && !connection.guestAllowed && (
            <p className="info-box">
              Sign in to use Max. The server can separately permit guest AI for a private
              development preview.
            </p>
          )}
          <p>
            Max never changes your schedule without approval. Club advice weighs your interests,
            workload, time, and tradeoffs; it does not guarantee outcomes.
          </p>
        </aside>
      </div>
    </>
  );
}
