import { z } from 'zod';

export const INTERESTS = [
  'Engineering',
  'Computer science',
  'Arts & design',
  'Business',
  'Health sciences',
  'Community impact',
] as const;
export const TIMEZONE = 'America/New_York';
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Choose a valid date.');
export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const profileSchema = z.object({
  nickname: z.string().trim().max(60),
  grade: z.enum(['9', '10', '11', '12']).nullable(),
  region: z.enum(['Pennsylvania', 'Other US state', 'Outside US']).nullable(),
  interests: z.array(z.enum(INTERESTS)).max(6),
  ambition: z.string().trim().max(300),
  activities: z.string().trim().max(300),
  availableMinutes: z.number().int().min(0).max(180),
  startTime: timeSchema,
  weekdays: z.array(z.number().int().min(0).max(6)).max(7),
  preferFree: z.boolean(),
  preferRemote: z.boolean(),
  transportation: z.enum(['available', 'limited', 'unsure']),
  accessibilityInfo: z.boolean(),
});
export type StudentProfile = z.infer<typeof profileSchema>;
export type SourceEvidence = {
  id: string;
  url: string | null;
  title: string;
  excerpt: string;
  reviewedAt: string | null;
  status: 'unreviewed' | 'reviewed' | 'demonstration';
};
export type Opportunity = {
  id: string;
  name: string;
  organizer: string;
  type: 'Program' | 'Competition' | 'Learning resource';
  description: string;
  interests: string[];
  demo: boolean;
  format: 'Remote' | 'In person' | 'Hybrid' | 'Unknown';
  location: string | null;
  requirements: {
    grades: string[] | null;
    minimumAge: number | null;
    regions: string[] | null;
    other: string[];
  };
  cost: { participation: number | null; funding: string | null; additionalCosts: string | null };
  deadline: { date: string; time: string | null; timezone: string | null } | null;
  applicationStatus: 'open' | 'closed' | 'upcoming' | 'unknown' | 'not-applicable';
  materials: { name: string; sourceId: string }[];
  sources: SourceEvidence[];
  unresolved: string[];
};
export type MatchExplanation = {
  interests: string[];
  consistent: string[];
  mismatches: string[];
  missing: string[];
  questions: string[];
};
export const stepSchema = z.object({
  id: z.string().max(100),
  title: z.string().max(200),
  kind: z.enum(['requirement', 'suggestion', 'question']),
  sourceId: z.string().nullable(),
  dependsOn: z.array(z.string()).max(30),
  minutes: z.number().int().min(5).max(180),
  done: z.boolean(),
});
export type PreparationStep = z.infer<typeof stepSchema>;
export const pathwaySchema = z
  .object({
    id: z.string().max(100),
    opportunityId: z.string().max(100),
    targetDate: dateSchema.nullable(),
    applicationStatus: z.enum(['Exploring', 'Preparing', 'Submitted', 'Accepted', 'Not pursuing']),
    notes: z.string().max(2000),
    steps: z.array(stepSchema).max(30),
  })
  .superRefine((path, ctx) => {
    const ids = new Set(path.steps.map((s) => s.id));
    if (
      ids.size !== path.steps.length ||
      path.steps.some((s) => s.dependsOn.some((id) => !ids.has(id) || id === s.id))
    )
      ctx.addIssue({ code: 'custom', message: 'Invalid pathway dependencies.' });
    const visited = new Set<string>();
    const pending = new Set<string>();
    function visit(id: string): boolean {
      if (pending.has(id)) return false;
      if (visited.has(id)) return true;
      pending.add(id);
      const step = path.steps.find((s) => s.id === id)!;
      for (const dep of step.dependsOn) if (ids.has(dep) && !visit(dep)) return false;
      pending.delete(id);
      visited.add(id);
      return true;
    }
    if (path.steps.some((s) => !visit(s.id)))
      ctx.addIssue({ code: 'custom', message: 'Circular pathway dependencies.' });
    if (
      path.steps.some(
        (s) => s.done && s.dependsOn.some((id) => !path.steps.find((d) => d.id === id)?.done),
      )
    )
      ctx.addIssue({ code: 'custom', message: 'A completed step has an unfinished prerequisite.' });
  });
export type SavedPathway = z.infer<typeof pathwaySchema>;
export const taskSchema = z
  .object({
    id: z.string().max(100),
    title: z.string().trim().min(1).max(160),
    date: dateSchema,
    time: timeSchema,
    minutes: z.number().int().min(5).max(180),
    category: z.enum(['Assignment', 'Test', 'Club', 'Personal', 'Preparation']),
    done: z.boolean(),
    pathwayId: z.string().nullable(),
    stepId: z.string().nullable(),
  })
  .refine(
    (t) => Number(t.time.slice(0, 2)) * 60 + Number(t.time.slice(3)) + t.minutes <= 1440,
    'Tasks must finish within the selected day.',
  );
export type ScheduledTask = z.infer<typeof taskSchema>;
export const courseSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(100),
  period: z.string().max(30),
  grade: z.string().max(20),
});
export const recurringSchema = z
  .object({
    id: z.string().min(1).max(100),
    title: z.string().trim().min(1).max(150),
    category: z.enum(['Class', 'Club']),
    weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
    time: timeSchema,
    minutes: z.number().int().min(5).max(180),
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine((r) => r.endDate >= r.startDate, 'End date must follow the start date.')
  .refine(
    (r) => Number(r.time.slice(0, 2)) * 60 + Number(r.time.slice(3)) + r.minutes <= 1440,
    'Commitments must finish within the day.',
  );
export const schoolSchema = z.object({
  name: z.string().trim().max(150),
  courses: z.array(courseSchema).max(30),
  commitments: z.array(recurringSchema).max(100),
  setupDone: z.boolean(),
});
export type SchoolData = z.infer<typeof schoolSchema>;
export type RecurringCommitment = z.infer<typeof recurringSchema>;
export const petSchema = z.object({
  coins: z.number().int().min(0).max(1000000),
  rewardedTaskIds: z.array(z.string().max(100)).max(20000),
  owned: z.array(z.enum(['bandana', 'cap', 'glasses'])).max(3),
  equipped: z.enum(['bandana', 'cap', 'glasses']).nullable(),
  energy: z.number().int().min(0).max(100),
});
export const emptySchool = (): SchoolData => ({
  name: '',
  courses: [],
  commitments: [],
  setupDone: false,
});
export const emptyPet = () => ({
  coins: 0,
  rewardedTaskIds: [] as string[],
  owned: [] as ('bandana' | 'cap' | 'glasses')[],
  equipped: null as 'bandana' | 'cap' | 'glasses' | null,
  energy: 60,
});
const workspaceV3 = z
  .object({
    version: z.literal(3),
    school: schoolSchema.default(emptySchool),
    pet: petSchema.default(emptyPet),
    maxChat: z
      .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(12000) }))
      .max(40)
      .default([]),
    profile: profileSchema,
    onboarded: z.boolean(),
    pathways: z.array(pathwaySchema).max(50),
    tasks: z.array(taskSchema).max(1000),
  })
  .superRefine((state, ctx) => {
    if (
      new Set(state.pathways.map((p) => p.id)).size !== state.pathways.length ||
      new Set(state.pathways.map((p) => p.opportunityId)).size !== state.pathways.length ||
      new Set(state.tasks.map((t) => t.id)).size !== state.tasks.length
    )
      ctx.addIssue({ code: 'custom', message: 'Duplicate planner records.' });
    for (const task of state.tasks)
      if (
        task.pathwayId &&
        !state.pathways.some(
          (p) => p.id === task.pathwayId && p.steps.some((s) => s.id === task.stepId),
        )
      )
        ctx.addIssue({ code: 'custom', message: 'A task refers to a missing pathway step.' });
  });
export const workspaceSchema = z.preprocess((value) => {
  if (value && typeof value === 'object' && 'version' in value && value.version === 2)
    return { ...value, version: 3 };
  return value;
}, workspaceV3);
export type Workspace = z.infer<typeof workspaceSchema>;
export function emptyWorkspace(): Workspace {
  return {
    version: 3,
    school: emptySchool(),
    pet: emptyPet(),
    maxChat: [],
    profile: {
      nickname: '',
      grade: null,
      region: null,
      interests: [],
      ambition: '',
      activities: '',
      availableMinutes: 0,
      startTime: '16:00',
      weekdays: [],
      preferFree: false,
      preferRemote: false,
      transportation: 'unsure',
      accessibilityInfo: false,
    },
    onboarded: false,
    pathways: [],
    tasks: [],
  };
}
