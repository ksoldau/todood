insert into public.users (id, email, password_hash) values
  (1, 'user1@example.com', 'password1');

insert into public.todos (user_id, title, notes) values
  (1, 'Buy groceries', 'Milk, eggs, bread'),
  (1, 'Clean the house', 'Vacuum and dust');