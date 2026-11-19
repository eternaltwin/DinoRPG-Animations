// @ts-check
import { Container, Graphics, Text } from 'pixi.js';
import { FighterStatus } from '../../Enums.js';
import { EnumConverter } from '../../data/EnumConverter.js';
import { FONT_SCALE, SCENE_FULL_WIDTH, SCENE_HEIGHT } from '../../IScene.js';

/**
 * Tooltip displaying the current state of the hovered Fighter (life, energy, status and custom stats).
 * Drawn inside the canvas: it is always moved to stay within the Scene.
 */
export class FighterTooltip extends Container {
	static PADDING = 5;
	/** Distance between the pointer and the tooltip. */
	static OFFSET = 12;
	static MAX_WIDTH = 180;

	/**
	 * The hovered Fighter, if any.
	 * @type {any}
	 */
	_fighter;
	/**
	 * Last pointer position, in canvas coordinates.
	 * @type {{x: number, y: number}}
	 */
	_pointer = { x: 0, y: 0 };
	/**
	 * Content currently displayed, to only redraw when the state changes.
	 * @type {string}
	 */
	_content = '';
	/**
	 * Background of the tooltip, resized to its content.
	 * @type {Graphics}
	 */
	_background = new Graphics();
	/**
	 * Text of the tooltip.
	 * @type {Text}
	 */
	_text;
	/**
	 * Function returning the translation of a key.
	 * @type {(key: string) => string}
	 */
	_lang;

	/**
	 * Creates the tooltip, hidden until a fighter is hovered.
	 * @param {(key: string) => string} lang Function returning the translation of a key.
	 */
	constructor(lang) {
		super();
		this._lang = lang;
		this._text = new Text('', {
			fontFamily: 'drpg-verdana',
			fontSize: 9 * FONT_SCALE,
			lineHeight: 12 * FONT_SCALE,
			fill: 0xffffff,
			wordWrap: true,
			wordWrapWidth: (FighterTooltip.MAX_WIDTH - FighterTooltip.PADDING * 2) * FONT_SCALE
		});
		this._text.scale.set(1 / FONT_SCALE);
		this._text.x = this._text.y = FighterTooltip.PADDING;
		this.addChild(this._background);
		this.addChild(this._text);
		// Not interactive, so the pointer goes through and the fighter below stays hovered.
		this.visible = false;
	}

	/**
	 * Shows the tooltip for the given Fighter.
	 * @param {any} fighter The hovered Fighter.
	 * @param {{x: number, y: number}} pointer Pointer position in canvas coordinates.
	 */
	show(fighter, pointer) {
		this._fighter = fighter;
		this.move(fighter, pointer);
		this.update();
	}

	/**
	 * Follows the pointer while it moves over the Fighter.
	 * @param {any} fighter The hovered Fighter.
	 * @param {{x: number, y: number}} pointer Pointer position in canvas coordinates.
	 */
	move(fighter, pointer) {
		if (this._fighter !== fighter) return;
		this._pointer = { x: pointer.x, y: pointer.y };
		this.place();
	}

	/**
	 * Hides the tooltip if it belongs to the given Fighter.
	 * @param {any} fighter The Fighter no longer hovered.
	 */
	hide(fighter) {
		if (this._fighter !== fighter) return;
		this._fighter = undefined;
		this.visible = false;
	}

	/**
	 * Refreshes the content from the current state of the Fighter. Called every frame.
	 */
	update() {
		if (!this._fighter) return;
		if (this._fighter.isDeleted) {
			this.hide(this._fighter);
			return;
		}
		const content = this.buildContent(this._fighter.getState());
		if (content !== this._content) {
			this._content = content;
			this._text.text = content;
			const width = this._text.width + FighterTooltip.PADDING * 2;
			const height = this._text.height + FighterTooltip.PADDING * 2;
			this._background.clear();
			this._background.lineStyle(1, 0x000000, 1);
			this._background.beginFill(0x3d2614, 0.9);
			this._background.drawRoundedRect(0, 0, width, height, 4);
			this._background.endFill();
			this.place();
		}
		this.visible = true;
	}

	/**
	 * Builds the text of the tooltip.
	 * @param {{name: string, life: number, maxLife: number, energy: number, maxEnergy: number, status: number[], stats: {[label: string]: string | number}}} state The state of the Fighter.
	 * @returns {string} The text to display.
	 */
	buildContent(state) {
		const lines = [
			state.name,
			`${this._lang('tooltip_life')} : ${state.life} / ${state.maxLife}`,
			`${this._lang('tooltip_energy')} : ${Math.round(state.energy)} / ${state.maxEnergy}`
		];
		for (const label in state.stats) {
			lines.push(`${label} : ${state.stats[label]}`);
		}
		if (state.status.length > 0) {
			const names = state.status.map(
				(s) => this._lang(`status_${EnumConverter.convert(s, FighterStatus, true)}`) || s
			);
			lines.push(`${this._lang('tooltip_status')} : ${names.join(', ')}`);
		}
		return lines.join('\n');
	}

	/**
	 * Places the tooltip next to the pointer, on the side with the most room, and keeps it inside the canvas.
	 */
	place() {
		if (!this.parent) return;
		const w = this._background.width;
		const h = this._background.height;
		let x = this._pointer.x + FighterTooltip.OFFSET;
		if (x + w > SCENE_FULL_WIDTH) x = this._pointer.x - FighterTooltip.OFFSET - w;
		let y = this._pointer.y + FighterTooltip.OFFSET;
		if (y + h > SCENE_HEIGHT) y = this._pointer.y - FighterTooltip.OFFSET - h;
		const global = {
			x: Math.max(0, Math.min(x, SCENE_FULL_WIDTH - w)),
			y: Math.max(0, Math.min(y, SCENE_HEIGHT - h))
		};
		// The tooltip layer is offset from the canvas (columns, screen shake), so convert to its coordinates.
		this.position.copyFrom(this.parent.toLocal(global));
	}
}
