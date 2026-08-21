# Play Builder

A volleyball play diagrammer for coaches. Sketch attack combinations as a
sequence of court positions (Pre-Serve → Set → Attack, or however many steps
a play needs), stored by **role** (Setter, OH1, OH2, MB1, MB2, Opp) rather
than by specific player - so a play stays correct no matter who's actually
on the floor that match.

Comes with starter play packs for 5-1, 6-2, and 4-2 systems. Prebuilt plays
are read-only reference; hit **Duplicate to Edit** to make your own editable
copy, or start blank from the "My Plays" tab.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deploy to GitHub Pages

1. Push this repo to GitHub as `play-builder` (or update `REPO_NAME` in
   `vite.config.js` and `start_url`/`scope` in the same file if you name it
   something else).
2. In the repo's **Settings → Pages**, set the source to **GitHub Actions**.
3. Push to `main` - `.github/workflows/deploy.yml` builds and deploys
   automatically.

## How data is stored

Everything lives in the browser's `localStorage` under the key
`pb.appData` - no backend, works offline once loaded (it's a PWA). Two
things persist:

- **Roster** - the number/name currently assigned to each of the six
  position roles. One roster for the whole app; every play reads from it.
- **Custom plays** - anything you've built from scratch or duplicated from
  a prebuilt pack. Prebuilt plays themselves are never written to storage;
  they're defined in `src/lib/prebuiltPlays.js`, so updating that file
  updates the starter packs for everyone without touching anyone's saved
  custom plays.

Use the **Export/Import** buttons in the header to back up or move a
playbook between devices - it's a single JSON file containing the roster
and all custom plays.

## Project structure

```
src/
  lib/
    court.js          grid <-> court-fraction coordinate math
    positions.js       the six fixed position roles (S/OH1/OH2/MB1/MB2/OPP)
    plays.js            play/frame data model + CRUD helpers
    prebuiltPlays.js     5-1 / 6-2 / 4-2 starter play packs
    appData.js           initial persisted app state
  components/
    CourtDiagram.jsx     renders one frame - pucks, net, tap-to-place editing
    FrameBar.jsx          step dots + prev/next + add/rename/delete frame
    PlayLibrary.jsx        browse prebuilt systems + "My Plays"
    RosterEditor.jsx        assign number/name to each position
    DataTransfer.jsx         export/import playbook JSON
  App.jsx                     wires it all together
```

## Adding or editing prebuilt plays

Edit `src/lib/prebuiltPlays.js`. Each play is a `play(name, frameDefs)` call
where `frameDefs` is an array of `[label, positions]` pairs. `positions` is
keyed by position id (`S`, `OH1`, `OH2`, `MB1`, `MB2`, `OPP`) with `{col,
row}` values on the 12-column x 8-row court grid (row 0 = at the net, row 7
= endline). Easiest way to get exact coordinates: build the play in the app
itself with the position-editor, then read the values back out of
`localStorage` (`pb.appData` → the play's `frames`) and paste them in here.
