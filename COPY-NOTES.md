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
- **S9** — Built-in guardrails: pull requests open as drafts by default;
  force-pushes and branch deletion aren't possible through Passdesk's
  git tools; Jira access is read-only.
- **S10** — Deployment today: Passdesk runs in a Docker sandbox; the
  sandbox keeps agents' tool traffic contained and is where the egress
  proxy adds the GitHub token. One Passdesk serves one project, on your
  machine. Rules are built into Passdesk's image at build time, so
  agents can't change them at runtime; changing a rule means rebuilding
  and restarting.
- **S11** — Implementation facts from the public repository: Apache-2.0,
  standard-library Python only, runs on the user's own machine, works
  with Claude Code today.
- **S12** — Self-hosted, nothing phones home: the gateway and its sandbox
  run on the user's machine; credentials, code and the audit record stay
  there; no Passdesk-operated service receives any of them. The built site
  makes no runtime request except the waitlist form's POST (README,
  "Sign-up form"). Copy that could read as Passdesk the company holding a
  user's credentials is not allowed; "the desk" always means the user's
  own gateway.

## Passdesk Pro (private beta, P1–P2)

Sold separately; not yet on sale. Every Pro claim is labelled "Early
access" or "private beta" and dated "early 2027".

- **P1** — Approvals: `git_push` and `github_create_pr` are held until a
  person approves them from the console (`factory approvals`) or, after a
  webhook notification, declines them; the decision and the approver's
  name go on the audit record. Built and tested; in private beta.
- **P2** — Pricing as planned: Pro Solo $79 a year for one approver, Pro
  Team $490 a year for up to ten approvers, unlimited agents on both.
  Stated as a starting point that may change before launch.

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
- `og:image` (`public/og.svg`, rendered to `public/og.png`): the key mark
  (`KeyMark.tsx`) and wordmark "Passdesk" restate the header; the eyebrow
  "Open source · runs on your machine" restates the hero eyebrow (**S11** +
  **S12**); the headline restates the hero title verbatim — no new claim.
  `og:image:alt` states the same headline; not a separate claim.

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

- Lede: "a gateway that runs on your own machine", "credentials, which
  never leave it", "and neither do we" — **S12** (also in the meta and
  Open Graph descriptions).
- Eyebrow "Open source · runs on your machine" (**S11** + **S12**) and the proof line under
  the form ("Runs on your machine", "Standard-library Python, open
  source", "Works with Claude Code today") — **S11** (the last also
  **S10**). The brass second line of the headline is styling, not a claim.

### 2. Problem (`Problem.tsx`)
- Body copy describes the baseline risk of handing an agent a token, not
  Passdesk.
- Two cards; the "With Passdesk" card:
  - "You do. They stay on your machine, in the gateway's own sandbox, and
    never reach the agent or us" — **S1** + **S12**.
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
- Step 3, "from its own sandbox on your machine, with your credentials, so
  they never reach the agent and never leave your machine" — **S1** + **S12**; "npm
  packages are pinned to your lockfile and hash-checked; Python wheels must be
  pinned to exact versions with hashes. No install scripts run" — **S6**.
- Step 4, "Pushes, pull requests and prompts sent to Gemini are scanned for
  common secret formats, and blocked if one turns up" — **S5**; "Text that
  comes back from the web, Jira or Gemini is cleaned and marked as
  untrusted" — **S5**; "Every call goes on the record" — **S7**.
- "When the answer is no" example, drawn as the exchange the agent sees:
  the tool call (`git_push repo=acme/web branch=main`) and the gateway's
  answer, which uses the real refusal prefix ("DENIED by broker policy:")
  and the real protected-branch reason; the hint to use a branch starting
  with `agent/` is illustrative (deployments choose the prefix) — **S4**
  (protected branches, required branch prefix). Captioned "Illustration";
  `acme/web` is a placeholder. "It heard “no” and why" — **S4** (reason on
  a denial).

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
- The three facts under the files: "Credentials" (token stays on your
  machine; attached by the sandbox's proxy; the gateway's process never
  reads it; no agent sandbox receives it; nothing is sent to us) — **S1** +
  **S12**; "Supply chain" (lockfile-pinned, hash-verified
  tarballs and wheels; nothing from the workspace executed) — **S6**;
  "Guardrails" (draft PRs by default, no force-push or branch deletion,
  Jira read-only) — **S9**.

### 5b. Pricing (`Pricing.tsx`)
- "The gateway is free" and the Free column — **S11** (license) plus
  **S1**, **S3**, **S4**/**S9**, **S5**, **S6**, **S7** for its six lines.
- "The approval gate is Pro", the intro paragraph and the Pro Solo column
  — **P1**; the two lines marked "coming" — **R6** (per-agent rules) and
  **R2** (hash-chained audit export).
- Prices, "Early access" badge, "private beta and ships in early 2027",
  "may change before launch" — **P2**.
- Pro Team column: "One key for the team", support terms, "No SLA, no
  custom work", "No enterprise tier, on purpose" — **P2** (the offer as
  planned, stated as policy, not as a shipped capability).

### 6. Availability (`Availability.tsx`)
- "Works today" list — **S8**, the full list; the "Jira (read your assigned
  issues)" entry — **S8**.
- "Works today" note, "Pull requests open as drafts; force-pushes and
  branch deletion aren't possible; Jira is read-only." — **S9**.
- "Coming soon" list — **R1** ("Any MCP client, outside Docker sandboxes"),
  **R6** (per-agent rules), **R2**, **R3**, **R4**, **R5**, in that order.
  The FAQ restates R1, and the Pricing section marks R6 and R2 as
  "coming" in the Pro Solo column; nowhere else lists roadmap items.

### 7. FAQ (`Faq.tsx`)
- GitHub token, "The gateway's own sandbox on your machine holds the
  credentials" — **S1** + **S3** + **S12**.
- "Do you ever see my keys, my code or my record?" — **S12** in full,
  including "this website makes no request except the early-access form".
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
- "The keys stay on your machine" — **S12**; "The record stays with you"
  and "keeps the record" — **S7** + **S12**; "keeps them out of your keys"
  — **S1**.
- "© 2026 Passdesk" and the contact address (`CONTACT_EMAIL` in
  `src/config.ts`, a placeholder to replace before launch) — not claims.

## Things deliberately left out
- No "zero trust", "military-grade", padlock or shield imagery, robot
  imagery, customer logos, testimonials, quotes, "trusted by", or invented
  numbers or stats. The brand mark is a key, not a padlock.
- "Tools", never "skills".
- GitHub, npm, PyPI, Jira and Gemini appear only as plain text, never as
  logos, and never phrased as endorsements.
- No fake CLI or product screens: the refusal example shows only a tool
  call and the gateway's denial text in the format the gateway really
  returns, captioned as an illustration; nothing on the page depicts a
  Passdesk command-line or interface that does not ship.
- No quickstart commands or package names: the quickstart ships at launch.
