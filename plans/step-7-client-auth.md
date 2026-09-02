# Step 7: Auth on the Client

## Learning Goals

- Understand how a client holds identity between requests
- Learn where a token can live on a device and what each option protects against
- Understand the difference between data at rest, in transit, and in use
- Learn conditional rendering driven by auth state
- Understand why a client never decides who it is, only proves it

## Learning Questions

- What is the difference between `AsyncStorage` and `expo-secure-store`, and
  what attack does the second one actually stop?
- The token is readable by anyone holding it (see step 5). So why is storing it
  carefully still worth doing?
- When the API returns 401, how does the app tell "token expired" from "wrong
  password"? Should it?
- Why is there no encrypted-at-rest option on web at all?

## Tasks

### 1. Write the storage wrapper

Storage is already decided in DECISIONS #12: `expo-secure-store` on native,
`AsyncStorage` on web, because there is no encrypted-at-rest option on web.
Read that entry rather than re-deriving it here.

One module: `saveToken`, `getToken`, `clearToken`, branching on `Platform.OS`
inside. Everything else in the app goes through it and stays unaware of which
backend is in play — so if this moves to Supabase Auth later (DECISIONS #5, #9),
exactly one file changes.

What is stored is one string: the JWT, 188 bytes at the current payload of
`sub`, `iat`, `exp`. The user id is not stored separately — it decodes out of
the token as `sub`. Never the password.

### 2. Write an API client

One wrapper around `fetch` that:

- prefixes the base URL from step 6
- attaches `Authorization: Bearer <token>` when a token exists
- parses JSON and throws on non-2xx, so screens are not each re-checking
  `res.ok`

This is the mirror image of `requireAuth` on the server — that middleware reads
the header this client writes.

Note this is the first request to carry `Authorization`, so it is the first to
trigger the CORS preflight configured in step 6. If web breaks here and native
does not, that is why.

### 3. Handle 401 centrally

A 401 from any call means the token is gone or expired (24h, per DECISIONS #10).
The app should clear the token and return to login from one place, not from
every screen that happens to make a request.

Careful with the distinction: a 401 from `/login` means bad credentials and
should show an error on the form. A 401 from `/todos` means the session died.
Same status, different meaning, because one of them is not authenticated yet.

### 4. Login and register screens

Email and password, POST to the endpoint, store the returned token on success.

Surface the errors the API already returns rather than inventing new copy: 400
for missing fields, 401 for bad credentials, 409 for an email already taken.
Note that the 409 is the enumeration leak from DECISIONS #9 — the frontend is
where that becomes visible to a user, which is a good moment to re-read it.

One open question to settle here: `/login` returns only `{ token }`, and the
email is not a claim in the token. So the client has no copy of the user's
email unless it keeps what was typed. If any screen needs to display it, decide
between adding a claim, adding a `/me` endpoint, or holding the typed value.

### 5. Auth gate

On launch, read the stored token: present means show the app, absent means show
login. There will be a moment before storage resolves — decide what renders
then, because a flash of the login screen on every cold start is the default
and it looks broken.

### 6. Verify before moving on

- Register, log out, log back in
- Force-quit and reopen — still logged in
- Do the same on web. The storage backends genuinely differ, so a pass on iOS
  proves nothing about the browser

Do not use "delete and reinstall the app" to clear login state on iOS. Keychain
data survives uninstall when reinstalled under the same bundle ID, so the old
token comes back and you will chase a ghost session. Android differs — its
Keystore-encrypted SharedPreferences do not survive uninstall — so the two
platforms disagree and testing one tells you nothing about the other. Clear it
through log out, or delete the key explicitly.

## Output

A user can register, log in, and stay logged in across an app restart, on both
iOS and web. A dead token returns them to login cleanly.

## Next: Step 8, the todo screens
