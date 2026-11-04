// docs/CONTENT.md §2 (owner-approved where marked there).
export const home = {
  hero: {
    eyebrow: 'CUSTOM PRINTING & PACKAGING',
    titleLead: 'Printing & Packaging Solutions That Make Your Brand',
    titleAccent: 'Stand Out.',
    text: 'At VasuPrint, we provide customized printing, packaging and labeling solutions designed to help businesses create a strong brand identity. From premium packaging boxes to custom stickers, DTF transfers and product tags, we deliver solutions tailored to your business requirements.',
    imageAlt: 'Custom printed cartons, label rolls, DTF transfer sheet and hang tags arranged on a light grey surface',
  },
  intro: {
    eyebrow: 'WHO WE ARE',
    title: 'Your Trusted Partner for Custom Printing & Packaging',
    paragraphs: [
      'VasuPrint is your one-stop destination for customized printing and packaging solutions. We specialize in providing a wide range of products for businesses, brands, manufacturers, retailers and distributors.',
      'Whether you need custom packaging boxes, high-quality stickers, DTF transfers or personalized tags, we focus on delivering products according to your specifications, material preferences and quantity requirements.',
    ],
    link: 'About VasuPrint',
  },
  categories: {
    eyebrow: 'WHAT WE MAKE',
    title: 'Our Product Categories',
    lead: 'Five product families, each made to your size, material and quantity.',
  },
  why: {
    eyebrow: 'WHY VASUPRINT',
    title: 'Printing Solutions Designed Around Your Business',
    items: [
      { icon: 'Ruler', title: 'Customized Solutions', body: 'Products made according to your requirements.' },
      { icon: 'LayoutGrid', title: 'Multiple Product Options', body: 'A wide range of printing and packaging products.' },
      { icon: 'Boxes', title: 'Bulk Order Support', body: 'Solutions for businesses requiring bulk quantities.' },
      { icon: 'BadgeCheck', title: 'Quality-Focused Production', body: 'Attention to printing, materials and finishing.' },
      { icon: 'SlidersHorizontal', title: 'Custom Specifications', body: 'Options for size, material and design requirements.' },
      { icon: 'MessageSquareText', title: 'Easy Enquiry Process', body: 'Connect with us for quotations and product details.' },
    ],
  },
  featured: { eyebrow: 'POPULAR PRODUCTS', title: 'Built for brands that ship', link: 'View all products' },
  capabilities: {
    eyebrow: 'CAPABILITIES',
    title: 'Materials, finishes and formats we work with',
    text: "Tell us how your product will be used and we'll recommend the right board, film and finish. Every option below can be combined to suit your brand and budget.",
    groups: [
      { title: 'Boards & papers', items: ['SBS board', 'Duplex board', 'Art card', 'Kraft card', 'Chromo paper', 'Mirrorcoat paper'] },
      { title: 'Films & transfers', items: ['White vinyl', 'Transparent vinyl', 'PVC film', 'Metallic film', 'DTF PET film', 'UV DTF film'] },
      {
        title: 'Finishes',
        items: ['Matte lamination', 'Gloss lamination', 'Soft-touch lamination', 'Spot UV', 'Hot foil stamping', 'Embossing & debossing', 'Die-cutting', 'Aqueous / UV varnish'],
      },
    ],
  },
} as const;
