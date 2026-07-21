# Shopscape

**RuneScape, but make it commerce.** A browser-based, top-down RPG set in the Shopify universe — battle the beasts of commerce, train merchant skills, gear up, and ultimately *arm the rebels* against the Emperor of the Everything Store.

Built as a single, dependency-free HTML5 canvas game so it runs anywhere and deploys cleanly as a static site (e.g. a Quick site).

![Shopscape](docs/screenshots/placeholder.md)

## Play

No build step, no dependencies. Just open the game:

```bash
open index.html          # macOS
# or double-click index.html, or serve the folder:
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Controls

- **Click** the ground to walk (A\* pathfinding routes around water, trees, rocks, and buildings).
- **Click a monster** to fight, a **Product Tree** to chop, a **rock** to mine, a **crate** to gather, or the **Bank/Shop** to enter.
- **Inventory panel** — click an item to equip/use it; hover for a description + effects.
- Progress **auto-saves** to your browser. "Start a new store" wipes the save and re-opens character select.

## Characters

Pick one hero at the start — each has a signature weapon + shield and a unique attack animation:

| Hero | Weapon | Shield |
|------|--------|--------|
| **River** — long blue hair, agent-mage | Water Staff | Blast Shield |
| **Shoppy** — the green shopping-bag mascot | White Gloves | Money Shield |
| **Lord Shoppington** — bag with monocle + top hat | Fancy Cane | Trillion Dollar Shield |

## Systems

- **Combat** with weapon ratings — each weapon has Attack, Speed, and strengths/weaknesses vs enemy classes (physical / undead / ghost / beast).
- **Skills** — the full Design Bible skill map. Currently trainable: **Checkout Combat**, **Sourcing** (chopping), **Data Mining**.
- **Gear** — equip weapon, shield, head, body, legs, and hands. Armour adds defence; some pieces regenerate health or boost GMV find.
- **Wandering + aggro enemies** that chase, attack, and leash back home. Bosses: the **Churn Dragon**, **Legacy Code Lich**, and the multi-phase **Emperor (Jeff Bezos)** endgame fight.
- **Quests** — a main quest ("Arm the Rebels") plus side quests with live completion tracking.
- **Shop & Bank** interiors — buy/sell gear and consumables, deposit/withdraw to the vault.
- **Items** — Health Score Potions, NRR Elixir (overheal), Spin-Up Portal Stone (teleport), Analytics Spyglass (reveal enemy stats), Sidekick Lamp (AI familiar), and buff consumables.

## Project structure

```
shopscape/
├── index.html            # entry point (markup only)
├── src/
│   ├── shopscape.css      # all styles
│   └── shopscape.js       # all game logic (engine, world, combat, UI)
├── docs/
│   ├── DESIGN_BIBLE.md    # the full lore & content catalog
│   ├── ROADMAP.md         # what's built vs. planned
│   └── screenshots/
├── assets/                # (art is procedurally drawn on canvas — no binary assets yet)
├── LICENSE
└── README.md
```

## Tech notes

- Pure vanilla JS + Canvas 2D. No frameworks, no build.
- All sprites are drawn procedurally (vector shapes), so there are no image assets to manage.
- Terrain is generated with seeded value-noise into an offscreen buffer for an organic, non-grid look.

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full feature status and what's next.
