import postgres from 'postgres';

const connectionString = "postgresql://neondb_owner:npg_m9Sineuka7sf@ep-wild-scene-a2vw3u1f.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function test() {
  const sql = postgres(connectionString);
  try {
    const [dbResult] = await sql`SELECT current_database()`;
    const [userResult] = await sql`SELECT current_user`;
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
    
    console.log("Connected to Database:", dbResult.current_database);
    console.log("Connected as User:", userResult.current_user);
    console.log("Existing Tables:", tables.map(t => t.table_name));
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await sql.end();
  }
}

test();