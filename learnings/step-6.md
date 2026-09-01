# Step 6: Expo App and Talking to the API

Answers written before doing the step, as predictions. Corrections and what
actually happened go underneath, marked, rather than replacing the original
guess — the gap between the two is the useful part.

## Learning Questions

### Why can the iOS simulator reach `localhost:3000` but a physical phone cannot?

[@ksoldau] localhost:3000 points at "this device". If the server is running on my laptop at localhost:3000 then the simulator can reach it because it's on the laptop, but obviously the physical phone isn't on thelaptop.

### Why does the browser need permission for this request when curl does not?

[@ksoldau] HTTP doesn't explicitly need the permission to make the request, that's the browser's rule. Browsers will attach cookies associated with the request's url, but we don't want just anyone to be able to read, say "bank.com/balance" using someone else's session. The browser won't let JS read the response if it doesn't have permission. Curl doesn't automatically attach any cookies or other ambient credentials.

### Why does sending an `Authorization` header cause an extra `OPTIONS` request?

[@ksoldau] It's the browser asking permission before doing anything (preflight). Happens underneath `fetch`, which makes it kinda hard to debug!

The same origin policy (talked about above) only really applies to the reading of the response because the request still gets sent. The extra OPTIONS request can stop the request form being sent at all. If the browser thinks the req will cause a side effect just by sending a request, it'll make sure it's allowed to send from the origin first. It "thinks there will be a side effect" if you're doing anything other than what an original HTML form could do.

History: anything that a plain HTML form could trigger was grandfathered in and is allowed. HTML forms only support GET and POST w/ no un-safelisted headers.

Caching: Browsers cache Allow-Headers (and others) which includes the Authorization one, so don't need to preflight EVERY request, as LONG AS `Access-Control-Max-Age` is set. Without max age set the default age is 5 seconds, so you wouldn't be caching for long.

### Why is `Access-Control-Allow-Origin: *` a bad default here?

[@ksoldau] We don't want to allow ANYONE to read a response from our APIs, only our app or website.

Realistically, since we're using an Authz header and not auth cookies, the "*" is less dangerous because there's no cookies that'll automatically get attached. But /login and /register still would've been exposed.
