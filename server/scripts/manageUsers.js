const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

const command = process.argv[2];
const args = process.argv.slice(3);

async function listUsers() {
  const result = await pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
  console.log('\nUsers:');
  console.log(JSON.stringify(result.rows, null, 2));
}

async function deleteUser(email) {
  if (!email) {
    console.error('Error: Email required. Usage: node manageUsers.js delete <email>');
    process.exit(1);
  }
  const result = await pool.query('DELETE FROM users WHERE email = $1 RETURNING id, email, name', [email]);
  if (result.rows.length === 0) {
    console.log(`No user found with email: ${email}`);
  } else {
    console.log(`Deleted user: ${JSON.stringify(result.rows[0], null, 2)}`);
  }
}

async function updateUserRole(email, role) {
  if (!email || !role) {
    console.error('Error: Email and role required. Usage: node manageUsers.js setRole <email> <admin|author>');
    process.exit(1);
  }
  if (!['admin', 'author'].includes(role)) {
    console.error('Error: Role must be "admin" or "author"');
    process.exit(1);
  }
  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, name, role',
    [role, email]
  );
  if (result.rows.length === 0) {
    console.log(`No user found with email: ${email}`);
  } else {
    console.log(`Updated user: ${JSON.stringify(result.rows[0], null, 2)}`);
  }
}

async function main() {
  try {
    switch (command) {
      case 'list':
        await listUsers();
        break;
      case 'delete':
        await deleteUser(args[0]);
        break;
      case 'setRole':
        await updateUserRole(args[0], args[1]);
        break;
      default:
        console.log(`
User Management Script

Usage:
  node manageUsers.js list                    - List all users
  node manageUsers.js delete <email>           - Delete a user
  node manageUsers.js setRole <email> <role>   - Set user role (admin|author)

Examples:
  node manageUsers.js list
  node manageUsers.js delete test@example.com
  node manageUsers.js setRole test@example.com admin
        `);
    }
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
