# Infobulle des combattants

## Intention

Au survol d'un combattant (ou de son portrait), afficher son état à l'instant T du combat : vie, énergie, statuts, et les stats que dinorpg reconstruit dans son transpiler (initiative, vitesse, etc.). Visible par tous les joueurs : ces valeurs sont calculables, elles ne donnent pas d'avantage.

- **Objectif** : tous les consommateurs du paquet (ed-ui, démo, Paradino) ont l'infobulle sans rien coder ; dinorpg n'a qu'à ajouter des actions `Stats` à l'historique.
- **Non-objectifs** : calculer l'initiative ou la vitesse dans le paquet ; infobulle HTML débordant du canvas ; mise en forme riche (icônes, colonnes).
- **Anti-objectif** : une infobulle fausse après un `seek` ou qui gêne la lecture du combat.

## Approches

- **A. Infobulle PixiJS dans le canvas, données via l'historique** — retenue. Rien à coder côté consommateur, cohérente avec `seek`, mais limitée aux 488×300.
- B. Le paquet expose survol + état, ed-ui dessine en HTML — écartée : chaque consommateur doit coder l'infobulle.
- C. Infobulle HTML gérée par le paquet, débordant du canvas — écartée pour l'instant (choix de l'utilisateur : rester dans le canvas).

L'essai (spike) validé par l'utilisateur sert de base : le rendu actuel convient.

## Conception

- **Action `Stats` (32)** : `{ action: 'Stats', fighters: [{ fid, stats: { [libellé]: string | number | null } }] }`. Les valeurs fusionnent avec les précédentes, `null` retire une stat. Les libellés sont envoyés déjà traduits par le transpiler et affichés tels quels, dans l'ordre d'insertion.
- **Contenu** : nom, `Vie : x / max`, `Énergie : x / max`, les stats personnalisées, puis les statuts (traduits dans `Lang.js` : fr et en, repli sur en).
- **Survol** : sur le corps du combattant (zone rectangulaire de la taille de son collider, pour éviter le clignotement entre ses morceaux) et sur son portrait. Le survol ne modifie pas le comportement du clic (`onFighterClick`).
- **Placement** : à côté du pointeur, du côté où il y a la place, toujours contenue dans le canvas ; non interactive (le pointeur la traverse). Rafraîchie à chaque frame, donc toujours à jour, y compris après `seek`.
- **API** : `fight.getFighterState(fid)` renvoie `{ fid, name, side, alive, life, maxLife, energy, maxEnergy, status, stats }`, ou `undefined`.
- **Conversion Motion-Twin** : `Stats` n'existe pas dans fight.swf ; `getMTFormat()` l'ignore silencieusement (aujourd'hui une action inconnue est sautée avec une erreur console ; `Stats` étant purement informative, elle est sautée sans erreur).
- **Livrables** : types (`StatsAction`, `FighterState`, `getFighterState`), test de types, section dans `src/fight/README.md` (« New Actions »), exemple « Tooltip » de la démo.

## Laissé au constructeur

- Style exact (couleurs, police, marges) : repris de l'essai.
- Le bug existant de `Scene.removeFighter` (filtre qui retire tous les combattants) est hors périmètre, à traiter séparément.
