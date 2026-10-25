import type { Opportunity, SavedPathway, Workspace } from './models';
export function createPathway(opportunity: Opportunity, id: string): SavedPathway {
  return {
    id,
    opportunityId: opportunity.id,
    targetDate: null,
    applicationStatus: 'Exploring',
    notes: '',
    steps: [
      {
        id: 'review',
        title: opportunity.demo
          ? 'Read the sample requirements and evidence'
          : 'Read the organizer’s official program page',
        kind: 'suggestion',
        sourceId: null,
        dependsOn: [],
        minutes: 25,
        done: false,
      },
      {
        id: 'confirm',
        title: 'Confirm eligibility, current dates, costs and access needs',
        kind: 'question',
        sourceId: null,
        dependsOn: ['review'],
        minutes: 25,
        done: false,
      },
      ...opportunity.materials.map((material, index) => ({
        id: `material-${index}`,
        title: `Prepare ${material.name}`,
        kind: 'requirement' as const,
        sourceId: material.sourceId,
        dependsOn: ['confirm'],
        minutes: 25,
        done: false,
      })),
      {
        id: 'prepare',
        title: 'Try a small project or practice activity',
        kind: 'suggestion',
        sourceId: null,
        dependsOn: ['confirm'],
        minutes: 25,
        done: false,
      },
      {
        id: 'next',
        title: opportunity.demo
          ? 'Review your example plan (no real submission)'
          : opportunity.type === 'Learning resource'
            ? 'Choose your next learning session'
            : 'Review your materials before external submission',
        kind: 'suggestion',
        sourceId: null,
        dependsOn: [...opportunity.materials.map((_, index) => `material-${index}`), 'prepare'],
        minutes: 25,
        done: false,
      },
    ],
  };
}
export function setStepCompletion(
  pathway: SavedPathway,
  id: string,
  done: boolean,
): { pathway: SavedPathway; error: string | null } {
  const step = pathway.steps.find((s) => s.id === id);
  if (!step) return { pathway, error: 'Step not found.' };
  if (done && step.dependsOn.some((dep) => !pathway.steps.find((s) => s.id === dep)?.done))
    return { pathway, error: 'Complete the prerequisite steps first.' };
  const reset = new Set([id]);
  if (!done) {
    let changed = true;
    while (changed) {
      changed = false;
      for (const s of pathway.steps)
        if (!reset.has(s.id) && s.dependsOn.some((dep) => reset.has(dep))) {
          reset.add(s.id);
          changed = true;
        }
    }
  }
  return {
    pathway: {
      ...pathway,
      steps: pathway.steps.map((s) =>
        s.id === id ? { ...s, done } : !done && reset.has(s.id) ? { ...s, done: false } : s,
      ),
    },
    error: null,
  };
}
export function completeStep(
  workspace: Workspace,
  pathId: string,
  stepId: string,
  done: boolean,
): { workspace: Workspace; error: string | null } {
  const path = workspace.pathways.find((p) => p.id === pathId);
  if (!path) return { workspace, error: 'Pathway not found.' };
  const result = setStepCompletion(path, stepId, done);
  if (result.error) return { workspace, error: result.error };
  return {
    workspace: {
      ...workspace,
      pathways: workspace.pathways.map((p) => (p.id === pathId ? result.pathway : p)),
      tasks: workspace.tasks.map((task) =>
        task.pathwayId === pathId && task.stepId
          ? { ...task, done: result.pathway.steps.find((s) => s.id === task.stepId)?.done || false }
          : task,
      ),
    },
    error: null,
  };
}
