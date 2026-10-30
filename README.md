# Wild Magic Surge

A browser-based wild magic surge roller for tabletop RPG sessions. Roll from a customizable effect table, filter entries by source, and present each result with a full-screen visual effect. An admin panel provides table import and roll controls.

## Getting Started

You will need Node.js and npm installed.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite to use the app. To create and preview a production build:

```sh
npm run build
npm run preview
```

## Using the App

- **Roll a surge:** Select **Roll Magic Surge**. The app builds anticipation, chooses an entry uniformly from the active table, and displays its effect and severity with an animation.
- **Filter the table:** In the admin panel, choose all entries, D100, PHB 2024, or homebrew/custom entries.
- **Manage entries:** Import a JSON array or CSV file and merge it with the current table or replace the table. You can also edit and apply the table as JSON.
- **Test a specific result:** Set a manual override ID in the admin panel, then return to the player view and roll. Clear the override to resume random rolls.
- **Review recent rolls:** The admin panel shows the latest 15 results; roll history is retained in browser storage.

Use the **Admin** button in the lower-right corner to switch between the player view and admin panel.

## Table Data

The default table is loaded from [`src/data/surgeData.json`](src/data/surgeData.json). Entries use this shape:

```json
{
  "id": 1,
  "effect": "Your hair changes to a vivid, unnatural color of the DM's choice.",
  "severity": "harmless",
  "source": "saga20"
}
```

Each entry needs an `id`, `effect`, and `severity`; `source` is used for source filters. CSV imports should include `id`, `effect`, and `severity` headers, and may include `source`.

The selected source filter, manual override, and roll history are saved in browser storage. The entry list is seeded from `surgeData.json` and admin imports/edits are currently held in memory, so they do not survive a page reload. Update the JSON file to make table changes part of the default data.

## Animations

Surge effects use dedicated canvas scenes where available, with a legacy visual fallback for other entries. The registry tracks coverage by stable entry ID. See the generated [animation inventory](docs/ANIMATION_INVENTORY.md) for per-entry status; currently 41 of 118 entries have dedicated scenes.

Animation scenes live in `src/animations/scenes/`. The registry and its tests are in `src/animations/registry.js` and `src/animations/registry.test.js`.

## Development Commands

```sh
npm test       # Run the Node.js test suite
npm run lint   # Check the project with ESLint
npm run build  # Build the production app
```

The animation inventory can be regenerated with:

```sh
node scripts/inventory.mjs
```
