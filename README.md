# AUTONAMO v1.0

A local OpenAPI endpoint explorer with searchable endpoints and **Documentation**,
**HTTP Client**, and **OpenAPI** views. The API target is fixed to
`https://localhost:5002`; API requests originate in your browser, not a remote proxy.

## Run locally

With Node.js 22 or later:

```sh
npm start
```

Open **http://127.0.0.1:3000** on the machine running your API. No package installation
or build step is needed. The UI server binds only to `127.0.0.1`.

Start your own HTTPS API on port **5002**, enter its OpenAPI **3.x JSON** path
(default: `/swagger/v1/swagger.json`), then click **Connect**. The default path is
a convention, not a supplied backend. No mock endpoints or API server are included.
Select an endpoint to inspect documentation or send a request in **HTTP Client**.
Change the path to `/openapi.json` or another local path if your API uses it.

### HTTPS and browser access

- Your browser must trust the API's certificate for `localhost`. Configure a
  trusted development certificate; this app does not bypass TLS verification.
- Configure the API to allow CORS for `http://127.0.0.1:3000` (or
  `http://localhost:3000` if you open the UI there), including the methods,
  `Content-Type` and `Accept` headers you use, and OPTIONS preflight requests.
- `localhost` always means the machine running the browser. Starlink or another
  internet provider does not change that. This works on an Apple M1 Mac with Node,
  but does not provision Starlink, Copilot subscriptions, or external servers.

### v1.0 scope

Supports inline OpenAPI operations, scalar path/query parameters, optional JSON
request bodies, and text/JSON responses. Referenced parameters, YAML specifications,
complex parameter serialization, header/cookie parameters, and authentication
are not implemented. OpenAPI `servers` URLs are intentionally ignored so requests
remain on the configured local target; API paths must include any required prefix.
Cookies are not sent, redirects are rejected, and requests time out after 15 seconds.
Browsers may reject methods such as TRACE. Requests run only when you click
**Connect** or **Send request**; sending a request may modify your API's data.

Run the focused tests with `npm test`.

---

# Original Copilot CLI exercise

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey damn-am-star!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/damn-am-star/npx-wrangler-preview-/issues/2)

