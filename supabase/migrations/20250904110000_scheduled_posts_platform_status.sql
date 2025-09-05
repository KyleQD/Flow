-- Add per-platform status tracking on scheduled_posts
alter table if exists scheduled_posts
  add column if not exists platform_status jsonb default '{}'::jsonb,
  add column if not exists platform_errors jsonb default '{}'::jsonb;

create index if not exists idx_scheduled_posts_platform_status on scheduled_posts using gin(platform_status);
create index if not exists idx_scheduled_posts_platform_errors on scheduled_posts using gin(platform_errors);


