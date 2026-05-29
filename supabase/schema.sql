-- R&W-Wit Cricket Team Database Schema
-- Run this in your Supabase SQL editor

create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  created_at timestamptz default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('training', 'match')),
  date date not null,
  time time not null,
  location text not null,
  notes text,
  created_at timestamptz default now()
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  status text not null check (status in ('attending', 'not_attending', 'maybe')),
  unique(event_id, member_id)
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  role text not null,
  unique(event_id, member_id, role)
);

-- Enable Row Level Security (open read/write for team use - no login required)
alter table members enable row level security;
alter table events enable row level security;
alter table attendance enable row level security;
alter table assignments enable row level security;

create policy "Public read members" on members for select using (true);
create policy "Public insert members" on members for insert with check (true);
create policy "Public update members" on members for update using (true);
create policy "Public delete members" on members for delete using (true);

create policy "Public read events" on events for select using (true);
create policy "Public insert events" on events for insert with check (true);
create policy "Public update events" on events for update using (true);
create policy "Public delete events" on events for delete using (true);

create policy "Public read attendance" on attendance for select using (true);
create policy "Public insert attendance" on attendance for insert with check (true);
create policy "Public update attendance" on attendance for update using (true);
create policy "Public delete attendance" on attendance for delete using (true);

create policy "Public read assignments" on assignments for select using (true);
create policy "Public insert assignments" on assignments for insert with check (true);
create policy "Public update assignments" on assignments for update using (true);
create policy "Public delete assignments" on assignments for delete using (true);

-- Sample data
insert into members (name, email, phone) values
  ('Coach Mike', 'coach@rwwit.com', '0400 000 001'),
  ('Alex van der Berg', 'alex@example.com', '0400 000 002'),
  ('Sam Patel', 'sam@example.com', '0400 000 003'),
  ('Jake Williams', 'jake@example.com', '0400 000 004'),
  ('Liam Johnson', 'liam@example.com', '0400 000 005');
