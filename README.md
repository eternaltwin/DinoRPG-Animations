# DinoRPG: Animations

This project is a recreation of the [Dino-RPG](http://www.dinorpg.com/) game Flash files into Javacript using [PixiJS](https://pixijs.com/).

The compiled script combines the Flash files fight.swf, gfx.swf, sdino.swf, dino.swf, and smonsters.swf.

You can see the final product used on my other repository hosting the legacy version of the Paradino Cinema: [Dino-RPG: Legacy Paradino](https://github.com/Gerardufoin/DinoRPG-Legacy-Paradino).

The documentation for the fight format can be found in the fight's [README](https://github.com/Gerardufoin/DinoRPG-Animations/tree/main/src/fight)

The following pages allow to test the result for the different parts of the project:

-   [sdino.swf](https://gerardufoin.github.io/DinoRPG-Animations/public/sdino.html): The small animated version of the Dinoz.
-   [dino.swf](https://gerardufoin.github.io/DinoRPG-Animations/public/dino.html): The big static portrait of the Dinoz.
-   [smonsters.swf](https://gerardufoin.github.io/DinoRPG-Animations/public/smonster.html): All the monsters which can be fought in the game.
-   [fight.swf](https://gerardufoin.github.io/DinoRPG-Animations/public/fight.html): A few example of the final product with all parts combined.

A comparison of the Dinoz' display with their Flash equivalent can be found [here](https://gerardufoin.github.io/DinoRPG-Animations/public/compare.html), but do note that you will need a plugin like [Ruffle](https://ruffle.rs/) to be able to run the Flash files.

## TypeScript

The package ships its type declarations (`src/index.d.ts`): the entities, the `Fight` class, the fight data and the enums.

```typescript
import { Action, EntranceEffect, Fight, FightAction, sdino } from '@eternaltwin/dinorpg_animations';

const dinoz = new sdino({ data: '09T1Yt9wqq4Rx000', pflag: true });

// The history is a union discriminated on `action`. Enums accept their value or their name.
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
	{ action: 'Talk', fid: 0, message: 'Hello!' }
];
const fight = new Fight({ bg: 's_dnv', history });
```

The declarations are written by hand and must be updated with the public API. `npm run types:check` checks them against `test/types/usage.ts`.

## Development

To run the project locally, run `npm start`.

## Eternal-Twin

If you are interested in the original game, you can found a recreation of it using this project over at Eternal-Twin: [DinoRPG](https://dinorpg.eternaltwin.org/).

## License

Following the license of [Motion-Twin WebGamesArchives](https://github.com/motion-twin/WebGamesArchives), this work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
