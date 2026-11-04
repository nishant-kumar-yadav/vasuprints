/** Lists business details still set to placeholders. Exit code 1 when any remain (use before launch). */
import { business, isSet } from '../src/config/business';

const missing = Object.entries(business)
  .filter(([, v]) => typeof v === 'string' && !isSet(v))
  .map(([k]) => k);
if (missing.length) {
  console.log(`Placeholders still to fill in src/config/business.ts:\n  - ${missing.join('\n  - ')}`);
  process.exit(1);
}
console.log('All business details are set.');
