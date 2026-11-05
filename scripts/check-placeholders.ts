/** Lists business details still set to placeholders. Exit code 1 when any remain (use before launch). */
import { business, PLACEHOLDER } from '../src/config/business';

const missing = Object.entries(business)
  .filter(([, v]) => v === PLACEHOLDER)
  .map(([k]) => k);
if (missing.length) {
  console.log(`Placeholders still to fill in src/config/business.ts:\n  - ${missing.join('\n  - ')}`);
  process.exit(1);
}
console.log('All business details are set.');
