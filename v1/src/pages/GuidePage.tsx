import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Send, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { getGuidance, type Page, type StudentState } from '../domain';
import { api } from '../lib/api';

type Message = { role: 'guide' | 'student'; content: string; mode?: string };
export function GuidePage({
  state,
  email,
  aiConfigured,
  navigate,
  announce,
}: {
  state: StudentState;
  email: string | null;
  aiConfigured: boolean;
  navigate: (page: Page) => void;
  announce: (message: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const active = useRef(true);
  const firstName = state.profile.name.split(' ')[0];
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);
  async function ask(text: string) {
    if (!text.trim() || asking) return;
    setQuestion('');
    setAsking(true);
    setMessages((current) => [...current, { role: 'student', content: text }]);
    try {
      const result = email
        ? await api('/advisor', 'POST', { question: text, consent: aiConsent })
        : { answer: getGuidance(text, state), mode: 'local' };
      if (!active.current) return;
      setMessages((current) => [
        ...current,
        {
          role: 'guide',
          content: result.answer,
          mode:
            result.mode === 'ai'
              ? 'AI suggestion · verify important details'
              : 'Local planning guide',
        },
      ]);
      if (result.notice) announce(result.notice);
    } catch (error) {
      if (!active.current) return;
      setMessages((current) => [
        ...current,
        {
          role: 'guide',
          content: `I couldn’t reach the server. ${(error as Error).message} You can try again.`,
          mode: 'Connection error',
        },
      ]);
    } finally {
      if (active.current) setAsking(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOU DON’T HAVE TO FIGURE IT OUT ALONE</div>
          <h1>A little clarity for what’s next.</h1>
          <p>A thoughtful starting point for your school day and your bigger goals.</p>
        </div>
        <span className="status-pill">
          <span />
          {email && aiConfigured && aiConsent ? 'Live AI enabled' : 'Local planning guide'}
        </span>
      </div>
      <div className="guide-layout">
        <section className="panel conversation">
          <div className="conversation-heading">
            <span className="guide-icon">
              <Sparkles size={21} />
            </span>
            <div>
              <h2>Your Acadia guide</h2>
              <p>Here to help you find your next small step.</p>
            </div>
            <button
              className="icon-button"
              aria-label="Clear conversation"
              onClick={() => setMessages([])}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="chat-messages">
            <div className="chat-message guide">
              <span className="chat-avatar">
                <Sparkles size={16} />
              </span>
              <div>
                <p>
                  Hi {firstName}! Whether you’re planning your afternoon or wondering what comes
                  after high school, let’s take it one step at a time. What’s on your mind?
                </p>
                <small>Planning suggestions · not a school counselor</small>
              </div>
            </div>
            {messages.map((message, i) => (
              <div className={`chat-message ${message.role}`} key={i}>
                {message.role === 'guide' && (
                  <span className="chat-avatar">
                    <Sparkles size={16} />
                  </span>
                )}
                <div>
                  <p>{message.content}</p>
                  {message.mode && <small>{message.mode}</small>}
                </div>
              </div>
            ))}
            {asking && (
              <div className="thinking" role="status">
                Finding a helpful next step<span>…</span>
              </div>
            )}
            <div ref={chatEnd} />
          </div>
          {!messages.length && (
            <div className="suggestion-chips">
              {[
                'Help me plan my day',
                'What classes should I take?',
                'Find opportunities for my goals',
                'When is my PSAT?',
              ].map((text) => (
                <button key={text} onClick={() => void ask(text)}>
                  {text}
                  <ArrowUpRight size={13} />
                </button>
              ))}
            </div>
          )}
          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              void ask(question);
            }}
          >
            <input
              aria-label="Ask your Acadia guide"
              maxLength={1200}
              placeholder="What would you like a little guidance with?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
            <button
              className="button primary icon-button"
              type="submit"
              disabled={asking || !question.trim()}
              aria-label="Send question"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="guide-disclaimer">
            {email && aiConfigured && aiConsent
              ? 'Live AI receives your question, grade, and interests. Avoid personal details. Replies can be wrong.'
              : 'Local suggestions use simple planning rules, not a live AI model. No chat data leaves this app.'}
          </p>
        </section>
        <aside className="guide-context panel">
          <div className="eyebrow">YOUR COMPASS</div>
          <h2>A future that feels like you.</h2>
          <p>Your guidance starts with what matters to you.</p>
          <div className="context-label">YOU’RE CURIOUS ABOUT</div>
          <div className="interest-pills">
            {state.profile.interests.length ? (
              state.profile.interests.map((interest) => <span key={interest}>{interest}</span>)
            ) : (
              <p>Add your interests in your profile.</p>
            )}
          </div>
          <div className="context-label">YOUR BIGGER PICTURE</div>
          <blockquote>
            “{state.profile.ambition || 'Still exploring — and that’s a good place to be.'}”
          </blockquote>
          <button className="text-button" onClick={() => navigate('My profile')}>
            Update your direction <ArrowRight size={14} />
          </button>
          <div className="guide-privacy">
            <ShieldCheck size={19} />
            <p>
              {email
                ? 'Your name, email, school and grades are never automatically sent to the AI provider.'
                : 'This demo stays on your device. Create an account to save a private student workspace.'}
            </p>
          </div>
          {email && aiConfigured && (
            <label className="consent-check">
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(event) => setAiConsent(event.target.checked)}
              />
              <span>
                Use live AI. I agree to send my questions, grade, and interests to OpenAI. Please
                don’t include private information.
              </span>
            </label>
          )}
        </aside>
      </div>
    </>
  );
}
