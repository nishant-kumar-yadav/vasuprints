/** Prints an argon2id hash for ADMIN_PASSWORD_HASH. Reads the password from stdin (not echoed when interactive). */
import { hash } from '@node-rs/argon2';
import { createInterface } from 'node:readline';

async function readPassword(): Promise<string> {
  if (!process.stdin.isTTY) {
    let data = '';
    for await (const chunk of process.stdin) data += chunk;
    return data.replace(/\r?\n$/, '');
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const out = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
  process.stdout.write('Admin password (min 14 characters): ');
  out._writeToOutput = () => undefined;
  const pw = await new Promise<string>((resolve) => rl.question('', resolve));
  rl.close();
  process.stdout.write('\n');
  return pw;
}

const pw = await readPassword();
if (pw.length < 14) {
  console.error('Use at least 14 characters (a password manager can generate one).');
  process.exit(1);
}
const h = await hash(pw, { memoryCost: 19456, timeCost: 2, parallelism: 1, algorithm: 2 });
// Next.js expands $VARS inside .env files, so every $ must be escaped.
console.log(`\nADMIN_PASSWORD_HASH=${h.replace(/\$/g, '\\$')}\n`);
console.log('Paste that line into .env.local (or the server .env) exactly as printed, then restart.');
console.log('To sign out every session afterwards, bump SESSION_VERSION.');
