const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = "postgresql://neondb_owner:npg_N7pomAlP4hcG@ep-lively-wave-ai1wtmy2-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function migrate() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('Connected to Neon database');
    
    const sql = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/add_video_document_tables.sql'),
      'utf8'
    );
    
    await client.query(sql);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
