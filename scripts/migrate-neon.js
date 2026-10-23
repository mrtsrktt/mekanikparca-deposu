const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL ortam değişkeni bulunamadı.');
  process.exit(1);
}

const { Client } = require('pg');

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
