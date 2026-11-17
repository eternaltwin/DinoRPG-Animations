// @ts-check
// https://github.com/motion-twin/WebGamesArchives/blob/main/DinoRPG/gfx/fight/src/fx/MudWall.hx

import { Fighter } from '../../../Fighter.js';
import { Scene } from '../../../Scene.js';
import { State } from '../../../State.js';
import { Timer } from '../../../Timer.js';

/**
 * The given Fighter creates a mud wall in front of it.
 */
export class FxMudWall extends State {
	/**
	 * Remaining time in milliseconds before the State ends.
	 * @type {number}
	 */
	_remainingTime = 1000;

	/**
	 * The given fighter creates or removes a mudwall.
	 * @param {Scene} scene The Scene where the effect takes place.
	 * @param {() => void} endCall The callback at the end of the State.
	 * @param {Fighter} fighter The target of the attachement.
	 * @param {boolean} remove Should the mudwall be removed or added. False by default.
	 */
	constructor(scene, endCall, fighter, remove = false) {
		super(scene, endCall);
		if (remove) {
			fighter.fxRemoveMudWall();
		} else {
			fighter.fxAddMudWall();
		}
	}

	/**
	 * Ends the State once the remaining time has elapsed.
	 * Uses the Fight's timer instead of a timeout so the State follows the speed of the Fight.
	 * @param {Timer} timer The Fight's timer, containing the elapsed time.
	 */
	update(timer) {
		super.update(timer);
		if (this.toDelete) return;
		this._remainingTime -= timer.deltaTimeMS;
		if (this._remainingTime <= 0) {
			this.end();
		}
	}
}
