-- טבלת משתמשים (נוסעים ונהגים)
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  role text check (role in ('driver', 'passenger')) not null,
  show_phone boolean default false,
  female_only boolean default false,
  created_at timestamp default now()
);

-- טבלת נסיעות (rides)
create table rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references users(id) on delete cascade,
  origin text not null,
  destination text not null,
  datetime timestamptz not null,
  seats integer not null check (seats > 0),
  polyline text not null,
  created_at timestamp default now()
);

-- טבלת בקשות (requests)
create table requests (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid references users(id) on delete cascade,
  origin text not null,
  destination text not null,
  datetime timestamptz,
  status text default 'pending' check (status in ('pending', 'matched', 'ignored', 'cancelled')),
  matched_ride_id uuid references rides(id),
  origin_lat double precision,
  origin_lng double precision,
  destination_lat double precision,
  destination_lng double precision,
  created_at timestamp default now()
);

-- טבלת התאמות בין בקשה לנסיעה (matches)
create table matches (
  ride_id uuid references rides(id) on delete cascade,
  request_id uuid references requests(id) on delete cascade,
  distance_offset_km numeric,
  time_offset_min integer,
  created_at timestamp default now(),
  primary key (ride_id, request_id)
);

-- אינדקסים שימושיים
create index on rides (driver_id);
create index on requests (passenger_id);
create index on matches (ride_id);
create index on matches (request_id);

-- אפשרות לעדכון אוטומטי של רשימות בזמן אמת
alter publication supabase_realtime add table users, rides, requests, matches;
alter publication supabase_realtime add row level security;
alter publication supabase_realtime add constraint "rides_driver_id_fkey" foreign key (driver_id) references users(id) on delete cascade;
