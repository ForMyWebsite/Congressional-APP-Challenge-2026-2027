import {
  ArrowUpRight,
  Bookmark,
  Code2,
  Orbit,
  Sparkles,
  BookOpen,
  Heart,
  Check,
} from 'lucide-react';
import { rankOpportunities } from '../domain';
export function OpportunityCard({
  item,
  saved,
  toggle,
  compact = false,
}: {
  item: ReturnType<typeof rankOpportunities>[number];
  saved: boolean;
  toggle: () => void;
  compact?: boolean;
}) {
  const Icon =
    { code: Code2, orbit: Orbit, sparkles: Sparkles, book: BookOpen, heart: Heart }[item.icon] ||
    Sparkles;
  return (
    <article className={`opportunity-card ${compact ? 'compact' : ''}`}>
      <div className={`opportunity-art ${item.color}`}>
        <span className="art-ring ring-one" />
        <span className="art-ring ring-two" />
        <Icon size={compact ? 33 : 45} strokeWidth={1.3} />
        <span className="opportunity-type">{item.type}</span>
        <button
          className={`save-button ${saved ? 'saved' : ''}`}
          aria-label={`${saved ? 'Unsave' : 'Save'} ${item.title}`}
          aria-pressed={saved}
          onClick={toggle}
        >
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="opportunity-content">
        <div className="eyebrow">{item.organization}</div>
        <h3>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.title}
            <ArrowUpRight size={17} />
          </a>
        </h3>
        {!compact && <p>{item.description}</p>}
        <div className="match-reason">
          <Check size={13} />
          {item.score
            ? compact
              ? 'Picked for your interests'
              : item.reason
            : 'A new direction to explore'}
        </div>
        <div className="opportunity-meta">
          <span>{item.cost}</span>
          <span>{item.deadline}</span>
        </div>
      </div>
    </article>
  );
}
