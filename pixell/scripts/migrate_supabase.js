const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function migrate() {
  const client = new Client({
    host: "db.sobhmavdtbxjtbtwbewt.supabase.co",
    port: 5432,
    user: "postgres",
    password: process.env.SUPABASE_DB_PASSWORD || "3_r2qpBCbzhUGzn",
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to Supabase PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    // 1. Read and execute supabase_schema.sql
    const schemaPath = path.join(__dirname, "..", "supabase_schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");

    console.log("Executing supabase_schema.sql (tables, RLS, seed data)...");
    await client.query(sql);
    console.log("Schema executed successfully!");

    // 2. Create Storage bucket 'itfest' with public read access
    console.log("Setting up Supabase Storage bucket 'itfest'...");
    await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        'itfest',
        'itfest',
        true,
        52428800, -- 50MB
        ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif', 'application/pdf']
      )
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);

    // Storage policies
    await client.query(`
      DO $$
      BEGIN
        -- SELECT policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read itfest'
        ) THEN
          CREATE POLICY "Public read itfest" ON storage.objects FOR SELECT USING (bucket_id = 'itfest');
        END IF;

        -- INSERT policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public upload itfest'
        ) THEN
          CREATE POLICY "Public upload itfest" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'itfest');
        END IF;

        -- UPDATE policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public update itfest'
        ) THEN
          CREATE POLICY "Public update itfest" ON storage.objects FOR UPDATE USING (bucket_id = 'itfest');
        END IF;

        -- DELETE policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public delete itfest'
        ) THEN
          CREATE POLICY "Public delete itfest" ON storage.objects FOR DELETE USING (bucket_id = 'itfest');
        END IF;
      END $$;
    `);
    console.log("Storage bucket 'itfest' and policies created successfully!");

    // 3. Verify counts in all tables
    console.log("\nVerifying database tables:");
    const tables = ["sponsors", "media_partners", "timeline", "events", "speakers"];
    for (const t of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`  - Table '${t}': ${res.rows[0].count} records`);
    }

    const bucketRes = await client.query(`SELECT id, name, public FROM storage.buckets WHERE id = 'itfest'`);
    console.log(`  - Storage Bucket '${bucketRes.rows[0]?.id}': public = ${bucketRes.rows[0]?.public}`);

    console.log("\n>>> MIGRATION COMPLETE! ALL DATA AND TABLES ARE READY! <<<");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
