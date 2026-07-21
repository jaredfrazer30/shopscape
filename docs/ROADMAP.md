# Shopscape — Roadmap & Feature Status

## Implemented

**Engine & world**
- Click-to-walk with A\* pathfinding + line-of-sight path smoothing (non-grid movement).
- Procedural noise terrain (grass, dirt, water, cobble, bridges, sand) rendered to an offscreen buffer.
- Depth-sorted hand-drawn sprites with shadows; animated water; camera follow; minimap + zone labels.
- Four zones: 151 O'Connor Keep, The Data Warehouse, BFCM Battlefield, Fulfillment Fortress.

**Characters & combat**
- Character select (River, Shoppy, Lord Shoppington) with unique art + signature weapon/shield.
- Unique per-character and per-monster attack animations.
- Weapon ratings: Attack, Speed, crit, recoil, and strong/weak vs enemy class (physical/undead/ghost/beast).
- Player health bar (HUD + floating) and health orb.

**Enemies & bosses**
- Bestiary: Abandoned Cart, Cart Goblin, Refund Zombie, Chargeback Wraith, Fraudster, Latency Slime, Deprecated API Skeleton.
- Bosses: The Churn Dragon, Legacy Code Lich, and the multi-phase **Emperor (Jeff Bezos)** (enrage + heal phases).
- Wandering + aggro/chase/leash AI; auto-retaliate.

**Progression & content**
- Gear slots: weapon, shield, head, body, legs, hands. Full Design Bible weapon ladder + armour set.
- Skills panel with the complete Bible skill map; trainable: Checkout Combat, Sourcing, Data Mining.
- Tree chopping (clears path blockers) and rock mining.
- Items with real effects: Health Score Potion, NRR Elixir (overheal), Portal Stone (teleport), Analytics Spyglass (reveal), Sidekick Lamp (companion familiar), Capital/Launchpad/Discount buffs.
- Hover tooltips for every item (description + effects).
- Shop (buy/sell) and Bank (deposit/withdraw) interiors.
- Quest log: "Arm the Rebels" main quest + side quests with completion triggers.
- NPCs: Harley the Hype, the MSM (heals), the Partner, Tobi the Founder (grants the Rust Blade).
- LocalStorage autosave.

## Planned / simplified (next passes)

- **Deeper skills** — actively train the remaining Bible skills (Liquid magic, API/ranged, Fulfillment cooking, Theme crafting, CRO agility, etc.) with their own activities.
- **Bezos endgame** — full 4-phase fight (Buy Box seizure, Blue Origin re-entry AoE, Undercut price-war aura, Hostile Acquisition execute) with the complete loot table.
- **More bosses** — The BFCM Titan (seasonal world boss), QBR Dragon, Sev1 Behemoth random encounter.
- **Armour set bonuses** — Headless (Hydrogen+Oxygen) speed set, Trust Battery good-faith mechanic depth.
- **Crafting/economy** — the Partner forging gear from mined ore + logs; App Building & Theme Building skills.
- **World** — additional zones (The Monolith mega-dungeon, App Store Bazaar, Plus Palace, Snowdevil Cave) and fast-travel waypoints.
- **Polish** — title screen, sound, level-up fanfare, win screen; throttle UI re-render for performance.
