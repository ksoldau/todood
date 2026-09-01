# Step 6: Expo App and Talking to the API

Scope: the app has to run on iOS and on web. Web is confirmed in scope, which
is why CORS appears in this step at all, and why every choice from here has to
be verified on both — a pass on one target proves nothing about the other.

## Learning Goals

- Understand why the API's address is not the same from every client
- Understand why the browser needs the server's permission to make a request
- Learn what a CORS preflight is and what triggers one

## Learning Questions

- Why can the iOS simulator reach `localhost:3000` but a physical phone cannot?
- Why does the browser need permission for this request when curl does not?
- Why does sending an `Authorization` header cause an extra `OPTIONS` request?
- Why is `Access-Control-Allow-Origin: *` a bad default here?

## Tasks

### 1. Create the Expo app

Scaffold an Expo app into the existing `frontend/` directory — it currently
holds only a README, and DECISIONS #1 keeps frontend and backend in one repo.

Expo rather than bare React Native CLI — see DECISIONS #11 for the reasoning.

### 2. Point it at the API

The base URL is not the same in every context, and this is the first real
gotcha:

- iOS simulator — `http://localhost:3000` works, it shares the host's network
- Physical device — `localhost` is the _phone_. Needs the Mac's LAN IP
- Web — `localhost` works

Put it in one config module, not scattered through fetch calls. It changes.

### 3. Add CORS to the backend

The API has no CORS middleware, so the web build's requests will be blocked by
the browser before they ever reach Express. The native app is unaffected — this
is a browser rule, not an HTTP one, which is the point of the learning question
above.

`npm install cors` in `backend/`, allow the Expo dev origin, and note that
`Authorization` is not a simple header — the browser sends a preflight
`OPTIONS` request first, and the server has to allow the header by name. That
matters in step 7, not here, but configure it now while you are in the file.

Worth a DECISIONS entry: which origins are allowed, and why not `*`.

### 4. Prove the connection

Call `/healthz` from the app and render the response. Run it on iOS _and_ in a
browser — this is the first point where both targets are exercised, and the
first chance for them to disagree.

Deliberately an unauthenticated endpoint. If this fails, the cause is the base
URL or CORS and nothing else — there is no token, no storage, no auth logic in
the picture yet. That is the entire point of stopping here.

## Output

The Expo app runs on iOS and web and successfully calls `/healthz` on both.
Plumbing confirmed before any auth exists.
