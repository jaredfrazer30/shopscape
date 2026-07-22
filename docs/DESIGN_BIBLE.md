# Shopify Scape — Design Bible

A RuneScape clone set in the Shopify world — **now a playable HTML5 game**. The mission — *arm the rebels* — is the merchant's fight against the Empire's Everything Store. This document is the canonical content catalog; entries are marked **(in game)** when shipped or **(planned)** when they're still design/lore.

Tier ladder mirrors the plan ladder: **Trial → Basic → Shopify → Advanced → Plus**.

## What's shipped (v1)

Playable single-file HTML5 canvas game (also in `src/` split): 4 heroes, a 96×76 world of 8 regions, click-to-walk A\* pathfinding, wandering/aggro enemies, ranged & AoE weapons, fishing/cooking/mining/tree-chopping, campfires, day–night lighting + particles, worn-armor visuals, title screen + character select, quests, shops, the bank ("The Vault"), Hack Days HQ crafting, an MMO-style chat, a dog companion (Scout), and the SDP Data Restriction curse.

## Core reskin (systems → lore)

| RuneScape system | In Shopify Scape |
|---|---|
| HP | Merchant Health Score |
| Mana | Liquid |
| Gold / XP | GMV (Gross Merchandise Value) |
| Death | Churn |
| Reputation | Trust Battery |
| Stamina / rate cap | Leaky Bucket (API rate limit) |
| Fast travel | Digital by Design (Spin-Up Portal Stone) |
| Enemy faction | The Empire (the Everything Store) |
| Your faction | The Rebels (merchants & entrepreneurs) |

## Playable heroes (in game)

Pick one at character select; each has a signature weapon + shield and a unique attack animation.

- **River** — Our resident all-knowing Shopify expert; long blue hair. **Water Staff** (ranged — hurls blue water orbs) + **Blast Shield**.
- **Shoppy** — The tried-and-true green shopping-bag mascot, a true OG. **White Gloves** (fast melee) + **Money Shield**.
- **Lord Shoppington** — A fancy bag in monocle & top hat; a trillion reasons to love him. **Fancy Cane** (reach melee) + **Trillion Dollar Shield**.
- **Sidekick** — Your cheerful AI familiar (purple eyemask, Robin Hood look) who whispers growth tips and gently asks if you've considered improving your Conversion Rate. **Longbow** (ranged arrows) + **SnowDevil Shield**.

## Weapons

**In game:** Water Staff (ranged), White Gloves, Fancy Cane, Longbow (ranged), Buy Button Blade (Churn Dragon drop), Snowdevil Snowboard, Buy Button Bludgeon, Barcode Blaster, Discount Dagger (recoil), GraphQL Query Lance, Webhook Whip, Checkout Cleaver, The Monolith, Shop Pay Saber (+crit), Founder's Rust Blade (Tobi / Squash 25 Bugs), **Slop Grenade** (ranged AoE), **Molotov Sloptail** (ranged AoE).

Weapons carry real stats: Attack, Speed, optional crit/recoil, and **strong/weak vs enemy class** (physical / undead / ghost / beast).

**Planned/lore:** Rusty REST Sword, Liquid Staff, Leaky Bucket, POS Go Wand, Chrome Gauntlet.

## Armor (in game)

Equip slots: **weapon, shield, head, body, legs, hands, ring**. Worn gear now visually appears on the character (pauldrons/belt, greaves, cap, glove).

| Name | Slot | Tier | Notes |
|---|---|---|---|
| Dawn Robes | Body | Trial | Starter theme. |
| Liquid Leather | Body | Shopify | Templatable armour. |
| Polaris Plate | Body | Plus | Design-system platebody. |
| Trust Battery Chestplate | Body | Plus | Regenerates Health Score over time. |
| Emperor's Power-Armor | Body | Plus | Best in slot; prised from the Emperor. |
| Fraud Filter Faceguard | Head | Advanced | Anti-Fraudster. |
| Prime Crown / Merchant of the Year Crown | Head | Plus | +GMV find. |
| GDPR Gauntlets | Hands | Advanced | Consent-grade. |
| Oxygen Greaves | Legs | Plus | Headless-set speed. |
| **Touch Grass Hat** | Head | Shopify | Supply Store (Toronto) exclusive. |
| **Rebellion Jersey** | Body | Advanced | Supply Store exclusive (white + black stripe). |
| **GymShark Hoodie** | Body | Advanced | Supply Store exclusive (grey). |
| **Alo Yoga Pants** | Legs | Advanced | Supply Store exclusive (green). |
| **Mejuri Ring** | Ring | Plus | Supply Store exclusive; +GMV find. |

## Items (in game)

- **Currencies:** GMV Gold, Shop Cash, Gift Card.
- **Consumables:** Health Score Potion, NRR Elixir (overheals), **Ham** (heal drop), Cooked Fish.
- **Fishing/cooking:** Fishing Rod (from Harley), Raw Fish, Merchant Fire (from the CSM), campfires.
- **Resources:** Raw Goods, Product Logs, GMV Ore.
- **Rare drops:** Summit Swag (~1/20, 100 GMV), Ham (~1/25), Scope Change (~1/100, 250 GMV).
- **Cursed:** Bad Data (from the swamp — cooking/eating it triggers the curse).
- **Utility/buffs:** Capital Chest, Discount Code Scroll, Launchpad Rocket, Analytics Spyglass (reveal), Spin-Up Portal Stone (teleport home), Sidekick Lamp (summons a 30s familiar), Editions Booklet.

## Bestiary

| Enemy | Threat | Region | Notes |
|---|---|---|---|
| Abandoned Cart | Low | everywhere | Physical. |
| Cart Goblin | Low | BFCM / city | Physical. |
| Bug | Low | 151 O'Connor Keep | Fast respawn; squash 25 for Tobi. |
| Latency Slime | Low | Data Warehouse / snow | Beast. |
| Refund Zombie | Medium | BFCM / city | Undead. |
| Fraudster | Medium | city / fortress | Ghost. |
| Deprecated API Skeleton | Medium | Data Warehouse / Monolith | Undead. |
| Chargeback Wraith | High | Data Warehouse / snow | Ghost. |
| Openclaw | Medium | New York City | Lobster; spawns when you talk to Claude. |
| The Churn Dragon | Boss | Fulfillment Fortress | Beast; drops the Buy Button Blade. |
| Legacy Code Lich | Boss | The Monolith | Undead; drops The Monolith greatsword. |
| Jeff Bezos, Emperor of the Everything Store | Boss | Fulfillment Fortress | Endgame; enrage + self-heal phases; drops Emperor's Power-Armor. |

**Planned/lore:** 404 Phantom, Sneaker Bot Swarm, 429 Rate-Limit Golem, Merge Conflict Beast, The Zos, The BFCM Titan, The QBR Dragon, Sev1 Behemoth.

## NPCs (in game)

- **Harley the Hype** — hypeman; gives you the **Fishing Rod**.
- **Banker** — guards The Vault.
- **The CSM** — heals your Health Score to full and hands out **Merchant Fire**.
- **The Partner** — agency smith (crafting flavor).
- **Tobi the Founder** — gives the **Squash 25 Bugs** quest; rewards the Founder's Rust Blade.
- **The RevOps Oracle** — warns about the cursed swamp ("use governed data, brave ranger").
- **Claude** — orange-asterisk AI mascot in NYC; sycophantic dialogue; talking to him spawns an Openclaw.
- **Scout** — brown dog with a green bandana; earned from *Scout's Love*, permanently follows and fights.
- **NYC Citizens** — ambient roaming crowd.

## Skills

The full RuneScape→Shopify skill map is catalogued (Checkout Combat, Liquid, API, Trust Battery, Data Mining, App Building, Lead Gen, Fulfillment, Theme Building, Liquid Crafting, Merchandising, CRO, Growth/SEO, Fraud Slayer, Retention, Store Setup, Prospecting, Integrations, Marketing, Launches/Hype).

**Trainable now:** **Checkout Combat** (fighting), **Sourcing** (crates & trees), **Data Mining** (rocks), **Fishing** (water).

## World & regions (in game)

96×76 world, 8 regions linked by a bridged road grid:

- **151 O'Connor Keep** — grassy town, buildings (Vault, Shop, Hack Days HQ), cursed swamp + fishing pond, Bugs.
- **The Data Warehouse** — rocky mining grounds (slimes, skeletons, wraiths).
- **Toronto** — snow/ice; the **CN Tower** + **Shopify Supply Store** (exclusive gear).
- **BFCM Battlefield** — desert (carts, goblins).
- **New York City** — pavement + skyscraper block grid, street lamps, Citizens, Claude.
- **Fulfillment Fortress** — bosses: the Churn Dragon and the Emperor.
- **Liquid Falls** — water-heavy fishing region.
- **The Monolith** — dark undead dungeon; the Legacy Code Lich.

## Quests (in game)

- **The First Sale** — defeat your first enemy.
- **Clear the Path** — fell a Product Tree.
- **Into the Data Warehouse** — mine GMV Ore.
- **Scout's Love** — defeat 25 enemies to earn Scout the dog companion.
- **Squash 25 Bugs** — Tobi's quest; earns the Founder's Rust Blade.
- **Slay the Churn Reaper** — defeat the Churn Dragon.
- **The Great Deprecation** — destroy the Legacy Code Lich.
- **Arm the Rebels** — defeat Jeff Bezos, Emperor of the Everything Store.

## Mechanics (in game)

Ranged weapons + AoE explosives · fishing → cooking on campfires · mining · tree-chopping · GMV-find drops · day–night cycle with light sources · particle FX (embers, dust, combat bursts, fireflies) · screen shake · worn-armor visuals · minimap + orbs + OSRS-style tabbed UI · autosave · MMO-style public chat (speech bubbles) · the **SDP Data Restriction Curse** (5-minute visibility loss from Bad Data).

## The Emperor fight (featured, partially in game)

The endgame Bezos boss is implemented with enrage + self-heal phases. The full 4-phase design (Buy Box seizure → Blue Origin re-entry AoE → Undercut price-war aura → Hostile Acquisition execute) and the complete loot table (Mountain of GMV, Prime Crown, Rocket Boots, Chrome Gauntlet, The Everything Ledger, Monocle of Market Domination, Emperor's Power-Armor) remain on the roadmap.
