import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, dateKey, type CalendarEvent } from '../domain';
export function Calendar({
  month,
  setMonth,
  selectedDate,
  onSelect,
  allEvents,
  compact = false,
}: {
  month: Date;
  setMonth: (month: Date) => void;
  selectedDate: string;
  onSelect: (date: string) => void;
  allEvents: CalendarEvent[];
  compact?: boolean;
}) {
  const today = dateKey(new Date());
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const first = addDays(start, -((start.getDay() + 6) % 7));
  const days = Array.from(
    {
      length:
        35 +
        (new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() +
          ((start.getDay() + 6) % 7) >
        35
          ? 7
          : 0),
    },
    (_, i) => addDays(first, i),
  );
  return (
    <div className={`calendar ${compact ? 'mini-calendar' : ''}`}>
      <div className="calendar-heading">
        <h3>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        <div>
          <button
            className="icon-button"
            aria-label="Previous month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Next month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <span className="weekday" key={i}>
            {day}
          </span>
        ))}
        {days.map((day) => {
          const key = dateKey(day);
          const events = allEvents.filter((event) => event.date === key);
          return (
            <button
              key={key}
              aria-label={day.toLocaleDateString('en-US', { dateStyle: 'full' })}
              aria-pressed={selectedDate === key}
              className={`calendar-day ${day.getMonth() !== month.getMonth() ? 'muted' : ''} ${key === today ? 'today' : ''} ${key === selectedDate ? 'selected' : ''}`}
              onClick={() => {
                onSelect(key);
              }}
            >
              <span>{day.getDate()}</span>
              {compact ? (
                events.length > 0 && <i />
              ) : (
                <div className="day-events">
                  {events.slice(0, 2).map((event) => (
                    <small className={event.category.toLowerCase()} key={event.id}>
                      {event.title}
                    </small>
                  ))}
                  {events.length > 2 && <small>+{events.length - 2} more</small>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
