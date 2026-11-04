// Copy from docs/CONTENT.md §1 (owner-approved where marked there).
export const trustStrip = ['Custom sizes', 'Bulk orders', 'Artwork support', 'Pan-India dispatch'] as const;

export const process = {
  eyebrow: 'HOW IT WORKS',
  title: 'Our Process',
  lead: 'From requirement to dispatch in five clear steps.',
  steps: [
    { title: 'Share Your Requirements', body: 'Tell us about your product, size and quantity.' },
    { title: 'Get a Quotation', body: 'Receive pricing based on your specifications.' },
    { title: 'Design & Approval', body: 'Share your artwork and confirm the requirements.' },
    { title: 'Production', body: 'Your order moves into the production process.' },
    { title: 'Dispatch', body: 'Delivery arrangements are coordinated according to your order.' },
  ],
} as const;

export const ctas = {
  main: {
    title: 'Looking for Custom Printing & Packaging Solutions?',
    text: 'Tell us what you need. Our team will help you find the right printing or packaging solution for your business.',
    button: 'Request a Free Quote',
  },
  product: {
    title: 'Need Custom Sizes, Materials or Printing?',
    text: 'Every business has different requirements. Share your specifications and let us help you find the right solution.',
    button: 'Get Custom Quotation',
  },
  category: (name: string) => ({
    title: `Need custom ${name.toLowerCase()}?`,
    text: "Share your size, material and quantity — we'll send a quotation.",
    button: 'Get a Quote',
  }),
} as const;

export const megaPromo = {
  title: 'Not sure what you need?',
  text: "Share your requirement and we'll suggest the right material and finish.",
  link: 'Get a Quote',
} as const;

export const footer = {
  brandLine: 'Your destination for customized printing, packaging, stickers and branding solutions.',
} as const;
