# VasuPrint photo agent: generate and place the remaining photos

Paste everything from "Your task" down into your AI agent. Run it once per batch. The agent ticks the boxes in this file as it goes, so each new run picks up where the last one stopped.

**Quick start for each new batch** (in the project folder `D:\PROJECTS\vasuprints`):

> Read `docs/PHOTO-AGENT-PROMPT.md` and do the next unfinished batch.

---

## Your task

You are generating product photos for the VasuPrint website (a custom packaging, sticker and tag printer) and placing them into the site. There are **48 images left, split into 5 batches of up to 10**, because the image tool allows about 10 images at a time.

**Each run: do exactly one batch, the first batch below that still has unticked boxes. Then stop and report.** Don't start the next batch, even if quota seems left over.

### Step 1. Generate each image in the batch

For every unticked item in the batch:

1. Build the full prompt as: **the item's prompt + a blank line + the Style block below**. Put the Negative prompt in the tool's negative prompt box. If the tool has no such box, add `Avoid: ` plus the Negative prompt at the end. If the item says "Also avoid", add those words to the avoid list as well.
2. Generate in **4:3 landscape at 2048 × 1536 or larger**. If the tool only has presets, choose its largest 4:3 (or 3:2) size. If it has an upscale option, use it. The last batch came out at 1200 × 896, which is too small.
3. If the tool can take a reference image, give it `public/images/products/mono-carton-boxes/1.webp`. It sets the look: light cool grey background, soft light from the upper left.
4. Save it as PNG at **exactly the path shown** (for example `vasuprint-photos/products/sbs-boxes/2.png`). Create the folders if they don't exist. Never use other names: the import script only accepts `1.png` to `6.png` inside a product folder.

### Step 2. Check each image before you keep it

Look at every image yourself and reject it if any of these are true:

- It shows readable text, letters, numbers, units, fake words, or letter-like squiggles. This is the most common failure: last batch, 2 of 13 were rejected for it.
- It shows a real brand logo, a barcode, a QR code, or a face.
- A hand has the wrong number of fingers or looks unnatural.
- A box is physically wrong: warped edges, flaps that make no sense, melted shapes.
- The background is dark, coloured or busy (only the About page may show a real room).
- The image doesn't show what the prompt and the alt text describe.
- It's smaller than 1600 × 1200 or clearly not landscape.

If an image fails, regenerate it once with a fix added to the prompt (for example "no letters, no characters of any alphabet"). If it fails twice, don't save it. Leave its box unticked and note why in your report.

### Step 3. Place the batch on the site

Run these from the project folder `D:\PROJECTS\vasuprints`:

```bash
pnpm images ./vasuprint-photos
pnpm typecheck
```

`pnpm images` crops every photo in `vasuprint-photos/` to 4:3, resizes it, saves WebP files in `public/images/` and rewrites `src/content/images-manifest.ts`. It re-processes earlier batches too, which is fine. Both commands must finish without errors. Don't edit `images-manifest.ts` by hand.

Optional, to see the result: `pnpm dev`, then open http://localhost:3000 and the product pages for this batch.

### Step 4. Update this file and report

1. Change `- [ ]` to `- [x]` for each image you placed.
2. If a photo came out a bit different from its alt text but is still good, keep it and list it in your report, so the alt text can be updated.
3. Report back: the batch number, images placed, images that failed and why, and the output of both commands.

### Rules

- Don't move, rename or delete anything in `vasuprint-photos/_flagged/`. Those are rejected images kept for reference, and the import script ignores that folder.
- Don't touch any other code.
- Don't commit or push. Don't `git add` the `vasuprint-photos/` folder: only the WebP files in `public/images/` and the manifest belong in git.

---

## Style block (add after every prompt)

```
Premium commercial studio product photography. Soft diffused daylight from the upper left, gentle natural shadows falling to the lower right. Seamless very light cool grey background (#F1F4F7) with a faint paper texture. Shallow depth of field with crisp focus on the product. Realistic paper, board, vinyl and fabric materials with true-to-life print detail. Colour accents of deep navy (#102B46) and teal (#00A6A6) where natural, plus white, kraft and a touch of gold or silver foil. Clean minimal composition, product filling about 60% of the frame, at least 10% empty space on every side. Shot on a full-frame camera with a 100mm macro lens at f/5.6. Photorealistic, sharp, high dynamic range, 4:3 landscape.
```

## Negative prompt

```
readable text, words, letters, numbers, fake text, gibberish lettering, watermark, signature, real brand logos, barcodes with numbers, QR codes, people's faces, extra fingers, deformed hands, distorted or impossible packaging, warped box edges, melted shapes, CGI plastic look, cartoon, illustration, oversaturated colours, harsh shadows, coloured background, dark background, lens flare, vignette, frame, border, collage, split screen, mockup template look, low resolution, blur, noise
```

---

## The batches

Batches 1 and 2 cover photo 1 of every product and the two rejected images. Photo 1 matters most, because it's the product card and the social share image. Batches 3 to 5 fill in photos 2 to 4.

### Batch 1 (10 images)

- [x] **1. `vasuprint-photos/products/pvc-gumming-stickers/1.png`** (PVC Gumming Stickers · photo 1)  
  **Regenerate:** the first version was rejected. Has readable text on the label ("kW", "kg", "liter") and an energy-rating style layout. The brief asks for no text, and real units on a fake spec plate look odd to buyers.  
  Alt text it must match: "Silver metallic PVC label on a home appliance panel"

  ```
  A brushed silver metallic PVC label with rounded corners applied flat to the white side panel of a modern home appliance, 3/4 angle. The label shows only a single row of four simple dark navy pictogram icons (a gear, a water droplet, a thermometer, a wave) above three thin horizontal navy rule lines and a short row of solid navy bars. Absolutely no letters, numbers, units or words anywhere on the label or the appliance. Soft reflections on the brushed metal, light grey seamless background. (Also avoid: units, kW, kg, liter, energy rating label, letters on label)
  ```

- [x] **2. `vasuprint-photos/products/duplex-boxes/1.png`** (Duplex Boxes · photo 1)  
  **Regenerate:** the first version was rejected. The pattern is full of letter-like strokes (shapes that read as "Я", "Cy", "A") which look like garbled text. Tuck flaps also show a stray white strip.  
  Alt text it must match: "Colorful printed duplex boxes in different sizes on a light grey background"

  ```
  Three colourful printed duplex board retail boxes in small, medium and large sizes for household products, staggered on a light grey seamless background, 3/4 angle. The print uses only smooth geometric shapes: large circles, half-circles, wide diagonal stripes and dot grids in teal, navy, white and a touch of coral, with a simple hexagon logo mark on a plain white square panel. No letterforms, no calligraphic strokes, no characters from any alphabet. Glossy varnish, neat closed tuck flaps, straight folds, no words. (Also avoid: letterforms, glyphs, calligraphy, graffiti, characters)
  ```

- [x] **3. `vasuprint-photos/categories/custom-tags.png`** (Custom Tags category)

  ```
  A fanned group of premium hang tags laid over a neatly folded neutral linen shirt on a light grey surface, 3/4 angle: a thick matte black card tag with a gold foil abstract monogram, a natural kraft tag with a navy logo mark, a white tag with a silver metal eyelet and a teal edge, and a frosted translucent plastic tag. Cotton and jute strings curling naturally. No words.
  ```

- [x] **4. `vasuprint-photos/products/paper-gumming-stickers/1.png`** (Paper Gumming Stickers · photo 1)  
  Alt text it must match: "Roll of printed paper gumming stickers beside labeled jars on a light grey background"

  ```
  A roll of glossy printed paper product labels partly unrolled across the surface, beside three small clear glass jars of honey, spices and jam wearing matching round and rectangular paper labels in navy, teal and cream with abstract leaf logo marks. Light grey seamless background, 3/4 angle, no words.
  ```

- [x] **5. `vasuprint-photos/products/die-cut-stickers/1.png`** (Die-Cut Stickers · photo 1)  
  Alt text it must match: "Assorted custom die-cut logo stickers on a light grey background"

  ```
  An assortment of custom die-cut vinyl logo stickers in playful abstract shapes, a cloud, a leaf, a lightning bolt, a circular badge and a rounded star, each with a thin white border, in navy, teal, white and coral, scattered loosely on a light grey seamless background, top-down 3/4 angle, no words.
  ```

- [x] **6. `vasuprint-photos/products/dtf-transfer-stickers/1.png`** (DTF Transfer Stickers · photo 1)  
  Alt text it must match: "Full-color DTF transfer gang sheet on a light grey background"

  ```
  A large DTF transfer gang sheet on clear PET film filled edge to edge with many vibrant full-colour abstract illustrations, badges and patterns, partly rolled at one end, lying on a light grey seamless background at a 3/4 angle. The bright colours and the slightly glossy film are clearly visible, no words.
  ```

- [x] **7. `vasuprint-photos/products/custom-uv-transfer-stickers/1.png`** (Custom UV Transfer Stickers · photo 1)  
  Alt text it must match: "Custom UV transfer wrap on a frosted glass cup on a light grey background"

  ```
  A frosted glass cup with a full wraparound custom UV transfer design of flowing abstract waves in navy and teal, the print glossy against the frosted glass. Light grey seamless background, 3/4 angle, soft reflections, no words.
  ```

- [x] **8. `vasuprint-photos/products/custom-hang-tags/1.png`** (Custom Hang Tags · photo 1)  
  Alt text it must match: "Premium hang tags with gold foil and cotton strings on a light grey background"

  ```
  A group of premium hang tags with cotton strings fanned on a light grey seamless surface, 3/4 angle: a thick matte black card tag with a gold foil abstract monogram, a natural kraft tag with a navy logo mark and a white tag with a thin teal edge. Strings curling naturally, no words.
  ```

- [x] **9. `vasuprint-photos/products/plastic-tags/1.png`** (Plastic Tags · photo 1)  
  Alt text it must match: "Frosted plastic product tags with printed logo on a light grey background"

  ```
  Frosted translucent plastic product tags with rounded corners, printed with a navy abstract logo mark, fanned out on a light grey seamless background, 3/4 angle, light passing softly through the frosted plastic, no words.
  ```

- [x] **10. `vasuprint-photos/products/mono-carton-boxes/2.png`** (Mono Carton Boxes · photo 2)  
  Alt text it must match: "Open reverse tuck end mono carton showing the inside print"

  ```
  Close view of a single open reverse tuck end mono carton, top flap folded back, showing that the inside of the box is also printed with a teal and navy geometric pattern. A small frosted glass serum bottle sits half inside the box. Light grey seamless background, 30-degree high angle, shallow depth of field, no words.
  ```


### Batch 2 (10 images)

- [x] **11. `vasuprint-photos/products/mono-carton-boxes/3.png`** (Mono Carton Boxes · photo 3)  
  Alt text it must match: "Stack of flat-packed printed mono cartons"

  ```
  A neat stack of about twenty flat-packed printed mono carton blanks, navy and white designs, die-cut flaps and crease lines clearly visible on the top blank, a second smaller stack slightly offset behind it. Light grey seamless background, top-down 3/4 view, crisp detail on the cut edges, no words.
  ```

- [x] **12. `vasuprint-photos/products/mono-carton-boxes/4.png`** (Mono Carton Boxes · photo 4)  
  Alt text it must match: "Close-up of spot UV and embossing on a mono carton"

  ```
  Macro close-up of the front panel of a navy mono carton: a glossy spot UV abstract logo shining over a velvety matte lamination, with a subtle raised embossed border around it. Low raking light from the left reveals the texture and the contrast between gloss and matte. Very shallow depth of field, no words.
  ```

- [x] **13. `vasuprint-photos/products/sbs-boxes/2.png`** (SBS Boxes · photo 2)  
  Alt text it must match: "Premium SBS perfume box beside its open lid"

  ```
  An elegant faceted glass perfume bottle standing beside its open white SBS lid-and-base box. The lid leans against the base, and the base holds a white paperboard insert with a cut-out that matches the bottle. Light grey seamless background, close framing, soft reflections in the glass, no words.
  ```

- [x] **14. `vasuprint-photos/products/sbs-boxes/3.png`** (SBS Boxes · photo 3)  
  Alt text it must match: "Edge detail of SBS board showing white core"

  ```
  Edge detail of several cut sheets of SBS paperboard fanned slightly apart, showing the pure solid white core through the full thickness of the board and the smooth coated top surface. Light grey background, side angle, very sharp focus on the cut edges, shallow depth of field.
  ```

- [x] **15. `vasuprint-photos/products/sbs-boxes/4.png`** (SBS Boxes · photo 4)  
  Alt text it must match: "Embossed logo on a white SBS carton"

  ```
  Macro of a blind embossed abstract geometric logo raised from the surface of a bright white soft-touch SBS carton, no ink, only the relief. Strong low raking light from the left creates soft shadows around the embossing. Very shallow depth of field, white on white, minimal, no words.
  ```

- [x] **16. `vasuprint-photos/products/duplex-boxes/2.png`** (Duplex Boxes · photo 2)  
  Alt text it must match: "Duplex carton showing grey inner back"

  ```
  A colourful printed duplex box with its top flaps open, angled to show that the inside surfaces are the natural grey back of the duplex board while the outside is bright and printed. A wooden toy car rests partly inside. Light grey seamless background, close framing, 30-degree high angle, no words.
  ```

- [x] **17. `vasuprint-photos/products/duplex-boxes/3.png`** (Duplex Boxes · photo 3)  
  Alt text it must match: "Duplex box with euro-slot hang tab"

  ```
  A printed duplex retail box with a die-cut euro-slot hang tab at the top, hanging from a chrome retail peg hook, with two more identical boxes hanging behind it slightly out of focus. Light grey background, eye-level angle, shallow depth of field, no words.
  ```

- [x] **18. `vasuprint-photos/products/duplex-boxes/4.png`** (Duplex Boxes · photo 4)  
  Alt text it must match: "Flat-packed duplex cartons in a neat stack"

  ```
  A neat stack of flat-packed printed duplex carton blanks with colourful printed sides up, the cut edges showing the white top layer and grey back layers of the board. Light grey seamless background, 3/4 angle, sharp detail, no words.
  ```

- [x] **19. `vasuprint-photos/products/paper-gumming-stickers/2.png`** (Paper Gumming Stickers · photo 2)  
  Alt text it must match: "Sheet of round paper stickers with one peeled"

  ```
  A sheet of round printed paper stickers, three rows of navy and teal circular designs with abstract logo marks, on its glossy backing liner. One sticker is half peeled and curling up from the sheet. Light grey background, top-down angle with slight tilt, no words.
  ```

- [x] **20. `vasuprint-photos/products/paper-gumming-stickers/3.png`** (Paper Gumming Stickers · photo 3)  
  Alt text it must match: "Kraft paper labels on gift boxes"

  ```
  Small gift boxes wrapped in plain brown kraft paper, each sealed with a round or rectangular natural kraft paper label printed with a simple navy abstract logo mark, tied with thin cotton twine. Light grey background, 3/4 angle, warm and handmade but tidy, no words.
  ```


### Batch 3 (10 images)

- [ ] **21. `vasuprint-photos/products/paper-gumming-stickers/4.png`** (Paper Gumming Stickers · photo 4)  
  Alt text it must match: "Close-up of a glossy chromo paper product label"

  ```
  Macro close-up of a glossy chromo paper product label on a jar, showing sharp fine printed patterns and smooth gradients in navy and teal, with the label edge lifting slightly from the glass. Raking light reflects off the gloss coating. Very shallow depth of field, no words.
  ```

- [ ] **22. `vasuprint-photos/products/vinyl-gumming-stickers/2.png`** (Vinyl Gumming Stickers · photo 2)  
  Alt text it must match: "Transparent vinyl sticker on a glass bottle"

  ```
  A clear glass bottle of pale golden oil with a transparent vinyl label printed with a minimal white and teal design, so clear that the design looks printed directly on the glass. Close framing, light grey background, soft reflections and backlight through the glass, no words.
  ```

- [ ] **23. `vasuprint-photos/products/vinyl-gumming-stickers/3.png`** (Vinyl Gumming Stickers · photo 3)  
  Alt text it must match: "Roll of vinyl labels"

  ```
  A roll of white glossy vinyl labels with die-cut oval shapes on a clear liner, standing on its edge, with a short length unrolled in front showing evenly spaced labels printed with a teal abstract logo mark. Light grey seamless background, 3/4 angle, no words.
  ```

- [ ] **24. `vasuprint-photos/products/vinyl-gumming-stickers/4.png`** (Vinyl Gumming Stickers · photo 4)  
  Alt text it must match: "Water droplets on a vinyl label showing water resistance"

  ```
  Macro of fresh water droplets beading on a glossy white vinyl label on a navy plastic bottle. The droplets sit as clear round beads on the surface without soaking in, the print underneath crisp and intact. Shallow depth of field, soft side light, no words.
  ```

- [ ] **25. `vasuprint-photos/products/pvc-gumming-stickers/2.png`** (PVC Gumming Stickers · photo 2)  
  Alt text it must match: "Transparent PVC sticker on a plastic container"

  ```
  A transparent PVC sticker with a white and teal abstract logo mark applied to a translucent frosted plastic storage container, so only the printed design is visible. Close framing, light grey background, soft backlight through the container, no words.
  ```

- [ ] **26. `vasuprint-photos/products/pvc-gumming-stickers/3.png`** (PVC Gumming Stickers · photo 3)  
  Alt text it must match: "Sheet of white PVC labels with die-cut corners"

  ```
  A sheet of thick white PVC labels with rounded die-cut corners, printed with a navy abstract logo mark, one corner of the sheet lifted to show the thickness and stiffness of the material and the backing liner beneath. Light grey seamless background, 3/4 angle, no words.
  ```

- [ ] **27. `vasuprint-photos/products/pvc-gumming-stickers/4.png`** (PVC Gumming Stickers · photo 4)  
  Alt text it must match: "Gold PVC logo sticker close-up"

  ```
  Macro close-up of a gold metallic PVC logo sticker with an abstract circular emblem, on a matte black surface, its mirror-like gold sheen catching low raking light. Very shallow depth of field, rich but not overexposed reflections, no words.
  ```

- [ ] **28. `vasuprint-photos/products/die-cut-stickers/2.png`** (Die-Cut Stickers · photo 2)  
  Alt text it must match: "Kiss-cut sticker sheet with several shapes"

  ```
  A kiss-cut sticker sheet holding six different die-cut sticker shapes in navy, teal and coral, the cut lines visible through the vinyl to the backing, lying flat on a light grey surface, top-down angle with slight tilt, no words.
  ```

- [ ] **29. `vasuprint-photos/products/die-cut-stickers/3.png`** (Die-Cut Stickers · photo 3)  
  Alt text it must match: "Hand peeling a die-cut vinyl sticker"

  ```
  A hand peeling a glossy die-cut vinyl sticker shaped like a leaf from its backing sheet, sticker halfway off and curving. Close framing on the hand and sticker, wrist down only, light grey background, shallow depth of field, no words.
  ```

- [ ] **30. `vasuprint-photos/products/die-cut-stickers/4.png`** (Die-Cut Stickers · photo 4)  
  Alt text it must match: "Die-cut stickers applied to packaging"

  ```
  Die-cut stickers used as seals and branding on packaging: a round teal sticker sealing a kraft mailer box, a leaf-shaped sticker on a white paper bag and a small badge sticker on tissue paper. Light grey background, 3/4 angle, no words.
  ```


### Batch 4 (10 images)

- [ ] **31. `vasuprint-photos/products/dtf-transfer-stickers/2.png`** (DTF Transfer Stickers · photo 2)  
  Alt text it must match: "DTF transfer being peeled from a black T-shirt after pressing"

  ```
  A hand peeling the clear carrier film away from a freshly pressed, vibrant full-colour DTF print of an abstract mountain illustration on a black cotton T-shirt, film halfway lifted at a diagonal. Close framing, wrist down only, light grey background, no words.
  ```

- [ ] **32. `vasuprint-photos/products/dtf-transfer-stickers/3.png`** (DTF Transfer Stickers · photo 3)  
  Alt text it must match: "Heat press applying a DTF transfer to a T-shirt"

  ```
  A modern clamshell heat press closed on a white cotton T-shirt laid flat on the lower platen, the shirt's sleeves and hem visible. Clean, bright, uncluttered studio setting, shallow depth of field, no people, no readable text on the machine.
  ```

- [ ] **33. `vasuprint-photos/products/dtf-transfer-stickers/4.png`** (DTF Transfer Stickers · photo 4)  
  Alt text it must match: "Close-up of DTF print detail on fabric"

  ```
  Macro of a DTF print on cotton fabric: vivid saturated colours and fine gradients of an abstract illustration with the knit texture of the fabric visible at the print edge, showing a flexible thin print. Raking light, very shallow depth of field, no words.
  ```

- [ ] **34. `vasuprint-photos/products/dtf-heat-transfer-stickers/2.png`** (DTF Heat Transfer Stickers · photo 2)  
  Alt text it must match: "DTF printed neck label inside a T-shirt collar"

  ```
  Inside the back collar of a navy T-shirt, a printed tagless neck label in white showing a simple abstract logo mark and small size icons, no letters or numbers. Close framing, collar folded open, light grey background, soft light, no readable text.
  ```

- [ ] **35. `vasuprint-photos/products/dtf-heat-transfer-stickers/3.png`** (DTF Heat Transfer Stickers · photo 3)  
  Alt text it must match: "Chest logo applied with DTF on a polo shirt"

  ```
  A neatly folded white piqué polo shirt with a small full-colour teal and navy abstract chest logo applied with DTF on the left chest, the print crisp and flat. Light grey seamless background, 3/4 angle, no words.
  ```

- [ ] **36. `vasuprint-photos/products/dtf-heat-transfer-stickers/4.png`** (DTF Heat Transfer Stickers · photo 4)  
  Alt text it must match: "Sheet of identical pre-cut DTF logo transfers"

  ```
  A full sheet of identical pre-cut DTF logo transfers on clear carrier film, a grid of twenty small teal and white circular emblems with even spacing, lying flat on a light grey surface, top-down view, no words.
  ```

- [ ] **37. `vasuprint-photos/products/uv-dtf-sticker-printing/2.png`** (UV DTF Stickers · photo 2)  
  Alt text it must match: "UV DTF sticker being applied to a metal tumbler"

  ```
  A hand pressing a colourful UV DTF decal onto a matte black stainless steel tumbler and lifting away the clear carrier film, leaving the decal sharply on the metal. Close framing, wrist down only, light grey background, no words.
  ```

- [ ] **38. `vasuprint-photos/products/uv-dtf-sticker-printing/3.png`** (UV DTF Stickers · photo 3)  
  Alt text it must match: "Close-up of the raised glossy texture of a UV DTF print"

  ```
  Extreme close-up of the raised glossy varnish layer of a UV DTF print on a glass surface: a slightly dimensional, liquid-looking shine over bright colours, with visible edge height catching the light. Low raking light, very shallow depth of field, no words.
  ```

- [ ] **39. `vasuprint-photos/products/uv-dtf-sticker-printing/4.png`** (UV DTF Stickers · photo 4)  
  Alt text it must match: "Sheet of UV DTF decals with carrier film"

  ```
  A UV DTF decal sheet with several colourful abstract decals, the clear carrier film partially peeled back at one corner, lying on a light grey surface, top-down angle with a slight tilt, no words.
  ```

- [ ] **40. `vasuprint-photos/products/custom-uv-transfer-stickers/2.png`** (Custom UV Transfer Stickers · photo 2)  
  Alt text it must match: "Branded logo decal on a stainless steel tumbler"

  ```
  A brushed stainless steel tumbler with a small glossy UV transfer abstract logo mark in teal and white near the top, close framing on the logo area, light grey background, soft reflections on the metal, no words.
  ```


### Batch 5 (8 images)

- [ ] **41. `vasuprint-photos/products/custom-uv-transfer-stickers/3.png`** (Custom UV Transfer Stickers · photo 3)  
  Alt text it must match: "UV transfer label on a perfume bottle"

  ```
  An elegant rectangular glass perfume bottle with a raised glossy UV transfer label of a gold and navy abstract monogram on the front, soft reflections and light passing through the pale pink liquid. Light grey background, close framing, no words.
  ```

- [ ] **42. `vasuprint-photos/products/custom-uv-transfer-stickers/4.png`** (Custom UV Transfer Stickers · photo 4)  
  Alt text it must match: "Set of corporate gift items with UV transfer logos"

  ```
  A curated corporate gift set laid out flat: a navy hardcover notebook, a white metal water bottle, a clear acrylic desk plaque and a black pen, each carrying the same small teal abstract UV transfer logo mark. Light grey surface, top-down flat lay, tidy spacing, no words.
  ```

- [ ] **43. `vasuprint-photos/products/custom-hang-tags/2.png`** (Custom Hang Tags · photo 2)  
  Alt text it must match: "Kraft hang tag on a folded shirt"

  ```
  A natural kraft hang tag printed with a small navy abstract logo mark, attached with jute string to the collar button of a neatly folded oatmeal linen shirt. Close framing, light grey background, soft light, no words.
  ```

- [ ] **44. `vasuprint-photos/products/custom-hang-tags/3.png`** (Custom Hang Tags · photo 3)  
  Alt text it must match: "Die-cut hang tags with metal eyelets"

  ```
  Die-cut hang tags in custom shapes (rounded arch, scalloped circle, notched rectangle) in white, navy and kraft, each with a silver metal eyelet, stacked and fanned to show their shapes and thickness. Light grey seamless background, 3/4 angle, no words.
  ```

- [ ] **45. `vasuprint-photos/products/custom-hang-tags/4.png`** (Custom Hang Tags · photo 4)  
  Alt text it must match: "Embossed logo detail on a black hang tag"

  ```
  Macro of a deep embossed abstract monogram on a thick matte black hang tag, the raised logo finished in gold foil, low raking light showing the relief and the foil's shine. Very shallow depth of field, no words.
  ```

- [ ] **46. `vasuprint-photos/products/plastic-tags/2.png`** (Plastic Tags · photo 2)  
  Alt text it must match: "Transparent PVC tag on swimwear"

  ```
  A transparent PVC tag printed in white with a simple abstract logo mark, attached by a clear plastic loop to a teal swimsuit laid flat. Close framing, light grey background, soft light, no words.
  ```

- [ ] **47. `vasuprint-photos/products/plastic-tags/3.png`** (Plastic Tags · photo 3)  
  Alt text it must match: "White plastic plant tags in a nursery pot"

  ```
  White plastic plant tags with pointed ends pushed into small terracotta nursery pots holding young green seedlings, each tag printed with a small teal leaf mark. Soft natural light from the left, light grey background, 3/4 angle, no words.
  ```

- [ ] **48. `vasuprint-photos/products/plastic-tags/4.png`** (Plastic Tags · photo 4)  
  Alt text it must match: "Die-cut plastic tags with holes in a fanned stack"

  ```
  A stack of die-cut plastic tags in white, frosted and clear, each with a punched hole, slightly fanned so the edges and thickness are visible. Light grey seamless background, 3/4 angle, sharp detail on the edges, no words.
  ```

