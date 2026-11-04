/**
 * Buyer guides. Long-form, genuinely useful answers to the questions buyers search for before they order.
 * Body is Markdown (## headings become the table of contents; tables and lists are supported).
 * Keep `products` in sync with the slugs the guide links to: product and category pages show guides that list them.
 */
export interface GuideData {
  slug: string;
  title: string;
  /** ≤ 60 chars; " | VasuPrint" is added when it fits. */
  seoTitle: string;
  /** 120–160 chars. */
  description: string;
  excerpt: string;
  topic: 'Packaging' | 'Stickers & labels' | 'DTF & UV DTF' | 'Tags' | 'Artwork';
  published: string;
  updated: string;
  products: string[];
  faqs: { q: string; a: string }[];
  body: string;
}

export const guidesData: GuideData[] = [
  {
    slug: 'dtf-vs-uv-dtf-stickers',
    title: 'DTF vs UV DTF stickers: which one do you need?',
    seoTitle: 'DTF vs UV DTF Stickers: Differences & Uses',
    description:
      'DTF transfers go on fabric with heat; UV DTF stickers go on hard surfaces with no heat. Compare process, durability, surfaces and cost to choose the right one.',
    excerpt: 'They sound alike but solve different problems. One is for T-shirts and fabric, the other for bottles, tumblers and hard surfaces.',
    topic: 'DTF & UV DTF',
    published: '2026-11-04',
    updated: '2026-11-04',
    products: ['dtf-transfer-stickers', 'dtf-heat-transfer-stickers', 'uv-dtf-sticker-printing', 'custom-uv-transfer-stickers'],
    faqs: [
      {
        q: 'Can UV DTF stickers be used on T-shirts?',
        a: 'No. UV DTF is designed for hard, smooth surfaces. On fabric it cracks and peels when the garment stretches or is washed. Use DTF heat transfers for clothing.',
      },
      {
        q: 'Do I need a heat press for UV DTF?',
        a: 'No. UV DTF stickers are applied by hand: peel the backing, place the design, rub it firmly and peel away the top film. DTF transfers for fabric do need a heat press.',
      },
      {
        q: 'Which one lasts longer?',
        a: 'Both are durable when used on the right surface. DTF prints on fabric survive repeated washing when pressed correctly. UV DTF resists water and everyday handling on hard surfaces, but is not meant for dishwashers or abrasive scrubbing.',
      },
    ],
    body: `"DTF" and "UV DTF" are often mentioned together, and buyers regularly order one when they need the other. The names share three letters, but the two are different products made with different inks for different surfaces. This guide explains both in plain terms so you can order the right one the first time.

## The short answer

- **Printing on clothing or fabric?** Choose **DTF** (direct-to-film) heat transfers. They are pressed onto the fabric with heat and stay soft and flexible.
- **Branding a bottle, tumbler, jar, box, phone case or other hard surface?** Choose **UV DTF** stickers. They are applied by hand, with no heat, and leave a raised glossy finish.

## What is DTF?

DTF stands for direct-to-film. Your design is printed in full colour, with a layer of white ink behind it, onto a clear PET film. A fine hot-melt adhesive powder is applied to the wet ink and cured. The result is a transfer that sits on the film until it is heat-pressed onto fabric. The heat melts the adhesive into the fibres, and when the film is peeled off the print stays on the garment.

DTF works on cotton, polyester, blends, fleece, denim and many other fabrics, in light or dark colours. Because the white layer is printed under the colours, designs stay bright even on black garments. It is the most practical choice for logos on uniforms, merchandise, event T-shirts and small garment runs where screen printing would be too expensive to set up.

We supply DTF in two forms:

- **[DTF transfer stickers](/dtf-transfer-stickers)** as gang sheets: many different designs packed onto one film so you pay for the sheet, not for each design.
- **[DTF heat transfer stickers](/dtf-heat-transfer-stickers)**: identical, pre-cut logos ready to press, ideal for chest logos and tagless neck labels.

## What is UV DTF?

UV DTF uses UV-curable inks that harden instantly under ultraviolet light. The design is printed in layers of white, colour and clear varnish onto a carrier film (often called the A film), then laminated with a transfer film (the B film) that carries the adhesive. To apply it, you peel the backing, place the design on the surface, rub it down firmly and lift the top film away. Only the printed design stays behind, with no visible sticker edge or background.

UV DTF bonds to hard, smooth surfaces: glass, metal, plastic, acrylic, sealed wood, ceramic and coated paperboard. The varnish layer gives a slightly raised, glossy finish that looks premium and resists water and everyday handling. It is popular for drinkware, cosmetic jars, gift items, electronics accessories and short runs of branded packaging.

See [UV DTF stickers](/uv-dtf-sticker-printing) for decals and [custom UV transfer stickers](/custom-uv-transfer-stickers) for logos and cup wraps.

## Side-by-side comparison

| Compared | DTF | UV DTF |
|---|---|---|
| Best for | Fabric: T-shirts, hoodies, uniforms, bags | Hard surfaces: glass, metal, plastic, acrylic |
| How it's applied | Heat press (temperature, time and pressure) | By hand: peel, place, rub, lift film |
| Feel and finish | Soft, flexible, matte or satin | Raised, glossy, slightly textured |
| Washing | Survives repeated machine washing when pressed correctly | Not for fabric; hand-wash items carefully |
| Background | None: only the design transfers | None: only the design transfers |
| Equipment you need | Heat press | None |

## Common mistakes to avoid

- **Ordering UV DTF for clothing.** It will crack when the fabric stretches. Use DTF.
- **Ordering DTF for bottles.** DTF needs heat and a fibrous surface to grip. It will not bond properly to glass or metal.
- **Pressing DTF at the wrong settings.** Most adhesion problems with DTF come from incorrect temperature, time or pressure. We share application instructions with every order. Follow them, and press a test piece first.
- **Applying UV DTF to a dusty or oily surface.** Clean the surface with isopropyl alcohol and let it dry before applying.
- **Very thin lines and tiny text.** Both processes print fine detail, but lines thinner than about 0.5 mm can lift or break. Ask us to check your artwork if in doubt.

## Which one is cheaper?

Price depends on the size of the design, the quantity and, for DTF, how efficiently designs can be packed onto a gang sheet. As a rule, DTF is the more economical way to brand garments in small and medium runs, and UV DTF is an economical way to add a premium-looking logo to hard goods without screen printing or pad printing set-up costs. The best way to compare is to [request a quote](/get-a-quote) with your design size and quantity.

## How to order

Tell us the surface you are decorating, the size of the design, the quantity and whether you need the designs pre-cut. Send your artwork as a PDF, AI, PSD or a high-resolution PNG with a transparent background (see our [artwork guide](/guides/print-ready-artwork-guide)). We'll confirm the right product before printing.`,
  },
  {
    slug: 'sbs-vs-duplex-board',
    title: 'SBS vs duplex board: choosing board for printed boxes',
    seoTitle: 'SBS vs Duplex Board: Which Is Right for Your Box?',
    description:
      'SBS and duplex are the two most common boards for printed cartons. Compare whiteness, strength, print quality, GSM and cost to pick the right one.',
    excerpt: 'Board choice changes how your box looks, feels and costs more than any other decision. Here is how SBS and duplex compare.',
    topic: 'Packaging',
    published: '2026-11-04',
    updated: '2026-11-04',
    products: ['sbs-boxes', 'duplex-boxes', 'mono-carton-boxes'],
    faqs: [
      {
        q: 'Is a mono carton made from SBS or duplex?',
        a: 'Either. "Mono carton" describes the box: a single-layer folding carton made from paperboard, as opposed to a corrugated box. The board inside can be SBS, duplex or another paperboard depending on the look and budget.',
      },
      {
        q: 'What GSM should I choose for a carton?',
        a: 'Small cosmetic and pharma cartons commonly use 250–300 GSM. Larger or heavier products need 300–400 GSM. Share the product weight and box size and we will recommend a board.',
      },
      {
        q: 'Can duplex boxes look premium?',
        a: 'Yes, with the right finishing. Lamination, spot UV and foil on a white-coated duplex top can look very good. The grey back is visible inside the box, so choose SBS when the inside is part of the experience.',
      },
    ],
    body: `If you are ordering printed boxes, the board you choose affects the look, the feel, the strength and the price of every box. Most retail cartons in India are made from one of two boards: **SBS** or **duplex**. This guide explains the difference and when each one makes sense.

## First, what is a mono carton?

A mono carton is a folding carton made from a single sheet of paperboard: the kind of box that holds a cream tube, a perfume bottle or a strip of tablets. It is different from a corrugated box, which has a fluted middle layer for shipping strength. Mono cartons can be made from SBS, duplex or other boards. So when you order [mono carton boxes](/mono-carton-boxes), the next question is always: which board?

## What is SBS board?

SBS stands for solid bleached sulphate. It is made entirely from bleached virgin wood pulp, so it is bright white all the way through, on the front, on the back and at the cut edge. It usually has a smooth clay coating on the printed side.

Why brands choose [SBS boxes](/sbs-boxes):

- **Brightest white and sharpest print.** Colours look clean and fine detail stays crisp.
- **White inside.** When a customer opens the box, the inside looks as finished as the outside.
- **Clean cut edges** with no grey layer showing.
- **Takes premium finishes very well**: soft-touch lamination, foil, embossing and spot UV.

SBS is the usual choice for cosmetics, perfume, premium personal care, gifting and many pharmaceutical cartons.

## What is duplex board?

Duplex board is made from multiple layers, mostly recycled fibre, with a white coated top layer for printing. The back is usually grey (often called grey-back duplex), though white-back versions exist. It is the workhorse board for retail packaging in India.

Why brands choose [duplex boxes](/duplex-boxes):

- **Lower cost per box**, which matters a lot at high volumes.
- **Good print surface** on the coated side for bold retail graphics.
- **Good stiffness** for its price, especially at higher GSM.
- **Recycled content**, which suits many FMCG and household brands.

Duplex is common for FMCG, toys, hardware, household goods, food outer cartons and any product where the inside of the box is not part of the presentation.

## Comparison at a glance

| Compared | SBS | Duplex (grey back) |
|---|---|---|
| Fibre | Bleached virgin pulp throughout | Multi-layer, mostly recycled |
| Colour of back and edges | White | Grey |
| Print sharpness | Excellent | Good to very good |
| Feel | Smooth, premium | Firm, practical |
| Cost | Higher | Lower |
| Typical uses | Cosmetics, perfume, pharma, gifting | FMCG, toys, hardware, household |

## GSM, thickness and strength

GSM (grams per square metre) measures the weight of the board, not directly its thickness. Two boards with the same GSM can feel different because their density differs. For a carton, what matters is that the box holds its shape and protects the product. As a starting point:

- **250–300 GSM** for small, light products such as creams, serums, tablets and small accessories.
- **300–350 GSM** for medium products and boxes with larger panels.
- **350–400 GSM** for heavier products, tall boxes or boxes that will be stacked on shelves.

Heavy or fragile products may need an insert, a stronger box style (such as a crash-lock bottom) or an outer corrugated shipper as well.

## How to choose

1. **Will the customer see the inside?** If yes, and it matters to your brand, choose SBS.
2. **Is the box premium or gift-like?** Choose SBS for the best finish and feel.
3. **Is the product sold in high volumes at a competitive price?** Duplex usually gives better value.
4. **Do you want the most vibrant print on a budget?** Duplex with gloss lamination or varnish is a good middle ground.

If you are unsure, ask for a quote in both boards. Seeing the price difference for your exact size and quantity often makes the decision easy. Our guide to [packaging finishes](/guides/packaging-finishes-guide) explains how lamination, foil and spot UV change the result on either board.`,
  },
  {
    slug: 'paper-vs-vinyl-vs-pvc-stickers',
    title: 'Paper vs vinyl vs PVC stickers: choosing the right label material',
    seoTitle: 'Paper vs Vinyl vs PVC Stickers: Label Material Guide',
    description:
      'Paper, vinyl or PVC? Compare cost, water resistance, durability and finish to choose the right sticker material for jars, bottles, appliances and packaging.',
    excerpt: 'The wrong label material peels, smudges or wrinkles. Here is how to match paper, vinyl and PVC to where your sticker will live.',
    topic: 'Stickers & labels',
    published: '2026-11-04',
    updated: '2026-11-04',
    products: ['paper-gumming-stickers', 'vinyl-gumming-stickers', 'pvc-gumming-stickers', 'die-cut-stickers'],
    faqs: [
      {
        q: 'What is a gumming sticker?',
        a: 'In India, "gumming sticker" is the common name for a self-adhesive sticker or label: printed material with a pressure-sensitive adhesive on the back and a release liner that you peel off.',
      },
      {
        q: 'Which sticker material is waterproof?',
        a: 'Vinyl and PVC are both water-resistant. Paper labels are not, unless they are laminated, and even then the paper edges can absorb moisture over time.',
      },
      {
        q: 'Should I order sheets or rolls?',
        a: 'Choose sheets if you apply labels by hand in small numbers. Choose rolls if you apply many labels or use a labelling machine. Tell us your machine core size and label direction for rolls.',
      },
    ],
    body: `Every sticker has three parts: the face material you print on, the adhesive and the release liner. The face material decides how the label looks and how long it survives. In India these are usually called **gumming stickers**, and the three most common face materials are paper, vinyl and PVC.

## The short answer

- **Dry products, indoor use, lowest cost:** paper.
- **Bottles, jars and anything that gets wet or is squeezed:** vinyl.
- **Appliances, machinery, oil, heat and long life:** PVC.

## Paper stickers

[Paper gumming stickers](/paper-gumming-stickers) are printed on coated paper such as chromo (gloss), matte art paper or natural kraft. They print beautifully and cost the least, which makes them the default for product labels on dry goods, MRP labels, carton labels and box seals.

**Good for:** spice jars, dry food pouches, gift boxes, cartons, stationery, price and MRP labels.

**Limitations:** paper absorbs moisture and tears easily. A gloss or matte lamination adds some protection, but paper is not the right choice for products that go in the fridge, the bathroom or the shower.

## Vinyl stickers

[Vinyl gumming stickers](/vinyl-gumming-stickers) are printed on a thin, flexible plastic film. Vinyl is water-resistant, wipeable and conforms to curved and squeezable surfaces without wrinkling. It comes in white, transparent and some metallic finishes.

**Good for:** cosmetic and shampoo bottles, cleaning products, beverage bottles, cold-chain products, outdoor stickers and laptop or bike stickers.

**Transparent vinyl** is popular for a "no-label look" on glass and clear plastic. Any white parts of the design are printed with white ink so they stay visible.

## PVC stickers

[PVC gumming stickers](/pvc-gumming-stickers) use a thicker, tougher plastic face. They resist water, oil, abrasion and tearing, and they hold up for years. PVC is available in white, transparent and metallic silver and gold.

**Good for:** appliance specification and rating labels, machinery and industrial containers, electrical equipment, outdoor equipment, and premium metallic logo badges.

PVC is stiffer than vinyl, so it is better on flat or gently curved surfaces than on tight curves or squeezable bottles.

## Comparison at a glance

| Compared | Paper | Vinyl | PVC |
|---|---|---|---|
| Cost | Lowest | Medium | Higher |
| Water resistance | Low (better with lamination) | High | High |
| Oil and chemical resistance | Low | Medium | High |
| Flexibility on curves | Good on gentle curves | Excellent | Fair |
| Durability | Months, indoors | Years, indoors and outdoors | Years, demanding use |
| Typical finishes | Gloss, matte, kraft | White, clear, gloss, matte | White, clear, silver, gold |

## Shape: rectangles, circles or die-cut

Standard shapes are the most economical. A [die-cut sticker](/die-cut-stickers) is cut to the exact outline of your logo or design, which looks more custom and is great for branding and packaging seals. Any of the three materials can be die-cut.

## Sheets or rolls?

- **Sheets** suit small runs and hand application, for example a startup labelling jars by hand.
- **Rolls** suit larger runs and labelling machines. For machine application, tell us the core diameter, the maximum roll diameter and which way the label should come off the roll.

## Questions to answer before you order

1. What surface will the label go on, and is it curved, flat or squeezable?
2. Will it get wet, oily, cold or hot, or be used outdoors?
3. How long does it need to last?
4. Will you apply it by hand or by machine?
5. Does it carry regulatory text such as MRP, ingredients or batch numbers? If so, check the text carefully on the proof.

Send us these answers with your artwork and we will recommend the most cost-effective material. You can also read how to [prepare print-ready artwork](/guides/print-ready-artwork-guide).`,
  },
  {
    slug: 'print-ready-artwork-guide',
    title: 'How to prepare print-ready artwork for boxes, stickers and transfers',
    seoTitle: 'Print-Ready Artwork Guide: Bleed, CMYK & Dielines',
    description:
      'A practical checklist for print-ready artwork: CMYK, 300 DPI, 3 mm bleed, safe area, dielines, fonts, white ink and file formats. Avoid reprints and delays.',
    excerpt: 'Most print problems start in the artwork file. Follow this checklist and your proof will be right the first time.',
    topic: 'Artwork',
    published: '2026-11-04',
    updated: '2026-11-04',
    products: ['mono-carton-boxes', 'die-cut-stickers', 'dtf-transfer-stickers', 'custom-hang-tags'],
    faqs: [
      {
        q: 'Which file formats do you accept?',
        a: 'PDF, AI, CDR, EPS, SVG, PSD, TIFF, PNG and JPG. Vector files (PDF, AI, CDR, EPS, SVG) are best for logos and text. You can upload files of up to 100 MB with your quote request.',
      },
      {
        q: 'What if I don’t have a designer?',
        a: 'Send what you have: your logo, the text and a rough idea of the layout. We can help with basic layout and adapting your artwork to the dieline. We will confirm any design charges in the quotation.',
      },
      {
        q: 'Will printed colours exactly match my screen?',
        a: 'Screens show colour in RGB light, while print uses CMYK inks on physical material, so small differences are normal. For critical brand colours, give us a Pantone reference.',
      },
    ],
    body: `A great design can still print badly if the file isn't set up for print. The checklist below covers what our pre-press team checks on every order. Getting these right means faster proofs, fewer corrections and no surprises when your order arrives.

## 1. Use CMYK, not RGB

Screens mix colour from red, green and blue light (RGB). Printing mixes cyan, magenta, yellow and black inks (CMYK). Bright RGB colours, especially neon greens, electric blues and vivid oranges, can look duller in print. Set your document to CMYK from the start so what you see is closer to what prints.

For brand colours that must match exactly, specify a **Pantone** (PMS) reference. Where the process allows, we can match it with a spot ink or the closest CMYK build.

## 2. Resolution: 300 DPI at the final size

Photos and raster images should be at least **300 DPI at the size they will print**. An image taken from a website is usually 72 DPI and will look blurry or pixelated when printed. Enlarging a small image in your design software does not add detail.

Logos and text should be **vector** wherever possible (AI, PDF, EPS, SVG or CDR). Vectors stay perfectly sharp at any size.

## 3. Add 3 mm bleed

Bleed is extra artwork that extends beyond the cut line. Cutting always has a small tolerance, so if your background stops exactly at the edge, a thin white line can appear. Extend backgrounds and images **3 mm past every cut edge**.

## 4. Keep important content in the safe area

Keep text, logos and anything important at least **3 mm inside the cut line** (more on boxes near folds). Content too close to the edge risks being trimmed or wrapping around a fold.

## 5. Work on our dieline for boxes and die-cut shapes

A dieline is the flat outline of your box or sticker showing cut lines, fold lines and glue areas. For [mono carton boxes](/mono-carton-boxes) and [die-cut stickers](/die-cut-stickers), ask us for the dieline that matches your size and style, and place your artwork on it.

- Keep the dieline on its **own layer**, set as a spot colour, not printed.
- Check which panel is the front, which flaps tuck in and where the glue flap is.
- Remember that text on side and top panels must be readable when the box is closed.

## 6. Outline or embed fonts

If we open your file without your fonts installed, the text will change. Convert text to outlines (curves) or embed fonts in the PDF. Keep an editable copy for yourself in case changes are needed.

## 7. Minimum sizes

- **Text:** at least 6 pt for normal text, and 8 pt or larger for reversed (white on dark) text.
- **Lines:** at least 0.25 pt (0.1 mm) for print, and about 0.5 mm for DTF and UV DTF designs.
- **Barcodes:** keep them at the recommended size, print them in solid black on a light background and leave a clear quiet zone around them. Always test-scan the proof.

## 8. White ink and transparent backgrounds

For [DTF transfers](/dtf-transfer-stickers), UV DTF and transparent stickers, a white layer is printed under the colours. Send designs with a **transparent background** (PNG or vector) and tell us whether any area should be left clear. Black backgrounds in a PNG will print as black.

## 9. Finishes need their own layer

Spot UV, foil and embossing are applied only where you mark them. Create a separate layer or spot colour for each finish, named clearly (for example "FOIL_GOLD" or "SPOT_UV"), aligned exactly with the artwork. See our [guide to packaging finishes](/guides/packaging-finishes-guide).

## 10. Check the proof carefully

Before production, we send a digital proof. This is your last chance to catch mistakes. Check spelling, numbers, MRP, contact details, barcodes, colours, sizes and which way the design faces. Once you approve the proof, production starts, and changes after that usually mean a new order.

## Ready to send?

Upload your files with your [quote request](/get-a-quote). If something isn't quite print-ready, our team will point it out before printing.`,
  },
  {
    slug: 'packaging-finishes-guide',
    title: 'Packaging finishes explained: lamination, spot UV, foil and embossing',
    seoTitle: 'Packaging Finishes: Lamination, Spot UV, Foil & Emboss',
    description:
      'What gloss, matte and soft-touch lamination, spot UV, hot foil stamping and embossing do for printed boxes, labels and tags, and when each finish is worth it.',
    excerpt: 'Finishes turn a printed box into a branded experience. Here is what each one does and when it is worth the extra cost.',
    topic: 'Packaging',
    published: '2026-11-04',
    updated: '2026-11-04',
    products: ['mono-carton-boxes', 'sbs-boxes', 'custom-hang-tags', 'duplex-boxes'],
    faqs: [
      {
        q: 'Which finish makes a box look most premium?',
        a: 'A common premium combination is soft-touch (velvet) lamination with hot foil on the logo and spot UV or embossing as an accent. Used sparingly, one or two finishes look more premium than many.',
      },
      {
        q: 'Do finishes increase the cost?',
        a: 'Yes. Lamination adds a small cost per sheet. Foil and embossing also need a metal block or die made for your design, which is a one-time cost that matters more on small quantities.',
      },
      {
        q: 'Can I combine foil and spot UV?',
        a: 'Yes, as long as they don’t overlap in a way that affects adhesion. Mark each finish on a separate layer in your artwork and we’ll check the combination.',
      },
    ],
    body: `Two boxes can have identical printing and still feel completely different in the hand. The difference is the finish. This guide explains the common finishes for printed boxes, labels and tags, what each one does and when it is worth paying for.

## Lamination

Lamination is a very thin plastic film applied over the printed sheet. It protects the print from scuffs and moisture and changes the surface feel.

- **Gloss lamination** makes colours pop and gives a shiny, reflective finish. It is bright, durable and economical, and suits retail packaging that needs shelf impact.
- **Matte lamination** gives a smooth, low-glare, modern look. It photographs well and pairs beautifully with foil and spot UV.
- **Soft-touch (velvet) lamination** has a velvety, almost suede-like feel. It is the go-to finish for premium cosmetics, perfume and gift boxes.

## Varnish

Varnish is a clear coating applied like ink. It adds some protection and gloss or matte effect at a lower cost than lamination, though it protects less. It is a good option for high-volume [duplex boxes](/duplex-boxes) where budget is tight.

## Spot UV

Spot UV is a glossy, clear coating applied only to selected areas, such as a logo, a pattern or a product image, and cured with UV light. On a matte or soft-touch background, the contrast between matte and gloss makes those areas catch the light. It is subtle, elegant and very effective on dark colours.

**Artwork tip:** create the spot UV area on a separate layer as a solid shape, aligned exactly with the print.

## Hot foil stamping

Foil stamping uses heat and pressure to transfer metallic foil (gold, silver, rose gold, copper or holographic) onto the board through a metal block made in the shape of your design. Foil looks far more metallic than any printed gold ink.

Foil is ideal for logos, borders and small highlights. Very fine details and tiny text may not foil cleanly, so keep strokes reasonably thick.

## Embossing and debossing

Embossing raises part of the board to create a 3D effect you can feel; debossing presses it down. It is done with a matched pair of dies.

- **Blind embossing** has no ink or foil, just the raised shape. It is understated and very premium on white [SBS boxes](/sbs-boxes) and thick [hang tags](/custom-hang-tags).
- **Registered embossing** lines up exactly with a printed or foiled area to make it stand out.

## Window patching

A die-cut window covered with clear film lets customers see the product inside. It is popular for food, toys and gifting. It adds a process step, so allow a little more time.

## Finishes on labels and tags

Finishes are not only for boxes. Paper and vinyl labels can be gloss or matte laminated to resist scuffs and moisture, and metallic PVC gives a foil-like look without a foil block. Hang tags take the same lamination, foil, spot UV and embossing as cartons, and a thick tag with a blind-embossed logo is one of the most cost-effective ways to make a garment feel premium.

## How to choose finishes

| Goal | Good choice |
|---|---|
| Maximum shelf impact on a budget | Gloss lamination or gloss varnish |
| Modern, clean, premium look | Matte lamination + foil logo |
| Luxury feel in the hand | Soft-touch lamination + foil or blind emboss |
| Highlight one element | Spot UV on matte |
| High volume, lowest cost | Varnish |

A few rules of thumb:

- **Less is more.** One hero finish usually looks better than four competing ones.
- **Think about cost per box.** Foil blocks and emboss dies are one-time costs, so they add more per box on small quantities and very little on large ones.
- **Mark every finish on its own layer** so there's no doubt where it goes.

Want to see what a finish adds to your price? Ask for a quote with and without it. Read more about choosing the right [board for your box](/guides/sbs-vs-duplex-board) and what drives [custom box prices](/guides/custom-box-price-factors).`,
  },
  {
    slug: 'custom-box-price-factors',
    title: 'What affects the price of custom printed boxes?',
    seoTitle: 'Custom Printed Box Price: 8 Factors That Affect Cost',
    description:
      'Why do printed box quotes vary so much? Learn how size, board, quantity, colours, finishes, box style and freight affect the price, and how to cut cost per box.',
    excerpt: 'Two quotes for "the same box" can differ a lot. These are the eight factors behind every carton price, and how to bring yours down.',
    topic: 'Packaging',
    published: '2026-11-04',
    updated: '2026-11-04',
    products: ['mono-carton-boxes', 'duplex-boxes', 'sbs-boxes'],
    faqs: [
      {
        q: 'What is the minimum order quantity for printed boxes?',
        a: 'It depends on the box and the printing method. Share your size and quantity and we will tell you what is practical. Larger quantities lower the cost per box because set-up costs are shared.',
      },
      {
        q: 'Why is the first order more expensive than reorders?',
        a: 'A first order may include one-time costs such as a cutting die, foil blocks or emboss dies. These are reused for repeat orders of the same design and size.',
      },
      {
        q: 'What information gives the most accurate quote?',
        a: 'Inside dimensions (length × width × height), box style, board preference, quantity, number of colours, finishes, artwork and delivery city.',
      },
    ],
    body: `When you ask for a quote for printed boxes, the price per box can vary a lot depending on a few decisions. Understanding them helps you compare quotes fairly and find savings without compromising the look of your packaging.

## 1. Quantity

Quantity is usually the biggest factor. Every print job has set-up work: preparing plates, setting up the press and the cutting machine, and making ready. That cost is the same for 1,000 boxes or 10,000 boxes, so it is shared across more boxes in a larger order. Ordering a larger quantity once is usually cheaper per box than ordering small batches repeatedly.

## 2. Box size and sheet usage

Boxes are printed several to a sheet and then die-cut. The number of boxes that fit on one sheet (often called "ups") has a big effect on cost. A small change of a few millimetres can sometimes fit one more box per sheet and cut the cost noticeably. Ask us whether a slight size adjustment would improve sheet usage.

## 3. Board type and GSM

Premium [SBS board](/sbs-boxes) costs more than [duplex board](/duplex-boxes), and higher GSM costs more than lower GSM. Choose the board your product actually needs. Our [SBS vs duplex guide](/guides/sbs-vs-duplex-board) explains the trade-offs.

## 4. Number of colours

Full-colour (CMYK) printing is standard. Adding Pantone spot colours, printing on the inside of the box or printing large flat areas of colour that need extra ink coverage can add cost.

## 5. Finishes

Lamination, spot UV, foil stamping, embossing and window patching each add a process step. Foil and emboss also need blocks or dies made for your design. See [packaging finishes explained](/guides/packaging-finishes-guide).

## 6. Box style and construction

A simple reverse tuck end carton is the most economical style. Crash-lock bottoms, lids and bases, sleeves, inserts, hang tabs and extra glue points all add material or process time.

## 7. One-time tooling

A new size or shape needs a cutting die. Foil and emboss need blocks. These one-time costs are reused on repeat orders, which is why reorders of the same design are usually cheaper.

## 8. Packing and freight

Boxes ship flat, but board is heavy. Freight depends on weight, volume and the delivery location. Your quotation shows shipping separately so you can compare like for like.

## How to lower your cost per box

- **Order in larger, less frequent batches** where storage allows.
- **Standardise sizes** across products so one die serves several products.
- **Use one hero finish** instead of several.
- **Choose duplex** where the inside of the box isn't seen.
- **Keep artwork print-ready** to avoid extra design and proofing rounds. See our [artwork guide](/guides/print-ready-artwork-guide).
- **Ask about size tweaks** that improve sheet usage.

## Comparing two quotes fairly

Quotes for "the same box" often differ because they are not for the same box. Before comparing prices, check that both quotes specify:

- The same **board and GSM**, for example 300 GSM SBS rather than just "white board".
- The same **printing**: number of colours, and whether the inside is printed.
- The same **finishes**: matte lamination is not the same as matte varnish.
- Whether **tooling** (die, foil blocks) is included or charged separately.
- Whether **GST and freight** are included.
- The **quantity tolerance**, since custom print runs can vary slightly from the ordered quantity.

A lower price that silently swaps a 350 GSM board for 250 GSM, or lamination for varnish, is not a saving if the box feels flimsy or scuffs on the shelf.

## Get an accurate quote

For a quote you can rely on, share the inside dimensions, box style, preferred board, quantity, colours, finishes, artwork and delivery city. [Request a quote](/get-a-quote) and we'll reply with pricing, or tell you how to make the box more economical.`,
  },
  {
    slug: 'hang-tag-design-guide',
    title: 'Hang tag design guide: size, GSM, finishes and strings',
    seoTitle: 'Hang Tag Design Guide: Size, GSM, Finish & Strings',
    description:
      'Plan custom hang tags that look premium: common sizes, card GSM, kraft vs art card, foil and emboss, eyelets, strings and what information to print.',
    excerpt: 'A hang tag is often the first thing a customer touches. Here is how to choose size, card, finish and attachment.',
    topic: 'Tags',
    published: '2026-11-04',
    updated: '2026-11-04',
    products: ['custom-hang-tags', 'plastic-tags'],
    faqs: [
      {
        q: 'What GSM is best for hang tags?',
        a: 'Around 300–400 GSM art card is common and feels solid. For a thicker, luxury feel, two sheets can be pasted together. Kraft card in a similar weight gives a natural look.',
      },
      {
        q: 'Can hang tags be printed on both sides?',
        a: 'Yes. The front usually carries the logo and the back carries details such as size, care instructions, MRP or a barcode.',
      },
      {
        q: 'When should I use plastic tags instead of card?',
        a: 'Use plastic or PVC tags for products that may get wet or handled heavily, such as swimwear, outdoor gear and plants.',
      },
    ],
    body: `Hang tags carry your brand, product details and price, and they are often the first thing a customer touches. A well-made tag makes a garment or product feel more premium. This guide covers the decisions that go into [custom hang tags](/custom-hang-tags).

## Size and shape

Most clothing tags are rectangles somewhere between business-card size and slightly larger, often with rounded corners. Smaller tags suit jewellery, accessories and kidswear; larger tags leave room for storytelling or detailed information.

Die-cut shapes, such as arches, circles, scallops or a shape based on your logo, make tags more distinctive. They need a cutting die, a one-time cost.

## Card and GSM

- **Art card** has a smooth white coated surface for sharp, colourful printing.
- **Kraft card** has a natural brown look that suits organic, handmade and sustainable brands.
- **Textured and coloured card** add a premium, tactile feel.

Around **300–400 GSM** feels solid in the hand. For a thick, luxury tag, two sheets can be pasted together. Heavier tags also hang straighter.

## Finishes

- **Matte or soft-touch lamination** for a modern, premium feel.
- **Hot foil** in gold, silver or rose gold for logos.
- **Embossing or debossing** to make the logo something customers can feel.
- **Spot UV** to highlight a logo or pattern on matte card.

Pick one or two finishes that match your brand rather than combining everything. Our [packaging finishes guide](/guides/packaging-finishes-guide) explains each one in detail.

## Holes, eyelets and strings

- **Punched hole:** simple and economical.
- **Metal eyelet:** reinforces the hole and adds a finished look, available in several metal colours.
- **Attachment:** cotton string, jute, satin ribbon, elastic loops, or plastic loops and tag pins for retail.

Pre-stringing saves your team time when tagging large quantities.

## What to print

**Front:** logo, and optionally a tagline or pattern.

**Back (as needed):** product name or style code, size, colour, fabric content, care instructions, MRP, a barcode, and your website or social handle.

Make sure any statutory information, such as MRP and manufacturer details, meets the requirements for your product. Check every detail on the proof.

## Plastic tags for tougher conditions

For swimwear, outdoor products, plants and anything that may get wet, [plastic tags](/plastic-tags) in PVC or frosted plastic last much longer than card.

## Common mistakes to avoid

- **Text too small.** Care instructions and fabric content are often printed at 5 pt or less and become unreadable. Keep body text at 6 pt or larger.
- **Too much on one tag.** A tag crowded with information looks cheap. Put the brand story on the front or on a separate card, and keep the back clean and practical.
- **Card too thin.** Thin tags curl and crease in transit and on the rack. If the tag feels flimsy in your hand, go up a weight or paste two sheets.
- **Hole too close to the edge.** Keep the hole or eyelet at least 5 mm from the edges so it doesn't tear.
- **Forgetting the barcode quiet zone.** Leave clear space around barcodes and test-scan the proof.

## Card or plastic?

| Compared | Card hang tags | Plastic tags |
|---|---|---|
| Look and feel | Premium, tactile, easy to emboss | Clean, modern, translucent options |
| Water resistance | Low (better with lamination) | High |
| Tear resistance | Medium | High |
| Best for | Fashion, gifting, accessories | Swimwear, outdoor gear, plants |

## Before you order

Decide the size, card, finishes, hole or eyelet, attachment, quantity and whether tags should be pre-strung. Then [request a quote](/get-a-quote) with your artwork. See our [artwork checklist](/guides/print-ready-artwork-guide) for file set-up.`,
  },
];
