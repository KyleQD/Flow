create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  email text not null,
  phone text not null,
  website text not null,
  currency text not null,
  payment_methods jsonb not null default '{
    "creditCard": false,
    "paypal": false,
    "applePay": false,
    "googlePay": false
  }',
  notifications jsonb not null default '{
    "email": true,
    "push": false,
    "sms": false
  }',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create a unique index on user_id to ensure one settings record per user
create unique index if not exists business_settings_user_id_idx on public.business_settings(user_id);

-- Enable Row Level Security
alter table public.business_settings enable row level security;

-- Create policies
create policy "Users can view their own business settings"
  on public.business_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own business settings"
  on public.business_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own business settings"
  on public.business_settings for update
  using (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger to automatically update updated_at timestamp
create trigger handle_business_settings_updated_at
  before update on public.business_settings
  for each row
  execute function public.handle_updated_at(); 