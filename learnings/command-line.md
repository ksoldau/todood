# Command line

## `curl`
Makes HTTP requests. Lets you test APIS from terminal.

Makes `get` requests by default, but you can make `post` requests like: 
```
curl -X POST http://localhost:3000/todos \
  - H "Content-Type": application/json" \
  - d '{"title":"Learn backend"}'
```