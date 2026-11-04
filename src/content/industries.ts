/**
 * Industry pages: what each kind of business needs, and which VasuPrint products fit.
 * Copy is written for buyers in that industry; product reasons are specific to the industry,
 * so each page has unique content rather than a template with a word swapped.
 */
export interface IndustryData {
  slug: string;
  name: string;
  /** ≤ 60 chars. */
  seoTitle: string;
  /** 120–160 chars. */
  description: string;
  heading: string;
  /** Card copy on the hub. */
  excerpt: string;
  icon: string;
  intro: string[];
  needs: { title: string; body: string }[];
  products: { slug: string; why: string }[];
  guides: string[];
  faqs: { q: string; a: string }[];
}

export const industriesData: IndustryData[] = [
  {
    slug: 'cosmetic-packaging',
    name: 'Cosmetics & skincare',
    seoTitle: 'Cosmetic Packaging Boxes & Labels Manufacturer',
    description:
      'Cosmetic and skincare packaging: printed SBS and mono carton boxes, waterproof vinyl labels and UV DTF decals for jars and bottles. Bulk orders across India.',
    heading: 'Cosmetic & skincare packaging that looks as good as your formula',
    excerpt: 'Premium cartons, waterproof bottle labels and glossy decals for beauty and personal care brands.',
    icon: 'Sparkles',
    intro: [
      'In beauty and personal care, packaging is part of the product. Customers judge a serum, cream or perfume by its box and label before they ever try it, and the same box has to hold up in shipping, on a shelf and in a humid bathroom.',
      'VasuPrint makes printed cartons, labels and decals for cosmetic, skincare, haircare and fragrance brands, from new D2C launches to established ranges that reorder in volume.',
    ],
    needs: [
      { title: 'A premium first impression', body: 'Bright white board, soft-touch lamination, foil and embossing make a product feel worth its price.' },
      { title: 'Labels that survive water and oil', body: 'Bottles and tubes get wet, oily and squeezed. Vinyl labels stay put where paper would wrinkle.' },
      { title: 'Consistent colour across the range', body: 'Your brand colours need to match from the carton to the label to the reorder six months later.' },
      { title: 'Room for regulatory text', body: 'Ingredients, batch, MRP and manufacturer details need clear, readable panels on the box and label.' },
    ],
    products: [
      { slug: 'sbs-boxes', why: 'Bright white inside and out, the best base for soft-touch, foil and embossing on serums, creams and perfume.' },
      { slug: 'mono-carton-boxes', why: 'Tuck-end cartons for tubes, jars and bottles, sized to your product with your choice of board and finish.' },
      { slug: 'vinyl-gumming-stickers', why: 'Waterproof labels that wrap smoothly around squeezable bottles. Transparent vinyl gives a no-label look on glass.' },
      { slug: 'uv-dtf-sticker-printing', why: 'Raised, glossy decals for jars, compacts and gift sets, ideal for short runs and limited editions.' },
    ],
    guides: ['sbs-vs-duplex-board', 'packaging-finishes-guide', 'paper-vs-vinyl-vs-pvc-stickers'],
    faqs: [
      {
        q: 'Which board is best for cosmetic boxes?',
        a: 'SBS is the usual choice for premium cosmetics because it is white throughout and takes finishes like soft-touch and foil very well. Duplex can work for value ranges where the inside of the box isn’t seen.',
      },
      {
        q: 'Can you print small quantities for a new launch?',
        a: 'Yes. Tell us your quantity and we will suggest the most economical route. UV DTF decals and short-run labels are good options while you test the market.',
      },
      {
        q: 'Who is responsible for the ingredient and regulatory text?',
        a: 'Your brand supplies and approves the content. We print exactly what you approve on the proof, so check every detail before you sign off.',
      },
    ],
  },
  {
    slug: 'pharma-packaging',
    name: 'Pharmaceutical & healthcare',
    seoTitle: 'Pharma Packaging: Printed Cartons & Labels',
    description:
      'Printed pharma cartons and labels for tablets, syrups, ointments and healthcare products, with clear space for batch, MRP and statutory text. Get a bulk quote.',
    heading: 'Pharmaceutical cartons and labels printed with precision',
    excerpt: 'Accurate, legible cartons and labels for medicines, nutraceuticals and healthcare products.',
    icon: 'Pill',
    intro: [
      'Pharmaceutical and healthcare packaging is about accuracy first. Every carton and label carries information that must be legible and correct: product name, composition, dosage, batch, manufacturing and expiry dates, MRP and manufacturer details.',
      'We print cartons and labels for pharmaceutical, nutraceutical, ayurvedic and healthcare brands, with careful proofing and consistent colour across repeat orders.',
    ],
    needs: [
      { title: 'Legible, accurate text', body: 'Small type has to print sharply. We check minimum text sizes and flag problems before printing.' },
      { title: 'Space for batch and expiry details', body: 'Leave a clear, uncoated area if batch numbers and dates are printed or stamped on your line.' },
      { title: 'Consistency across reorders', body: 'The same carton should look the same every time, so patients and pharmacists recognise it.' },
      { title: 'Sturdy cartons for strips and bottles', body: 'Board and box style are chosen to protect blister strips, bottles and tubes in transit.' },
    ],
    products: [
      { slug: 'mono-carton-boxes', why: 'The standard pharma carton for strips, bottles and tubes, with tuck-end or crash-lock styles.' },
      { slug: 'sbs-boxes', why: 'A clean white board for a clinical, trustworthy look and sharp small text.' },
      { slug: 'paper-gumming-stickers', why: 'Economical labels for bottles, jars and outer cartons, in sheets or rolls for labelling machines.' },
      { slug: 'vinyl-gumming-stickers', why: 'Water-resistant labels for syrups, liquids and products stored in cool or damp conditions.' },
    ],
    guides: ['print-ready-artwork-guide', 'sbs-vs-duplex-board', 'paper-vs-vinyl-vs-pvc-stickers'],
    faqs: [
      {
        q: 'Can you leave a space for batch numbers and expiry dates?',
        a: 'Yes. Mark the area on your artwork and we will keep it free of lamination or varnish if you print or stamp variable data on your line.',
      },
      {
        q: 'Do you check the regulatory text?',
        a: 'We print the content you approve. Responsibility for regulatory content stays with your brand, so review the proof carefully. We will point out obvious issues such as text that is too small to print clearly.',
      },
      {
        q: 'Can labels be supplied on rolls for machines?',
        a: 'Yes. Tell us the core size, maximum roll diameter and the direction the label comes off the roll.',
      },
    ],
  },
  {
    slug: 'food-packaging-labels',
    name: 'Food & beverage',
    seoTitle: 'Food Packaging Boxes & Product Labels',
    description:
      'Printed food boxes, jar and bottle labels and seal stickers for snacks, sweets, spices, bakeries and drinks. Waterproof and kraft options. Get a bulk quote.',
    heading: 'Food packaging and labels that make products sell',
    excerpt: 'Boxes, jar and bottle labels and seal stickers for snacks, sweets, spices, bakeries and drinks.',
    icon: 'UtensilsCrossed',
    intro: [
      'Food and beverage products compete on the shelf and on screen. Good packaging tells customers what is inside, why it is better and that it is safe to buy, while carrying the information food labels must show.',
      'We print boxes, labels and seal stickers for snack, sweet, spice, bakery, beverage and gourmet food brands, from home-grown businesses to established manufacturers.',
    ],
    needs: [
      { title: 'Shelf appeal at the right cost', body: 'Bright print on economical board for products that sell in volume.' },
      { title: 'Labels for jars, bottles and pouches', body: 'Paper for dry goods, vinyl for bottles, the fridge and anything that gets wet.' },
      { title: 'Tamper-evident seals', body: 'Branded seal stickers on boxes and pouches reassure customers and look neat.' },
      { title: 'Clear mandatory information', body: 'Ingredients, nutrition, best-before, licence numbers and MRP need readable space in the design.' },
    ],
    products: [
      { slug: 'duplex-boxes', why: 'Economical printed boxes for sweets, snacks, bakery items and gift packs.' },
      { slug: 'paper-gumming-stickers', why: 'Gloss, matte or kraft labels for spice jars, dry foods and pouches.' },
      { slug: 'vinyl-gumming-stickers', why: 'Water-resistant labels for beverages, sauces, chilled and frozen products.' },
      { slug: 'die-cut-stickers', why: 'Custom-shape seals and branding stickers for boxes, pouches and takeaway packaging.' },
    ],
    guides: ['paper-vs-vinyl-vs-pvc-stickers', 'custom-box-price-factors', 'print-ready-artwork-guide'],
    faqs: [
      {
        q: 'Can the box or label touch food directly?',
        a: 'Tell us if the packaging will be in direct contact with food. We will recommend suitable materials and confirm what is possible for your product.',
      },
      {
        q: 'Which labels work in the fridge or freezer?',
        a: 'Vinyl labels handle condensation much better than paper. Tell us the storage temperature so we can recommend the right material and adhesive.',
      },
      {
        q: 'Do you print sweet boxes for festivals?',
        a: 'Yes. Festive orders are time-sensitive, so share your quantity and dates early and we will plan production around them.',
      },
    ],
  },
  {
    slug: 'apparel-branding',
    name: 'Apparel & fashion',
    seoTitle: 'Garment Branding: Hang Tags, DTF Transfers & Labels',
    description:
      'Branding for clothing brands: custom hang tags, DTF heat transfer logos, tagless neck labels and plastic tags. Premium finishes, bulk orders across India.',
    heading: 'Branding for apparel and fashion labels, from tag to T-shirt',
    excerpt: 'Hang tags, DTF logo transfers, tagless neck labels and plastic tags for clothing brands.',
    icon: 'Shirt',
    intro: [
      'Fashion customers notice details: the weight of a hang tag, the foil on a logo, a neat printed neck label instead of a scratchy one. These details make a garment feel premium and make your brand memorable.',
      'VasuPrint supplies clothing brands, boutiques, uniform makers and merchandise companies with tags and transfers that carry the brand from the rack to the wardrobe.',
    ],
    needs: [
      { title: 'Tags that feel premium', body: 'Thick card, foil, embossing and good strings make a garment feel worth more.' },
      { title: 'Logos that survive washing', body: 'DTF transfers stay bright and flexible through repeated washes when pressed correctly.' },
      { title: 'Tagless comfort', body: 'Printed neck labels carry size and care information without an itchy sewn label.' },
      { title: 'Small runs, many designs', body: 'Gang sheets let you print many designs and sizes together without minimums for each one.' },
    ],
    products: [
      { slug: 'custom-hang-tags', why: 'Printed tags on art card or kraft with foil, emboss, eyelets and strings.' },
      { slug: 'dtf-heat-transfer-stickers', why: 'Pre-cut logo transfers and tagless neck labels, ready to press.' },
      { slug: 'dtf-transfer-stickers', why: 'Full-colour gang sheets for graphic tees, merchandise and small collections.' },
      { slug: 'plastic-tags', why: 'Waterproof PVC tags for swimwear, sportswear and outdoor clothing.' },
    ],
    guides: ['hang-tag-design-guide', 'dtf-vs-uv-dtf-stickers', 'print-ready-artwork-guide'],
    faqs: [
      {
        q: 'Can DTF be used on polyester sportswear?',
        a: 'Yes. DTF works on cotton, polyester and blends. Follow the pressing instructions we provide, and test on one garment first.',
      },
      {
        q: 'Can you make tags pre-strung?',
        a: 'Yes. Pre-stringing saves your team time on large quantities. Choose the string type and length when you request a quote.',
      },
      {
        q: 'What should I print on a hang tag?',
        a: 'Usually the logo on the front, with size, fabric, care instructions, MRP and a barcode on the back. See our hang tag design guide for details.',
      },
    ],
  },
  {
    slug: 'fmcg-packaging',
    name: 'FMCG & retail',
    seoTitle: 'FMCG Packaging: Printed Retail Boxes & Labels',
    description:
      'High-volume printed retail packaging for FMCG, household, toy and hardware brands: duplex boxes, hang-tab cartons, PVC labels and product stickers. Get a quote.',
    heading: 'Retail packaging built for volume, shelf impact and cost',
    excerpt: 'Economical printed boxes, hang-tab cartons and durable labels for high-volume retail products.',
    icon: 'ShoppingBag',
    intro: [
      'In FMCG and retail, packaging has to do three things at once: stand out on a crowded shelf, protect the product through distribution, and keep the cost per unit low enough to protect your margin.',
      'We print packaging and labels for household, personal care, toy, hardware, electrical and other retail brands that order in volume and reorder regularly.',
    ],
    needs: [
      { title: 'Low cost per unit', body: 'Board, size and finish choices that keep the price right at high volumes.' },
      { title: 'Bold shelf graphics', body: 'Bright, consistent colour that is recognisable at a glance.' },
      { title: 'Retail-ready formats', body: 'Euro-slot hang tabs, display-friendly boxes and labels for machine application.' },
      { title: 'Reliable reorders', body: 'The same specification and colour every time you reorder.' },
    ],
    products: [
      { slug: 'duplex-boxes', why: 'The most economical printed carton for high-volume retail products, with hang-tab options.' },
      { slug: 'mono-carton-boxes', why: 'Folding cartons in standard and custom styles for every product size.' },
      { slug: 'pvc-gumming-stickers', why: 'Durable labels for appliances, electricals and products handled heavily.' },
      { slug: 'paper-gumming-stickers', why: 'Economical product, price and MRP labels on rolls for fast application.' },
    ],
    guides: ['custom-box-price-factors', 'sbs-vs-duplex-board', 'paper-vs-vinyl-vs-pvc-stickers'],
    faqs: [
      {
        q: 'How can we lower the cost per box?',
        a: 'Order larger batches, standardise sizes, use duplex where the inside isn’t seen and keep to one hero finish. Our box price guide explains each factor.',
      },
      {
        q: 'Can you add a hang tab for peg display?',
        a: 'Yes. Duplex and mono cartons can include a euro-slot hang tab for retail pegs.',
      },
      {
        q: 'Do you keep our specifications for reorders?',
        a: 'Yes. We keep your approved specification and dies so reorders match the original.',
      },
    ],
  },
  {
    slug: 'corporate-gifting-branding',
    name: 'Corporate gifting & merchandise',
    seoTitle: 'Corporate Gift Branding: Logo Stickers & Gift Boxes',
    description:
      'Brand corporate gifts and merchandise with UV DTF logo stickers for bottles and mugs, DTF for T-shirts, printed gift boxes and die-cut stickers. Bulk orders.',
    heading: 'Brand corporate gifts and merchandise in any quantity',
    excerpt: 'Logos on bottles, mugs, T-shirts and notebooks, plus printed gift boxes and stickers.',
    icon: 'Gift',
    intro: [
      'Corporate gifts, event kits and employee welcome packs need your logo on many different items: steel bottles, mugs, notebooks, T-shirts, boxes and bags, often in short runs with tight deadlines.',
      'VasuPrint helps gifting companies, event agencies and in-house teams brand merchandise quickly and consistently, without the set-up costs of screen or pad printing.',
    ],
    needs: [
      { title: 'One logo, many surfaces', body: 'UV DTF for hard goods and DTF for textiles keep the logo consistent across the kit.' },
      { title: 'Short runs, fast turnaround', body: 'No screens or plates, so small quantities stay affordable.' },
      { title: 'A premium unboxing', body: 'A printed gift box with foil or soft-touch makes the kit feel special.' },
      { title: 'Stickers for the extras', body: 'Die-cut logo stickers for laptops, packaging seals and swag bags.' },
    ],
    products: [
      { slug: 'custom-uv-transfer-stickers', why: 'Raised, glossy logos for steel bottles, tumblers, mugs, diaries and acrylic items, applied by hand.' },
      { slug: 'dtf-heat-transfer-stickers', why: 'Pre-cut logo transfers for T-shirts, polos, caps and tote bags.' },
      { slug: 'sbs-boxes', why: 'Premium printed gift boxes with soft-touch, foil and inserts.' },
      { slug: 'die-cut-stickers', why: 'Logo stickers for laptops, seals and welcome kits.' },
    ],
    guides: ['dtf-vs-uv-dtf-stickers', 'packaging-finishes-guide', 'print-ready-artwork-guide'],
    faqs: [
      {
        q: 'Can we brand items we have already bought?',
        a: 'Yes. UV DTF and DTF transfers are supplied ready to apply, so your team or gifting partner can brand items you already have.',
      },
      {
        q: 'How quickly can you deliver for an event?',
        a: 'DTF and UV DTF are among our fastest products. Share your event date with your quote request and we will confirm whether it can be met.',
      },
      {
        q: 'Will the logo look the same on a bottle and a T-shirt?',
        a: 'We print from the same artwork and colour references for both, so the logo stays consistent across the kit.',
      },
    ],
  },
];
