# Auth tokens

## Identifier vs credential

- **Identifier** — says who you are. Username, email, user id. Not secret.
- **Credential** — _proves_ it. Password, token, private key. Secret.

Test for a credential: if I have this and nothing else, can I act as you?

## What are you actually trying to do?

| goal                                    | what it needs                                                  | what you hold                                                               | why it's annoying                                               |
| --------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **log in (don't stay logged in)**       | a credential the server can recognize; stored in client memory | _**1 token**_ <br> JWT <br>--- _or_ <br> opaque session id                  | log in again every time you open the app                        |
| **+ stay logged in**                    | + store it on the device                                       | 1 token — JWT _or_ opaque session id                                        | a long-lived credential, no way to kill it early                |
| **+ log out everywhere** _(session id)_ | logic to delete session id from DB                             | 1 token — opaque random string, looked up in a table                        | a DB lookup on **every** request                                |
| **+ log out everywhere** _(JWT)_        | + a second, revocable token                                    | 2 tokens — a JWT access token, plus one opaque refresh token **per device** | tech complexity: a table, an extra endpoint, client retry logic |

## The tokens

|                     | access token                                             | refresh token                                                                   | CSRF token                                                                     |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **answers**         | who are you?                                             | who are you?                                                                    | where did this request come from?                                              |
| **is credential?**  | yes                                                      | yes                                                                             | **no**                                                                         |
| **job**             | gain access to your stuff                                | get a new access token                                                          | prove the request came from your own page                                      |
| **format**          | usually a JWT — self-contained, so no DB lookup          | usually opaque + random — needs a DB lookup, which is _what makes it revocable_ | random string the server printed into your page                                |
| **transport**       | probably `Authorization: Bearer` — attached by your code | posted to `/refresh`, or an httpOnly cookie — cookie attached automatically     | `X-CSRF-Token` header or hidden form field — read out of the page by your code |
| **lifetime**        | minutes                                                  | weeks                                                                           | one session                                                                    |
| **if stolen**       | attacker is you, until it expires                        | attacker is you, for weeks                                                      | nothing — worthless alone                                                      |
| **todood has one?** | yes                                                      | yes (for learning)                                                              | never — no cookies                                                             |

These are not three of a kind. Access + refresh are siblings — both credentials,
both part of row 3. A CSRF token is a different axis entirely: it proves _where
a request came from_, not who you are, and it only exists in cookie-based apps,
where the browser attaches things automatically.

Which is why the last two columns barely co-occur. Refresh tokens belong to the
header world, CSRF tokens to the cookie world.

Missing on purpose: **session id**. It does the same job as an access token, so
it's an alternative, never an addition.

## JWT

Three pieces joined by dots: `header.payload.signature`. Split on the dots.

- Pieces 1 + 2 are the content — algorithm, and who the user is.
- Piece 3 is a number the server calculated _from_ pieces 1 and 2 plus its secret.

Verifying = redo the math on the pieces 1+2 that just arrived, check the answer
equals piece 3. Different answer means the content was changed after signing.
Can't forge a new piece 3 without `JWT_SECRET`.

Base64 is encoding, not encryption — **anyone holding the token can read the
payload**. Never put anything secret in it.

The server knows the user id because it _put it there_ at login:

```js
jwt.sign({ sub: user.id }, JWT_SECRET); // login: write the id in
jwt.verify(token, JWT_SECRET).sub; // later: read it back out
```

Nothing is derived or looked up. `sub` = "subject", just a convention.

Consequence: the id is never re-checked. Delete the user and their token still
verifies fine — it's a valid note about someone who no longer exists.

## Bearer

Whoever **bears** it, gets access. The token
after the word `Bearer` can be anything (JWT, session id, API key).

Non-bearer schemes exist (mTLS, DPoP) where the client must prove it holds a
private key, so a stolen token alone is useless. Banks use these.

## Cookie vs Authorization header

The one real difference: **a cookie is attached by the browser automatically,
a header is attached by your code explicitly.**

|                     | cookie (httpOnly)             | `Authorization` header           |
| ------------------- | ----------------------------- | -------------------------------- |
| who attaches it     | browser, automatically        | your code, explicitly            |
| CSRF                | vulnerable — needs `SameSite` | immune                           |
| XSS stealing it     | can't — JS can't read it      | can — `localStorage` is readable |
| non-browser clients | awkward                       | natural                          |

Neither is safer; they're vulnerable to different things. The header won for
APIs because cookies are a _browser_ feature — curl, mobile apps, and other
servers have no cookie jar.

For todood the client is React Native, so there's no cookie jar at all. The
header isn't a security choice, it's the only thing that fits.

Rule worth keeping: **put each secret in the most restrictive place that still
lets it do its job.** One decision per token, based on who needs to read it.
Access token must be readable by your JS (it goes in the header). Refresh token
never is — so lock it away in httpOnly.

## CSRF — cross-site request forgery

Attacker can **send** requests to your domain (cookie rides along automatically)
but **cannot read** anything from it (same-origin policy).

Classic: you're logged into the bank, a forum post contains
`<img src="https://bank.com/transfer?to=attacker&amount=1000">`. Browser fetches
it, attaches your cookie, bank obeys. Attacker never saw a thing — blind attack.

This is where "a GET must never change state" comes from.

**CSRF token** exploits the same asymmetry in reverse: require something that
could only be obtained by _reading_. Server prints a random value into the page
(hidden input, or `<meta name="csrf-token">` for an SPA), JS reads it and sends
it as a header, server compares. evil.com can't read your page, so it can't
produce the value. Not a secret from the user — a secret from other _sites_.

Stateless variant: **double-submit cookie** — same value in a cookie and a
header, server checks they're equal, no server-side storage.

Mostly defanged now: browsers default to `SameSite=Lax`, so cookies aren't sent
on cross-site requests anyway.

Doesn't apply to todood at all — no cookies means no automatic attachment means
no CSRF. That's _why_ we don't need a CSRF token.

## XSS vs CSRF

|                      | XSS              | CSRF                            |
| -------------------- | ---------------- | ------------------------------- |
| attacker's code runs | on **your** site | on **their** site               |
| can read your data?  | yes, everything  | no, nothing                     |
| can act as you?      | yes              | yes                             |
| their lever          | injected script  | your browser's automatic cookie |

XSS is strictly worse. CSRF is narrower — can only trigger actions, blind.

## Refresh tokens

Solve a tension: short expiry is safe but you log in constantly; long expiry is
convenient but a stolen token lives forever and can't be revoked.

Split the job across two tokens:

- **Access token** — JWT, ~15 min, every request, no DB hit. This is the one
  that gets stolen, and it dies fast.
- **Refresh token** — opaque, ~30 days, sent only to `/refresh`, stored in a
  table. Because it's a row, you can **delete** it. That's the revocation you
  gave up by choosing JWTs.

Flow: request 401s → client silently POSTs to `/refresh` → gets a new access
token → retries. User sees nothing. "Log out everywhere" =
`DELETE FROM refresh_tokens WHERE user_id = ...`; worst case the thief keeps
access for 15 more minutes.

Why the refresh token can sit in a cookie even though cookies have the CSRF
problem: trick the browser into calling `/refresh` and the new token lands in
the _response body_, which the attacker can't read. They caused a token to be
minted and handed to you. Nothing happened.

Costs a table + cleanup, a `/refresh` endpoint, client retry logic (don't let
ten parallel 401s fire ten refreshes), and rotation with reuse-detection if
done properly.
