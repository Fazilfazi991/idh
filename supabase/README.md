# IDH Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` to load the current site content.
4. Create at least one Supabase Auth email/password user for the admin.
5. Add that user to the admin allow-list:
   ```sql
   insert into public.admin_users (user_id, email)
   select id, email from auth.users where email = 'admin@example.com';
   ```
6. Copy `supabase-config.example.js` to `supabase-config.js` and fill in:
   - `supabaseUrl`
   - `supabaseAnonKey`

`supabase-config.js` is ignored by git. On Vercel, make sure the deployed build includes an equivalent config file or inject `window.IDH_SUPABASE_CONFIG` before `script.js`.
