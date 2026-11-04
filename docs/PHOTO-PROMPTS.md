# VasuPrint photo prompts

This file has every photo the website can use: 1 home hero, 1 About page image, 5 category images and 4 photos for each of the 13 products. That is **59 images**. Each one has a ready-to-paste prompt, the exact filename to save it as, and the size to generate it at.

You don't have to make all of them at once. The site falls back to its drawn illustrations for any image that is missing, so you can start with slot 1 of each product (13 images) and add the rest later.

---

## 1. How to generate

**Size.** Generate every image in **4:3 landscape**, at **2048 × 1536 or larger**. Make the home hero **2400 × 1800 or larger**. If your tool only offers presets, pick 4:3 (or 3:2 and let the script crop it). PNG, JPG or WebP are all fine.

**You don't need to resize anything.** The import script crops each image to 4:3 with smart cropping (it keeps the product in frame), resizes it (1600 × 1200, hero 2000 × 1500), converts it to WebP and writes it into the site.

**Paste the style block after every prompt.** It is what makes 59 separate generations look like one studio shoot. If your tool has a separate "negative prompt" box, paste the negative prompt there. If it doesn't, add `Avoid:` followed by the negative prompt at the end.

**Keep a seed or style reference if your tool supports it.** Generate the first product hero you like, then use it as the style or reference image for the rest. Consistent background and light matter more than any single image being perfect.

### 1.1 Style block (paste after every prompt)

```
Premium commercial studio product photography. Soft diffused daylight from the upper left, gentle natural shadows falling to the lower right. Seamless very light cool grey background (#F1F4F7) with a faint paper texture. Shallow depth of field with crisp focus on the product. Realistic paper, board, vinyl and fabric materials with true-to-life print detail. Colour accents of deep navy (#102B46) and teal (#00A6A6) where natural, plus white, kraft and a touch of gold or silver foil. Clean minimal composition, product filling about 60% of the frame, at least 10% empty space on every side. Shot on a full-frame camera with a 100mm macro lens at f/5.6. Photorealistic, sharp, high dynamic range, 4:3 landscape.
```

### 1.2 Negative prompt

```
readable text, words, letters, numbers, fake text, gibberish lettering, watermark, signature, real brand logos, barcodes with numbers, QR codes, people's faces, extra fingers, deformed hands, distorted or impossible packaging, warped box edges, melted shapes, CGI plastic look, cartoon, illustration, oversaturated colours, harsh shadows, coloured background, dark background, lens flare, vignette, frame, border, collage, split screen, mockup template look, low resolution, blur, noise
```

### 1.3 Logos and text on products

AI tools invent garbled letters. Ask for **"a simple abstract logo mark"** (a circle with a line, a leaf, a geometric monogram) and **no words**. Every prompt below already does this. If an image comes out with fake text on it, regenerate it or retouch the text out. Readable nonsense words on a product make the site look fake.

### 1.4 Hands

Some in-use shots include a hand. Keep it to one or two hands, no face, natural nails, shown from the wrist down. Check the fingers before you keep an image.

---

## 2. Folder layout to send me

Name the files exactly like this. The extension can be `.png`, `.jpg`, `.jpeg`, `.webp` or `.avif`.

```
vasuprint-photos/
  hero/home.png
  pages/about.png
  categories/packaging-boxes.png
  categories/custom-stickers.png
  categories/dtf-stickers.png
  categories/uv-dtf-stickers.png
  categories/custom-tags.png
  products/mono-carton-boxes/1.png … 4.png
  products/sbs-boxes/1.png … 4.png
  products/duplex-boxes/1.png … 4.png
  products/paper-gumming-stickers/1.png … 4.png
  products/vinyl-gumming-stickers/1.png … 4.png
  products/pvc-gumming-stickers/1.png … 4.png
  products/die-cut-stickers/1.png … 4.png
  products/dtf-transfer-stickers/1.png … 4.png
  products/dtf-heat-transfer-stickers/1.png … 4.png
  products/uv-dtf-sticker-printing/1.png … 4.png
  products/custom-uv-transfer-stickers/1.png … 4.png
  products/custom-hang-tags/1.png … 4.png
  products/plastic-tags/1.png … 4.png
```

Zip the folder and send it. On my side it is one command, `pnpm images ./vasuprint-photos`, then a rebuild. Photo 1 of each product becomes its card image, its first gallery photo and the background of its social share card.

**The order of photos 1 to 4 matters.** Each slot already has alt text (the description screen readers and Google read) written for it, which is quoted under each prompt. If a photo turns out different from its description, tell me and I'll update the alt text, or you can edit it in the admin panel.

| Slot | What it shows | Framing |
|---|---|---|
| 1 | Hero: the product group | 3/4 angle (camera about 30° above, product turned about 35°), centred, on the seamless grey |
| 2 | In use or opened | Closer framing, product applied or being used |
| 3 | Format or detail | Stack, roll, sheet, structure or a second use |
| 4 | Macro or finish | Very close, material and finish texture, raking light |

---

## 3. Home and About

### Home hero: `hero/home.png` (2400 × 1800 or larger)

Shown large at the top of the home page, on the right half on desktop. Keep the arrangement slightly to the right of centre with calm space on the left.

```
A curated arrangement of printed packaging and labels on a light grey surface, seen from a 30-degree high angle. In the back, a matte navy mono carton box with a thin gold foil border and an abstract circle logo, standing upright beside a smaller bright white soft-touch box with a teal band. In front, a roll of glossy white product labels partly unrolled, a sheet of colourful DTF transfer designs on clear film curling at one edge, a small clear glass jar with a raised glossy UV DTF floral decal, and a small bundle of kraft hang tags tied with cotton string. Objects slightly overlapping in a balanced asymmetric composition, abstract logo marks only, no words.
```
Alt text: "Custom printed cartons, label rolls, DTF transfer sheet and hang tags arranged on a light grey surface"

### About page: `pages/about.png`

For this one only, the background may be a real interior in soft focus instead of seamless grey.

```
A clean, well-organised print finishing workspace in soft daylight from a large window on the left. On a pale wooden worktable: neat stacks of printed folding cartons in navy and white, two rolls of printed labels, a green self-healing cutting mat with a steel ruler, a fan of colour swatches and a few flat-packed box blanks with visible crease lines. A large-format printer and shelves softly out of focus in the background. Calm, orderly, premium atmosphere, no people, no readable text.
```
Alt text: "Print finishing workspace at VasuPrint"

---

## 4. Category images

Shown on the home page product grid and at the top of each category page.

### `categories/packaging-boxes.png`
```
Three custom printed folding carton boxes of different sizes arranged in a staggered row on a light grey seamless background, 3/4 angle. Left: a tall matte navy mono carton with a thin gold foil border and an abstract circle logo. Centre: a bright white premium SBS box with a soft-touch finish and a teal band. Right: a colourful printed duplex box with its top flap open, showing the grey back of the board inside. Crisp folds and straight edges, abstract logo marks only, no words.
```

### `categories/custom-stickers.png`
```
An arrangement of custom printed stickers and labels on a light grey seamless background, 3/4 angle: a roll of glossy white paper labels partly unrolled, a clear glass bottle wearing a transparent vinyl label with a minimal white and teal design, a brushed silver metallic PVC sticker, a kiss-cut sheet of die-cut vinyl stickers, and a few loose die-cut stickers in navy, teal, white and coral scattered in the foreground. Abstract shapes and logo marks only, no words.
```

### `categories/dtf-stickers.png`
```
A neatly folded black cotton T-shirt with a vibrant full-colour DTF printed abstract illustration on the chest, beside a large DTF transfer sheet on clear PET film showing several colourful abstract designs and badges, one corner peeling up, and a small stack of pre-cut teal and white circular logo transfers. On a light grey seamless background, 3/4 angle, no words.
```

### `categories/uv-dtf-stickers.png`
```
Hard-surface items decorated with glossy, slightly raised UV DTF decals, arranged on a light grey seamless background at a 3/4 angle: a clear glass storage jar with a colourful floral decal, a matte black stainless steel tumbler with a small geometric decal, a white ceramic mug with an abstract wave decal and a clear acrylic phone stand with a teal logo mark. In the foreground, a UV DTF decal sheet with its clear carrier film catching the light. No words.
```

### `categories/custom-tags.png`
```
A fanned group of premium hang tags laid over a neatly folded neutral linen shirt on a light grey surface, 3/4 angle: a thick matte black card tag with a gold foil abstract monogram, a natural kraft tag with a navy logo mark, a white tag with a silver metal eyelet and a teal edge, and a frosted translucent plastic tag. Cotton and jute strings curling naturally. No words.
```

---

## 5. Product photos (13 products × 4)

### 5.1 Mono Carton Boxes: `products/mono-carton-boxes/`

**1.png**
```
Three custom printed reverse tuck end mono carton boxes for a premium skincare product on a light grey seamless background, 3/4 angle. Matte laminated deep navy board with a thin gold foil border and a small gold abstract circle logo. One box standing upright, one lying on its side in front, one standing with its top tuck flap open showing a crisp white interior. Sharp folds, clean straight edges, no words.
```
Alt: "Matte-laminated mono carton boxes with gold foil detailing on a light grey background"

**2.png**
```
Close view of a single open reverse tuck end mono carton, top flap folded back, showing that the inside of the box is also printed with a teal and navy geometric pattern. A small frosted glass serum bottle sits half inside the box. Light grey seamless background, 30-degree high angle, shallow depth of field, no words.
```
Alt: "Open reverse tuck end mono carton showing the inside print"

**3.png**
```
A neat stack of about twenty flat-packed printed mono carton blanks, navy and white designs, die-cut flaps and crease lines clearly visible on the top blank, a second smaller stack slightly offset behind it. Light grey seamless background, top-down 3/4 view, crisp detail on the cut edges, no words.
```
Alt: "Stack of flat-packed printed mono cartons"

**4.png**
```
Macro close-up of the front panel of a navy mono carton: a glossy spot UV abstract logo shining over a velvety matte lamination, with a subtle raised embossed border around it. Low raking light from the left reveals the texture and the contrast between gloss and matte. Very shallow depth of field, no words.
```
Alt: "Close-up of spot UV and embossing on a mono carton"

### 5.2 SBS Boxes: `products/sbs-boxes/`

**1.png**
```
Two premium bright white SBS paperboard boxes on a light grey seamless background, 3/4 angle: a tall rectangular perfume box and a smaller square box. Smooth soft-touch finish, a silver foil abstract monogram on the front and a thin teal band near the base. Perfectly crisp corners and clean white edges, elegant and minimal, no words.
```
Alt: "Bright white SBS box with soft-touch finish and silver foil on a light grey background"

**2.png**
```
An elegant faceted glass perfume bottle standing beside its open white SBS lid-and-base box. The lid leans against the base, and the base holds a white paperboard insert with a cut-out that matches the bottle. Light grey seamless background, close framing, soft reflections in the glass, no words.
```
Alt: "Premium SBS perfume box beside its open lid"

**3.png**
```
Edge detail of several cut sheets of SBS paperboard fanned slightly apart, showing the pure solid white core through the full thickness of the board and the smooth coated top surface. Light grey background, side angle, very sharp focus on the cut edges, shallow depth of field.
```
Alt: "Edge detail of SBS board showing white core"

**4.png**
```
Macro of a blind embossed abstract geometric logo raised from the surface of a bright white soft-touch SBS carton, no ink, only the relief. Strong low raking light from the left creates soft shadows around the embossing. Very shallow depth of field, white on white, minimal, no words.
```
Alt: "Embossed logo on a white SBS carton"

### 5.3 Duplex Boxes: `products/duplex-boxes/`

**1.png**
```
Three colourful printed duplex board retail boxes in small, medium and large sizes for household products, arranged in a staggered group on a light grey seamless background, 3/4 angle. Bold graphics with teal, navy, white and a touch of coral, abstract shapes and a simple abstract logo mark. Glossy varnish finish, clean folds, no words.
```
Alt: "Colorful printed duplex boxes in different sizes on a light grey background"

**2.png**
```
A colourful printed duplex box with its top flaps open, angled to show that the inside surfaces are the natural grey back of the duplex board while the outside is bright and printed. A wooden toy car rests partly inside. Light grey seamless background, close framing, 30-degree high angle, no words.
```
Alt: "Duplex carton showing grey inner back"

**3.png**
```
A printed duplex retail box with a die-cut euro-slot hang tab at the top, hanging from a chrome retail peg hook, with two more identical boxes hanging behind it slightly out of focus. Light grey background, eye-level angle, shallow depth of field, no words.
```
Alt: "Duplex box with euro-slot hang tab"

**4.png**
```
A neat stack of flat-packed printed duplex carton blanks with colourful printed sides up, the cut edges showing the white top layer and grey back layers of the board. Light grey seamless background, 3/4 angle, sharp detail, no words.
```
Alt: "Flat-packed duplex cartons in a neat stack"

### 5.4 Paper Gumming Stickers: `products/paper-gumming-stickers/`

**1.png**
```
A roll of glossy printed paper product labels partly unrolled across the surface, beside three small clear glass jars of honey, spices and jam wearing matching round and rectangular paper labels in navy, teal and cream with abstract leaf logo marks. Light grey seamless background, 3/4 angle, no words.
```
Alt: "Roll of printed paper gumming stickers beside labeled jars on a light grey background"

**2.png**
```
A sheet of round printed paper stickers, three rows of navy and teal circular designs with abstract logo marks, on its glossy backing liner. One sticker is half peeled and curling up from the sheet. Light grey background, top-down angle with slight tilt, no words.
```
Alt: "Sheet of round paper stickers with one peeled"

**3.png**
```
Small gift boxes wrapped in plain brown kraft paper, each sealed with a round or rectangular natural kraft paper label printed with a simple navy abstract logo mark, tied with thin cotton twine. Light grey background, 3/4 angle, warm and handmade but tidy, no words.
```
Alt: "Kraft paper labels on gift boxes"

**4.png**
```
Macro close-up of a glossy chromo paper product label on a jar, showing sharp fine printed patterns and smooth gradients in navy and teal, with the label edge lifting slightly from the glass. Raking light reflects off the gloss coating. Very shallow depth of field, no words.
```
Alt: "Close-up of a glossy chromo paper product label"

### 5.5 Vinyl Gumming Stickers: `products/vinyl-gumming-stickers/`

**1.png**
```
Three cosmetic plastic bottles of different heights in navy, white and teal, each wearing a smooth glossy white vinyl label that wraps perfectly around the curve with no wrinkles, printed with a minimal abstract logo mark. Light grey seamless background, 3/4 angle, no words.
```
Alt: "Glossy white vinyl labels on cosmetic bottles on a light grey background"

**2.png**
```
A clear glass bottle of pale golden oil with a transparent vinyl label printed with a minimal white and teal design, so clear that the design looks printed directly on the glass. Close framing, light grey background, soft reflections and backlight through the glass, no words.
```
Alt: "Transparent vinyl sticker on a glass bottle"

**3.png**
```
A roll of white glossy vinyl labels with die-cut oval shapes on a clear liner, standing on its edge, with a short length unrolled in front showing evenly spaced labels printed with a teal abstract logo mark. Light grey seamless background, 3/4 angle, no words.
```
Alt: "Roll of vinyl labels"

**4.png**
```
Macro of fresh water droplets beading on a glossy white vinyl label on a navy plastic bottle. The droplets sit as clear round beads on the surface without soaking in, the print underneath crisp and intact. Shallow depth of field, soft side light, no words.
```
Alt: "Water droplets on a vinyl label showing water resistance"

### 5.6 PVC Gumming Stickers: `products/pvc-gumming-stickers/`

**1.png**
```
A brushed silver metallic PVC specification label applied to the white side panel of a modern home appliance, printed in dark navy with simple abstract icons and thin lines instead of text, rounded corners, perfectly flat. Light grey background, 3/4 angle, soft reflections on the brushed metal finish, no readable text.
```
Alt: "Silver metallic PVC label on a home appliance panel"

**2.png**
```
A transparent PVC sticker with a white and teal abstract logo mark applied to a translucent frosted plastic storage container, so only the printed design is visible. Close framing, light grey background, soft backlight through the container, no words.
```
Alt: "Transparent PVC sticker on a plastic container"

**3.png**
```
A sheet of thick white PVC labels with rounded die-cut corners, printed with a navy abstract logo mark, one corner of the sheet lifted to show the thickness and stiffness of the material and the backing liner beneath. Light grey seamless background, 3/4 angle, no words.
```
Alt: "Sheet of white PVC labels with die-cut corners"

**4.png**
```
Macro close-up of a gold metallic PVC logo sticker with an abstract circular emblem, on a matte black surface, its mirror-like gold sheen catching low raking light. Very shallow depth of field, rich but not overexposed reflections, no words.
```
Alt: "Gold PVC logo sticker close-up"

### 5.7 Die-Cut Stickers: `products/die-cut-stickers/`

**1.png**
```
An assortment of custom die-cut vinyl logo stickers in playful abstract shapes, a cloud, a leaf, a lightning bolt, a circular badge and a rounded star, each with a thin white border, in navy, teal, white and coral, scattered loosely on a light grey seamless background, top-down 3/4 angle, no words.
```
Alt: "Assorted custom die-cut logo stickers on a light grey background"

**2.png**
```
A kiss-cut sticker sheet holding six different die-cut sticker shapes in navy, teal and coral, the cut lines visible through the vinyl to the backing, lying flat on a light grey surface, top-down angle with slight tilt, no words.
```
Alt: "Kiss-cut sticker sheet with several shapes"

**3.png**
```
A hand peeling a glossy die-cut vinyl sticker shaped like a leaf from its backing sheet, sticker halfway off and curving. Close framing on the hand and sticker, wrist down only, light grey background, shallow depth of field, no words.
```
Alt: "Hand peeling a die-cut vinyl sticker"

**4.png**
```
Die-cut stickers used as seals and branding on packaging: a round teal sticker sealing a kraft mailer box, a leaf-shaped sticker on a white paper bag and a small badge sticker on tissue paper. Light grey background, 3/4 angle, no words.
```
Alt: "Die-cut stickers applied to packaging"

### 5.8 DTF Transfer Stickers: `products/dtf-transfer-stickers/`

**1.png**
```
A large DTF transfer gang sheet on clear PET film filled edge to edge with many vibrant full-colour abstract illustrations, badges and patterns, partly rolled at one end, lying on a light grey seamless background at a 3/4 angle. The bright colours and the slightly glossy film are clearly visible, no words.
```
Alt: "Full-color DTF transfer gang sheet on a light grey background"

**2.png**
```
A hand peeling the clear carrier film away from a freshly pressed, vibrant full-colour DTF print of an abstract mountain illustration on a black cotton T-shirt, film halfway lifted at a diagonal. Close framing, wrist down only, light grey background, no words.
```
Alt: "DTF transfer being peeled from a black T-shirt after pressing"

**3.png**
```
A modern clamshell heat press closed on a white cotton T-shirt laid flat on the lower platen, the shirt's sleeves and hem visible. Clean, bright, uncluttered studio setting, shallow depth of field, no people, no readable text on the machine.
```
Alt: "Heat press applying a DTF transfer to a T-shirt"

**4.png**
```
Macro of a DTF print on cotton fabric: vivid saturated colours and fine gradients of an abstract illustration with the knit texture of the fabric visible at the print edge, showing a flexible thin print. Raking light, very shallow depth of field, no words.
```
Alt: "Close-up of DTF print detail on fabric"

### 5.9 DTF Heat Transfer Stickers: `products/dtf-heat-transfer-stickers/`

**1.png**
```
A neat stack of identical pre-cut DTF heat transfer logo stickers, each a simple teal and white circular abstract emblem on its own square of clear film, the top few fanned out. Light grey seamless background, 3/4 angle, no words.
```
Alt: "Pre-cut DTF heat transfer logos stacked on a light grey background"

**2.png**
```
Inside the back collar of a navy T-shirt, a printed tagless neck label in white showing a simple abstract logo mark and small size icons, no letters or numbers. Close framing, collar folded open, light grey background, soft light, no readable text.
```
Alt: "DTF printed neck label inside a T-shirt collar"

**3.png**
```
A neatly folded white piqué polo shirt with a small full-colour teal and navy abstract chest logo applied with DTF on the left chest, the print crisp and flat. Light grey seamless background, 3/4 angle, no words.
```
Alt: "Chest logo applied with DTF on a polo shirt"

**4.png**
```
A full sheet of identical pre-cut DTF logo transfers on clear carrier film, a grid of twenty small teal and white circular emblems with even spacing, lying flat on a light grey surface, top-down view, no words.
```
Alt: "Sheet of identical pre-cut DTF logo transfers"

### 5.10 UV DTF Stickers: `products/uv-dtf-sticker-printing/`

**1.png**
```
A clear glass storage jar with a wooden lid wearing a vibrant, slightly raised glossy UV DTF floral decal in teal, coral and navy, with a UV DTF transfer sheet holding several more decals lying in front of it. Light grey seamless background, 3/4 angle, no words.
```
Alt: "Colorful UV DTF decal on a glass jar on a light grey background"

**2.png**
```
A hand pressing a colourful UV DTF decal onto a matte black stainless steel tumbler and lifting away the clear carrier film, leaving the decal sharply on the metal. Close framing, wrist down only, light grey background, no words.
```
Alt: "UV DTF sticker being applied to a metal tumbler"

**3.png**
```
Extreme close-up of the raised glossy varnish layer of a UV DTF print on a glass surface: a slightly dimensional, liquid-looking shine over bright colours, with visible edge height catching the light. Low raking light, very shallow depth of field, no words.
```
Alt: "Close-up of the raised glossy texture of a UV DTF print"

**4.png**
```
A UV DTF decal sheet with several colourful abstract decals, the clear carrier film partially peeled back at one corner, lying on a light grey surface, top-down angle with a slight tilt, no words.
```
Alt: "Sheet of UV DTF decals with carrier film"

### 5.11 Custom UV Transfer Stickers: `products/custom-uv-transfer-stickers/`

**1.png**
```
A frosted glass cup with a full wraparound custom UV transfer design of flowing abstract waves in navy and teal, the print glossy against the frosted glass. Light grey seamless background, 3/4 angle, soft reflections, no words.
```
Alt: "Custom UV transfer wrap on a frosted glass cup on a light grey background"

**2.png**
```
A brushed stainless steel tumbler with a small glossy UV transfer abstract logo mark in teal and white near the top, close framing on the logo area, light grey background, soft reflections on the metal, no words.
```
Alt: "Branded logo decal on a stainless steel tumbler"

**3.png**
```
An elegant rectangular glass perfume bottle with a raised glossy UV transfer label of a gold and navy abstract monogram on the front, soft reflections and light passing through the pale pink liquid. Light grey background, close framing, no words.
```
Alt: "UV transfer label on a perfume bottle"

**4.png**
```
A curated corporate gift set laid out flat: a navy hardcover notebook, a white metal water bottle, a clear acrylic desk plaque and a black pen, each carrying the same small teal abstract UV transfer logo mark. Light grey surface, top-down flat lay, tidy spacing, no words.
```
Alt: "Set of corporate gift items with UV transfer logos"

### 5.12 Custom Hang Tags: `products/custom-hang-tags/`

**1.png**
```
A group of premium hang tags with cotton strings fanned on a light grey seamless surface, 3/4 angle: a thick matte black card tag with a gold foil abstract monogram, a natural kraft tag with a navy logo mark and a white tag with a thin teal edge. Strings curling naturally, no words.
```
Alt: "Premium hang tags with gold foil and cotton strings on a light grey background"

**2.png**
```
A natural kraft hang tag printed with a small navy abstract logo mark, attached with jute string to the collar button of a neatly folded oatmeal linen shirt. Close framing, light grey background, soft light, no words.
```
Alt: "Kraft hang tag on a folded shirt"

**3.png**
```
Die-cut hang tags in custom shapes (rounded arch, scalloped circle, notched rectangle) in white, navy and kraft, each with a silver metal eyelet, stacked and fanned to show their shapes and thickness. Light grey seamless background, 3/4 angle, no words.
```
Alt: "Die-cut hang tags with metal eyelets"

**4.png**
```
Macro of a deep embossed abstract monogram on a thick matte black hang tag, the raised logo finished in gold foil, low raking light showing the relief and the foil's shine. Very shallow depth of field, no words.
```
Alt: "Embossed logo detail on a black hang tag"

### 5.13 Plastic Tags: `products/plastic-tags/`

**1.png**
```
Frosted translucent plastic product tags with rounded corners, printed with a navy abstract logo mark, fanned out on a light grey seamless background, 3/4 angle, light passing softly through the frosted plastic, no words.
```
Alt: "Frosted plastic product tags with printed logo on a light grey background"

**2.png**
```
A transparent PVC tag printed in white with a simple abstract logo mark, attached by a clear plastic loop to a teal swimsuit laid flat. Close framing, light grey background, soft light, no words.
```
Alt: "Transparent PVC tag on swimwear"

**3.png**
```
White plastic plant tags with pointed ends pushed into small terracotta nursery pots holding young green seedlings, each tag printed with a small teal leaf mark. Soft natural light from the left, light grey background, 3/4 angle, no words.
```
Alt: "White plastic plant tags in a nursery pot"

**4.png**
```
A stack of die-cut plastic tags in white, frosted and clear, each with a punched hole, slightly fanned so the edges and thickness are visible. Light grey seamless background, 3/4 angle, sharp detail on the edges, no words.
```
Alt: "Die-cut plastic tags with holes in a fanned stack"

---

## 6. Check before you send

- [ ] No readable text, fake words, real brand logos or numbers on any product.
- [ ] Boxes look physically right: flaps, folds and tuck ends make sense, edges are straight.
- [ ] Hands have five fingers and look natural. No faces anywhere.
- [ ] The background is the same light cool grey across the set, and light comes from the upper left.
- [ ] Each photo matches its alt text. If it doesn't, note which ones and I'll update the descriptions.
- [ ] Filenames and folders match section 2 exactly.

## 7. Later: real photos

AI images are a good stand-in, but real photos of your own work sell better to B2B buyers. When you have a photoshoot, keep the same 4 slots and framing per product so each real photo can replace its AI version one for one. The same `pnpm images` command takes real photos too, or you can upload them per product in the admin panel.
