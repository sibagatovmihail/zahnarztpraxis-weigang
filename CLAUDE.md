# Zahnarztpraxis Weigang — spec pitch

Spec pitch (no website exists) for Zahnarztpraxis Cirsten und Dr. Dirk Weigang + Dr. Johannes Weigang,
Große Grüne Str. 5, 17192 Waren (Müritz). Tel 03991 667661, Fax 03991 667561. Google 4.7 (54 reviews).
Hours (Google): Mo–Mi 7:30–18, Do 7:30–19, Fr 7:30–12. Step-free / wheelchair accessible.
Johannes: Invisalign provider, DGSZM listing (dental sleep medicine). Cirsten: Dipl.-Stom.
Stadthafen ~150 m, Neuer Markt ~130 m, Bahnhof ~930 m (OSM, straight line).
Review themes: tourists with toothache ("Urlaub gerettet"), anxious patients, same-day help, kids' play corner.

Static HTML/CSS/JS, no build. `index.html` one page, `css/styles.css` (tokens at the top), `js/main.js`.
- Palette: Müritzblau #16406B (brand) + Bojen-Orange #F0673A (accent); white ground, mist tint #F2F6FA.
  No existing logo anywhere → own mark `assets/mark.svg` (tooth standing in a lake wave). Fonts Bricolage Grotesque + Figtree, self-hosted.
- Radius family: logo tile r = 25 % of --ctl-h → --ctl-r; header strip = --ctl-r + --inset.
- Header: one continuous floating strip; ≤64rem the same strip grows downward into the menu sheet (scroll lock, rows with arrows).
- Leistungen = tabs by situation (all panels stacked in one grid cell → no jump); ≤48rem sideways chip row.
- Status/hours logic in main.js (`HOURS`, Europe/Berlin). Hours widget: bars on a 7–20 h scale + "jetzt" line.
- Photos: Unsplash stand-ins tagged "Beispielbild". Doctors have monogram tiles ("Foto folgt"), no stock faces.
- Copyright set (Design Principles rule 15) NOT added yet — add as the final step once the design is approved.
- Bump `?v=` on CSS/JS links with every deploy that changes them.
