// Declarations of the fight data and of the public API of src/fight/Fight.js.
// See src/fight/README.md for the detailed description of each action.
import type {
	Action,
	AuraType,
	DamagesEffect,
	EmoteBehaviour,
	EmoteList,
	EndBehaviour,
	EntranceEffect,
	EnumInput,
	FighterProperty,
	FighterStatus,
	GotoEffect,
	GroundType,
	LifeEffect,
	NotificationList,
	SkillList,
	SkillType
} from './enums.js';

/**
 * Discriminant of an action: its numeric value in the `Action` enum, or its name.
 */
type ActionOf<K extends keyof typeof Action> = { action: (typeof Action)[K] | K };

/**
 * The visual effect played when a fighter gains or loses life.
 */
export interface LifeFx {
	fx: EnumInput<typeof LifeEffect>;
	/** Amount of fx to show. Used by `Burn` (5 by default). */
	amount?: number;
	/** Size of the fx. Used by `Skull` (1 by default). */
	size?: number;
}

/**
 * Details of a fighter added with the `Add` action.
 */
export interface FighterDetails {
	/** ID of the fighter, used by the subsequent actions. */
	fid: number;
	/** True if the fighter is a dino, false if it is a monster. */
	dino: boolean;
	/** Visual description of the fighter: the dino code for a dino, the monster name for a monster. */
	gfx: string;
	/** Name displayed on entry. */
	name: string;
	/** Side of the fighter. True for left, false for right. */
	side: boolean;
	/** Current life of the fighter. */
	life: number;
	/** Maximum life of the fighter. Defaults to `life`. */
	maxLife?: number;
	/** Properties of the fighter. */
	props: EnumInput<typeof FighterProperty>[];
	/** Scale of the fighter. 1 by default. */
	scale?: number;
	/** How the fighter enters the Scene. Simple drop down if undefined. */
	entrance?: EnumInput<typeof EntranceEffect>;
	/** Animation played with the `Anim` entrance effect. */
	anim?: string;
	/** X position of the fighter. Random if undefined. */
	x?: number;
	/** Y position of the fighter. Random if undefined. */
	y?: number;
	/** If true, hides the energy bar of the fighter. False by default. */
	hideEnergy?: boolean;
}

/**
 * Target of a skill.
 */
export interface SkillTarget {
	/** ID of the targeted fighter. */
	id: number;
	/**
	 * Life gained or lost by the target. `null` makes the target dodge,
	 * undefined means no damage and no number displayed.
	 */
	life?: number | null;
}

/**
 * Parameters of a skill. Which ones are used depends on the skill (see src/fight/README.md).
 */
export interface SkillDetails {
	/** ID of the fighter using the skill, if any. */
	fid?: number;
	/** Targets of the skill. */
	targets?: SkillTarget[];
	/** Fx played by the skill. Used by Projectile, Tremor, JumpAttack, Attach, AttachAnim and HeadOrTail. */
	fx?: string;
	/** Animation used by the skill. Used by Projectile, Anim and Invoc. */
	anim?: string;
	/** Type of the skill. `SkillType` for Shower and Env, `AuraType` for Aura, 0 or 1 for Snow and Heal. */
	type?: EnumInput<typeof SkillType> | EnumInput<typeof AuraType> | number;
	/** Speed of the skill. Used by Projectile and Rafale. */
	speed?: number;
	/** Power of the skill. Used by Rafale and Generate. */
	power?: number;
	/** Radius of the skill. Used by Generate. */
	radius?: number;
	/** Color of the skill. Used by Aura, Snow, Cloud, Focus, Blink and Generate. */
	color?: number;
	/** Alpha of the skill (0 - 100). Used by Blink. */
	alpha?: number;
	/** If true, removes the effect instead of adding it. Used by Env and MudWall. */
	remove?: boolean;
	/** Percentage of the effect (0 - 100). Used by Snow. */
	percent?: number;
	/** Result of the throw. Used by HeadOrTail. */
	ok?: boolean;
}

/**
 * Customization of the castle added with the `AddCastle` action.
 */
export interface CastleDetails {
	/** Current life of the castle. */
	life: number;
	/** Maximum life of the castle. */
	maxLife: number;
	/** If true, adds a pen inside the castle. */
	enclos?: boolean;
	/** Adds ponds in front of the castle. 1-3 changes the color. */
	ground?: number;
	/** Adds a repairman inside the castle. 1-3 changes the helmet and the speed. */
	repair?: number;
	/** Armor of the castle (1-3). */
	armor?: number;
	/** Color of the castle (1-2). */
	color?: number;
	/** If true, the castle is half transparent. */
	invisible?: boolean;
	/** If true, hides the energy bar of the castle. False by default. */
	hideEnergy?: boolean;
}

/**
 * Energy of a fighter, used by the `Energy` and `MaxEnergy` actions.
 */
export interface FighterEnergy {
	fid: number;
	energy: number;
}

/** Adds a fighter to the scene. */
export interface AddAction extends ActionOf<'Add'> {
	fighter: FighterDetails;
}
/** A fighter announces something, most likely the use of a skill. */
export interface AnnounceAction extends ActionOf<'Announce'> {
	fid: number;
	message: string;
}
/** A fighter uses an item. */
export interface ObjectAction extends ActionOf<'Object'> {
	fid: number;
	/** Item name displayed in the announce. */
	name: string;
	/** Asset of the /assets/gfx/items folder, without the extension. */
	item: string;
}
/** A fighter loses life without being attacked (poison, burn, etc). */
export interface LostAction extends ActionOf<'Lost'> {
	fid: number;
	amount: number;
	lifeFx: LifeFx;
}
/** Adds a status to a fighter. */
export interface StatusAction extends ActionOf<'Status'> {
	fid: number;
	status: EnumInput<typeof FighterStatus>;
}
/** Removes a status from a fighter. */
export interface NoStatusAction extends ActionOf<'NoStatus'> {
	fid: number;
	status: EnumInput<typeof FighterStatus>;
}
/** A fighter regenerates life. Resurrects it if it was dead. */
export interface RegenAction extends ActionOf<'Regen'> {
	fid: number;
	amount: number;
	lifeFx: LifeFx;
}
/** A fighter attacks another fighter. */
export interface DamagesAction extends ActionOf<'Damages'> {
	/** ID of the attacking fighter. */
	fid: number;
	/** ID of the targeted fighter. */
	tid: number;
	/** Damages dealt. `null` if the attack is dodged, 0 if it is guarded. */
	damages: number | null;
	lifeFx?: LifeFx;
	effect?: EnumInput<typeof DamagesEffect>;
	/** Fill color of the damage text. 0xffffff by default. */
	textColor?: number;
	/** Scale factor of the damage text. 2 by default. */
	textScaleFactor?: number;
}
/** A skill is used. */
export interface SkillAction extends ActionOf<'Skill'> {
	skill: EnumInput<typeof SkillList>;
	details: SkillDetails;
}
/** A fighter dies. */
export interface DeadAction extends ActionOf<'Dead'> {
	fid: number;
}
/** Moves a fighter in range of another fighter. */
export interface GotoAction extends ActionOf<'Goto'> {
	fid: number;
	tid: number;
	effect?: EnumInput<typeof GotoEffect>;
	/** Colors of the shades created by `GotoEffect.Special`. Pure black if undefined. */
	shadeColor?: { col1?: number; col2?: number };
	/** Saves the starting position of the fighter for a future Return. True by default. */
	saveStartPosition?: boolean;
}
/** Makes a fighter go back to its saved position. */
export interface ReturnAction extends ActionOf<'Return'> {
	fid: number;
}
/** Pauses the history for the given number of frames. Reduces the time bar, if any. */
export interface PauseAction extends ActionOf<'Pause'> {
	time: number;
}
/** Ends the fight. */
export interface FinishAction extends ActionOf<'Finish'> {
	left: EnumInput<typeof EndBehaviour>;
	right: EnumInput<typeof EndBehaviour>;
}
/** Adds a castle to the scene. */
export interface AddCastleAction extends ActionOf<'AddCastle'> {
	castle: CastleDetails;
}
/** Adds a time bar to the scene. */
export interface TimeLimitAction extends ActionOf<'TimeLimit'> {
	/** Total duration of the time bar, in frames. */
	time: number;
	/** If true, the time bar is centered. False by default. */
	center?: boolean;
}
/** A fighter attacks the castle. */
export interface AttackCastleAction extends ActionOf<'AttackCastle'> {
	fid: number;
	damages: number;
}
/** Removes the loading screen. Automatically added at the start of the history if missing. */
export interface DisplayAction extends ActionOf<'Display'> {}
/** Displays a text at the top of the scene and waits for a click. */
export interface TextAction extends ActionOf<'Text'> {
	message: string;
}
/** A fighter speaks and waits for a click. */
export interface TalkAction extends ActionOf<'Talk'> {
	fid: number;
	message: string;
}
/** A fighter escapes the fight. */
export interface EscapeAction extends ActionOf<'Escape'> {
	fid: number;
}
/** Moves a fighter to the given coordinates. */
export interface MoveToAction extends ActionOf<'MoveTo'> {
	fid: number;
	x: number;
	y: number;
}
/** Flips a fighter. */
export interface FlipAction extends ActionOf<'Flip'> {
	fid: number;
}
/** Spawns a toy in the scene. */
export interface SpawnToyAction extends ActionOf<'SpawnToy'> {
	/** Asset of the assets/gfx/toys folder, without the extension. */
	toy: string;
	x?: number;
	y?: number;
	z?: number;
	vx?: number;
	vy?: number;
	vz?: number;
}
/** Destroys every instance of the given toy. */
export interface DestroyToyAction extends ActionOf<'DestroyToy'> {
	toy: string;
}
/** Pauses the history for the given time in milliseconds. Does not change the time bar. */
export interface WaitAction extends ActionOf<'Wait'> {
	time: number;
}
/** Logs a message in the console. */
export interface LogAction extends ActionOf<'Log'> {
	msg: string;
}
/** Plays a notification above a group of fighters. */
export interface NotifyAction extends ActionOf<'Notify'> {
	fids: number[];
	notification: EnumInput<typeof NotificationList>;
}
/** Sets the energy of a group of fighters. */
export interface EnergyAction extends ActionOf<'Energy'> {
	fighters: FighterEnergy[];
}
/** Sets the maximum energy of a group of fighters. */
export interface MaxEnergyAction extends ActionOf<'MaxEnergy'> {
	fighters: FighterEnergy[];
}
/** Shows an emote above a group of fighters. Not compatible with Motion-Twin's fight.swf. */
export interface EmoteAction extends ActionOf<'Emote'> {
	fids: number[];
	emote: EnumInput<typeof EmoteList>;
	behaviour: EnumInput<typeof EmoteBehaviour>;
}
/** Shakes the scene. Not compatible with Motion-Twin's fight.swf. */
export interface ShakeAction extends ActionOf<'Shake'> {
	/** Strength of the shaking. 8 by default. */
	force?: number;
	/** Friction between 0 and 1. 1 makes the shaking permanent. 0.75 by default. */
	frict?: number;
	/** Speed of the shaking. 1 by default. */
	speed?: number;
}

/**
 * Custom stats of a fighter, used by the `Stats` action.
 */
export interface FighterStats {
	fid: number;
	/**
	 * Stats to display in the tooltip of the fighter, keyed by their label (already translated).
	 * They are merged with the previous ones; `null` removes a stat.
	 */
	stats: Record<string, string | number | null>;
}
/** Sets the custom stats displayed in the tooltip of a group of fighters (initiative, speed, etc). Not compatible with Motion-Twin's fight.swf. */
export interface StatsAction extends ActionOf<'Stats'> {
	fighters: FighterStats[];
}

/**
 * State of a fighter at the current instant of the fight, as displayed in its tooltip.
 */
export interface FighterState {
	fid: number;
	name: string;
	/** True for the left side. */
	side: boolean;
	alive: boolean;
	life: number;
	maxLife: number;
	energy: number;
	maxEnergy: number;
	/** Current statuses, as numeric values of the `FighterStatus` enum. */
	status: FighterStatus[];
	/** Custom stats set by the `Stats` action, keyed by their label, in insertion order. */
	stats: Record<string, string | number>;
}

/**
 * A step of the fight history. Discriminated by its `action` property.
 */
export type FightAction =
	| AddAction
	| AnnounceAction
	| ObjectAction
	| LostAction
	| StatusAction
	| NoStatusAction
	| RegenAction
	| DamagesAction
	| SkillAction
	| DeadAction
	| GotoAction
	| ReturnAction
	| PauseAction
	| FinishAction
	| AddCastleAction
	| TimeLimitAction
	| AttackCastleAction
	| DisplayAction
	| TextAction
	| TalkAction
	| EscapeAction
	| MoveToAction
	| FlipAction
	| SpawnToyAction
	| DestroyToyAction
	| WaitAction
	| LogAction
	| NotifyAction
	| EnergyAction
	| MaxEnergyAction
	| EmoteAction
	| ShakeAction
	| StatsAction;

/**
 * Options shared by both ways of creating a fight.
 */
export interface FightOptions {
	/** Language of the settings: 'fr', 'en', 'es' or 'it'. 'en' by default. */
	lang?: string;
	/** If false, disables the settings and plays the fight with its default parameters. True by default. */
	settings?: boolean;
}

/**
 * A fight described with the JSON format of this project.
 */
export interface FightData extends FightOptions {
	/** Background of the scene: a file name of /assets/gfx/background, without the extension. */
	bg: string;
	/** Dojo background drawn over the background, if any. */
	dojo?: string;
	/** Top margin of the walkable area. 0 by default. */
	top?: number;
	/** Bottom margin of the walkable area. 0 by default. */
	bottom?: number;
	/** Right margin of the walkable area. 0 by default. */
	right?: number;
	/** Type of ground of the scene. None by default. */
	ground?: EnumInput<typeof GroundType>;
	/** The steps of the fight. */
	history: FightAction[];
}

/**
 * A fight described with the legacy data fed by Motion-Twin to fight.swf.
 */
export interface LegacyFightData extends FightOptions {
	/** The URI-encoded, Haxe-serialized fight data. */
	legacy_data: string;
}

/**
 * Creates a fight scene rendering the history of a DinoRPG fight.
 * @example
 * const fight = new Fight({ bg: 's_dnv', history: [...] });
 * document.body.appendChild(fight.getDisplay());
 */
export declare class Fight {
	/** Number of frames per second of the fight. */
	static FRAME_RATE: number;
	/** Maximum time in milliseconds spent simulating the fight per browser frame while seeking. */
	static SEEK_FRAME_BUDGET: number;
	/** Maximum number of simulated frames without progress in the history before a seek is aborted. */
	static SEEK_MAX_STALLED_FRAMES: number;

	constructor(data: FightData | LegacyFightData);

	/** Is the fight history currently paused? */
	readonly paused: boolean;
	/** Is the fight currently simulating its history to reach a step requested via `seek()`? */
	readonly seeking: boolean;
	/** Total number of steps in the fight history (including the Display step automatically added if missing). */
	readonly stepCount: number;
	/** Index of the step currently being played. -1 before the fight starts. While seeking, the requested step. */
	readonly currentStep: number;

	/**
	 * @returns The canvas to add to the webpage.
	 */
	getDisplay(): HTMLCanvasElement;
	/**
	 * Updates the fight. Called automatically by the internal timer.
	 */
	update(): void;
	/**
	 * Pauses the fight for the given number of frames.
	 */
	pause(frames: number): void;
	/**
	 * Moves the fight to the given step of its history. Seeking backward replays the history from the start.
	 * Calling `seek` while a seek is running changes its target.
	 * @param step Index of the step, between 0 and `stepCount - 1`.
	 * @returns Resolves once the step is reached.
	 */
	seek(step: number): Promise<void>;
	/**
	 * Gets the state of a fighter at the current instant of the fight: life, energy, statuses and custom stats.
	 * @param fid The id of the fighter.
	 * @returns The state of the fighter, or undefined if it is not in the scene.
	 */
	getFighterState(fid: number): FighterState | undefined;
	/**
	 * Copies the fight data to the clipboard.
	 */
	copyToClipboard(): void;
	/**
	 * @param forceDAData Use the converted data even if legacy data was passed at initialization.
	 * @returns The serialized data to feed Motion-Twin's fight.swf.
	 */
	getMTFormat(forceDAData?: boolean): string;
	/**
	 * @returns The fight data under Motion-Twin's format, as an object.
	 */
	getMTObject(): object;
	/**
	 * Stops the fight and frees its resources.
	 */
	destroy(): void;

	/** Fired when a step starts. The enums of the step are numbers. Not fired for the steps skipped by a seek. */
	set onStepStart(cb: (idx: number, step: FightAction) => void);
	/** Fired when a step ends. The enums of the step are numbers. Not fired for the steps skipped by a seek. */
	set onStepEnd(cb: (idx: number, step: FightAction) => void);
	/** Same as `onStepStart`, with the enums of the step converted to strings. */
	set onStepStartStr(cb: (idx: number, step: FightAction) => void);
	/** Same as `onStepEnd`, with the enums of the step converted to strings. */
	set onStepEndStr(cb: (idx: number, step: FightAction) => void);
	/** Fired when the first action of the fight is played. */
	set onFightStart(cb: () => void);
	/** Fired when the last action of the fight has finished. */
	set onFightEnd(cb: () => void);
	/** Fired when a fighter or its portrait is clicked. Must be set before the fighters are added. */
	set onFighterClick(cb: (fid: number) => void);
	/** Fired when the statuses of a fighter change. The statuses are names of the `FighterStatus` enum. */
	set onStatusChange(cb: (fid: number, status: (keyof typeof FighterStatus)[]) => void);
	/** Fired when the life of a fighter changes. */
	set onLifeChange(cb: (fid: number, life: number) => void);
	/** Fired when a fighter dies. */
	set onDeath(cb: (fid: number) => void);
}
