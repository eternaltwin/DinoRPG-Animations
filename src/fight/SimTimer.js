// @ts-check

/**
 * Fake Timer used to simulate the fight without rendering it, at a fixed frame rate.
 * Exposes the same values as the Timer class read by the States and the Scene.
 * Used when seeking a specific step of the fight history.
 */
export class SimTimer {
	/**
	 * Number of expected frames elapsed since the last update. Always 1 to keep the simulation stable.
	 * @type {number}
	 */
	tmod = 1;
	/**
	 * A frame of the expected frame rate always elapses between two simulated updates.
	 * @type {boolean}
	 */
	frameElapsed = true;
	/**
	 * Elapsed time between two simulated frames in milliseconds.
	 * @type {number}
	 */
	deltaTimeMS;

	/**
	 * Creates a simulation timer running at the given frame rate.
	 * @param {number} fps The expected frame rate of the simulation.
	 */
	constructor(fps) {
		this.deltaTimeMS = 1000 / fps;
	}

	/**
	 * Elapsed time between two simulated frames in seconds.
	 * @type {number}
	 */
	get deltaTimeS() {
		return this.deltaTimeMS / 1000;
	}
}
