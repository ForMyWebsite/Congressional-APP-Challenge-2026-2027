'use client';
import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  Code2,
  Compass,
  ExternalLink,
  Filter,
  Search,
  ShieldQuestion,
} from 'lucide-react';
import { catalogue } from '../data/catalogue';
import { explainMatch, recommend } from '../domain/matching';
import { effectiveStatus, todayKey } from '../domain/dates';
import type { Opportunity, Workspace } from '../domain/models';
import { Modal } from './Modal';
export function OpportunityDetails({
  opportunity,
  workspace,
  onSave,
  onClose,
}: {
  opportunity: Opportunity;
  workspace: Workspace;
  onSave: (item: Opportunity) => void;
  onClose: () => void;
}) {
  const match = explainMatch(workspace.profile, opportunity, todayKey());
  const saved = workspace.pathways.some((p) => p.opportunityId === opportunity.id);
  return (
    <Modal title={opportunity.name} close={onClose}>
      <div className="detail-body">
        <div className="badges">
          <span className={`badge ${opportunity.demo ? 'amber' : ''}`}>
            {opportunity.demo ? 'Fictional demonstration' : 'Source not reviewed'}
          </span>
          <span className="badge">{opportunity.type}</span>
        </div>
        <p>{opportunity.description}</p>
        <dl className="facts">
          <div>
            <dt>Organizer</dt>
            <dd>{opportunity.organizer}</dd>
          </div>
          <div>
            <dt>Participation cost</dt>
            <dd>
              {opportunity.cost.participation === null
                ? 'Unknown'
                : opportunity.cost.participation === 0
                  ? 'Free participation'
                  : `$${opportunity.cost.participation}`}
              {opportunity.demo ? ' (sample fact)' : ''}
            </dd>
          </div>
          <div>
            <dt>Other costs / funding</dt>
            <dd>
              {opportunity.cost.additionalCosts || 'Additional costs unknown'} ·{' '}
              {opportunity.cost.funding || 'Funding unknown'}
            </dd>
          </div>
          <div>
            <dt>Format & location</dt>
            <dd>
              {opportunity.format} · {opportunity.location || 'Location unknown'}
            </dd>
          </div>
          <div>
            <dt>Grade / age / geography</dt>
            <dd>
              {opportunity.requirements.grades?.join(', ') || 'Grades unknown'} ·{' '}
              {opportunity.requirements.minimumAge
                ? `Age ${opportunity.requirements.minimumAge}+`
                : 'Age requirements unknown'}{' '}
              · {opportunity.requirements.regions?.join(', ') || 'Geographic requirements unknown'}
            </dd>
          </div>
          <div>
            <dt>Application status</dt>
            <dd>
              {opportunity.demo
                ? 'No real application exists'
                : effectiveStatus(opportunity, todayKey()) === 'not-applicable'
                  ? 'Learning resource — no application tracked'
                  : effectiveStatus(opportunity, todayKey())}
            </dd>
          </div>
          <div>
            <dt>Official deadline & timezone</dt>
            <dd>
              {opportunity.deadline
                ? `${opportunity.deadline.date} ${opportunity.deadline.time || 'time unknown'} · ${opportunity.deadline.timezone || 'timezone unknown'}`
                : 'Unknown — not a student target date'}
            </dd>
          </div>
          <div>
            <dt>{opportunity.demo ? 'Example materials' : 'Published materials'}</dt>
            <dd>
              {opportunity.materials.length
                ? opportunity.materials.map((m) => (
                    <a className="source-anchor" key={m.name} href={`#evidence-${m.sourceId}`}>
                      {m.name} ↗
                    </a>
                  ))
                : 'No materials verified. Confirm with the organizer.'}
            </dd>
          </div>
        </dl>
        <section>
          <h3>How this fits your preferences</h3>
          {[
            [
              'Interest alignment',
              match.interests.length ? match.interests : ['No interest alignment selected.'],
            ],
            ['Appears consistent', match.consistent],
            ['Known mismatches', match.mismatches],
            ['Missing information', match.missing],
            ['Questions to confirm', match.questions],
          ].map(([title, items]) => (
            <div className="match-group" key={title as string}>
              <strong>{title as string}</strong>
              <ul>
                {(items as string[]).length ? (
                  (items as string[]).map((text) => <li key={text}>{text}</li>)
                ) : (
                  <li>No information to report.</li>
                )}
              </ul>
            </div>
          ))}
          <p className="small-note">
            This is a transparent comparison, not an eligibility decision or admission guarantee.
          </p>
        </section>
        <section>
          <h3>Sources & evidence</h3>
          {opportunity.sources.map((source) => (
            <article className="evidence" id={`evidence-${source.id}`} key={source.id}>
              <strong>{source.title}</strong>
              <p>{source.excerpt}</p>
              <span>
                Last reviewed: {source.reviewedAt || 'Not reviewed'} · {source.status}
              </span>
              {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  Read organizer source <ExternalLink size={13} />
                  <span className="source-url">{source.url}</span>
                </a>
              )}
            </article>
          ))}
        </section>
        <button className="button primary full-width" onClick={() => onSave(opportunity)}>
          {saved ? 'Remove saved pathway' : 'Save and build a pathway'}
          <Bookmark size={16} />
        </button>
        <p className="small-note">
          Saving is not registration, submission, or acceptance.{' '}
          {opportunity.demo
            ? 'This example cannot receive applications.'
            : 'Actual applications happen on the organizer’s official service.'}
        </p>
      </div>
    </Modal>
  );
}
export function Discover({
  workspace,
  onSave,
  initialDemo = false,
}: {
  workspace: Workspace;
  onSave: (item: Opportunity) => void;
  initialDemo?: boolean;
}) {
  const [collection, setCollection] = useState(initialDemo ? 'Demo studio' : 'Programs');
  const [query, setQuery] = useState('');
  const [interest, setInterest] = useState('All interests');
  const [cost, setCost] = useState('Any cost');
  const [format, setFormat] = useState('Any format');
  const [location, setLocation] = useState('Any location');
  const [grade, setGrade] = useState('Any grade');
  const [type, setType] = useState('Any type');
  const [recommended, setRecommended] = useState(false);
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const records = useMemo(
    () =>
      recommend(workspace.profile, catalogue, todayKey()).filter(
        ({ opportunity: o, match }) =>
          (collection === 'Demo studio'
            ? o.demo
            : !o.demo &&
              (collection === 'Learning resources'
                ? o.type === 'Learning resource'
                : o.type !== 'Learning resource')) &&
          (!recommended || match.interests.length > 0) &&
          `${o.name} ${o.organizer} ${o.description}`.toLowerCase().includes(query.toLowerCase()) &&
          (interest === 'All interests' || o.interests.includes(interest)) &&
          (cost === 'Any cost' ||
            (cost === 'Free participation'
              ? o.cost.participation === 0
              : cost === 'Unknown cost'
                ? o.cost.participation === null
                : o.cost.participation !== null && o.cost.participation > 0)) &&
          (format === 'Any format' || o.format === format) &&
          (location === 'Any location' ||
            (location === 'Pennsylvania'
              ? o.requirements.regions?.includes('Pennsylvania')
              : o.requirements.regions === null)) &&
          (grade === 'Any grade' || o.requirements.grades?.includes(grade)) &&
          (type === 'Any type' || o.type === type),
      ),
    [
      workspace.profile,
      collection,
      query,
      interest,
      cost,
      format,
      location,
      grade,
      type,
      recommended,
    ],
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">DISCOVER YOUR NEXT CHAPTER</div>
          <h1>Possibility, with a little direction.</h1>
          <p>Explore beyond what you already know. Then choose a practical next step.</p>
        </div>
        <span className="coverage-chip">
          <Compass size={14} />
          Starting in Pennsylvania · grades 9–12
        </span>
      </div>
      <div className="discovery-hero">
        <span className="hero-compass">
          <Compass size={36} />
        </span>
        <div>
          <h2>Talent is everywhere. Guidance should be, too.</h2>
          <p>Start with your interests. Check the details. Make a plan that fits your life.</p>
        </div>
        <span className="hero-small">YOUR FUTURE ISN’T A STRAIGHT LINE</span>
      </div>
      <div className="tabs" aria-label="Catalogue collections">
        {['Programs', 'Learning resources', 'Demo studio'].map((value) => (
          <button
            aria-pressed={collection === value}
            className={collection === value ? 'active' : ''}
            key={value}
            onClick={() => setCollection(value)}
          >
            {value}
            {value === 'Demo studio' && <span>EXAMPLES</span>}
          </button>
        ))}
      </div>
      <div className={`notice-strip ${collection === 'Demo studio' ? 'amber' : ''}`}>
        <ShieldQuestion size={18} />
        <p>
          {collection === 'Demo studio'
            ? 'Fictional examples for trying the planner. These are not real opportunities, published requirements, or open applications.'
            : 'Source review is pending. Official pages were inaccessible during setup. Costs, requirements, and application status remain unknown until reviewed; none are presented as currently open.'}
        </p>
      </div>
      <section className="filter-panel" aria-label="Filter opportunities">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Search opportunities"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a program, interest, or organizer…"
          />
        </label>
        <div className="filter-grid">
          <label>
            Interest
            <select
              aria-label="Interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            >
              <option>All interests</option>
              {[
                'Engineering',
                'Computer science',
                'Arts & design',
                'Business',
                'Health sciences',
                'Community impact',
              ].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <label>
            Cost
            <select aria-label="Cost" value={cost} onChange={(e) => setCost(e.target.value)}>
              <option>Any cost</option>
              <option>Free participation</option>
              <option>Paid participation</option>
              <option>Unknown cost</option>
            </select>
          </label>
          <label>
            Format
            <select aria-label="Format" value={format} onChange={(e) => setFormat(e.target.value)}>
              {['Any format', 'Remote', 'In person', 'Hybrid', 'Unknown'].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <label>
            Location
            <select
              aria-label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>Any location</option>
              <option>Pennsylvania</option>
              <option>Unknown coverage</option>
            </select>
          </label>
          <label>
            Listed grade
            <select
              aria-label="Listed grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option>Any grade</option>
              {['9', '10', '11', '12'].map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)}>
              <option>Any type</option>
              <option>Program</option>
              <option>Competition</option>
              <option>Learning resource</option>
            </select>
          </label>
        </div>
        <div className="filter-bottom">
          <label className="check-label">
            <input
              type="checkbox"
              checked={recommended}
              onChange={(e) => setRecommended(e.target.checked)}
            />
            Only show interest matches
          </label>
          <button
            className="text-button"
            onClick={() => {
              setQuery('');
              setInterest('All interests');
              setCost('Any cost');
              setFormat('Any format');
              setLocation('Any location');
              setGrade('Any grade');
              setType('Any type');
              setRecommended(false);
            }}
          >
            <Filter size={13} />
            Reset filters
          </button>
        </div>
      </section>
      <div className="results-heading">
        <h2>
          {records.length} {collection === 'Demo studio' ? 'examples' : 'starting points'} to
          explore
        </h2>
        <span>Matches explain alignment, not eligibility</span>
      </div>
      <div className="catalogue-grid">
        {records.map(({ opportunity: o, match }) => (
          <article className="opportunity-card" key={o.id}>
            <div
              className={`opportunity-art ${o.demo ? 'demo-art' : o.type === 'Competition' ? 'peach-art' : 'blue-art'}`}
            >
              <span className="orbital" />
              <Code2 size={39} strokeWidth={1.25} />
              <span className="art-label">
                {o.demo ? 'FICTIONAL EXAMPLE' : o.type.toUpperCase()}
              </span>
              <button
                className="bookmark-button"
                onClick={() => onSave(o)}
                aria-label={`${workspace.pathways.some((p) => p.opportunityId === o.id) ? 'Remove' : 'Save'} ${o.name}`}
                aria-pressed={workspace.pathways.some((p) => p.opportunityId === o.id)}
              >
                <Bookmark
                  size={18}
                  fill={
                    workspace.pathways.some((p) => p.opportunityId === o.id)
                      ? 'currentColor'
                      : 'none'
                  }
                />
              </button>
            </div>
            <div className="opportunity-content">
              <div className="section-kicker">{o.demo ? 'DEMO STUDIO' : o.organizer}</div>
              <h3>
                <button onClick={() => setDetail(o)}>
                  {o.name}
                  <ArrowUpRight size={18} />
                </button>
              </h3>
              <div className="badges">
                <span className={`badge ${o.demo ? 'amber' : ''}`}>
                  {o.demo ? 'Demo evidence' : 'Source not reviewed'}
                </span>
                <span className="badge">
                  {o.type === 'Learning resource'
                    ? 'Learning resource'
                    : o.demo
                      ? 'No real application'
                      : 'Availability unknown'}
                </span>
              </div>
              <p>{o.description}</p>
              <div className="match-line">
                <Check size={14} />
                {match.interests.length
                  ? `Relates to ${match.interests.join(' & ')}`
                  : 'A new direction to explore'}
              </div>
              {match.mismatches.length > 0 && (
                <p className="mismatch-note">
                  {match.mismatches.length} preference or requirement mismatch(es) to review
                </p>
              )}
              <div className="card-facts">
                <span>
                  {o.cost.participation === null
                    ? 'Cost unknown'
                    : o.cost.participation === 0
                      ? 'Free participation (sample)'
                      : `$${o.cost.participation} (sample)`}
                </span>
                <span>{o.format}</span>
              </div>
              <button
                className="text-button full-width details-button"
                onClick={() => setDetail(o)}
              >
                Details, fit & sources
                <ChevronRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!records.length && (
        <div className="empty-state">
          <Search size={32} />
          <h2>No records match these filters.</h2>
          <p>
            Unknown costs and grades aren’t treated as free or eligible. Broaden your filters, or
            explore the fictional Demo studio to try a complete pathway.
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setCost('Any cost');
              setGrade('Any grade');
              setRecommended(false);
            }}
          >
            Broaden cost & grade filters
          </button>
        </div>
      )}
      {detail && (
        <OpportunityDetails
          opportunity={detail}
          workspace={workspace}
          onSave={onSave}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
