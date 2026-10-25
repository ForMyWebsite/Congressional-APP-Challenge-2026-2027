import type { Workspace } from './models';
export const GEAR = [
  { id: 'bandana', name: 'Forest bandana', price: 20 },
  { id: 'cap', name: 'Explorer cap', price: 35 },
  { id: 'glasses', name: 'Study glasses', price: 25 },
] as const;
export function awardTaskCoins(before: Workspace, after: Workspace): Workspace {
  const awarded = new Set(after.pet.rewardedTaskIds);
  let coins = 0;
  for (const task of after.tasks)
    if (
      task.done &&
      !awarded.has(task.id) &&
      before.tasks.some((old) => old.id === task.id && !old.done)
    ) {
      awarded.add(task.id);
      coins += 10;
    }
  return coins
    ? {
        ...after,
        pet: {
          ...after.pet,
          coins: Math.min(1000000, after.pet.coins + coins),
          rewardedTaskIds: [...awarded],
        },
      }
    : after;
}
export function petAction(
  workspace: Workspace,
  item: string,
): { workspace: Workspace; error: string | null } {
  if (item === 'feed') {
    if (workspace.pet.energy >= 100)
      return { workspace, error: 'Max is full. Save your coins for later.' };
    if (workspace.pet.coins < 5) return { workspace, error: 'You need 5 coins to buy a snack.' };
    return {
      workspace: {
        ...workspace,
        pet: {
          ...workspace.pet,
          coins: workspace.pet.coins - 5,
          energy: Math.min(100, workspace.pet.energy + 20),
        },
      },
      error: null,
    };
  }
  const gear = GEAR.find((g) => g.id === item);
  if (!gear) return { workspace, error: 'Unknown item.' };
  if (workspace.pet.owned.includes(gear.id))
    return {
      workspace: {
        ...workspace,
        pet: { ...workspace.pet, equipped: workspace.pet.equipped === gear.id ? null : gear.id },
      },
      error: null,
    };
  if (workspace.pet.coins < gear.price)
    return { workspace, error: `You need ${gear.price} coins for this gear.` };
  return {
    workspace: {
      ...workspace,
      pet: {
        ...workspace.pet,
        coins: workspace.pet.coins - gear.price,
        owned: [...workspace.pet.owned, gear.id],
        equipped: gear.id,
      },
    },
    error: null,
  };
}
