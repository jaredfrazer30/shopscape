import {
  H1,
  H2,
  H3,
  Text,
  Card,
  CardHeader,
  CardBody,
  Grid,
  Row,
  Stack,
  Pill,
  Stat,
  Callout,
  Table,
  Divider,
  useHostTheme,
  useCanvasState,
} from "cursor/canvas";
import type { Color } from "cursor/canvas";

type Tier = "Trial" | "Basic" | "Shopify" | "Advanced" | "Plus";

const tierColor: Record<Tier, Color> = {
  Trial: "gray",
  Basic: "blue",
  Shopify: "green",
  Advanced: "yellow",
  Plus: "purple",
};

const tierOrder: Tier[] = ["Trial", "Basic", "Shopify", "Advanced", "Plus"];

function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        background: color,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function TierTag({ tier }: { tier: Tier }) {
  const theme = useHostTheme();
  return (
    <Row gap={6} align="center">
      <Dot color={theme.category[tierColor[tier]]} />
      <Text as="span" size="small" tone="secondary">
        {tier}
      </Text>
    </Row>
  );
}

const TABS = [
  "Overview",
  "Characters",
  "Weapons",
  "Armor",
  "Items",
  "Bestiary",
  "Bosses & NPCs",
  "Skills",
  "World & Quests",
] as const;
type Tab = (typeof TABS)[number];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const characters: {
  name: string;
  color: Color;
  appearance: string;
  weapon: { name: string; effect: string };
  shield: { name: string; effect: string };
}[] = [
  {
    name: "River",
    color: "blue",
    appearance:
      "Our resident expert for all things Shopify — long blue hair, a Water Staff, and a penchant for being all-knowing. How can one say she's not alive?!",
    weapon: {
      name: "Water Staff",
      effect:
        "A RANGED staff that hurls blue water orbs from afar. Strong vs beasts & undead; fizzles on ghosts.",
    },
    shield: {
      name: "Blast Shield",
      effect:
        "Absorbs one big burst hit and vents the overflow back as splash damage. Made for surviving traffic spikes.",
    },
  },
  {
    name: "Shoppy",
    color: "green",
    appearance:
      "Our tried-and-true mascot and a true OG — the green shopping bag with arms and legs. Internationally known, locally respected.",
    weapon: {
      name: "White Gloves",
      effect:
        "Bare-handed brawler gloves — fast, flurrying jabs. 'White-glove service' hits that stun and disarm.",
    },
    shield: {
      name: "Money Shield",
      effect:
        "A wall of GMV coins. Blocked hits are converted into gold — the more you tank, the more you earn.",
    },
  },
  {
    name: "Lord Shoppington",
    color: "yellow",
    appearance:
      "A fancy shopping bag in a monocle and top hat. Some say born with money, some say self-made — either way, a trillion reasons to love him.",
    weapon: {
      name: "Fancy Cane",
      effect:
        "An elegant melee cane with immense reach and poise. Parries on the backswing; taps enemies into next quarter.",
    },
    shield: {
      name: "Trillion Dollar Shield",
      effect:
        "The realm's ultimate bulwark, plated in a trillion in cumulative GMV. Near-impenetrable, befitting a Lord.",
    },
  },
  {
    name: "Sidekick",
    color: "purple",
    appearance:
      "Your favorite cheerful AI familiar — purple eyemask, Robin Hood silhouette. Whispers growth tips, automates the mundane, and gently asks if you've considered improving your Conversion Rate.",
    weapon: {
      name: "Longbow",
      effect:
        "An elegant RANGED bow that executes queries with precision — fires arrows from up to 6 tiles.",
    },
    shield: {
      name: "SnowDevil Shield",
      effect: "The OG order of protection — built for speed, built to last.",
    },
  },
];

const weapons: { name: string; type: string; tier: Tier; effect: string }[] = [
  {
    name: "Snowdevil Snowboard",
    type: "Melee · 2H",
    tier: "Trial",
    effect:
      "The origin blade — Shopify literally began as Snowdevil, a snowboard shop. Ride it for move speed; whack for chip damage.",
  },
  {
    name: "Rusty REST Sword",
    type: "Melee",
    tier: "Trial",
    effect:
      "Deprecated. Occasionally throws a 'sunset warning' pop-up and does nothing that turn.",
  },
  {
    name: "Buy Button Bludgeon",
    type: "Melee",
    tier: "Basic",
    effect: "One-click smash. Simple and reliable; clears trash mobs fast.",
  },
  {
    name: "Barcode Blaster",
    type: "Ranged",
    tier: "Basic",
    effect: "POS scanner rifle. *beep* = hit. Jams on unrecognized SKUs.",
  },
  {
    name: "Discount Dagger",
    type: "Melee",
    tier: "Shopify",
    effect:
      "Applies 'Markdown' bleed to enemies — but erodes your own margin (minor self-damage).",
  },
  {
    name: "Liquid Staff",
    type: "Magic",
    tier: "Shopify",
    effect: "Channels Liquid to cast templated spells. Scales with Magic level.",
  },
  {
    name: "GraphQL Query Lance",
    type: "Ranged",
    tier: "Advanced",
    effect:
      "Asks for exactly the fields it needs — precise, high single-target damage. REST users flee.",
  },
  {
    name: "Webhook Whip",
    type: "Melee / Ranged",
    tier: "Advanced",
    effect:
      "Fires on every event. Great crowd control; occasionally double-fires (retry storm).",
  },
  {
    name: "Leaky Bucket",
    type: "Ranged · Thrown",
    tier: "Advanced",
    effect:
      "Rate-limited: only N throws per turn. Exceed it and you get 429'd (self-stun).",
  },
  {
    name: "Shop Pay Saber",
    type: "Melee",
    tier: "Plus",
    effect:
      "Highest-converting blade in the realm. +crit, +attack speed. One tap, instant kill.",
  },
  {
    name: "Checkout Cleaver",
    type: "Melee · 2H",
    tier: "Plus",
    effect:
      "The sacred conversion blade. Extensible — slot in mods (upsells / blocks) at the forge.",
  },
  {
    name: "POS Go Wand",
    type: "Ranged",
    tier: "Plus",
    effect: "Handheld all-in-one. Taps to pay, zaps to slay.",
  },
  {
    name: "The Monolith",
    type: "Melee · 2H",
    tier: "Plus",
    effect:
      "A colossal greatsword forged from Shopify Core. Devastating, slow, and everyone argues about refactoring it.",
  },
  {
    name: "Founder's Rust Blade",
    type: "Melee",
    tier: "Plus",
    effect:
      "Tobi's legendary weapon, hand-forged in Rust. Blazing fast, memory-safe, never segfaults. Earned by squashing 25 Bugs for Tobi.",
  },
  {
    name: "Longbow",
    type: "Ranged",
    tier: "Advanced",
    effect: "Sidekick's signature bow — fires arrows from range (6 tiles). Strong vs beasts & undead.",
  },
  {
    name: "Slop Grenade",
    type: "Ranged · Explosive",
    tier: "Advanced",
    effect: "A lobbed bomb that detonates on impact — AoE blast damages everything near the target. Sold at the General Store.",
  },
  {
    name: "Molotov Sloptail",
    type: "Ranged · Explosive",
    tier: "Advanced",
    effect: "A flaming bottle that bursts into a fiery explosion around the target. Strong vs beasts & ghosts.",
  },
];

const armor: { name: string; slot: string; tier: Tier; effect: string }[] = [
  {
    name: "Dawn Robes",
    slot: "Body",
    tier: "Trial",
    effect: "The default starter theme. Clean, minimal — everyone begins here.",
  },
  {
    name: "Two-Factor Shield",
    slot: "Offhand",
    tier: "Basic",
    effect:
      "Blocks the first hit every fight. Requires a one-turn code from your phone to equip.",
  },
  {
    name: "SSL Padlock Aegis",
    slot: "Offhand",
    tier: "Shopify",
    effect: "The little green lock. Reflects 'insecure connection' attacks.",
  },
  {
    name: "Liquid Leather",
    slot: "Body",
    tier: "Shopify",
    effect: "Flexible, templatable armor — recolors to match any theme.",
  },
  {
    name: "Fraud Filter Faceguard",
    slot: "Head",
    tier: "Advanced",
    effect: "Auto-flags incoming Fraudster hits before they land.",
  },
  {
    name: "GDPR Gauntlets",
    slot: "Hands",
    tier: "Advanced",
    effect: "Compliance-grade. Forces enemies to request consent before looting you.",
  },
  {
    name: "Hydrogen Helm + Oxygen Greaves",
    slot: "Head / Legs",
    tier: "Plus",
    effect:
      "Headless set bonus: detach your frontend from your body for a big speed boost.",
  },
  {
    name: "Polaris Plate",
    slot: "Body",
    tier: "Plus",
    effect:
      "Design-system platebody. Perfectly consistent; grants +Navigation and you never get lost.",
  },
  {
    name: "Trust Battery Chestplate",
    slot: "Body",
    tier: "Plus",
    effect:
      "Regenerates armor over time while you act in good faith — drains fast if you betray an NPC.",
  },
  {
    name: "Uptime Aegis (99.99%)",
    slot: "Offhand",
    tier: "Plus",
    effect:
      "Almost never fails — 52 minutes of downtime per year, and you'll feel every second of it.",
  },
  {
    name: "Merchant of the Year Crown",
    slot: "Head",
    tier: "Plus",
    effect: "Legendary. +GMV find, boosted drop rate, and every NPC bows.",
  },
  {
    name: "Touch Grass Hat",
    slot: "Head",
    tier: "Shopify",
    effect: "Green cap — a Shopify Supply Store (Toronto) exclusive. Reminds you to log off and touch grass.",
  },
  {
    name: "Rebellion Jersey",
    slot: "Body",
    tier: "Advanced",
    effect: "White with a black stripe — Supply Store exclusive, worn by those who arm the rebels.",
  },
  {
    name: "GymShark Hoodie",
    slot: "Body",
    tier: "Advanced",
    effect: "Cozy grey hoodie — Supply Store exclusive. +defence, +gains.",
  },
  {
    name: "Alo Yoga Pants",
    slot: "Legs",
    tier: "Advanced",
    effect: "Green performance leggings — Supply Store exclusive. Flexible and forgiving.",
  },
  {
    name: "Mejuri Ring",
    slot: "Ring",
    tier: "Plus",
    effect: "Tasteful gold ring worn on the hand (Ring slot) — Supply Store exclusive. A little extra GMV find.",
  },
];

const items: { name: string; type: string; effect: string }[] = [
  {
    name: "GMV Gold",
    type: "Currency",
    effect: "The realm's coin — Gross Merchandise Value. Everything is priced in it.",
  },
  {
    name: "Shop Cash",
    type: "Premium currency",
    effect: "Earned at checkout, spent anywhere. Shinier than GMV gold.",
  },
  {
    name: "Gift Card",
    type: "Tradeable note",
    effect: "Bearer currency — never expires, always accepted at the Merch Table.",
  },
  {
    name: "Health Score Potion",
    type: "Heal",
    effect: "Instantly restores merchant HP. Your Health Score IS your HP bar.",
  },
  {
    name: "NRR Elixir",
    type: "Regen",
    effect:
      "Net Revenue Retention brew — heals over time and can push max HP past 100% (net expansion).",
  },
  {
    name: "Capital Chest",
    type: "Risky buff",
    effect:
      "A Shopify Capital loan. Big power spike now; repay from future GMV or take a debuff.",
  },
  {
    name: "Discount Code Scroll",
    type: "Buff",
    effect: "Summons a horde of customers — but shrinks your margin. Use sparingly.",
  },
  {
    name: "Launchpad Rocket",
    type: "Timed buff",
    effect: "Schedule a flash sale: a massive buff window that auto-reverts on the clock.",
  },
  {
    name: "Editions Booklet",
    type: "Ability unlock",
    effect: "Drops every Summer & Winter — unlocks 100+ new abilities at once.",
  },
  {
    name: "Metafield Pouch",
    type: "Storage",
    effect: "Custom bag slots — store anything you can define.",
  },
  {
    name: "Bulk Editor Gloves",
    type: "Utility",
    effect: "Apply one change to a thousand items at once.",
  },
  {
    name: "Tophat",
    type: "Utility",
    effect: "Preview any change safely before it ships. 'Can you tophat this?'",
  },
  {
    name: "Spin-Up Portal Stone",
    type: "Teleport",
    effect: "Conjures a fresh dev environment / instant fast-travel, then vanishes when done.",
  },
  {
    name: "Analytics Spyglass",
    type: "Recon",
    effect: "Reveals enemy stats, funnel drop-off, and hidden loot.",
  },
  {
    name: "Sidekick Lamp",
    type: "Companion",
    effect: "Rub for a hint — summons your AI familiar to fight beside you for 30s.",
  },
  {
    name: "Fishing Rod",
    type: "Tool",
    effect: "From Harley the Hype. Click any body of water to fish and train the Fishing skill.",
  },
  { name: "Raw Fish", type: "Resource", effect: "A fresh catch — select it, then click a campfire to cook it." },
  { name: "Cooked Fish", type: "Heal", effect: "Grilled on a Merchant Fire; restores Health Score when eaten." },
  { name: "Merchant Fire", type: "Utility", effect: "From the CSM. Combine with Product Logs to build a campfire." },
  { name: "Bad Data", type: "Cursed", effect: "Dredged from the cursed swamp. Cooking or eating it inflicts the SDP Data Restriction Curse (5-min visibility loss)." },
  { name: "GMV Ore", type: "Resource", effect: "Mined from rocks with Data Mining. Refine or sell." },
  { name: "Product Logs", type: "Resource", effect: "Chopped from Product Trees; used to build campfires and craft at Hack Days HQ." },
  { name: "Summit Swag", type: "Rare drop", effect: "~1 in 20 kills. Sells for 100 GMV." },
  { name: "Ham", type: "Heal drop", effect: "~1 in 25 kills. Eat to restore 20 Health Score." },
  { name: "Scope Change", type: "Epic drop", effect: "~1 in 100 kills. Sells for 250 GMV." },
];

const bestiary: {
  name: string;
  threat: "Low" | "Medium" | "High" | "Boss-tier";
  location: string;
  notes: string;
}[] = [
  {
    name: "Abandoned Cart",
    threat: "Low",
    location: "Checkout Cathedral",
    notes: "Wanders full of loot. Recover it (cart-recovery email) to claim the goods.",
  },
  {
    name: "Cart Goblin",
    threat: "Low",
    location: "Everywhere",
    notes: "Snatches items mid-purchase and bolts.",
  },
  {
    name: "Latency Slime",
    threat: "Low",
    location: "The Monolith",
    notes: "Slows your attack speed. Harmless alone, brutal in a swarm (ms by ms).",
  },
  {
    name: "404 Phantom",
    threat: "Low",
    location: "Off the map",
    notes: "A page that isn't there. Strikes once, then vanishes.",
  },
  {
    name: "Refund Zombie",
    threat: "Medium",
    location: "Merch Table",
    notes: "Rises to reclaim a completed sale — reverses your last GMV gain.",
  },
  {
    name: "Fraudster",
    threat: "Medium",
    location: "App Store Bazaar",
    notes: "Disguised as a customer; steals gold if unmasked too late. Fraud Filter reveals it.",
  },
  {
    name: "Deprecated API Skeleton",
    threat: "Medium",
    location: "The Data Warehouse",
    notes: "Old REST endpoints clawing out of the grave. Immune to modern gear — needs a migration.",
  },
  {
    name: "Sneaker Bot Swarm",
    threat: "High",
    location: "BFCM Battlefield",
    notes: "Overwhelming numbers during drops. Only Bot Protection AoE clears them.",
  },
  {
    name: "429 Rate-Limit Golem",
    threat: "High",
    location: "The Monolith",
    notes: "Stuns you if you attack too fast. Respect the leaky bucket.",
  },
  {
    name: "Chargeback Wraith",
    threat: "High",
    location: "Checkout Cathedral",
    notes: "Undoes a won fight and drains gold days later. Truly haunting.",
  },
  {
    name: "Merge Conflict Beast",
    threat: "High",
    location: "Partner's Guild",
    notes: "Two heads that refuse to agree. Must be resolved line by line.",
  },
  {
    name: "Legacy Code Lich",
    threat: "Boss-tier",
    location: "The Monolith",
    notes: "Ancient, powerful, load-bearing. A region boss guarding the undead dungeon.",
  },
  {
    name: "Bug",
    threat: "Low",
    location: "151 O'Connor Keep",
    notes: "Little green critter that respawns fast. Squash 25 of them for Tobi to earn the Rust Blade.",
  },
  {
    name: "Openclaw",
    threat: "Medium",
    location: "New York City",
    notes: "A red lobster that skitters out whenever you talk to Claude. Drops Summit Swag.",
  },
  {
    name: "The Churn Dragon",
    threat: "Boss-tier",
    location: "Fulfillment Fortress",
    notes: "A winged beast boss. Drops the Buy Button Blade.",
  },
];

const threatTone: Record<
  string,
  "neutral" | "info" | "warning" | "danger"
> = {
  Low: "neutral",
  Medium: "info",
  High: "warning",
  "Boss-tier": "danger",
};

const bosses: { name: string; tag: string; desc: string }[] = [
  {
    name: "Jeff Bezos, Emperor of the Everything Store",
    tag: "Empire · Supreme Final Boss",
    desc: "The realm's ultimate antagonist. Floats above the Fulfillment Fortress in chrome power-armor, summoning Prime drones and one-click armies. Phase 2 unlocks a rocket and he leaves the arena's atmosphere — dodge the re-entry. Weak only to fiercely loyal customers and brands he can't undercut.",
  },
  {
    name: "The Zos, Warden of the Everything Store",
    tag: "Empire · Final Boss",
    desc: "Bezos's steel enforcer, commanding infinite fulfillment armies from a fortress that sells literally everything. Guards the door to the Emperor. Weak to genuine merchant loyalty and a differentiated brand.",
  },
  {
    name: "The BFCM Titan",
    tag: "World Boss · Seasonal",
    desc: "Traffic-surge incarnate. Once a year the whole realm raids it together for a single weekend — record-breaking loot for those who survive.",
  },
  {
    name: "The QBR Dragon",
    tag: "Quarterly Boss",
    desc: "Demands you show your numbers. Breathes spreadsheets; only defeated by a clean pipeline and an honest forecast.",
  },
  {
    name: "The Churn Reaper",
    tag: "Regional Boss",
    desc: "Roams merchant villages lowering Health Scores. Beaten with NRR Elixirs, Success Plans, and an attentive MSM.",
  },
  {
    name: "Sev1 Behemoth",
    tag: "Random Encounter · Incident",
    desc: "Spawns unannounced and pages the on-call raid. Must be downed before the pager stops screaming.",
  },
];

const npcs: { name: string; tag: string; desc: string }[] = [
  {
    name: "Shoppy · River · Lord Shoppington · Sidekick",
    tag: "Playable Heroes",
    desc: "The four starting heroes — pick one at character select (Sidekick is the newest, with the Longbow).",
  },
  {
    name: "Tobi the Founder",
    tag: "Hidden · Quest Giver",
    desc: "Tucked inside the Snowdevil Cave building mechanical keyboards between StarCraft matches. Rewards the Founder's Rust Blade.",
  },
  {
    name: "Harley the Hype",
    tag: "Merchant Guild",
    desc: "Endless entrepreneurship quests and motivational shouts. Recruits every rebel he meets.",
  },
  {
    name: "The CSM",
    tag: "Healer · Gives Merchant Fire",
    desc: "Customer Success Manager. Restores your Health Score to full and hands out Merchant Fire for cooking.",
  },
  {
    name: "The Partner",
    tag: "Smith",
    desc: "Agency crafter — forges custom gear (apps & themes) in exchange for GMV.",
  },
  {
    name: "The RevOps Oracle",
    tag: "Wizard · Lore",
    desc: "Warns: \"The sacred mart says: use governed data, brave ranger. The raw-table swamp is cursed.\" Guards the cursed swamp.",
  },
  {
    name: "Claude",
    tag: "NYC Mascot",
    desc: "An orange-asterisk AI mascot roaming New York City with relentlessly agreeable dialogue. Talking to him spawns an Openclaw.",
  },
  {
    name: "Scout",
    tag: "Dog Companion",
    desc: "A brown dog with a green bandana. Earned via the 'Scout's Love' quest (25 kills); permanently follows you and fights.",
  },
  {
    name: "NYC Citizens",
    tag: "Ambient",
    desc: "Dozens of roaming citizens fill New York City with big-city chatter.",
  },
  {
    name: "Sidekick Familiar",
    tag: "Summoned Pet",
    desc: "Summoned by the Sidekick Lamp for 30 seconds — an AI familiar that fights beside you.",
  },
];

const bezosPhases: {
  phase: string;
  hp: string;
  attacks: string;
  mechanic: string;
}[] = [
  {
    phase: "1 · The Everything Store",
    hp: "100–70%",
    attacks: "One-Click Barrage · Prime Drone Swarm · Buy Box Slam",
    mechanic:
      "Seizes the Buy Box. Reclaim it within 10s or your damage is halved while he hoards the customer.",
  },
  {
    phase: "2 · Blue Origin Ascent",
    hp: "70–40%",
    attacks: "Rocket Launch · Re-Entry Meteor (arena-wide) · Fulfillment Titan adds",
    mechanic:
      "He exits the arena on a rocket. Duck behind cover (any Shield / Aegis) during the re-entry telegraph or eat massive AoE.",
  },
  {
    phase: "3 · Undercut Meltdown",
    hp: "40–10%",
    attacks: "Undercut Nova · Marketplace Mirror (clones your gear, cheaper) · Chargeback Volley",
    mechanic:
      "A price-war aura drains your GMV every tick. Burn him down fast or you go broke mid-fight.",
  },
  {
    phase: "4 · The Long Game",
    hp: "10–0%",
    attacks: "Hostile Acquisition (execute) · Infinite Runway (heal attempt)",
    mechanic:
      "He tries to acquire you outright — a full Trust Battery blocks the instant-kill. Empty battery = game over.",
  },
];

type LootRarity = "Guaranteed" | "Rare" | "Epic" | "Legendary";
const lootRarityColor: Record<LootRarity, Color> = {
  Guaranteed: "gray",
  Rare: "blue",
  Epic: "purple",
  Legendary: "yellow",
};

const bezosLoot: { item: string; rarity: LootRarity; note: string }[] = [
  {
    item: "Mountain of GMV",
    rarity: "Guaranteed",
    note: "A record-breaking gold payout — enough to bankroll a whole guild.",
  },
  {
    item: "Prime Crown",
    rarity: "Guaranteed",
    note: "Cosmetic headpiece; every NPC lets you skip the line.",
  },
  {
    item: "Rocket Boots",
    rarity: "Rare",
    note: "Blue Origin thrusters — extra Digital-by-Design fast-travel charges.",
  },
  {
    item: "Chrome Gauntlet",
    rarity: "Rare",
    note: "Melee weapon that fires a One-Click Barrage on tap.",
  },
  {
    item: "The Everything Ledger",
    rarity: "Epic",
    note: "Unlocks every marketplace recipe in the App Store Bazaar.",
  },
  {
    item: "Monocle of Market Domination",
    rarity: "Epic",
    note: "Reveals every enemy's price, weakness, and hidden loot.",
  },
  {
    item: "Emperor's Power-Armor",
    rarity: "Legendary",
    note: "Full chrome body set — the best in the realm. Vanishingly small drop chance.",
  },
];

const skills: { rs: string; skill: string; what: string }[] = [
  { rs: "Attack / Strength / Defence", skill: "Checkout Combat", what: "Close the conversion in melee fights." },
  { rs: "Magic", skill: "Liquid", what: "Cast templated spells that scale with level." },
  { rs: "Ranged", skill: "API (GraphQL / REST)", what: "Attack at range with precise queries." },
  { rs: "Prayer", skill: "Trust Battery", what: "Buffs that charge with good faith and drain with betrayal." },
  { rs: "Mining", skill: "Data Mining", what: "Mine GMV ore and metrics in the Data Warehouse." },
  { rs: "Smithing", skill: "App Building", what: "Forge apps from the data you mined." },
  { rs: "Fishing", skill: "Lead Gen", what: "Catch leads and MSQLs from the stream." },
  { rs: "Cooking", skill: "Fulfillment", what: "Turn raw orders into shipped, happy customers." },
  { rs: "Crafting", skill: "Theme Building", what: "Craft storefronts customers love." },
  { rs: "Runecrafting", skill: "Liquid Crafting", what: "Craft the runes (Liquid) that power Magic." },
  { rs: "Herblore", skill: "Merchandising", what: "Mix discounts, bundles, and potions." },
  { rs: "Agility", skill: "CRO", what: "Parkour the conversion funnel without dropping off." },
  { rs: "Thieving", skill: "Growth / SEO", what: "Nab organic traffic from rival kingdoms." },
  { rs: "Slayer", skill: "Fraud Slayer", what: "Complete assigned fraud-fighting tasks." },
  { rs: "Farming", skill: "Retention", what: "Grow your merchant base — farm NRR." },
  { rs: "Construction", skill: "Store Setup", what: "Build and upgrade your shop and HQ." },
  { rs: "Hunter", skill: "Prospecting", what: "Hunt MSQLs in the wild." },
  { rs: "Summoning", skill: "Integrations", what: "Summon app familiars to fight beside you." },
  { rs: "Fletching", skill: "Marketing", what: "Craft campaigns — fletch your ad arrows." },
  { rs: "Firemaking", skill: "Launches / Hype", what: "Light up product drops." },
];

const locations: { name: string; note: string }[] = [
  { name: "Onboarding Island", note: "Tutorial zone — make your very first sale." },
  { name: "151 O'Connor Keep (Ottawa)", note: "The ancestral HQ and main town." },
  { name: "Snowdevil Cave", note: "Origin dungeon where it all began — and where Tobi hides." },
  { name: "Checkout Cathedral", note: "Sacred conversion temple; Abandoned Carts roam the aisles." },
  { name: "Liquid Falls", note: "Magic training grounds." },
  { name: "The Data Warehouse", note: "Mining dungeon (the BigQuery mines); Deprecated Skeletons lurk." },
  { name: "App Store Bazaar & Theme Store Village", note: "Bustling markets for gear and cosmetics." },
  { name: "The Monolith", note: "Mega-dungeon (Shopify Core); Rate-Limit Golems and the Legacy Lich." },
  { name: "Plus Palace", note: "Enterprise district with the realm's best vendors." },
  { name: "The Empire's Fulfillment Fortress", note: "Endgame raid — the Everything Store itself." },
  { name: "BFCM Battlefield", note: "Seasonal world-boss raid zone." },
  { name: "Digital-by-Design Waypoints", note: "Remote-first fast travel — the Spin-Up Portal Stone teleports you home." },
  { name: "Toronto (in-game)", note: "Snowy region with the CN Tower and the Shopify Supply Store (exclusive merch)." },
  { name: "New York City (in-game)", note: "Dense skyscraper block grid with street lamps, roaming Citizens, and Claude." },
  { name: "The Cursed Swamp", note: "Greenish-blue water south of town. Fishing it yields Bad Data — do not cook it." },
];
// Regions actually in the shipped 96×76 world:
// 151 O'Connor Keep (town) · The Data Warehouse (mining) · Toronto (snow) ·
// BFCM Battlefield (desert) · New York City (city) · Fulfillment Fortress (bosses) ·
// Liquid Falls (fishing) · The Monolith (undead).

const quests: { name: string; note: string }[] = [
  { name: "The First Sale", note: "Tutorial — ring up your first order to leave Onboarding Island." },
  { name: "Arm the Rebels", note: "Main questline: unite the merchants against the Empire." },
  { name: "The Founder's Keyboard", note: "Find Tobi, build a mechanical keyboard, earn the Rust Blade." },
  { name: "Slay the Churn Reaper", note: "Save a merchant village by restoring its Health Scores." },
  { name: "Survive BFCM", note: "Endure the weekend-long traffic raid." },
  { name: "The Great Deprecation", note: "Migrate the realm off REST and clear the Skeletons." },
  { name: "Charge the Trust Battery", note: "Earn an NPC's trust to unlock Plus-tier gear." },
  { name: "Scout's Love (in-game)", note: "Defeat 25 enemies to earn Scout, a dog companion who fights beside you." },
  { name: "Squash 25 Bugs (in-game)", note: "Tobi's quest — squash 25 Bugs to earn the Founder's Rust Blade." },
  { name: "Into the Data Warehouse (in-game)", note: "Mine your first GMV Ore." },
];

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function Legend() {
  const theme = useHostTheme();
  return (
    <Row gap={14} wrap align="center">
      <Text as="span" size="small" tone="tertiary">
        Rarity = plan tier:
      </Text>
      {tierOrder.map((t) => (
        <div key={t} style={{ display: "contents" }}>
          <Row gap={6} align="center">
            <Dot color={theme.category[tierColor[t]]} />
            <Text as="span" size="small" tone="secondary">
              {t}
            </Text>
          </Row>
        </div>
      ))}
    </Row>
  );
}

function Overview() {
  const mechanics: [string, string][] = [
    ["HP", "Merchant Health Score"],
    ["Mana", "Liquid"],
    ["Gold / XP", "GMV (Gross Merchandise Value)"],
    ["Death", "Churn"],
    ["Reputation", "Trust Battery"],
    ["Stamina / rate cap", "Leaky Bucket (API rate limit)"],
    ["Fast travel", "Digital by Design (remote-first)"],
    ["Enemy faction", "The Empire (the Everything Store)"],
    ["Your faction", "The Rebels (merchants & entrepreneurs)"],
  ];
  return (
    <Stack gap={16}>
      <Callout tone="success" title="Now a playable game (v1)">
        Shipped &amp; playable: <Text as="span" weight="semibold">4 heroes</Text> (River, Shoppy, Lord Shoppington, Sidekick), a
        4×-larger <Text as="span" weight="semibold">8-region world</Text> (incl. snowy Toronto with the CN Tower &amp; Shopify Supply Store,
        and skyscraper-filled New York City), click-to-walk pathfinding, ranged &amp; AoE weapons, fishing / cooking / mining /
        tree-chopping, campfires, day–night lighting &amp; particles, worn-armor visuals, a title screen, quests, shops, The Vault
        (bank), Hack Days HQ crafting, MMO-style chat, and the SDP Data Restriction curse.
      </Callout>
      <Callout tone="info" title="The core reskin">
        Shopify Scape is RuneScape with a commerce soul. The mission — <Text as="span" weight="semibold">arm the rebels</Text> — is
        the merchant's fight against the Empire's Everything Store. The whole stat sheet is a Shopify metaphor:
      </Callout>

      <Grid columns={5} gap={12}>
        <Stat value={weapons.length} label="Weapons" />
        <Stat value={armor.length} label="Armor pieces" />
        <Stat value={items.length} label="Items" />
        <Stat value={bestiary.length} label="Enemies" />
        <Stat value={bosses.length} label="Bosses" />
      </Grid>

      <H2>Systems → lore</H2>
      <Table
        headers={["RuneScape system", "In Shopify Scape"]}
        rows={mechanics.map(([a, b]) => [a, b])}
        columnAlign={["left", "left"]}
      />

      <Divider />
      <Legend />
    </Stack>
  );
}

function GearTable({
  rows,
  slotHeader,
}: {
  rows: { name: string; slotOrType: string; tier: Tier; effect: string }[];
  slotHeader: string;
}) {
  return (
    <Table
      headers={["Name", slotHeader, "Tier", "Effect / lore"]}
      columnAlign={["left", "left", "left", "left"]}
      rows={rows.map((r) => [
        <Text as="span" weight="semibold">
          {r.name}
        </Text>,
        <Text as="span" size="small" tone="secondary">
          {r.slotOrType}
        </Text>,
        <TierTag tier={r.tier} />,
        <Text as="span" size="small" tone="secondary">
          {r.effect}
        </Text>,
      ])}
    />
  );
}

function EntityCards({
  entries,
}: {
  entries: { name: string; tag: string; desc: string }[];
}) {
  return (
    <Grid columns={2} gap={12}>
      {entries.map((e) => (
        <div key={e.name} style={{ display: "contents" }}>
          <Card>
            <CardHeader trailing={<Pill size="sm">{e.tag}</Pill>}>{e.name}</CardHeader>
            <CardBody>
              <Text size="small" tone="secondary">
                {e.desc}
              </Text>
            </CardBody>
          </Card>
        </div>
      ))}
    </Grid>
  );
}

function Characters() {
  const theme = useHostTheme();
  return (
    <Stack gap={12}>
      <H2>Playable characters</H2>
      <Text tone="secondary">
        Each hero comes with two exclusive starting items — a signature weapon and a signature shield.
      </Text>
      <Grid columns={3} gap={12}>
        {characters.map((c) => (
          <div key={c.name} style={{ display: "contents" }}>
            <Card>
              <CardHeader
                trailing={
                  <Row gap={6} align="center">
                    <Dot color={theme.category[c.color]} />
                    <Text as="span" size="small" tone="tertiary">
                      Starter
                    </Text>
                  </Row>
                }
              >
                {c.name}
              </CardHeader>
              <CardBody>
                <Stack gap={12}>
                  <Text size="small" tone="secondary">
                    {c.appearance}
                  </Text>
                  <Divider />
                  <Stack gap={4}>
                    <Row gap={6} align="center">
                      <Dot color={theme.category[c.color]} size={6} />
                      <Text as="span" weight="semibold">
                        {c.weapon.name}
                      </Text>
                      <Text as="span" size="small" tone="tertiary">
                        · Weapon
                      </Text>
                    </Row>
                    <Text size="small" tone="secondary">
                      {c.weapon.effect}
                    </Text>
                  </Stack>
                  <Stack gap={4}>
                    <Row gap={6} align="center">
                      <Dot color={theme.category[c.color]} size={6} />
                      <Text as="span" weight="semibold">
                        {c.shield.name}
                      </Text>
                      <Text as="span" size="small" tone="tertiary">
                        · Shield
                      </Text>
                    </Row>
                    <Text size="small" tone="secondary">
                      {c.shield.effect}
                    </Text>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </div>
        ))}
      </Grid>
    </Stack>
  );
}

function BezosFight() {
  const theme = useHostTheme();
  return (
    <Stack gap={12}>
      <Callout tone="danger" title="Featured boss fight — Jeff Bezos, Emperor of the Everything Store">
        A four-phase endgame duel above the Fulfillment Fortress. Recommended: full Trust Battery, a shield equipped, and
        enough burst to race his price-war aura in Phase 3.
      </Callout>

      <Grid columns={3} gap={12}>
        <Stat value="2.0T" label="Market Cap (HP)" tone="danger" />
        <Stat value="4" label="Phases" />
        <Stat value="7" label="Loot drops" />
      </Grid>

      <H3>Phases</H3>
      <Table
        headers={["Phase", "HP", "Signature attacks", "Key mechanic"]}
        columnAlign={["left", "left", "left", "left"]}
        rowTone={["neutral", "info", "warning", "danger"]}
        rows={bezosPhases.map((p) => [
          <Text as="span" weight="semibold">
            {p.phase}
          </Text>,
          <Text as="span" size="small" tone="secondary">
            {p.hp}
          </Text>,
          <Text as="span" size="small" tone="secondary">
            {p.attacks}
          </Text>,
          <Text as="span" size="small" tone="secondary">
            {p.mechanic}
          </Text>,
        ])}
      />

      <H3>Loot table</H3>
      <Table
        headers={["Drop", "Rarity", "Notes"]}
        columnAlign={["left", "left", "left"]}
        rows={bezosLoot.map((l) => [
          <Text as="span" weight="semibold">
            {l.item}
          </Text>,
          <Row gap={6} align="center">
            <Dot color={theme.category[lootRarityColor[l.rarity]]} />
            <Text as="span" size="small" tone="secondary">
              {l.rarity}
            </Text>
          </Row>,
          <Text as="span" size="small" tone="secondary">
            {l.note}
          </Text>,
        ])}
      />
    </Stack>
  );
}

function Panel({ tab }: { tab: Tab }) {
  if (tab === "Overview") return <Overview />;
  if (tab === "Characters") return <Characters />;

  if (tab === "Weapons")
    return (
      <Stack gap={12}>
        <H2>Weapons</H2>
        <Text tone="secondary">
          Tiered like RuneScape metals — but the ladder is your plan: Trial → Basic → Shopify → Advanced → Plus.
        </Text>
        <GearTable
          slotHeader="Type"
          rows={weapons.map((w) => ({
            name: w.name,
            slotOrType: w.type,
            tier: w.tier,
            effect: w.effect,
          }))}
        />
      </Stack>
    );

  if (tab === "Armor")
    return (
      <Stack gap={12}>
        <H2>Armor & sets</H2>
        <GearTable
          slotHeader="Slot"
          rows={armor.map((a) => ({
            name: a.name,
            slotOrType: a.slot,
            tier: a.tier,
            effect: a.effect,
          }))}
        />
      </Stack>
    );

  if (tab === "Items")
    return (
      <Stack gap={12}>
        <H2>Items, currencies & consumables</H2>
        <Table
          headers={["Name", "Type", "Effect"]}
          columnAlign={["left", "left", "left"]}
          rows={items.map((i) => [
            <Text as="span" weight="semibold">
              {i.name}
            </Text>,
            <Text as="span" size="small" tone="secondary">
              {i.type}
            </Text>,
            <Text as="span" size="small" tone="secondary">
              {i.effect}
            </Text>,
          ])}
        />
      </Stack>
    );

  if (tab === "Bestiary")
    return (
      <Stack gap={12}>
        <H2>Bestiary</H2>
        <Text tone="secondary">
          The realm's monsters are the everyday enemies of commerce — abandoned carts, fraud, chargebacks, and deprecated code.
        </Text>
        <Table
          headers={["Enemy", "Threat", "Habitat", "Notes"]}
          columnAlign={["left", "left", "left", "left"]}
          rowTone={bestiary.map((b) => threatTone[b.threat])}
          rows={bestiary.map((b) => [
            <Text as="span" weight="semibold">
              {b.name}
            </Text>,
            <Text as="span" size="small" tone="secondary">
              {b.threat}
            </Text>,
            <Text as="span" size="small" tone="secondary">
              {b.location}
            </Text>,
            <Text as="span" size="small" tone="secondary">
              {b.notes}
            </Text>,
          ])}
        />
      </Stack>
    );

  if (tab === "Bosses & NPCs")
    return (
      <Stack gap={16}>
        <H2>Bosses</H2>
        <EntityCards entries={bosses} />
        <Divider />
        <BezosFight />
        <Divider />
        <H2>Allies & NPCs</H2>
        <EntityCards entries={npcs} />
      </Stack>
    );

  if (tab === "Skills")
    return (
      <Stack gap={12}>
        <H2>Skills</H2>
        <Text tone="secondary">
          Every RuneScape skill maps to a lever a real merchant pulls. Train them to level up your shop.
        </Text>
        <Table
          headers={["RuneScape skill", "Shopify skill", "What you do"]}
          columnAlign={["left", "left", "left"]}
          rows={skills.map((s) => [
            <Text as="span" size="small" tone="tertiary">
              {s.rs}
            </Text>,
            <Text as="span" weight="semibold">
              {s.skill}
            </Text>,
            <Text as="span" size="small" tone="secondary">
              {s.what}
            </Text>,
          ])}
        />
      </Stack>
    );

  // World & Quests
  return (
    <Grid columns="1fr 1fr" gap={16}>
      <Stack gap={10}>
        <H2>Locations</H2>
        {locations.map((l) => (
          <div key={l.name} style={{ display: "contents" }}>
            <Stack gap={2}>
              <Text weight="semibold">{l.name}</Text>
              <Text size="small" tone="secondary">
                {l.note}
              </Text>
            </Stack>
          </div>
        ))}
      </Stack>
      <Stack gap={10}>
        <H2>Quests</H2>
        {quests.map((q) => (
          <div key={q.name} style={{ display: "contents" }}>
            <Card>
              <CardHeader>{q.name}</CardHeader>
              <CardBody>
                <Text size="small" tone="secondary">
                  {q.note}
                </Text>
              </CardBody>
            </Card>
          </div>
        ))}
      </Stack>
    </Grid>
  );
}

export default function ShopifyScapeDesignBible() {
  const [tab, setTab] = useCanvasState<Tab>("tab", "Overview");
  return (
    <Stack gap={18} style={{ padding: 20 }}>
      <Stack gap={4}>
        <H1>Shopify Scape — Design Bible</H1>
        <Text tone="secondary">
          A RuneScape clone set in the Shopify world — now a playable HTML5 game. This is the living design catalog for
          items, weapons, armor, enemies, skills, and lore behind the four heroes: Shoppy, River, Lord Shoppington, and Sidekick.
        </Text>
      </Stack>

      <Row gap={8} wrap>
        {TABS.map((t) => (
          <div key={t} style={{ display: "contents" }}>
            <Pill active={t === tab} onClick={() => setTab(t)}>
              {t}
            </Pill>
          </div>
        ))}
      </Row>

      <Divider />

      <Panel tab={tab} />
    </Stack>
  );
}
