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

Project categories are fixed to:

- Residential Architecture
- Residential Interior
- Commercial Architecture
- Commercial Interior
- Landscape
- Others

The analytics table stores only basic activity events such as page views, project views, insight reads and career apply clicks. It does not store names, emails, phone numbers or IP addresses. Public visitors can insert events only; admin users can read analytics from the dashboard.
