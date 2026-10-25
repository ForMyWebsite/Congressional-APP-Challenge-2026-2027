'use client';
import { Coins, Heart, ShoppingBag } from 'lucide-react';
import { GEAR, petAction } from '../domain/pet';
import type { Workspace } from '../domain/models';
import type { Dispatch, SetStateAction } from 'react';
export function MaxPortrait({ gear = null }: { gear?: Workspace['pet']['equipped'] }) {
  return (
    <svg
      className="max-portrait"
      viewBox="0 0 220 190"
      role="img"
      aria-label={`Max the dog${gear ? ` wearing ${gear}` : ''}`}
    >
      <ellipse cx="110" cy="168" rx="64" ry="9" fill="#dbe6cd" />
      <path
        d="M72 104c-22 5-30 29-22 46 7 15 28 14 39 5m59-51c21 5 29 29 21 46-7 15-28 14-39 5"
        fill="#b48a56"
      />
      <ellipse cx="110" cy="133" rx="48" ry="36" fill="#e0bc84" />
      <path d="M67 40C35 35 38 93 60 106l25-39m69-27c31-5 28 53 6 66l-24-39" fill="#9c7449" />
      <path d="M65 68c0-56 90-56 90 0v27c0 45-90 45-90 0Z" fill="#e5c18a" />
      <path d="M101 28c-16 14-17 35-9 50l22-17 9-34" fill="#f4e0bb" />
      <ellipse cx="110" cy="97" rx="30" ry="24" fill="#f4e0bb" />
      <circle cx="88" cy="76" r="6" fill="#3a3d2d" />
      <circle cx="132" cy="76" r="6" fill="#3a3d2d" />
      <circle cx="90" cy="74" r="2" fill="white" />
      <circle cx="134" cy="74" r="2" fill="white" />
      <path d="M103 91q7-6 14 0-1 12-7 12t-7-12" fill="#3a3d2d" />
      <path
        d="M110 103q-5 10-13 4m13-4q5 10 13 4"
        stroke="#755c3b"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {gear === 'bandana' && <path d="m73 118 36 14 38-14-37 36Z" fill="#3d7455" />}
      {gear === 'cap' && (
        <>
          <path d="M67 47q6-43 52-34 36 6 36 34Z" fill="#4a7959" />
          <path d="M65 47h108q-2 10-37 10H65Z" fill="#315c42" />
        </>
      )}
      {gear === 'glasses' && (
        <g stroke="#3f5e48" strokeWidth="4" fill="none">
          <rect x="73" y="65" width="32" height="25" rx="9" />
          <rect x="117" y="65" width="32" height="25" rx="9" />
          <path d="M105 74h12" />
        </g>
      )}
      <ellipse cx="85" cy="156" rx="21" ry="12" fill="#f1d5a3" />
      <ellipse cx="137" cy="156" rx="21" ry="12" fill="#f1d5a3" />
    </svg>
  );
}
export function MaxPet({
  workspace,
  update,
  notify,
}: {
  workspace: Workspace;
  update: Dispatch<SetStateAction<Workspace>>;
  notify: (text: string) => void;
}) {
  function act(item: string) {
    const result = petAction(workspace, item);
    if (result.error) {
      notify(result.error);
      return;
    }
    update(result.workspace);
    notify(item === 'feed' ? 'Max enjoyed his snack!' : 'Max’s gear is updated.');
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="section-kicker">YOUR LITTLE COMPANION FOR BIG DAYS</div>
          <h1>Meet Max. Make progress together.</h1>
          <p>
            Earn 10 coins the first time you complete a task. Reopening it won’t award more coins.
          </p>
        </div>
        <span className="coin-pill">
          <Coins size={18} />
          {workspace.pet.coins} coins
        </span>
      </div>
      <div className="pet-layout">
        <section className="panel pet-home">
          <MaxPortrait gear={workspace.pet.equipped} />
          <h2>Max</h2>
          <p>Here for your small wins, study breaks, and next steps.</p>
          <div className="pet-energy">
            <Heart size={17} />
            Snack energy: {workspace.pet.energy}/100
          </div>
          <button className="button primary" onClick={() => act('feed')}>
            Feed Max · 5 coins
          </button>
          <p className="small-note">
            Rewards are cosmetic. No purchases with real money. Max never punishes you for resting
            or missing a task.
          </p>
        </section>
        <section className="panel pet-shop">
          <h2>
            <ShoppingBag size={20} />
            Max’s gear shop
          </h2>
          {GEAR.map((item) => (
            <div className="shop-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>
                  {workspace.pet.owned.includes(item.id) ? 'Already yours' : `${item.price} coins`}
                </span>
              </div>
              <button className="button secondary" onClick={() => act(item.id)}>
                {workspace.pet.equipped === item.id
                  ? 'Take off'
                  : workspace.pet.owned.includes(item.id)
                    ? 'Equip'
                    : 'Buy'}
              </button>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
