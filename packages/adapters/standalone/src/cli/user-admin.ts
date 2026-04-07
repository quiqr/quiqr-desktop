/**
 * CLI User Management Tool
 *
 * Manages users in the local file auth provider.
 * Usage:
 *   node dist/cli/user-admin.js add <email>
 *   node dist/cli/user-admin.js list
 *   node dist/cli/user-admin.js remove <email>
 *   node dist/cli/user-admin.js reset-password <email>
 */

import { LocalFileAuthProvider } from '@quiqr/backend';
import { homedir } from 'os';
import { join } from 'path';
import { createInterface } from 'readline';

const configDir = join(homedir(), '.quiqr-standalone');

function promptPassword(prompt: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const email = args[1];

  const provider = new LocalFileAuthProvider(configDir);

  switch (command) {
    case 'add': {
      if (!email) {
        console.error('Usage: user-admin add <email>');
        process.exit(1);
      }
      const password = await promptPassword('Password: ');
      if (!password) {
        console.error('Password cannot be empty.');
        process.exit(1);
      }
      const user = await provider.createUser(email, password, true);
      console.log(`User created: ${user.email} (must change password on first login)`);
      break;
    }

    case 'list': {
      const users = await provider.listUsers();
      if (users.length === 0) {
        console.log('No users found.');
      } else {
        for (const user of users) {
          const status = user.mustChangePassword ? '(must-change-password)' : '(active)';
          console.log(`  ${user.email}  ${status}`);
        }
      }
      break;
    }

    case 'remove': {
      if (!email) {
        console.error('Usage: user-admin remove <email>');
        process.exit(1);
      }
      await provider.removeUser(email);
      console.log(`User removed: ${email}`);
      break;
    }

    case 'reset-password': {
      if (!email) {
        console.error('Usage: user-admin reset-password <email>');
        process.exit(1);
      }
      const newPassword = await promptPassword('New password: ');
      if (!newPassword) {
        console.error('Password cannot be empty.');
        process.exit(1);
      }
      await provider.resetPassword(email, newPassword);
      console.log(`Password reset for ${email}. User must change password on next login.`);
      break;
    }

    default:
      console.log('Usage: user-admin <command> [args]');
      console.log('');
      console.log('Commands:');
      console.log('  add <email>            Add a new user');
      console.log('  list                   List all users');
      console.log('  remove <email>         Remove a user');
      console.log('  reset-password <email> Reset a user\'s password');
      process.exit(command ? 1 : 0);
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
