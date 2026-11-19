// Declarations of the public API of the animated entities (src/display/Animator.js, src/ADino.js, src/sdino.js, src/dino.js, src/smonster.js).
import type { Container, Rectangle } from 'pixi.js';

/**
 * Size of the collision box of an entity, in pixels.
 */
export interface Collider {
	width: number;
	height: number;
}

/**
 * Options shared by every animated entity.
 */
export interface AnimatorOptions {
	/**
	 * If true, the entity registers itself to the shared PixiJS ticker so its animation plays automatically.
	 * Set to false to drive the animation yourself with `update()`. True by default.
	 */
	autoUpdate?: boolean;
	/**
	 * If false, the entity does not play its animation and stays at frame 0 of the "stand" animation. False by default.
	 */
	pflag?: boolean;
	/**
	 * Scale of the entity. Needed to load the SVG at the correct resolution. 1 by default.
	 */
	scale?: number;
	/**
	 * Direction the entity faces. Truthy to face right, falsy to face left.
	 */
	flip?: boolean | number;
	/**
	 * If false, the shadow of the entity is not drawn. True by default.
	 */
	shadow?: boolean;
	/**
	 * If true, the entity is darkened.
	 */
	dark?: boolean;
}

/**
 * Options to instantiate a dino (`sdino` or `dino`).
 */
export interface DinoOptions extends AnimatorOptions {
	/**
	 * The code describing the dino (species, parts and colors), e.g. `'09T1Yt9wqq4Rx000'`.
	 */
	data: string;
	/**
	 * Amount of damages taken by the dino. Only visible on the big format. 0 by default.
	 */
	damages?: number;
	/**
	 * If true, the dino is displayed as frozen.
	 */
	congel?: boolean;
}

/**
 * Options to instantiate a monster (`smonster`).
 */
export interface MonsterOptions extends AnimatorOptions {
	/**
	 * Name of the monster to instantiate, e.g. `'goblin'`. Unknown names display an error placeholder.
	 */
	type: string;
}

/**
 * Base class of every animated entity. A PixiJS Container which plays the animations converted from the original Flash files.
 *
 * This class is not exported at runtime: it is only available as a type.
 */
export declare class Animator extends Container {
	/**
	 * Is the animation currently playing?
	 */
	playing: boolean;
	/**
	 * True if the current animation has reached its end.
	 */
	readonly hasAnimEnded: boolean;
	/**
	 * True once every texture of the entity is loaded.
	 */
	readonly loaded: boolean;
	/**
	 * Registers a callback fired once every texture of the entity is loaded.
	 * If the entity is already loaded, the callback fires immediately.
	 */
	set onLoad(cb: () => void);

	/**
	 * @param autoUpdate If true, the Animator registers itself to the shared PixiJS ticker. True by default.
	 */
	constructor(autoUpdate?: boolean);

	/**
	 * Registers a callback which can be triggered by the animations.
	 * @param name Name of the callback.
	 * @param callback Function invoked with the animation triggering the callback and its arguments.
	 */
	registerCallback(name: string, callback: (animation: unknown, args: unknown[]) => void): void;
	/**
	 * Clears a callback registered with `registerCallback`.
	 * @param name Name of the callback to clear.
	 */
	clearCallback(name: string): void;
	/**
	 * Darkens the entity.
	 */
	darken(): void;
	/**
	 * Flips the entity.
	 * @param side Direction the entity has to face. Truthy to face right, falsy to face left.
	 */
	flip(side: boolean | number): void;
	/**
	 * Plays the given animation. Falls back to "stand" if the animation does not exist.
	 * @param key Name of the animation to play, e.g. `'stand'`, `'run'`, `'attack'`.
	 * @param unpauseIfSame If true, unpause the animation if it is already the current one. True by default.
	 */
	playAnim(key: string, unpauseIfSame?: boolean): void;
	/**
	 * Advances the animation. Called automatically if `autoUpdate` is true.
	 * @param deltaTime Elapsed time since the last frame, in milliseconds.
	 * @param reverse If true, the animation goes backward. False by default.
	 */
	update(deltaTime: number, reverse?: boolean): void;
	/**
	 * Sets the current animation at the given frame.
	 * @param idx The frame index. Will be moduloed by the animation length.
	 * @param resetTimer If true, reset the timer. True by default.
	 */
	setFrame(idx: number, resetTimer?: boolean): void;
	/**
	 * Resumes the animation, optionally from the given frame.
	 * @param idx The frame to start from.
	 */
	play(idx?: number): void;
	/**
	 * @returns The number of frames of the current animation.
	 */
	getCurrentAnimationLength(): number;

	/**
	 * Renders the entity into an `<img>` element.
	 * Useful to display the entity without instantiating a WebGL context every time.
	 * @param callback Receives the resulting image.
	 * @param width Width of the image. Needs both width and height to be taken into account.
	 * @param height Height of the image. Needs width to be defined.
	 * @param x Offset x position based on the center of the image.
	 * @param y Offset y position based on the center of the image.
	 */
	toImage(callback: (image: HTMLImageElement) => void, width?: number, height?: number, x?: number, y?: number): void;
	/**
	 * Renders the entity into a data URL.
	 * @param callback Receives the resulting data URL.
	 * @param width Width of the image. Needs both width and height to be taken into account.
	 * @param height Height of the image. Needs width to be defined.
	 * @param x Offset x position based on the center of the image.
	 * @param y Offset y position based on the center of the image.
	 * @param format Format of the output. 'image/png' by default.
	 */
	toRawImage(
		callback: (dataUrl: string) => void,
		width?: number,
		height?: number,
		x?: number,
		y?: number,
		format?: string
	): void;
	/**
	 * Renders every frame of the current animation into a `<div class="DinoRPG-Animation">` containing one `<img>` per frame.
	 * @param callback Receives the resulting div.
	 * @param width Width of the image. Needs both width and height to be taken into account.
	 * @param height Height of the image. Needs width to be defined.
	 * @param x Offset x position based on the center of the image.
	 * @param y Offset y position based on the center of the image.
	 */
	toAnimation(callback: (div: HTMLDivElement) => void, width?: number, height?: number, x?: number, y?: number): void;
	/**
	 * Renders every frame of the current animation into data URLs, in order.
	 * @param callback Receives the resulting data URLs.
	 * @param width Width of the image. Needs both width and height to be taken into account.
	 * @param height Height of the image. Needs width to be defined.
	 * @param x Offset x position based on the center of the image.
	 * @param y Offset y position based on the center of the image.
	 * @param format Format of the output. 'image/png' by default.
	 */
	toRawAnimation(
		callback: (dataUrls: string[]) => void,
		width?: number,
		height?: number,
		x?: number,
		y?: number,
		format?: string
	): void;
}

/**
 * Base class of `sdino` and `dino`.
 *
 * This class is not exported at runtime: it is only available as a type.
 */
export declare class ADino extends Animator {
	/**
	 * Colors of the default palette.
	 */
	static DEFAULT_COLORS: string[];
	/**
	 * Default palette used when the dino has none.
	 */
	static DEFAULT_PALETTE: string[][];

	/**
	 * @param data Options describing the dino.
	 * @param big If true, the dino is instantiated in its big static format, otherwise in its small animated format.
	 */
	constructor(data: DinoOptions, big: boolean);

	/**
	 * Converts the ASCII code of a character of [0-9A-Za-z] into a number between 0 and 61, or 63 otherwise.
	 * @param n The ASCII code of a character.
	 */
	decode62(n: number): number;
	/**
	 * (Re)initializes the dino.
	 * @param data The code describing the dino.
	 * @param damages Amount of damages taken by the dino.
	 * @param pflag If false, the dino does not play its animation. False by default.
	 * @param scale Scale of the dino. 1 by default.
	 * @returns True if the dino has loaded correctly, false otherwise.
	 */
	init(data: string, damages?: number, pflag?: boolean, scale?: number): boolean;
	/**
	 * Displays the dino as frozen.
	 */
	congel(): void;
	/**
	 * Recreates the chk code needed to validate the parameters of Motion-Twin's sdino.swf file.
	 */
	getChkCode(): number;
}

/**
 * Conversion of the sdino.swf file of the web game "Dino RPG".
 * Instantiates a dino in its small animated format from the code describing it.
 *
 * To display still pictures, prefer generating an image with `toImage`/`toRawImage`:
 * filling a webpage with WebGL canvas will send it straight to hell.
 * @example new sdino({ data: '09T1Yt9wqq4Rx000', pflag: true })
 */
export declare class sdino extends ADino {
	/**
	 * The collider of the dino.
	 */
	readonly collider: Collider;

	constructor(data: DinoOptions);
}

/**
 * Conversion of the dino.swf file of the web game "Dino RPG".
 * Instantiates a dino in its big static format from the code describing it.
 *
 * To display still pictures, prefer generating an image with `toImage`/`toRawImage`:
 * filling a webpage with WebGL canvas will send it straight to hell.
 * @example new dino({ data: '09T1Yt9wqq4Rx000' })
 */
export declare class dino extends ADino {
	constructor(data: DinoOptions);

	/**
	 * Gets the bounds of the view of the big dino. Used to position the texture in the Slots.
	 * @returns The bounds of the view sprite, or an empty rectangle if no view sprite is found.
	 */
	getView(): Rectangle;
}

/**
 * Conversion of the smonster.swf file of the web game "Dino RPG".
 * Instantiates a monster from its name.
 * @example new smonster({ type: 'goupi', pflag: true })
 */
export declare class smonster extends Animator {
	/**
	 * The collider of the monster.
	 */
	readonly collider: Collider;

	constructor(data: MonsterOptions);

	/**
	 * (Re)initializes the monster.
	 * @param type Name of the monster.
	 * @param pflag If false, the monster does not play its animation. False by default.
	 * @param scale Scale of the monster. 1 by default.
	 */
	init(type: string, pflag?: boolean, scale?: number): void;
	/**
	 * Gets the shadow type of the monster: Fire if the monster emits light, Normal otherwise.
	 */
	getShadeType(): number;
}
