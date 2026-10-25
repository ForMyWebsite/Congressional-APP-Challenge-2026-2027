import { z } from 'zod';
import { dateSchema, timeSchema, type Workspace } from './models';
export const proposalSchema = z.object({
  title: z.string().trim().min(1).max(160),
  date: dateSchema.nullable(),
  time: timeSchema.nullable(),
  minutes: z.number().int().min(5).max(180),
  category: z.enum(['Assignment', 'Test', 'Club', 'Personal']),
});
export const maxReplySchema = z.object({
  answer: z.string().min(1).max(12000),
  proposals: z.array(proposalSchema).max(8),
});
export const maxRequestSchema = z.object({
  question: z.string().trim().min(1).max(2500),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(12000) }))
    .max(10),
  consent: z.literal(true),
  context: z.object({
    grade: z.string().nullable(),
    interests: z.array(z.string().max(50)).max(10),
    ambition: z.string().max(300),
    availableMinutes: z.number().min(0).max(180),
    courses: z
      .array(
        z.object({
          name: z.string().max(100),
          grade: z.string().max(20),
          period: z.string().max(30),
        }),
      )
      .max(30),
    tasks: z
      .array(
        z.object({
          title: z.string().max(160),
          date: dateSchema,
          time: timeSchema,
          minutes: z.number().min(5).max(180),
          category: z.string().max(30),
          done: z.boolean(),
        }),
      )
      .max(120),
    commitments: z
      .array(
        z.object({
          title: z.string().max(150),
          weekdays: z.array(z.number()).max(7),
          time: timeSchema,
          minutes: z.number(),
          startDate: dateSchema,
          endDate: dateSchema,
        }),
      )
      .max(100),
  }),
});
export function maxContext(workspace: Workspace, shareSchool: boolean) {
  return {
    grade: workspace.profile.grade,
    interests: workspace.profile.interests,
    ambition: workspace.profile.ambition,
    availableMinutes: workspace.profile.availableMinutes,
    courses: shareSchool
      ? workspace.school.courses.map(({ name, grade, period }) => ({ name, grade, period }))
      : [],
    tasks: workspace.tasks.slice(-120).map(({ title, date, time, minutes, category, done }) => ({
      title,
      date,
      time,
      minutes,
      category,
      done,
    })),
    commitments: workspace.school.commitments.map(
      ({ title, weekdays, time, minutes, startDate, endDate }) => ({
        title,
        weekdays,
        time,
        minutes,
        startDate,
        endDate,
      }),
    ),
  };
}
export const extractionSchema = z.object({
  courses: z
    .array(
      z.object({
        name: z.string().max(100),
        period: z.string().max(30),
        grade: z.string().max(20),
      }),
    )
    .max(30),
  assignments: z
    .array(
      z.object({
        title: z.string().max(160),
        date: dateSchema.nullable(),
        time: timeSchema.nullable(),
        minutes: z.number().int().min(5).max(180),
      }),
    )
    .max(60),
  notes: z.string().max(2000),
});
