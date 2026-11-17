// @ts-check
// https://github.com/motion-twin/WebGamesArchives/tree/main/DinoRPG/gfx/fight
// https://github.com/motion-twin/WebGamesArchives/blob/main/DinoRPG/gfx/fight/src/Main.hx
// enums: https://github.com/motion-twin/WebGamesArchives/blob/main/DinoRPG/src/com/Fight.hx
import { Renderer } from 'pixi.js';
import { HaxeUnserializer } from './data/HaxeUnserializer.js';
import { HaxeSerializer } from './data/HaxeSerializer.js';
import { DAConverter } from './data/DAConverter.js';
import { MTConverter } from './data/MTConverter.js';
import { Scene } from './Scene.js';
import { History } from './History.js';
import { Timer } from './Timer.js';
import { SimTimer } from './SimTimer.js';
import { PreloadData } from '../display/PreloadData.js';
import { Settings } from './settings/Settings.js';
import { EnumConverter } from './data/EnumConverter.js';

/**
 * Create a fight scene to render the history of a fight for DinoRPG.
 *
 * Can be created using the legacy fight data used by Motion Twin, or the adapted JSON version used for this project.
 */
export class Fight {
	static FRAME_RATE = 32;
	/**
	 * Maximum time in milliseconds spent simulating the fight per browser frame while seeking.
	 * @type {number}
	 */
	static SEEK_FRAME_BUDGET = 25;
	/**
	 * Maximum number of simulated frames without any progress in the history before a seek is aborted.
	 * Prevents infinite loops if a step never ends (for example a casting waiting for a dead fighter).
	 * @type {number}
	 */
	static SEEK_MAX_STALLED_FRAMES = Fight.FRAME_RATE * 120;

	/**
	 * The fight settings, allowing to manage the different fight options.
	 * @type {Settings}
	 */
	_settings;
	/**
	 * Timer managing the time elapsed between two frame to make it fit an expected framerate.
	 * @type {Timer}
	 */
	_timer;
	/**
	 * PixiJS renderer for the fight. Will render the instantiated Scene object.
	 * @type {Renderer}
	 */
	_renderer;
	/**
	 * PixiJS container containing all the object to be displayed during the fight.
	 * @type {Scene}
	 */
	_scene;
	/**
	 * Unserialized legacy data if any was passed at intialization.
	 * @type {object}
	 */
	_legacyData;
	/**
	 * Data of the current fight under DA format.
	 * @type {object}
	 */
	_data;

	/**
	 * If waiting time is above 0, the game is paused until the given time has elapsed.
	 * @type {number}
	 */
	_waitingTime = 0;

	/**
	 * Is the current fight history paused?
	 * @type {boolean}
	 */
	get paused() {
		return this._waitingTime > 0;
	}

	/**
	 * Fight history manager.
	 * @type {History}
	 */
	_history;

	/**
	 * Reference to the load timeout, to be destroyed if the Fight is immediately destroyed.
	 * @type {any}
	 */
	_loadTimeout;

	/**
	 * True once the loading delay is over and the history started playing.
	 * @type {boolean}
	 */
	_started = false;
	/**
	 * True once destroy() has been called.
	 * @type {boolean}
	 */
	_destroyed = false;
	/**
	 * Step to seek once the fight starts, if seek() was called before the start.
	 * @type {number | undefined}
	 */
	_pendingSeek;
	/**
	 * Latest step requested via seek(), consumed by the running seek.
	 * @type {number | undefined}
	 */
	_seekTarget;
	/**
	 * Promise of the seek currently running, if any.
	 * @type {Promise<void> | undefined}
	 */
	_seekPromise;
	/**
	 * Timer used to simulate the fight without rendering while seeking.
	 * @type {SimTimer}
	 */
	_simTimer = new SimTimer(Fight.FRAME_RATE);

	/**
	 * Is the fight currently simulating its history to reach a step requested via seek()?
	 * @type {boolean}
	 */
	get seeking() {
		return this._seekPromise !== undefined;
	}

	/**
	 * Total number of steps in the fight history (including the Display step automatically added if missing).
	 * @type {number}
	 */
	get stepCount() {
		return this._history.length;
	}

	/**
	 * Index of the step currently being played. -1 before the fight starts.
	 * While seeking, returns the requested step.
	 * @type {number}
	 */
	get currentStep() {
		if (this._seekTarget !== undefined) return this._seekTarget;
		if (this._pendingSeek !== undefined) return this._pendingSeek;
		return Math.min(this._history.currentStep, this._history.length - 1);
	}

	/**
	 * Creates a fight based on the data parameter.
	 * @param {{legacy_data?: string, bg?: string, history?: Array, lang?: string, settings?: boolean}} data Object containing the data describing a fight.
	 */
	constructor(data) {
		if (data.legacy_data) {
			this._legacyData = new HaxeUnserializer(decodeURIComponent(data.legacy_data)).unserialize();
			this._data = DAConverter.convert(this._legacyData);
		} else {
			this._data = EnumConverter.convertData(data, false);
		}

		this._renderer = new Renderer({
			backgroundColor: 0xfce3bb,
			width: 488,
			height: 300
		});

		this._settings = new Settings(data.lang ?? 'en', !(data.settings ?? true));
		this._settings.copyFight = () => {
			this.copyToClipboard();
		};

		this._buildScene();

		this._timer = new Timer(Fight.FRAME_RATE, this._settings);
		this._timer.add(() => {
			// While seeking, the simulation is driven by the seek loop and the last frame stays on screen.
			if (this.seeking) return;
			this.update();
			this._renderer.render(this._scene);
		});
		this._timer.start();

		// Preload data and then starts the history.
		PreloadData.preload(this._renderer).then(() => {
			// "Fake" loading delay to leave the time for the player to understand what is happening and for some resources to load.
			this._loadTimeout = setTimeout(() => {
				this._loadTimeout = undefined;
				this._started = true;
				this._settings.onFightStart();
				if (this._pendingSeek !== undefined) {
					const target = this._pendingSeek;
					this._pendingSeek = undefined;
					this.seek(target);
				} else {
					this._history.playNext();
				}
			}, 1000);
		});
	}

	/**
	 * Creates the Scene and the History from the fight data, replacing the current ones if any.
	 */
	_buildScene() {
		if (this._history) {
			this._history.destroy();
		}
		if (this._scene) {
			this._scene.destroy({
				children: true,
				// Textures are shared between the Scenes and other instances.
				texture: false,
				baseTexture: false
			});
		}
		// The hitbox callbacks reference the objects of the previous Scene.
		this._settings._showHitboxCallbacks = [];
		this._waitingTime = 0;

		this._scene = new Scene(
			this._data.bg,
			this._data.dojo,
			{
				top: this._data.top ?? 0,
				bottom: this._data.bottom ?? 0,
				right: this._data.right ?? 0
			},
			this._data.ground ?? 0,
			this._renderer,
			this._settings
		);
		this._history = new History(this, this._scene, this._data.history);
	}

	/**
	 * Updates the States and the Scene.
	 * If waiting time is above 0, decrease it and play the next history action once finish.
	 * @param {Timer | SimTimer} timer The timer giving the elapsed time. The Fight's timer by default.
	 */
	update(timer = this._timer) {
		const t = /** @type {Timer} */ (timer);
		this._history.updateStates(t);
		this._scene.update(t);
		if (this._waitingTime > 0) {
			this._waitingTime -= t.tmod;
			if (this._waitingTime <= 0) {
				this._waitingTime = 0;
				this._history.nextAction();
			}
		}
	}

	/**
	 * Moves the fight to the given step of its history.
	 *
	 * The fight is simulated without rendering until the given step is about to be played, then resumes normally from this step.
	 * Seeking backward rebuilds the Scene and replays the history from the start.
	 * Texts, speeches and auto pauses are skipped during the simulation.
	 * The step callbacks (onStepStart, onStepEnd, onFightEnd) are not invoked for the skipped steps.
	 *
	 * The result is not pixel-perfect compared to a normal playback (random positions and particles),
	 * but the state of the fight (life, status, deaths, castle, time bar) is the same.
	 *
	 * Calling seek while a seek is running changes its target; the returned promise resolves once the last target is reached.
	 * @param {number} step The index of the step to go to, between 0 and stepCount - 1.
	 * @returns {Promise<void>} Resolves once the step is reached.
	 */
	seek(step) {
		if (this._destroyed) return Promise.resolve();
		const target = Math.max(0, Math.min(Math.floor(step), this.stepCount - 1));
		if (!this._started) {
			this._pendingSeek = target;
			return Promise.resolve();
		}
		this._seekTarget = target;
		if (!this._seekPromise) {
			this._seekPromise = this._runSeek().finally(() => {
				this._seekPromise = undefined;
			});
		}
		return this._seekPromise;
	}

	/**
	 * Simulates the fight until the last requested seek target is reached.
	 * @returns {Promise<void>}
	 */
	async _runSeek() {
		this._settings.muted = true;
		try {
			while (this._seekTarget !== undefined && !this._destroyed) {
				const target = this._seekTarget;
				if (target <= this._history.currentStep) {
					// Going back (or restarting the current step): replay the history from the start.
					this._buildScene();
					this._history.haltAt(target);
					this._history.playNext();
				} else {
					this._history.haltAt(target);
				}
				this._scene.fastForward = true;
				// Release the current click wait (auto pause, text, speech) if any.
				this._scene.triggerClick();

				let lastStep = this._history.currentStep;
				let stalledFrames = 0;
				while (!this._history.halted && this._seekTarget === target && !this._destroyed) {
					const start = performance.now();
					while (
						!this._history.halted &&
						performance.now() - start < Fight.SEEK_FRAME_BUDGET &&
						stalledFrames < Fight.SEEK_MAX_STALLED_FRAMES
					) {
						this.update(this._simTimer);
						if (this._history.currentStep !== lastStep) {
							lastStep = this._history.currentStep;
							stalledFrames = 0;
						} else {
							stalledFrames++;
						}
					}
					if (stalledFrames >= Fight.SEEK_MAX_STALLED_FRAMES) {
						console.warn(`Fight.seek: step ${lastStep} never ended, seek to step ${target} aborted.`);
						break;
					}
					if (!this._history.halted) {
						await Fight._nextFrame();
					}
				}
				if (this._destroyed) break;
				this._scene.fastForward = false;
				if (this._seekTarget === target) {
					this._seekTarget = undefined;
					this._settings.muted = false;
					this._history.resume();
				}
			}
		} finally {
			this._seekTarget = undefined;
			this._settings.muted = false;
			if (!this._destroyed) {
				this._scene.fastForward = false;
			}
		}
	}

	/**
	 * Waits for the next browser frame.
	 * @returns {Promise<void>}
	 */
	static _nextFrame() {
		return new Promise((resolve) => {
			if (typeof requestAnimationFrame === 'function') {
				requestAnimationFrame(() => resolve());
			} else {
				setTimeout(resolve, 0);
			}
		});
	}

	/**
	 * Gets the fight canvas to add to a webpage.
	 * @returns {import("pixi.js").ICanvas} The canvas instance to add to the webpage.
	 */
	getDisplay() {
		return this._renderer.view;
	}

	/**
	 * Pauses the action for the given number of frames.
	 * @param {number} frames The number of frames the pause has to last.
	 */
	pause(frames) {
		this._waitingTime = frames;
	}

	/**
	 * Copies the fight to the user clipboard.
	 */
	copyToClipboard() {
		navigator.clipboard.writeText(JSON.stringify(EnumConverter.convertData(this._data, true), undefined, '\t'));
	}

	/**
	 * Gets the fight data under MT format.
	 * @param {boolean} forceDAData Force the process to use the converted data as base, even if legacy data was passed at init.
	 * @returns {string} The serialized data to feed fight.swf.
	 */
	getMTFormat(forceDAData = false) {
		if (this._legacyData && !forceDAData) {
			return encodeURIComponent(new HaxeSerializer(this._legacyData).serialize());
		}
		return encodeURIComponent(new HaxeSerializer(MTConverter.convert(this._data)).serialize());
	}

	/**
	 * Gets the unserialized fight data under MT format.
	 * @returns {object} The fight data under MT format as an object.
	 */
	getMTObject() {
		if (this._legacyData) {
			return this._legacyData;
		}
		return MTConverter.convert(this._data);
	}

	/**
	 * Destroys the fight display and clean the memory.
	 * Call if you need to remove the Fight from the webpage without reloading.
	 * The Fight object is rendered useless after this method is called and will have to be discarded.
	 */
	destroy() {
		this._destroyed = true;
		// Destroy the timer and renderer after the timer finishes its last rendering.
		this._timer.add(() => {
			if (this._loadTimeout) {
				clearTimeout(this._loadTimeout);
				this._loadTimeout = undefined;
			}
			this._timer.destroy();
			this._renderer.destroy();
			this._scene.destroy({
				children: true,
				// Textures cannot be destroyed in case another instance is running or an instance is started before the current one is fully destroyed.
				texture: false,
				baseTexture: false
			});
		});
	}

	/**
	 * Registers a callback firing every time a new step is started in the fight history.
	 * Will give the step index and object as argument. The object enums are sent as numbers.
	 * @param {((idx: number, step: object) => {})} cb The callback to invoke on a new step.
	 */
	set onStepStart(cb) {
		this._settings.onStepStart = cb;
	}

	/**
	 * Registers a callback firing every time a step ends in the fight history.
	 * Will give the step index and object as argument. The object enums are sent as numbers.
	 * @param {((idx: number, step: object) => {})} cb The callback to invoke when a step ends.
	 */
	set onStepEnd(cb) {
		this._settings.onStepEnd = cb;
	}

	/**
	 * Registers a callback firing every time a new step is started in the fight history.
	 * Will give the step index and object as argument. The object enums are sent as strings.
	 * @param {((idx: number, step: object) => {})} cb The callback to invoke on a new step.
	 */
	set onStepStartStr(cb) {
		this._settings.onStepStartStr = cb;
	}

	/**
	 * Registers a callback firing every time a step ends in the fight history.
	 * Will give the step index and object as argument. The object enums are sent as strings.
	 * @param {((idx: number, step: object) => {})} cb The callback to invoke when a step ends.
	 */
	set onStepEndStr(cb) {
		this._settings.onStepEndStr = cb;
	}

	/**
	 * Registers a callback firing once the fight starts.
	 * @param {(() => {})} cb The callback to invoke when the fight starts.
	 */
	set onFightStart(cb) {
		this._settings.onFightStart = cb;
	}

	/**
	 * Registers a callback firing once the fight ends.
	 * @param {(() => {})} cb The callback to invoke when the fight ends.
	 */
	set onFightEnd(cb) {
		this._settings.onFightEnd = cb;
	}

	/**
	 * Registers a callback firing every time a fighter or its portrait is clicked.
	 * Will give the fighter idx as parameter.
	 * @param {((idx: number) => {})} cb The callback to invoke when a fighter is clicked.
	 */
	set onFighterClick(cb) {
		this._settings.onFighterClick = cb;
	}

	/**
	 * Registers a callback firing every time the status of a fighter changes.
	 * Will give the fighter idx and the list of its status as parameters.
	 * @param {((idx: number, status: string[]) => {})} cb The callback to invoke when there is a change of status on a fighter.
	 */
	set onStatusChange(cb) {
		this._settings.onStatusChange = cb;
	}

	/**
	 * Registers a callback firing every time the life of a fighter changes.
	 * Will give the fighter and its current life as parameters.
	 * @param {((idx: number, life: number) => {})} cb The callback to invoke when the life of a fighter changes.
	 */
	set onLifeChange(cb) {
		this._settings.onLifeChange = cb;
	}

	/**
	 * Registers a callback firing every time a fighter dies.
	 * @param {((idx: number) => {})} cb The callback to invoke when a fighter dies.
	 */
	set onDeath(cb) {
		this._settings.onDeath = cb;
	}
}
