-- Sample data for local development. Loaded by `supabase db reset` after
-- migrations run. Safe to change freely — this never touches prod.
--
-- Both tables use UUID ids (users.id defaults to gen_random_uuid()), and every
-- todo must state a bucket and position. One CTE inserts the user and reuses
-- its generated id for the todos, so we never hardcode a UUID.
--
-- The password_hash below is bcrypt('password1'). This is a throwaway demo
-- account, not the dev login — that user is created via /register.

with u as (
  insert into public.users (email, password_hash)
  values ('user1@example.com', '$2b$10$vlj0tBLzca0VyOF0.T528elb9yu/J5LD46VKbsRw4SfxbXdq3AECW')
  returning id
)
insert into public.todos (user_id, title, notes, bucket, position)
select u.id, t.title, t.notes, t.bucket, t.position
from u,
  (values
    ('Buy groceries', 'Milk, eggs, bread', 'today', 0),
    ('Clean the house', 'Vacuum and dust', 'today', 1),
    ('Plan weekend trip', null, 'soon', 0),
    ('Read a book', null, 'later', 0)
  ) as t(title, notes, bucket, position);
