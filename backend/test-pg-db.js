import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    console.log('Connecting to', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@'));
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Query success:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

test();
