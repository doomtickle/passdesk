# Copy notes

Every claim on the homepage, matched to the shipped capability that backs it.
Shipped capabilities are S1–S10; roadmap ("Coming soon") items are R1–R6. Copy
lives in `src/components/`; the file for each section is named below.

## Shipped capabilities (S1–S10)

- **S1** — There's no "Passdesk secret store". The GitHub token is
  injected directly by the sandbox's egress proxy; Passdesk itself never
  needs to see it. The Jira, Gemini and private-npm-registry credentials
  are kept in the user's OS keychain, delivered only into Passdesk's own
  sandbox, and read fresh from a file on every call.
- **S2** — Agents still talk to their model provider directly for
  inference. Every other tool call goes through Passdesk, which is itself
  held to an egress allowlist.
- **S3** — Rules are one org-wide policy file, not one per agent. Each
  agent gets its own tool grant: a per-agent bearer token maps to the
  list of tools that agent may call; anything outside that grant is
  denied with a reason. Per-agent rules (letting one agent's repo list,
  branch rules or size limits differ from another's) are roadmap (**R6**).
- **S4** — The org policy limits what a tool can do: repo allowlist,
  protected branches, required branch prefix, package allow/deny lists,
  web host allowlist, size limits (`max_diff_mb`, not `max_push_mb`).
- **S5** — Outbound scanning covers every pushed commit (content,
  messages, author names), pull request titles and bodies, and prompts
  sent to Gemini, plus web_fetch URLs; it looks for known key/token
  formats (GitHub, AWS, Anthropic, OpenAI, Slack, Google, private keys,
  password assignments) and blocks the call if one turns up — a safety
  net, not a full data-loss-prevention tool. Inbound text from the web,
  Jira, Gemini and errors from remote services is cleaned (terminal
  escapes stripped, size capped) and marked as untrusted.
- **S6** — npm packages are pinned to your lockfile and hash-checked;
  Python wheels must be pinned to exact versions with hashes. No install
  scripts run in Passdesk.
- **S7** — Append-only audit record per call: time, agent, tool, redacted
  arguments, the decision (allow/deny/error), the reason and a result
  excerpt.
- **S8** — Tools available today: GitHub (fetch, push, open PR as a
  draft), npm (download only), PyPI (download only), web fetch, Jira
  (read-only, limited to issues assigned to the calling agent), Gemini.
- **S9** — Built-in guardrails: pull requests always open as drafts;
  force-pushes and branch deletion aren't possible through Passdesk's
  git tools; Jira access is read-only.
- **S10** — Deployment today: Passdesk runs in a Docker sandbox; the
  sandbox keeps agents' tool traffic contained and is where the egress
  proxy adds the GitHub token. One Passdesk serves one project, on your
  machine. Rules are built into Passdesk's image at build time, so
  agents can't change them at runtime; changing a rule means rebuilding
  and restarting.

## Roadmap items (R1–R6)

- **R1** — Passdesk already is an MCP server and runs with Claude Code
  agents in Docker sandboxes today. Roadmap: other MCP clients (Codex,
  Cursor) and setups without a shared sandbox.
- **R2** — Tamper-evident hash-chained logs and SIEM sinks (syslog,
  webhook, OpenTelemetry).
- **R3** — Short-lived per-repo GitHub App tokens.
- **R4** — Human approval for risky actions.
- **R5** — Signed policy bundles and an admin API.
- **R6** — Per-agent rules: letting one agent's repo list, branch rules
  or size limits differ from another's, instead of every agent sharing
  the same org-wide policy file.

## Claim by claim

### Meta and header (`index.html`, `Header.tsx`)
- Title and Open Graph copy restate the hero; same backing as the hero lede.
- Wordmark, nav and "Request early access" button are structural.

### 1. Hero (`Hero.tsx`, `DeskDemo.tsx`)
- "Let your agents work. Keep the keys." — positioning line, not a fact.
- Lede: "push code, open pull requests and pull in packages" — **S8**;
  "with its own credentials" and "Your agents never hold your tokens." — **S1**
  (also in the meta and Open Graph descriptions);
  "by your rules" — **S3**/**S4**; "on the record" — **S7**.
- Desk illustration (captioned "Illustration"; slips and record lines in
  `deskScript.ts`): "No keys" chip and "Keys stay at the desk" (the matching
  key lights up on the rack but never moves to the agent) — **S1**; key tags
  GitHub, npm, PyPI, Jira, Web, Gemini — **S8**. Slips:
  - "Push branch agent/bump-deps to acme/web" and "Open a pull request: Bump
    deps", approved — **S8** (GitHub push, open PR) within **S4**.
  - "Push branch agent/fix-ci to acme/web", declined with "A secret turned up
    in the changes" — **S5**.
  - "Push straight to main on acme/web", declined with "main is a protected
    branch. Use a branch starting with agent/" — **S4** (protected branches,
    required branch prefix).
  - "Fetch acme/api from GitHub", approved — **S8** (GitHub fetch).
  - "Fetch @acme/ui-kit 2.4.1 from npm", approved — **S8** (npm) + **S6**.
  - "On the record" lines (time, agent, tool, decision) — **S7**; the tool
    names (`github.push`, `github.open_pr`, `github.fetch`, `npm.fetch`) are
    illustrative. Agent, repo and package names are placeholders.
- "We'll only email you about Passdesk early access." — a commitment about
  the sign-up list, not a product claim.

### 2. Problem (`Problem.tsx`)
- Body copy describes the baseline risk of handing an agent a token, not
  Passdesk.
- Table, "With Passdesk" column:
  - "Passdesk, which uses them on the agent's behalf" — **S1**.
  - "Only to Passdesk; apart from its model provider, it has no other way
    out" — **S2**.
  - "Only the tools you approved, within your rules" — **S3** + **S4**.
  - "What you can see afterwards": "Every call, with its decision" — **S7**.
    The "Without" cell, "Only what each service happens to log", describes
    the baseline, not Passdesk.
- Body copy "leaves you no record of what the agent asked for" is the
  baseline; the contrast it sets up is **S7**.

### 3. How it works (`HowItWorks.tsx`)
- Step 1, "its own Passdesk token, never your credentials" — **S3** + **S1**.
- Step 2, repos/branches/packages/websites, "declined, with a reason" — **S4** (+ **S3** for the reason).
- Step 3, "It uses its own credentials, so they never reach the agent" — **S1**; "npm
  packages are pinned to your lockfile and hash-checked; Python wheels must be
  pinned to exact versions with hashes. No install scripts run" — **S6**.
- Step 4, "Pushes, pull requests and prompts sent to Gemini are scanned for
  common secret formats, and blocked if one turns up" — **S5**; "Text that
  comes back from the web, Jira or Gemini is cleaned and marked as
  untrusted" — **S5**; "Every call goes on the record" — **S7**.
- "When the answer is no" example (push to main declined, hint to use a
  branch starting with `agent/`) — **S4** (protected branches, required
  branch prefix). Captioned "Illustration"; `acme/web` is a placeholder.

### 4. Audiences (`Audiences.tsx`)
- "For engineering": the tool list ("fetch and push code, open pull
  requests, pull packages from npm and PyPI, read the web, read their
  assigned Jira issues and use Gemini") — **S8**; Gemini is named without a
  specific action because S8 lists it only by name; "hears why and can take
  the allowed route" — **S4** (reason and hint on a denial).
- "For security": "Approve each agent's tools once, in a config file that's
  reviewed like any other code change" — **S3**. Per-agent grant files
  reviewed like code is the brief's policy-as-code wording decision for S3; "see every call: when, which agent, which tool, the arguments with
  secrets redacted, and the decision" — **S7**.

### 5. Under the hood (`UnderTheHood.tsx`)
- Heading "See what your security team will see" and intro "Two files show
  how it works: the rules an agent works under, and the record of what it
  did." — **S3** (the rules) + **S7** (the record); framing, not an
  exhaustive claim.
- "The rules" panel intro:
  - "An org-wide policy file, plus a short tool grant per agent, both kept
    in version control. Change them, review them, merge them." — **S3**.
  - "Rules apply to every agent; each agent's grant controls which tools it
    can call. Per-agent rules are coming." — **S3** (shipped half) + **R6**
    (roadmap half).
  - "Rules are built into Passdesk's image, so agents can't change them;
    changing a rule means rebuilding and restarting." — **S10**.
  - The example is split into two files: `policy.toml` (org-wide — `repos`,
    `branches.protected`, `push_prefix`, `max_diff_mb`, `npm.allow`/`deny`,
    `web_fetch.hosts`, `max_response_mb` — **S4**) and `grants/release-bot`
    (per-agent — `tools: [github.fetch, github.push, github.open_pr,
    npm.fetch]` — **S3** + **S8**). Captioned "illustrative, schema
    simplified"; all values are placeholders.
- "The record": "time, agent, tool, redacted arguments and the decision" —
  **S7** (abridged; the full field list — reason, result excerpt — is in
  S7 above). Sample lines (captioned "illustrative, not captured output"):
  the "secret detected in diff" denial — **S5**; the "protected branch"
  denial — **S4**; the `jira.get_issue` line is an illustrative example of
  a Jira read call (**S8** Jira, read-only) — action name illustrative; no
  line carries a credential — **S1**.

### 6. Availability (`Availability.tsx`)
- "Works today" list — **S8**, the full list; the "Jira (read your assigned
  issues)" entry — **S8**.
- "Works today" note, "Pull requests open as drafts; force-pushes and
  branch deletion aren't possible; Jira is read-only." — **S9**.
- "Coming soon" list — **R1** ("Any MCP client, outside Docker sandboxes"),
  **R6** (per-agent rules), **R2**, **R3**, **R4**, **R5**, in that order.
  This is the only place roadmap items are listed (the FAQ restates R1).

### 7. FAQ (`Faq.tsx`)
- GitHub token, "Passdesk's sandbox holds the credentials" — **S1** + **S3**.
- Not allowed — **S4** + **S7**.
- Going around Passdesk, "All of an agent's tool traffic goes through
  Passdesk; apart from its model provider, it has no other way out" —
  **S2**.
- Secret in a push or prompt — **S5**, including the list of key/token
  formats and the "safety net, not a full data-loss-prevention tool" line.
- "What do I need to run it?" — **S10**.
- "Will it work with Claude Code, Codex or Cursor?" — **R1**: today's
  Claude Code / Docker sandbox / MCP support is **S10**/shipped; the rest
  (other MCP clients, no shared sandbox) is explicitly "coming".
- When can I try it — no product claim.

### 8. Closing and footer (`Closing.tsx`, `Footer.tsx`)
- "Passdesk holds the keys" — **S1**; "keeps the record" — **S7**.
- "© 2026 Passdesk" and the contact address (`CONTACT_EMAIL` in
  `src/config.ts`, a placeholder to replace before launch) — not claims.

## Things deliberately left out
- No "zero trust", "military-grade", padlock or shield imagery, robot
  imagery, customer logos, testimonials, quotes, "trusted by", or invented
  numbers or stats. The brand mark is a key, not a padlock.
- "Tools", never "skills".
- GitHub, npm, PyPI, Jira and Gemini appear only as plain text, never as
  logos, and never phrased as endorsements.
- No fake CLI transcript or terminal: the refusal example is a plain-language
  exchange, since no Passdesk CLI is a shipped product surface.
- No quickstart commands or package names: the quickstart ships at launch.
