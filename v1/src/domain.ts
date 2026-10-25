import { z } from 'zod';

export const interests = [
  'Computer science',
  'Engineering',
  'Medicine',
  'Business',
  'Arts & design',
  'Social impact',
];
export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}
export const parseDate = (value: string) => new Date(`${value}T12:00:00`);
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (value) => !Number.isNaN(parseDate(value).getTime()) && dateKey(parseDate(value)) === value,
    'Enter a valid date',
  );
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  school: z.string().trim().max(120),
  grade: z.enum(['8', '9', '10', '11', '12', 'Other']),
  ambition: z.string().trim().max(300),
  interests: z.array(z.string().max(50)).max(10),
  clubs: z.string().trim().max(300),
});
export const taskSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().trim().min(1).max(160),
  subject: z.string().trim().max(60),
  date: dateSchema,
  time: z.enum(['Before school', 'After school']),
  done: z.boolean(),
});
export const eventSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().trim().min(1).max(160),
  date: dateSchema,
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  category: z.enum(['Class', 'Club', 'Exam', 'Personal']),
  location: z.string().max(100),
});
export const stateSchema = z.object({
  profile: profileSchema,
  tasks: z.array(taskSchema).max(500),
  events: z.array(eventSchema).max(500),
  saved: z.array(z.string().max(100)).max(100),
  readMessages: z.array(z.string().max(100)).max(100),
  onboarded: z.boolean(),
});
export type Profile = z.infer<typeof profileSchema>;
export type Task = z.infer<typeof taskSchema>;
export type CalendarEvent = z.infer<typeof eventSchema>;
export type StudentState = z.infer<typeof stateSchema>;
export type Page =
  'Overview' | 'My planner' | 'Opportunities' | 'Acadia guide' | 'Inbox' | 'My profile';

export function makeEmptyState(name: string): StudentState {
  return {
    profile: { name, school: '', grade: '10', ambition: '', interests: [], clubs: '' },
    tasks: [],
    events: [],
    saved: [],
    readMessages: [],
    onboarded: false,
  };
}
export function makeDemoState(): StudentState {
  const today = dateKey(new Date());
  return {
    profile: {
      name: 'Alex Morgan',
      school: 'Westbridge High School',
      grade: '10',
      ambition: 'Build technology that makes a difference',
      interests: ['Computer science', 'Engineering'],
      clubs: 'Robotics club, Environmental club',
    },
    tasks: [
      {
        id: 'demo-1',
        title: 'Review biology flashcards',
        subject: 'Biology',
        date: today,
        time: 'Before school',
        done: false,
      },
      {
        id: 'demo-2',
        title: 'Pack your robotics project',
        subject: 'Robotics',
        date: today,
        time: 'Before school',
        done: true,
      },
      {
        id: 'demo-3',
        title: 'Finish the quadratic equations worksheet',
        subject: 'Algebra II',
        date: today,
        time: 'After school',
        done: false,
      },
      {
        id: 'demo-4',
        title: 'Spend 20 minutes on your app idea',
        subject: 'Personal goal',
        date: today,
        time: 'After school',
        done: false,
      },
    ],
    events: [
      {
        id: 'event-1',
        title: 'Biology study session',
        date: today,
        time: '08:30',
        category: 'Class',
        location: 'Library · Room 204',
      },
      {
        id: 'event-2',
        title: 'Robotics club',
        date: today,
        time: '15:30',
        category: 'Club',
        location: 'Innovation lab',
      },
      {
        id: 'event-3',
        title: 'Algebra II quiz',
        date: dateKey(addDays(new Date(), 2)),
        time: '10:00',
        category: 'Exam',
        location: 'Room 108',
      },
      {
        id: 'event-4',
        title: 'Explore summer opportunities',
        date: dateKey(addDays(new Date(), 4)),
        time: '16:00',
        category: 'Personal',
        location: 'Your next chapter',
      },
    ],
    saved: [],
    readMessages: [],
    onboarded: true,
  };
}
export const opportunities = [
  {
    id: 'congress',
    title: 'Turn your big idea into an app',
    organization: 'Congressional App Challenge',
    type: 'Competition',
    tags: ['Computer science', 'Engineering'],
    description:
      'Create an original app, learn by building, and explore your district’s competition. Participation depends on your district and the current program rules.',
    cost: 'Free to explore',
    deadline: 'Check provider',
    url: 'https://www.congressionalappchallenge.us/',
    color: 'peach',
    icon: 'code',
  },
  {
    id: 'nasa',
    title: 'Your curiosity. A NASA internship.',
    organization: 'NASA STEM Engagement',
    type: 'Internship',
    tags: ['Engineering', 'Computer science', 'Medicine'],
    description:
      'Explore NASA’s student pathways and internships. Age, citizenship, enrollment, and location requirements vary; check each listing before applying.',
    cost: 'Eligibility varies',
    deadline: 'Check provider',
    url: 'https://www.nasa.gov/learning-resources/internship-programs/',
    color: 'blue',
    icon: 'orbit',
  },
  {
    id: 'gwc',
    title: 'Find your community in code',
    organization: 'Girls Who Code',
    type: 'Program',
    tags: ['Computer science', 'Arts & design'],
    description:
      'Discover coding clubs and student programs in a supportive community. Check the provider for current formats, locations, and eligibility.',
    cost: 'Free programs',
    deadline: 'Check provider',
    url: 'https://girlswhocode.com/programs',
    color: 'lavender',
    icon: 'sparkles',
  },
  {
    id: 'khan',
    title: 'Make your next SAT practice count',
    organization: 'Khan Academy',
    type: 'Learning',
    tags: [
      'Computer science',
      'Engineering',
      'Medicine',
      'Business',
      'Arts & design',
      'Social impact',
    ],
    description:
      'Build confidence with free digital SAT practice. This is a learning resource; confirm your actual test dates with your school or College Board.',
    cost: 'Free',
    deadline: 'Check provider',
    url: 'https://www.khanacademy.org/digital-sat',
    color: 'sage',
    icon: 'book',
  },
  {
    id: 'volunteer',
    title: 'Small actions. Real local impact.',
    organization: 'VolunteerMatch',
    type: 'Volunteering',
    tags: ['Social impact', 'Medicine', 'Business'],
    description:
      'Browse local service opportunities aligned with your interests. Verify age limits, transportation, safeguarding, and organization details with a trusted adult.',
    cost: 'Varies by listing',
    deadline: 'Check provider',
    url: 'https://www.volunteermatch.org/',
    color: 'sand',
    icon: 'heart',
  },
];
export function rankOpportunities(selected: string[]) {
  return opportunities
    .map((item) => {
      const matches = item.tags.filter((tag) => selected.includes(tag));
      return {
        ...item,
        score: matches.length,
        reason: matches.length
          ? `Matches your interest in ${matches.join(' and ')}`
          : 'Explore something new',
      };
    })
    .sort((a, b) => b.score - a.score);
}
export function getGuidance(question: string, state: StudentState): string {
  const text = question.toLowerCase();
  if (/psat|sat|exam|test date/.test(text))
    return 'I don’t have verified exam dates from your school. Confirm PSAT/SAT registration, eligibility, fees and dates with your school counselor and the official College Board website. Once confirmed, add the date to your planner and set aside a short practice block each week.';
  if (/class|course|subject/.test(text))
    return `For your interest in ${state.profile.interests.join(' and ') || 'exploring careers'}, consider a balanced schedule with a strong math foundation, writing, and an introductory elective in your area of interest. Talk with your counselor about prerequisites, graduation requirements, workload, and which courses your school actually offers. Your path can change as you learn.`;
  if (/intern|opportun|club|career/.test(text)) {
    const match = rankOpportunities(state.profile.interests)[0];
    return `Your next step could be “${match.title}” from ${match.organization}. ${match.reason}. Find it in Opportunities, then check the provider’s current age requirements and availability. To work toward “${state.profile.ambition || 'discover what you enjoy'}”, try one small project or club activity and write down what you learned. Recommendations are starting points, not admission or career guarantees.`;
  }
  const pending = state.tasks.filter((task) => !task.done && task.date <= dateKey(new Date()));
  return pending.length
    ? `Let’s make today manageable. Start with “${pending[0].title}”, then take a five-minute break. You have ${pending.length} unfinished task${pending.length === 1 ? '' : 's'} due today or earlier. Choose one that matters most, block out 25 focused minutes after school, and leave room for rest. For your goal of “${state.profile.ambition || 'finding your direction'}”, a small consistent step is enough.`
    : 'You have no unfinished tasks due today. Pick one small step toward your goal, add it to your planner, and leave room for rest. If you want school-specific advice, check with a teacher or counselor; I do not have access to your school records.';
}
export function getReminders(state: StudentState) {
  const today = dateKey(new Date());
  return [
    {
      id: 'welcome',
      title: 'A little direction goes a long way',
      body: 'Your planner is yours to shape. Add your goals and interests to make recommendations more relevant.',
      label: 'Acadia',
      date: 'Getting started',
    },
    ...state.events
      .filter((event) => event.date >= today && event.date <= dateKey(addDays(new Date(), 7)))
      .map((event) => ({
        id: event.id,
        title: event.title,
        body: `${event.category} · ${parseDate(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${event.time}${event.location ? ` · ${event.location}` : ''}. This reminder comes from your planner.`,
        label: 'Planner reminder',
        date: event.date,
      })),
    {
      id: 'exams',
      title: 'Check in about school-wide exams',
      body: 'PSAT and other exam dates vary by school and grade. Ask your counselor about upcoming tests and registration, then add confirmed dates to your calendar.',
      label: 'Helpful nudge',
      date: 'Worth a look',
    },
  ];
}
