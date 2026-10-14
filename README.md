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

_Learn to use GitHub Copilot CLI—a standalone terminal application—for issue management and building a Node.js calculator application._

## Welcome

- **Who is this for**: Developers who want to learn how to use the standalone GitHub Copilot CLI to streamline their development workflow
- **What you'll learn**: How to install and use GitHub Copilot CLI as a standalone terminal tool for creating issues, generating code, and collaborating interactively from the command line
- **What you'll build**: A Node.js calculator app using Copilot CLI for project setup, issue management, and collaborative development
- **Prerequisites**:
  - Familiarity with basic command line (CLI) operations
  - Basic knowledge of GitHub repositories
  - Node.js version 22 or later (for Copilot CLI installation)
  - A GitHub Copilot subscription (Free, Pro, Pro+, Business, or Enterprise)

- **How long**: This exercise takes less than 60 minutes to complete.

In this exercise, you will:

1. Learn to install the standalone Copilot CLI and use an issue template
1. Use Copilot CLI to create an issue for a Node.js calculator app from an existing template
1. Practice iterative development by working together with Copilot on the command line

### What's New in Copilot CLI

GitHub Copilot CLI is a standalone terminal application with exciting features:
- **Latest AI models**: Access the newest models from OpenAI and Google
- **Custom agents**: Create specialized agent personas for your workflows using `.github/agents/`
- **`/delegate` command**: Delegate tasks to Copilot coding agent which works autonomously
- **`/share` command**: Save chat sessions as Markdown files or GitHub gists
- **Better image support**: Add images via paste and drag-and-drop
- **MCP server support**: Integrate with Model Context Protocol tools
- **Improved reliability**: Better handling of long-running commands and enhanced automation with headless `-p` mode


### How to start this exercise

Simply copy the exercise to your account, then give your favorite Octocat (Mona) **about 20 seconds** to prepare the first lesson, then **refresh the page**.

[![](https://img.shields.io/badge/Copy%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/new?template_owner=skills&template_name=create-applications-with-the-copilot-cli&owner=%40me&name=skills-create-applications-with-the-copilot-cli&description=Exercise:+Create+Applications+with+the+Copilot+CLI&visibility=public)

<details>
<summary>Having trouble? 🤷</summary><br/>

When copying the exercise, we recommend the following settings:

- For owner, choose your personal account or an organization to host the repository.

- We recommend creating a public repository, since private repositories will use Actions minutes.

If the exercise isn't ready in 20 seconds, please check the [Actions](../../actions) tab.

- Check to see if a job is running. Sometimes it simply takes a bit longer.

- If the page shows a failed job, please submit an issue. Nice, you found a bug! 🐛

</details>

---

&copy; 2026 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)
