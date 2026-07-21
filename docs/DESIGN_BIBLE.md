# Shopify Scape — Design Bible

A RuneScape clone set in the Shopify world. The mission — **arm the rebels** — is the merchant's fight against the Empire's Everything Store. This document is the canonical content catalog for items, weapons, armor, enemies, skills, bosses, and lore.

Rarity/tier ladder mirrors the plan ladder: **Trial → Basic → Shopify → Advanced → Plus**.

## Core reskin (systems → lore)

| RuneScape system | In Shopify Scape |
|---|---|
| HP | Merchant Health Score |
| Mana | Liquid |
| Gold / XP | GMV (Gross Merchandise Value) |
| Death | Churn |
| Reputation | Trust Battery |
| Stamina / rate cap | Leaky Bucket (API rate limit) |
| Fast travel | Digital by Design (remote-first) |
| Enemy faction | The Empire (the Everything Store) |
| Your faction | The Rebels (merchants & entrepreneurs) |

## Playable characters

Each hero comes with two exclusive starting items — a signature weapon and a signature shield.

- **River** — Long blue hair; an internal-Shopify-tool, agent-mage vibe. Calm, precise, always three queries ahead.
  - *Water Staff*: ranged magic that soaks and slows a whole group before they reach you.
  - *Blast Shield*: absorbs one big burst hit and vents the overflow as splash damage.
- **Shoppy** — The green shopping-bag mascot with arms and legs. Eager, bouncy, the friendly face of every first sale.
  - *White Gloves*: fast, flurrying "white-glove service" jabs that stun and disarm.
  - *Money Shield*: a wall of GMV coins; blocked hits convert into gold.
- **Lord Shoppington** — A fancy shopping bag with a monocle and top hat. Refined, enterprise-grade, quietly loaded.
  - *Fancy Cane*: elegant melee with immense reach; parries on the backswing.
  - *Trillion Dollar Shield*: the realm's ultimate bulwark, plated in a trillion in cumulative GMV.

## Weapons

| Name | Type | Tier | Effect / lore |
|---|---|---|---|
| Snowdevil Snowboard | Melee · 2H | Trial | The origin blade — Shopify began as Snowdevil, a snowboard shop. |
| Rusty REST Sword | Melee | Trial | Deprecated. Occasionally throws a "sunset warning" and does nothing that turn. |
| Buy Button Bludgeon | Melee | Basic | One-click smash. Simple and reliable; clears trash mobs fast. |
| Barcode Blaster | Ranged | Basic | POS scanner rifle. *beep* = hit. Jams on unrecognized SKUs. |
| Discount Dagger | Melee | Shopify | Applies "Markdown" bleed — but erodes your own margin (self-damage). |
| Liquid Staff | Magic | Shopify | Channels Liquid to cast templated spells. Scales with Magic level. |
| GraphQL Query Lance | Ranged | Advanced | Asks for exactly the fields it needs — precise, high single-target damage. |
| Webhook Whip | Melee / Ranged | Advanced | Fires on every event. Great crowd control; occasionally double-fires. |
| Leaky Bucket | Ranged · Thrown | Advanced | Rate-limited: exceed N throws and you get 429'd (self-stun). |
| Shop Pay Saber | Melee | Plus | Highest-converting blade. +crit, +attack speed. One tap, instant kill. |
| Checkout Cleaver | Melee · 2H | Plus | The sacred conversion blade. Extensible — slot in mods at the forge. |
| POS Go Wand | Ranged | Plus | Handheld all-in-one. Taps to pay, zaps to slay. |
| The Monolith | Melee · 2H | Plus | A colossal greatsword forged from Shopify Core. Devastating, slow. |
| Founder's Rust Blade | Melee | Plus | Tobi's blade, forged in Rust. Blazing fast, memory-safe. Drops in Snowdevil Cave. |

## Armor & sets

| Name | Slot | Tier | Effect / lore |
|---|---|---|---|
| Dawn Robes | Body | Trial | The default starter theme. Clean, minimal — everyone begins here. |
| Two-Factor Shield | Offhand | Basic | Blocks the first hit every fight. Requires a one-turn code to equip. |
| SSL Padlock Aegis | Offhand | Shopify | The little green lock. Reflects "insecure connection" attacks. |
| Liquid Leather | Body | Shopify | Flexible, templatable armor — recolors to match any theme. |
| Fraud Filter Faceguard | Head | Advanced | Auto-flags incoming Fraudster hits before they land. |
| GDPR Gauntlets | Hands | Advanced | Forces enemies to request consent before looting you. |
| Hydrogen Helm + Oxygen Greaves | Head / Legs | Plus | Headless set bonus: detach your frontend for a big speed boost. |
| Polaris Plate | Body | Plus | Design-system platebody. Grants +Navigation; you never get lost. |
| Trust Battery Chestplate | Body | Plus | Regenerates armor over time while you act in good faith. |
| Uptime Aegis (99.99%) | Offhand | Plus | Almost never fails — 52 minutes of downtime per year. |
| Merchant of the Year Crown | Head | Plus | +GMV find, boosted drop rate, and every NPC bows. |

## Items, currencies & consumables

| Name | Type | Effect |
|---|---|---|
| GMV Gold | Currency | The realm's coin. Everything is priced in it. |
| Shop Cash | Premium currency | Earned at checkout, spent anywhere. |
| Gift Card | Tradeable note | Bearer currency — never expires. |
| Health Score Potion | Heal | Instantly restores HP. Your Health Score IS your HP bar. |
| NRR Elixir | Regen | Heals over time; can push max HP past 100% (net expansion). |
| Capital Chest | Risky buff | A Capital loan. Big power spike now; repay from future GMV. |
| Discount Code Scroll | Buff | Summons a horde of customers — but shrinks your margin. |
| Launchpad Rocket | Timed buff | Schedule a flash sale: a massive buff window that auto-reverts. |
| Editions Booklet | Ability unlock | Drops every Summer & Winter — unlocks 100+ abilities. |
| Metafield Pouch | Storage | Custom bag slots — store anything you can define. |
| Bulk Editor Gloves | Utility | Apply one change to a thousand items at once. |
| Tophat | Utility | Preview any change safely before it ships. |
| Spin-Up Portal Stone | Teleport | Fresh dev environment / instant fast-travel. |
| Analytics Spyglass | Recon | Reveals enemy stats, funnel drop-off, and hidden loot. |
| Sidekick Lamp | Companion | Summons your AI familiar to fight and auto-loot beside you. |

## Bestiary

| Enemy | Threat | Habitat | Notes |
|---|---|---|---|
| Abandoned Cart | Low | Checkout Cathedral | Wanders full of loot. Recover it to claim the goods. |
| Cart Goblin | Low | Everywhere | Snatches items mid-purchase and bolts. |
| Latency Slime | Low | The Monolith | Slows your attack speed. Brutal in a swarm. |
| 404 Phantom | Low | Off the map | A page that isn't there. Strikes once, then vanishes. |
| Refund Zombie | Medium | Merch Table | Rises to reclaim a sale — reverses your last GMV gain. |
| Fraudster | Medium | App Store Bazaar | Disguised as a customer; Fraud Filter reveals it. |
| Deprecated API Skeleton | Medium | The Data Warehouse | Old REST endpoints. Immune to modern gear — needs a migration. |
| Sneaker Bot Swarm | High | BFCM Battlefield | Overwhelming numbers during drops. Bot Protection AoE clears them. |
| 429 Rate-Limit Golem | High | The Monolith | Stuns you if you attack too fast. Respect the leaky bucket. |
| Chargeback Wraith | High | Checkout Cathedral | Undoes a won fight and drains gold days later. |
| Merge Conflict Beast | High | Partner's Guild | Two heads that refuse to agree. Resolve line by line. |
| Legacy Code Lich | Boss | Monolith depths | Ancient, powerful, load-bearing. Nobody remembers who summoned it. |

## Bosses

- **Jeff Bezos, Emperor of the Everything Store** — Supreme final boss. Floats above the Fulfillment Fortress in chrome power-armor, summoning Prime drones and one-click armies. Weak only to fiercely loyal customers and brands he can't undercut.
- **The Zos, Warden of the Everything Store** — Bezos's steel enforcer; guards the door to the Emperor.
- **The BFCM Titan** — Traffic-surge incarnate. A once-a-year world-boss raid for record loot.
- **The QBR Dragon** — Demands your numbers. Breathes spreadsheets; beaten with a clean pipeline and honest forecast.
- **The Churn Reaper** — Roams merchant villages lowering Health Scores. Beaten with NRR Elixirs, Success Plans, and an attentive MSM.
- **Sev1 Behemoth** — Spawns unannounced and pages the on-call raid. Down it before the pager stops screaming.

### Featured fight — the Emperor (4 phases)

| Phase | HP | Signature attacks | Key mechanic |
|---|---|---|---|
| 1 · The Everything Store | 100–70% | One-Click Barrage · Prime Drone Swarm · Buy Box Slam | Seizes the Buy Box — reclaim it in 10s or your damage is halved. |
| 2 · Blue Origin Ascent | 70–40% | Rocket Launch · Re-Entry Meteor · Fulfillment Titan adds | Duck behind a Shield during the re-entry telegraph or eat massive AoE. |
| 3 · Undercut Meltdown | 40–10% | Undercut Nova · Marketplace Mirror · Chargeback Volley | A price-war aura drains your GMV every tick — burn him down fast. |
| 4 · The Long Game | 10–0% | Hostile Acquisition (execute) · Infinite Runway (heal) | A full Trust Battery blocks the instant-kill. Empty battery = game over. |

**Loot:** Mountain of GMV & Prime Crown (guaranteed), Rocket Boots & Chrome Gauntlet (rare), The Everything Ledger & Monocle of Market Domination (epic), Emperor's Power-Armor (legendary).

## Allies & NPCs

- **Shoppy · River · Lord Shoppington** — the playable trio.
- **Tobi the Founder** — hidden quest giver in the Snowdevil Cave; rewards the Founder's Rust Blade.
- **Harley the Hype** — endless entrepreneurship quests and motivational shouts.
- **The MSM** (Merchant Success Manager) — healer class; boosts Health Score & NRR, writes your Success Plan.
- **The Partner** — agency smith; forges custom gear (apps & themes) for GMV.
- **Sidekick** — your AI familiar companion pet.

## Skills

| RuneScape skill | Shopify skill | What you do |
|---|---|---|
| Attack / Strength / Defence | Checkout Combat | Close the conversion in melee fights. |
| Magic | Liquid | Cast templated spells that scale with level. |
| Ranged | API (GraphQL / REST) | Attack at range with precise queries. |
| Prayer | Trust Battery | Buffs that charge with good faith. |
| Mining | Data Mining | Mine GMV ore and metrics in the Data Warehouse. |
| Smithing | App Building | Forge apps from the data you mined. |
| Fishing | Lead Gen | Catch leads and MSQLs from the stream. |
| Cooking | Fulfillment | Turn raw orders into shipped, happy customers. |
| Crafting | Theme Building | Craft storefronts customers love. |
| Runecrafting | Liquid Crafting | Craft the runes (Liquid) that power Magic. |
| Herblore | Merchandising | Mix discounts, bundles, and potions. |
| Agility | CRO | Parkour the conversion funnel without dropping off. |
| Thieving | Growth / SEO | Nab organic traffic from rival kingdoms. |
| Slayer | Fraud Slayer | Complete assigned fraud-fighting tasks. |
| Farming | Retention | Grow your merchant base — farm NRR. |
| Construction | Store Setup | Build and upgrade your shop and HQ. |
| Hunter | Prospecting | Hunt MSQLs in the wild. |
| Summoning | Integrations | Summon app familiars to fight beside you. |
| Fletching | Marketing | Craft campaigns — fletch your ad arrows. |
| Firemaking | Launches / Hype | Light up product drops. |

## World & locations

Onboarding Island · 151 O'Connor Keep (Ottawa) · Snowdevil Cave · Checkout Cathedral · Liquid Falls · The Data Warehouse (BigQuery mines) · App Store Bazaar & Theme Store Village · The Monolith (Shopify Core) · Plus Palace · The Empire's Fulfillment Fortress · BFCM Battlefield · Digital-by-Design fast-travel waypoints.

## Quests

- **The First Sale** — ring up your first order to leave Onboarding Island.
- **Arm the Rebels** — the main questline: unite merchants against the Empire.
- **The Founder's Keyboard** — find Tobi, build a mechanical keyboard, earn the Rust Blade.
- **Slay the Churn Reaper** — restore a merchant village's Health Scores.
- **Survive BFCM** — endure the weekend-long traffic raid.
- **The Great Deprecation** — migrate the realm off REST and clear the Skeletons.
- **Charge the Trust Battery** — earn an NPC's trust to unlock Plus-tier gear.
