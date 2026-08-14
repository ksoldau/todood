# Databases

## Postgres 
Relational DB. ACID compliant. Industry standard. 

## Database driver
Software that lets your app talk to a DB/translator between code and DB. 

Otherwise, in Express for example, JS can't communicate with Postgres.

Handles connecting to dDB, sending SQL queries, receiving results, error handling.

## SQL
Shouldn't ever build SQL queries with string interpolation bc of the threat of SQL injection! Can get around it with parameterized versions of queries like:
```
await pgClient.query('SELECT * FROM todos WHERE user_id = $1', [userId])
```