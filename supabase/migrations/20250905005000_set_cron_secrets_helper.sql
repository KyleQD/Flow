-- Helper: set Postgres settings so the schedule migration can vault.create_secret them
-- Usage (run once, customize values):
-- select set_config('app.settings.project_url', 'https://YOUR_PROJECT_REF.supabase.co', true);
-- select set_config('app.settings.service_role_key', 'YOUR_SUPABASE_SERVICE_ROLE_KEY', true);
-- select set_config('app.settings.cron_secret', 'LONG_RANDOM_VALUE', true);

comment on current_setting('app.settings.project_url', true) is 'Project URL used by scheduled analytics job';
comment on current_setting('app.settings.service_role_key', true) is 'Service role key used for scheduled analytics job';
comment on current_setting('app.settings.cron_secret', true) is 'Shared secret header for scheduled analytics job';



