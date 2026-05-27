import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DIRECT_URL,
});

async function test() {
  try {
    console.log('Connecting to', process.env.DIRECT_URL.replace(/:[^:@]+@/, ':***@'));
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Query success:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

test();
