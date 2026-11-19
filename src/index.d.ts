// Type declarations of the package entry point (src/index.js).
export { Application, Graphics, Container, Texture, Matrix, Renderer, autoDetectRenderer } from 'pixi.js';

export { sdino, dino, smonster } from './types/display.js';
export type { Animator, ADino, AnimatorOptions, DinoOptions, MonsterOptions, Collider } from './types/display.js';

export { Fight } from './types/fight.js';
export type * from './types/fight.js';

export * from './types/enums.js';
