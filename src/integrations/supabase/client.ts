import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hpvcqatrglqqolmtdsxj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwdmNxYXRyZ2xxcW9sbXRkc3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMTQ2NDEsImV4cCI6MjA2NDc5MDY0MX0.KGxDVQvo0D4JkLKDPOMWEHk11SqpB3Rm0zLKgI7r5Cw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
