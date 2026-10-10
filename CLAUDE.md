# Orbis — how work is done in this repository

The site's owner (Yavuz) works from a phone and does not run technical checks himself.
Talk to him in Turkish, in plain words, without file paths or code. Every change below
is published by pushing to `main`: the "Publish site" workflow tests, builds and commits
the pages; Cloudflare (Workers Builds) then serves them at https://orbisreadingatlas.com.

## The three gates (nothing broken reaches readers)

1. `scripts/stories-check.test.mjs` (part of `npm run test:site`): every reading file is
   valid, its id matches its file name, its section, date and titles are right, its
   picture, video and recordings exist, every `[n]` points to a source.
2. `scripts/check-built-site.mjs` (last step of `npm run build:pages`): every reading
   page was written with its title, every address inside the site resolves, every DOI is
   registered at doi.org.
3. A failing gate stops the workflow before the publish commit, so the live site stays as
   it was. Never weaken or skip a gate to get a reading out; fix the reading.

## Adding or changing a reading

1. `git pull` first; work on the latest `main`.
2. One reading per commit, touching only `content/stories/<id>.json` and its own media
   (`images/<id>…jpg`, `public/audio/<id>-<lang>.mp3`, `videos/`). Never mix a reading
   with a change to site code.
3. Open every source address before publishing and confirm that the title, authors, year
   and the figure cited are really there. The gates prove a DOI exists, not that it is
   the right paper or that it says what the text says.
4. Run `npm run test:site && npm run build:pages` locally; both must pass.
5. Push, watch the "Publish site" run, then the Cloudflare status on the `[site] publish`
   commit (`gh api repos/editor-cell/editor-cell.github.io/commits/<sha>/check-runs`),
   then look at the live page.
6. If a published reading is wrong, `git revert` its commit and push; the site returns
   to the state before it.

## Editorial rules from the owner

- Readings rest on public, checkable sources (public institutions first); no essays,
  no pieces about individual people.
- Compare how several countries respond to the same question; Turkey is not the centre.
- About 1.5 A4 pages per reading (measured on the English text).
- Pictures are AI-made (no copyright risk); English first, Turkish second.

## Changing the site itself

Design and code changes go in their own commits, after `npm run typecheck`,
`npm run test:site` and `npm run build:pages`, and a look at the built pages at phone
(390 px) and desktop (1280 px) width. A fix for the phone must not change the desktop
layout, and the other way round.
