-- Migration: add first/last name + parent fields to members, display_name to assignments
alter table assignments add column if not exists display_name text;
alter table assignments add column if not exists is_parent boolean default false;

alter table members add column if not exists first_name text;
alter table members add column if not exists last_name text;
alter table members add column if not exists parent_name text;
alter table members add column if not exists parent_phone text;

-- Backfill existing name into first_name
update members set first_name = name where first_name is null;

-- Delete old sample data and insert real team members
delete from members;

insert into members (first_name, last_name, phone, parent_name, parent_phone) values
  ('Adelia',       'Zacharia',      '0645575793', 'Sushma & Sunil',      '0645575793'),
  ('Aryan',        'Mehra',         '',           '',                    ''),
  ('Alex',         'Pandit',        '0619398849', 'Shiv Pandit',         '0619398849'),
  ('Diaan',        'Lakhani',       '0687460565', 'Kunal',               '0687460565'),
  ('Harith',       'Kiran',         '',           '',                    ''),
  ('Maureen',      'Schimdt',       '0622774019', 'Andrea & Wladimir',   '0622774019'),
  ('Mrinal',       'Geddada',       '0644761199', 'Sridhar',             '0644761199'),
  ('Nicole',       'Yadav',         '',           '',                    ''),
  ('Reyansh',      'Gani',          '0620956141', 'Venkat & Bhargavi',   '0620956141'),
  ('Ruben',        'Gutbier-Garg',  '',           'Jitendar',            ''),
  ('Shivansh',     'Sudrik',        '0627425692', 'Umesh',               '0627425692'),
  ('Siddharth',    'Vijjapu',       '0684859730', 'Raju & Vidya',        '0684859730'),
  ('Veerle van den','Berg',         '0612965351', 'Pieter & Martine',    '0612965351');

-- Delete old events and insert real match schedule
delete from events;

insert into events (title, type, date, time, location, notes) values
  ('vs ACC U13 2',               'match', '2026-05-03', '09:00', 'Home',                           'Arrival 08:30'),
  ('vs Ajax - Dosto U11',        'match', '2026-05-10', '09:00', 'Home',                           'Arrival 08:30'),
  ('vs ACC U11',                 'match', '2026-05-17', '09:00', 'Away',                           'Arrival 08:30 — see location link'),
  ('vs QUI VIVE U11 1',          'match', '2026-05-24', '09:00', 'Home',                           'Arrival 08:30'),
  ('vs VRA U11 1',               'match', '2026-05-31', '09:00', 'Away',                           'Arrival 08:30'),
  ('vs VRA U11 2',               'match', '2026-06-07', '09:00', 'Home',                           'Arrival 08:30'),
  ('vs QUI VIVE U11 2',          'match', '2026-06-14', '09:00', 'Away',                           'Arrival 08:30'),
  ('vs BDAAL-HIL COMBI U11 1',   'match', '2026-06-21', '09:00', 'Away',                           'Arrival 08:30');

-- Insert recurring Tuesday + Friday trainings (May 29 – June 27 2026)
insert into events (title, type, date, time, location, notes) values
  ('Training', 'training', '2026-05-29', '16:30', 'Home ground', '16:30 – 18:00'),
  ('Training', 'training', '2026-06-02', '16:30', 'Home ground', '16:30 – 18:00'),
  ('Training', 'training', '2026-06-05', '16:30', 'Home ground', '16:30 – 18:00'),
  ('Training', 'training', '2026-06-09', '16:30', 'Home ground', '16:30 – 18:00'),
  ('Training', 'training', '2026-06-12', '16:30', 'Home ground', '16:30 – 18:00'),
  ('Training', 'training', '2026-06-16', '16:30', 'Home ground', '16:30 – 18:00'),
  ('Training', 'training', '2026-06-19', '16:30', 'Home ground', '16:30 – 18:00'),
  ('Training', 'training', '2026-06-23', '16:30', 'Home ground', '16:30 – 18:00'),
  ('Training', 'training', '2026-06-26', '16:30', 'Home ground', '16:30 – 18:00');
