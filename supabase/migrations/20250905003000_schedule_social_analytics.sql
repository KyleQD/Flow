-- Enable extensions if not already enabled
create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists vault;

-- Store secrets in Vault (safe to re-run; will upsert). Replace with your project-ref and anon key at deploy time.
-- For local dev, you can set them via SQL once. In CI, use env-substitution or a one-time migration adjustment.
select vault.create_secret(coalesce(current_setting('app.settings.project_url', true), 'https://YOUR_PROJECT_REF.supabase.co'), 'project_url');
select vault.create_secret(coalesce(current_setting('app.settings.service_role_key', true), 'YOUR_SUPABASE_SERVICE_ROLE_KEY'), 'service_role_key');
select vault.create_secret(coalesce(current_setting('app.settings.cron_secret', true), 'CHANGE_ME_CRON_SECRET'), 'cron_secret');

-- Nightly at 3 AM UTC
select
  cron.schedule(
    'social-analytics-nightly',
    '0 3 * * *',
    $$
    select
      net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/social-analytics',
        headers := jsonb_build_object(
          'Content-type', 'application/json',
          'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'),
          'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
        ),
        body := jsonb_build_object('runAll', true)
      ) as request_id;
    $$
  );

-- Index the cron jobs table for visibility (optional)
create index if not exists cron_job_run_details_status_idx on cron.job_run_details(status);


