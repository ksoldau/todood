-- Goal: switch users.id from integer to UUID. 
-- Why: So that we can use UUIDs for user IDs, which are more secure and less predictable than sequential integers.

-- First, add new column to users table to hold UUIDs
ALTER TABLE users
ADD COLUMN new_id UUID DEFAULT gen_random_uuid();

-- Next, add new column to todos table to later hold the new user_id.
ALTER TABLE todos
ADD COLUMN new_user_id UUID;

-- Now, update the new_user_id column in todos to match the new_id in users.
UPDATE todos
SET new_user_id = users.new_id
FROM users
WHERE todos.user_id = users.id;

-- Then, drop the old user_id column from todos and the old id column from users,
-- and rename the new columns to take their place.
ALTER TABLE todos
DROP COLUMN user_id;

ALTER TABLE users
DROP COLUMN id;

ALTER TABLE users
RENAME COLUMN new_id TO id;

ALTER TABLE todos 
RENAME COLUMN new_user_id TO user_id;

-- Finally, update constraints on the new columns. 
ALTER TABLE users
ADD PRIMARY KEY (id);

ALTER TABLE todos
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE todos
ADD CONSTRAINT todos_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);