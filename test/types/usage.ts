// Type-level tests of the public API. Checked by `npm run types:check`, never executed.
import {
	Action,
	ADino,
	Animator,
	Container,
	DamagesEffect,
	dino,
	EntranceEffect,
	Fight,
	FightAction,
	FightData,
	FighterStatus,
	GroundType,
	sdino,
	SkillList,
	smonster
} from '@eternaltwin/dinorpg_animations';

// Dinos and monsters are PixiJS containers.
const small = new sdino({ data: '09T1Yt9wqq4Rx000', pflag: true, flip: 1 });
const big = new dino({ data: '09T1Yt9wqq4Rx000', damages: 10, congel: true });
const monster = new smonster({ type: 'goupi', pflag: true });
const stage = new Container();
stage.addChild(small, big, monster);

small.flip(true);
small.playAnim('run');
small.onLoad = () => {};
const collider: { width: number; height: number } = monster.collider;
big.getView().width satisfies number;
big.toRawImage((dataUrl) => dataUrl satisfies string, 100, 100, 0, 0, 'image/webp');
small.toAnimation((div) => div satisfies HTMLDivElement);
small.toRawAnimation((frames) => frames satisfies string[]);
small.toImage((img) => img satisfies HTMLImageElement);

const animators: Animator[] = [small, big, monster];
const dinos: ADino[] = [small, big];

// @ts-expect-error The dino code is mandatory.
new sdino({ pflag: true });
// @ts-expect-error The monster type is mandatory.
new smonster({});

// Enums are exported as values and as types.
const status: FighterStatus = FighterStatus.Poison;
const ground: GroundType = GroundType.Water;

// The fight history is a discriminated union on `action`, accepting enum values or enum names.
const history: FightAction[] = [
	{
		action: Action.Add,
		fighter: {
			fid: 0,
			dino: true,
			gfx: '09T1Yt9wqq4Rx000',
			name: 'Dragon Jr',
			side: true,
			life: 100,
			props: [],
			entrance: EntranceEffect.Run
		}
	},
	{
		action: 'Add',
		fighter: { fid: 1, dino: false, gfx: 'goupi', name: 'Goupi', side: false, life: 30, props: ['Static'] }
	},
	{ action: Action.Display },
	{ action: Action.Damages, fid: 0, tid: 1, damages: null, effect: DamagesEffect.Back },
	{ action: 'Skill', skill: SkillList.Fireball, details: { fid: 0, targets: [{ id: 1, life: -12 }] } },
	{ action: Action.Status, fid: 1, status: 'Poison' },
	{ action: Action.Lost, fid: 1, amount: 3, lifeFx: { fx: 'Poison' } },
	{ action: Action.Finish, left: 'Run', right: 'Escape' },
	// @ts-expect-error A Damages action needs a target.
	{ action: Action.Damages, fid: 0, damages: 3 },
	// @ts-expect-error Unknown enum name.
	{ action: Action.Status, fid: 1, status: 'Sick' }
];

const data: FightData = { bg: 's_dnv', ground: 'Dirt', history, lang: 'fr' };
const fight = new Fight(data);
new Fight({ legacy_data: '...' });
// @ts-expect-error A fight needs either a history or legacy data.
new Fight({ bg: 's_dnv' });

document.body.appendChild(fight.getDisplay());
fight.onFightEnd = () => {};
fight.onStepStart = (idx, step) => {
	if (step.action === Action.Talk) {
		step.message satisfies string;
	}
};
fight.onStatusChange = (fid, statuses) => statuses satisfies (keyof typeof FighterStatus)[];
fight.seek(fight.stepCount - 1).then(() => fight.currentStep satisfies number);

export { collider, animators, dinos, status, ground };
