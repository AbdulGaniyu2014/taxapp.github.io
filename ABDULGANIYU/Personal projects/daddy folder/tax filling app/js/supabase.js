/*==================================================
    SUPABASE CONFIGURATION
==================================================*/

const SUPABASE_URL = "https://jcwqobrhfsiiojaqntmd.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impjd3FvYnJoZnNpaW9qYXFudG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MzQ3NzYsImV4cCI6MjEwMTAxMDc3Nn0.4V1GUBxQRnbJWjwnMTgU5SZ8xPjRiY_JDQcDRh6X5Dk";

const db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("✅ Supabase Connected");