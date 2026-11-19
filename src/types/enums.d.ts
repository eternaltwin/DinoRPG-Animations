// Declarations of the enums defined in src/fight/Enums.js.
// Every enum is exposed both as a value (the mapping object) and as a type (the union of its numeric values).

/**
 * Any value accepted for an enum in the fight data: either its numeric value or the name of its key.
 * The fight converts the names to numbers on its own.
 * @example EnumInput<typeof Action> accepts `Action.Add`, `0` and `'Add'`.
 */
export type EnumInput<E extends Record<string, number>> = E[keyof E] | Extract<keyof E, string>;

/**
 * The different actions available in the fight history.
 */
export declare const Action: {
	readonly Add: 0;
	readonly Announce: 1;
	readonly Object: 2;
	readonly Lost: 3;
	readonly Status: 4;
	readonly NoStatus: 5;
	readonly Regen: 6;
	readonly Damages: 7;
	readonly Skill: 8;
	readonly Dead: 9;
	readonly Goto: 10;
	readonly Return: 11;
	readonly Pause: 12;
	readonly Finish: 13;
	readonly AddCastle: 14;
	readonly TimeLimit: 15;
	readonly AttackCastle: 16;
	readonly Display: 17;
	readonly Text: 18;
	readonly Talk: 19;
	readonly Escape: 20;
	readonly MoveTo: 21;
	readonly Flip: 22;
	readonly SpawnToy: 23;
	readonly DestroyToy: 24;
	readonly Wait: 25;
	readonly Log: 26;
	readonly Notify: 27;
	readonly Energy: 28;
	readonly MaxEnergy: 29;
	readonly Emote: 30;
	readonly Shake: 31;
};
export type Action = (typeof Action)[keyof typeof Action];

/**
 * Type of ground in the Scene. Decides which particles are emitted when the fighters walk or land.
 */
export declare const GroundType: {
	readonly None: 0;
	readonly Dirt: 1;
	readonly Water: 2;
	readonly Rock: 3;
};
export type GroundType = (typeof GroundType)[keyof typeof GroundType];

/**
 * The possible properties of a Fighter.
 */
export declare const FighterProperty: {
	readonly Boss: 0;
	readonly Static: 1;
	readonly GroundOnly: 2;
	readonly Dark: 3;
	readonly Nothing: 4;
};
export type FighterProperty = (typeof FighterProperty)[keyof typeof FighterProperty];

/**
 * Possible effects happening when a Fighter gains or loses health.
 */
export declare const LifeEffect: {
	readonly Normal: 0;
	/** No visual. */
	readonly Object: 1;
	readonly Skull: 2;
	readonly Acid: 3;
	/** No visual. */
	readonly Poison: 4;
	readonly Heal: 5;
	readonly Explode: 6;
	readonly Burn: 7;
	readonly Fire: 8;
	readonly Wood: 9;
	readonly Water: 10;
	readonly Lightning: 11;
	readonly Air: 12;
	/** No visual. */
	readonly Gold: 13;
	/** Debug. */
	readonly Todo: 14;
};
export type LifeEffect = (typeof LifeEffect)[keyof typeof LifeEffect];

/**
 * Possible statuses for a Fighter.
 */
export declare const FighterStatus: {
	readonly Sleep: 0;
	readonly Flames: 1;
	readonly Intang: 2;
	readonly Fly: 3;
	readonly Slow: 4;
	readonly Quick: 5;
	readonly Stoned: 6;
	readonly Shield: 7;
	readonly Bless: 8;
	readonly Poison: 9;
	readonly Heal: 10;
	readonly Burn: 11;
	readonly MonoElt: 12;
	readonly Dazzled: 13;
	readonly Stun: 14;
};
export type FighterStatus = (typeof FighterStatus)[keyof typeof FighterStatus];

/**
 * Entrance effect of a Fighter:
 * - Stand/Jump is a normal entrance.
 * - Run makes the Fighter run in from its side.
 * - Grow makes the Fighter grows from 0% to 100%.
 * - Fall makes the Fighter fall from the top of the scene.
 * - Ground makes the Fighter emerge from the ground.
 * - Anim makes the Fighter do a custom animation.
 */
export declare const EntranceEffect: {
	readonly Stand: 0;
	readonly Jump: 1;
	readonly Run: 2;
	readonly Grow: 3;
	readonly Fall: 4;
	readonly Ground: 5;
	readonly Anim: 6;
};
export type EntranceEffect = (typeof EntranceEffect)[keyof typeof EntranceEffect];

/**
 * Type of action a Fighter will take while attacking another Fighter.
 */
export declare const DamagesEffect: {
	readonly Normal: 0;
	readonly Back: 1;
	readonly Counter: 2;
	readonly Drop: 3;
	readonly Eject: 4;
	readonly FlyCancel: 5;
	readonly IntangCancel: 6;
	readonly IntangBreak: 7;
	readonly Missed: 8;
};
export type DamagesEffect = (typeof DamagesEffect)[keyof typeof DamagesEffect];

/**
 * List of the existing skills.
 */
export declare const SkillList: {
	readonly Todo: 0;
	readonly Fireball: 1;
	readonly Blow: 2;
	readonly Lava: 3;
	readonly Meteor: 4;
	readonly Vigne: 5;
	readonly WaterCanon: 6;
	readonly Shower: 7;
	readonly LevitRay: 8;
	readonly Lightning: 9;
	readonly Crepuscule: 10;
	readonly Mistral: 11;
	readonly Tornade: 12;
	readonly Disc: 13;
	readonly Hole: 14;
	readonly Ice: 15;
	readonly Projectile: 16;
	readonly Tremor: 17;
	readonly JumpAttack: 18;
	readonly ChainLightning: 19;
	readonly Heal: 20;
	readonly Charge: 21;
	readonly Anim: 22;
	readonly Invoc: 23;
	readonly Sylfide: 24;
	readonly Rafale: 25;
	readonly Deluge: 26;
	readonly Env: 27;
	readonly Aura: 28;
	readonly Snow: 29;
	readonly Swamp: 30;
	readonly Cloud: 31;
	readonly Focus: 32;
	/** Unused, here for legacy reasons. */
	readonly Default: 33;
	readonly Attach: 34;
	readonly AttachAnim: 35;
	readonly Hypnose: 36;
	readonly Ray: 37;
	readonly Speed: 38;
	readonly HeadOrTail: 39;
	readonly Resurrect: 40;
	readonly MudWall: 41;
	readonly Blink: 42;
	readonly Generate: 43;
	readonly Corruption: 44;
	readonly DivineLight: 45;
};
export type SkillList = (typeof SkillList)[keyof typeof SkillList];

/**
 * Types of skills (elements).
 */
export declare const SkillType: {
	readonly Fire: 0;
	readonly Wood: 1;
	readonly Water: 2;
	readonly Lightning: 3;
	readonly Air: 4;
};
export type SkillType = (typeof SkillType)[keyof typeof SkillType];

/**
 * Types of auras for the Aura skill.
 */
export declare const AuraType: {
	readonly Spiral: 0;
	readonly Line: 1;
	readonly Burst: 2;
	readonly Detonate: 3;
	readonly Light: 4;
};
export type AuraType = (typeof AuraType)[keyof typeof AuraType];

/**
 * How the Fighter moves toward its target:
 * - Normal is a normal run.
 * - Special creates shades as the fighter moves.
 * - Over makes the Fighter jump above the target. Removes the flying status.
 */
export declare const GotoEffect: {
	readonly Normal: 0;
	readonly Special: 1;
	readonly Over: 2;
	readonly Todo: 3;
};
export type GotoEffect = (typeof GotoEffect)[keyof typeof GotoEffect];

/**
 * Behavior of the Fighters at the end of the fight:
 * - Stand: Stand in place and do nothing.
 * - Run: Run across the scene and exit on the other side.
 * - Escape: Run away on the Fighter's side.
 * - Guard: Guard something.
 */
export declare const EndBehaviour: {
	readonly Stand: 0;
	readonly Run: 1;
	readonly Escape: 2;
	readonly Guard: 3;
};
export type EndBehaviour = (typeof EndBehaviour)[keyof typeof EndBehaviour];

/**
 * The possible notifications for the Notify action.
 */
export declare const NotificationList: {
	readonly Slow: 0;
	readonly Quick: 1;
	readonly Silence: 2;
	readonly Sharingan: 3;
	readonly NoUse: 4;
	readonly Down: 5;
	readonly Up: 6;
	readonly Fire: 7;
	readonly Wood: 8;
	readonly Water: 9;
	readonly Thunder: 10;
	readonly Air: 11;
	readonly InitUp: 12;
	readonly InitDown: 13;
	readonly Snake: 14;
	readonly Strong: 15;
	readonly Shield: 16;
	readonly MonoElt: 17;
	readonly Todo: 18;
};
export type NotificationList = (typeof NotificationList)[keyof typeof NotificationList];

/**
 * Types of emote available.
 */
export declare const EmoteList: {
	readonly Surprise: 0;
	readonly Question: 1;
	readonly Angry: 2;
	readonly Love: 3;
};
export type EmoteList = (typeof EmoteList)[keyof typeof EmoteList];

/**
 * Types of behaviour for the emotes.
 */
export declare const EmoteBehaviour: {
	readonly Float: 0;
	readonly Bounce: 1;
	readonly Grow: 2;
};
export type EmoteBehaviour = (typeof EmoteBehaviour)[keyof typeof EmoteBehaviour];
