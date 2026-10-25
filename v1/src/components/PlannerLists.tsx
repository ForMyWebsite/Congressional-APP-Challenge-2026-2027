import { CalendarDays, Check, CheckCircle2, Trash2 } from 'lucide-react';
import { dateKey, parseDate, type Task, type CalendarEvent } from '../domain';

export function TaskList({
  items,
  onToggle,
  onRemove,
}: {
  items: Task[];
  onToggle: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  return items.length ? (
    <div className="task-list">
      {items.map((task) => (
        <div className={`task-row ${task.done ? 'is-done' : ''}`} key={task.id}>
          <label className="task-check">
            <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} />
            <span className="custom-check">{task.done && <Check size={12} />}</span>
            <span className="task-text">
              <span>{task.title}</span>
              <small>
                {task.subject || 'Personal'} <span>·</span> {task.time}
              </small>
            </span>
          </label>
          {Boolean(onRemove) && (
            <button
              className="icon-button"
              aria-label={`Delete ${task.title}`}
              onClick={() => onRemove?.(task.id)}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="empty-inline">
      <CheckCircle2 size={24} />
      <p>
        A little room to breathe.
        <br />
        <span>Add a task when you’re ready.</span>
      </p>
    </div>
  );
}

export function EventList({
  events,
  onRemove,
}: {
  events: CalendarEvent[];
  onRemove?: (id: string) => void;
}) {
  const today = dateKey(new Date());
  return events.length ? (
    <div className="event-list">
      {events.map((event) => (
        <article className={`event-row ${event.category.toLowerCase()}`} key={event.id}>
          <div className="event-time">
            {new Date(`2000-01-01T${event.time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
            <small>
              {event.date === today
                ? 'Today'
                : parseDate(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
            </small>
          </div>
          <div className="event-details">
            <h3>{event.title}</h3>
            <p>{event.location || event.category}</p>
          </div>
          {Boolean(onRemove) ? (
            <button
              className="icon-button"
              aria-label={`Delete ${event.title}`}
              onClick={() => onRemove?.(event.id)}
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <span className={`tag ${event.category.toLowerCase()}`}>{event.category}</span>
          )}
        </article>
      ))}
    </div>
  ) : (
    <div className="empty-inline">
      <CalendarDays size={25} />
      <p>
        Your calendar has some open space.
        <br />
        <span>Add a confirmed event to get started.</span>
      </p>
    </div>
  );
}
