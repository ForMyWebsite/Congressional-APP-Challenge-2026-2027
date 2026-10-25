import type { MatchExplanation, Opportunity, StudentProfile } from './models';
import { effectiveStatus } from './dates';
export function explainMatch(
  profile: StudentProfile,
  opportunity: Opportunity,
  today: string,
): MatchExplanation {
  const result: MatchExplanation = {
    interests: opportunity.interests.filter((i) =>
      profile.interests.includes(i as StudentProfile['interests'][number]),
    ),
    consistent: [],
    mismatches: [],
    missing: [],
    questions: [...opportunity.unresolved],
  };
  if (!profile.interests.length) result.missing.push('Your interests are not selected yet.');
  if (opportunity.requirements.grades && profile.grade) {
    if (opportunity.requirements.grades.includes(profile.grade))
      result.consistent.push(`Grade ${profile.grade} is within the listed range.`);
    else
      result.mismatches.push(
        `Listed grades: ${opportunity.requirements.grades.join(', ')}; your grade is ${profile.grade}.`,
      );
  } else
    result.missing.push(
      opportunity.requirements.grades
        ? 'Your grade is not provided.'
        : 'Grade requirements are unknown.',
    );
  if (opportunity.requirements.regions && profile.region) {
    if (opportunity.requirements.regions.includes(profile.region))
      result.consistent.push('Your broad location matches the listed region.');
    else result.mismatches.push('Your broad location is outside the listed region.');
  } else result.missing.push('Geographic eligibility needs confirmation.');
  if (opportunity.cost.participation === null)
    result.missing.push('Participation cost is unknown; do not assume it is free.');
  else if (opportunity.cost.participation === 0)
    result.consistent.push('Participation is listed as free. Additional costs may still apply.');
  else if (profile.preferFree)
    result.mismatches.push(
      `Participation is listed at $${opportunity.cost.participation}; you prefer free programs.`,
    );
  if (profile.preferRemote && opportunity.format === 'In person')
    result.mismatches.push('This is in person; you prefer remote participation.');
  if (opportunity.format === 'Unknown') result.missing.push('Participation format is unknown.');
  if (profile.transportation === 'limited' && opportunity.format !== 'Remote')
    result.questions.push('Can you participate without reliable transportation?');
  if (profile.accessibilityInfo)
    result.questions.push('What accessibility support does the organizer offer?');
  if (opportunity.requirements.minimumAge !== null)
    result.questions.push(
      `Confirm you meet the listed minimum age of ${opportunity.requirements.minimumAge}. We do not collect your birth date.`,
    );
  if (!opportunity.deadline && opportunity.type !== 'Learning resource')
    result.missing.push('The current application deadline is unknown.');
  if (!opportunity.demo && opportunity.sources.some((s) => s.status !== 'reviewed'))
    result.missing.push('Organizer information has not been source-reviewed.');
  if (opportunity.demo)
    result.missing.push('Fictional example: no real application or eligibility is available.');
  const status = effectiveStatus(opportunity, today);
  if (status === 'closed')
    result.mismatches.push('Applications are closed or the recorded deadline has passed.');
  if (status === 'unknown') result.questions.push('Is the current application cycle open?');
  return result;
}
export function recommend(profile: StudentProfile, catalogue: Opportunity[], today: string) {
  return catalogue
    .map((opportunity) => ({ opportunity, match: explainMatch(profile, opportunity, today) }))
    .sort(
      (a, b) =>
        a.match.mismatches.length - b.match.mismatches.length ||
        b.match.interests.length - a.match.interests.length ||
        a.opportunity.name.localeCompare(b.opportunity.name),
    );
}
