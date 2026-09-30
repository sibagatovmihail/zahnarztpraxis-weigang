# Zahnarztpraxis Weigang — spec pitch

Spec pitch (no website exists) for Zahnarztpraxis Cirsten und Dr. Dirk Weigang + Dr. Johannes Weigang,
Große Grüne Str. 5, 17192 Waren (Müritz). Tel 03991 667661, Fax 03991 667561. Google 4.7 (54 reviews).
Hours (Google): Mo–Mi 7:30–18, Do 7:30–19, Fr 7:30–12. Step-free / wheelchair accessible.
Johannes: Invisalign provider, DGSZM listing (dental sleep medicine). Cirsten: Dipl.-Stom.
Stadthafen ~150 m, Neuer Markt ~130 m, Bahnhof ~930 m (OSM, straight line).
Review themes: tourists with toothache ("Urlaub gerettet"), anxious patients, same-day help, kids' play corner.

Static HTML/CSS/JS, no build. `index.html` one page, `css/styles.css` (tokens at the top), `js/main.js`.
- Palette (Pantone, approved 2026-09-30): plum P 95-16 C `#32004B` (brand) + orange P 30-8 C `#F37121` (accent) + sand P 15-2 C `#E7D2A9` (quiet fills; `--tint` is its wash `#F8F2E6`); white ground. Hex values are approximations from public databases, not Pantone-official. Small orange text uses `#B34708` (bright orange is ~3:1 on white). (Previous: Müritz-Petrol #0F5C63 + Koralle #FF7A66; before that Müritzblau #16406B + Bojen-Orange #F0673A.) Hard-coded colours also live in the `--bd-*` SVG data URIs, the `rgba()` shadows/glows, the wave/tooth art, `index.html` (theme-color, loader) and `assets/mark.svg`; change them together.
  No existing logo anywhere → own mark `assets/mark.svg` (tooth standing in a lake wave). Font: Jost (one variable file, heads 600 + body; same file as Schülein/Gussmann), self-hosted. Inter was tried first and rejected as "AI-looking".
- Radius family: logo tile r = 25 % of --ctl-h → --ctl-r; header strip = --ctl-r + --inset.
- Accent words in headings = solid accent block (Jesus Punkt style, `linear-gradient` band 1.04em tall, `box-decoration-break: clone`).
- Notfall section = plum, process as a "course" (3 stops, boat sails the legs, `.is-play` set by main.js, replays on re-entry); no reviews there.
- Backdrops: quiet line-art (ripples, tooth, waves, clock, bubble, ?) via section `::before/::after`, tokens `--bd-*`.
- Header: one continuous floating strip; ≤64rem the same strip grows downward into the menu sheet (scroll lock, rows with arrows). Mobile menu rows go plum (white text) on hover/press/focus.
- Leistungen = tabs by situation (all panels stacked in one grid cell → no jump); ≤48rem sideways chip row.
- Status/hours logic in main.js (`HOURS`, Europe/Berlin). Hours widget: bars on a 7–20 h scale + "jetzt" line.
- Photos: Unsplash stand-ins tagged "Beispielbild". Doctors have monogram tiles ("Foto folgt"), no stock faces.
- Copyright set (Design Principles rule 15) added 2026-09-30: LICENSE (DE/EN), README notice, HTML comment + `<meta name="copyright">` (also on impressum/datenschutz), footer line, fixed `.draft-tag`. Repo is public; live on GitHub Pages.
- Bump `?v=` on CSS/JS links with every deploy that changes them.
