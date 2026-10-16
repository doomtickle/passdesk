# Copy notes

Every factual claim on `index.html`, matched to the shipped capability that
backs it. Shipped capabilities are numbered S1–S8; roadmap ("Coming soon")
items are numbered R1–R5. Both lists are copied verbatim (condensed) from
the brief so a reviewer can cross-check without leaving this file.

## Shipped capabilities referenced (S1–S8)

- **S1** — Agents never hold your tokens. The GitHub token is injected by
  the egress proxy into the broker only; other credentials live in
  Passdesk's own secret store and are read fresh per call.
- **S2** — Agents can't reach the internet directly. Their only egress is
  through Passdesk, and Passdesk itself is held to an egress allowlist.
- **S3** — Each agent gets only its approved tools. A per-agent bearer
  token maps to a grant list; anything else is denied with a reason.
- **S4** — Policy limits what a tool can do: repo allowlist, protected
  branches, required branch prefix, package allow/deny lists, web host
  allowlist, size limits.
- **S5** — Outbound secret scanning blocks pushes and prompts that contain
  secrets. Inbound content is redacted, stripped of terminal escapes and
  wrapped as untrusted data.
- **S6** — Packages arrive as lockfile-pinned, hash-verified tarballs and
  wheels; no install scripts run in Passdesk.
- **S7** — Append-only audit record per call: time, agent, tool, redacted
  arguments, decision.
- **S8** — Tools available today: GitHub (fetch, push, open PR), npm,
  PyPI, web fetch, Jira, Gemini.

## Roadmap items referenced (R1–R5)

- **R1** — Generic MCP adapter for any MCP agent (Claude Code, Codex,
  Cursor).
- **R2** — Tamper-evident hash-chained logs and SIEM sinks (syslog,
  webhook, OpenTelemetry).
- **R3** — Short-lived per-repo GitHub App tokens.
- **R4** — Human approval for risky actions.
- **R5** — Signed policy bundles and an admin API.

## Claim-by-claim

### Header / nav
- "Passdesk" wordmark (now a key icon — a hotel-desk key, not a padlock)
  + nav links to each section — structural, not a factual claim.

### 1. Hero
- "Let your agents work. Keep the keys." — positioning line, not a
  checkable fact.
- "Your agents get the tools they need, and Passdesk keeps the
  credentials." — **S1** (no credentials reach the agent; Passdesk holds
  them).
- "Security approves every agent's tools and sees every call." —
  "approves every agent's tools" is the policy-as-code wording decision,
  backed by **S3** (per-agent grants live in config, see section 4);
  "sees every call" is **S7** (the append-only audit record), restated in
  full in section 5 and again in the closing section.
- Hero diagram labels: "no host credentials" on the agent node, "holds
  the keys" on the Passdesk node — **S1**. Targets shown (GitHub, npm,
  Jira) — subset of **S8**, chosen to fit the diagram; full list appears
  later in section 6.

### 2. The problem
- "Agent with a token" column (credential in environment, open network,
  no record) — describes the *baseline risk* Passdesk replaces, not a
  claim about Passdesk itself. Included for contrast only.
- "Only its Passdesk token, never your credentials" — **S1** (no real
  credential reaches the agent) + **S3** (the agent's own bearer token is
  the only thing it holds).
- "No network access outside Passdesk" — **S2**.
- "Every call logged with its decision" — **S7**.

### 3. How it works
- Step 1 (Agent asks): "using its own bearer token," "never sees a GitHub
  token, an npm credential, or raw network access" — **S3** (bearer token
  → grant list) + **S1** + **S2**.
- Step 2 (Passdesk checks policy): "grant list and the org's policy:
  which repos, which branches, which packages, which hosts," "denied with
  a reason" — **S4** + **S3**.
- Step 3 (Passdesk acts): "own credentials, read fresh per call," "egress
  through Passdesk only," "Passdesk itself is held to an egress
  allowlist" — **S1** + **S2**. "Packages arrive as lockfile-pinned,
  hash-verified tarballs and wheels, and no install scripts run" —
  **S6**, verbatim.
- Step 4 (Result filtered and logged): "Outgoing pushes and prompts are
  scanned for secrets and blocked if one turns up" — **S5** (outbound
  secret scanning). "What comes back is redacted, stripped of terminal
  escapes and wrapped as untrusted data" — **S5** (inbound content
  handling). "The call (time, agent, tool, redacted arguments, decision)
  is appended to the audit record" — **S7**.
- Denial example (`github.push {repo: "acme/web", branch: "main"}` →
  denied, reason "main is a protected branch," hint to push to a branch
  starting with `agent/`) — **S4** (protected branches, required branch
  prefix). This is the exact example named in the brief. The repo name
  (`acme/web`) is a placeholder, not a real customer. The block is
  rendered as a `<figure>` with a `<figcaption>` that reads "illustrative,
  not captured output" — it's a realistic example of the request/response
  shape, not a transcript of an actual call Passdesk made.

### 4. Approve tools once
- "Approval lives in version control: per-agent config files, reviewed
  like code." — the brief's policy-as-code wording decision, backed by
  **S3**. The earlier draft of this sentence added a clause ruling out "a
  central approval queue" / "admin console" — the reviewer asked to drop
  that clause, so the sentence now states the policy-as-code model
  directly without arguing against an alternative that isn't shown on the
  page.
- "Once deployed, calls are checked against the new version." — follows
  directly from the config-as-code model (**S3**/**S4**); not a separate
  capability claim, and timing depends on the operator's deploy.
- Grant file figure, captioned "Example grant file (illustrative, schema
  simplified)":
  - `repos`, `branches.protected`, `branches.push_prefix`,
    `actions: [fetch, push, open_pr]`, `max_push_mb` under `github` —
    **S4** (repo allowlist, protected branches, branch prefix, size
    limit) + **S8** (GitHub fetch/push/open PR is a shipped action set).
    The `# org policy, shown inline` comment on the protected-branches
    line is a label for the reader, not a claim.
  - `npm.allow: ["@acme/*"]` / `npm.deny: ["@acme/legacy-auth"]` — **S4**
    (package allow/deny lists) + **S8** (npm is a shipped tool).
  - `web_fetch.hosts` + `web_fetch.max_response_mb` — **S4** (web host
    allowlist + size limit).
  - All values (`acme/web`, `acme/legacy-auth`, `docs.acme.internal`,
    `wiki.acme.internal`, `20`, `5`) are illustrative placeholders, not
    real config.

### 5. Every call on the record
- "Append-only audit line for every call: time, agent, tool, redacted
  arguments, decision." — **S7**, near-verbatim.
- Sample log lines — realistic examples of the log's shape, not captured
  output: agent names, timestamps, repo/issue/package names are invented
  placeholders. What's being claimed is the *shape* of each line:
  - `github.push` lines never carry a token argument — consistent with
    **S1** (the audit log records what the agent asked for; the
    credential Passdesk used never appears because the agent never held
    it).
  - The `github.push ... decision=DENY reason="secret detected in diff"`
    line — **S5** (outbound secret scanning blocking a push).
  - The `github.push branch: "main" ... decision=DENY reason="protected
    branch"` line — **S4** (protected branches), now with `repo`
    included in its args like the other lines.
  - `jira.comment ... body: [REDACTED]` — **S5** (redaction) + **S7**.
    `[REDACTED]` is the only redacted argument on the page and is wrapped
    in a `<span class="redacted">` so it reads as a deliberately masked
    value rather than plain text.
  - `npm.fetch` now requests `@acme/ui-kit@2.4.1`, a scoped package
    consistent with the grant file's `npm.allow: ["@acme/*"]` — **S8**
    (npm is a shipped tool) and keeps the example internally consistent
    with section 4's policy.

### 6. Works with your stack
- Integration list "GitHub, npm, PyPI, Web fetch, Jira, Gemini" — **S8**,
  verbatim list.
- "Coming soon" block (MCP adapter for Claude Code/Codex/Cursor,
  hash-chained logs + SIEM sinks, short-lived per-repo GitHub App tokens,
  human approval, signed policy bundles + admin API) — **R1**–**R5**, all
  five roadmap items grouped into this one block, per the brief's rule
  that roadmap items live in a single block in section 5 or 6.

### 7. Closing CTA
- Headline restated — same backing as section 1.
- "Your agents keep doing the work. Passdesk holds the keys and keeps the
  record." — restates **S1**/**S2** ("Passdesk holds the keys") and
  **S7** ("keeps the record"); replaces an earlier draft line that made a
  softer, unbacked "nothing else changes" claim.
- Quickstart panel: "The quickstart docs are coming with launch." — no
  shipped backing needed; this is the placeholder wording the brief
  explicitly asked for (no fake commands or package names implying
  something already published).
- "Book a demo" CTA — *Judgment call*, unchanged from the first draft:
  the brief specifies the anchor (`href="#demo"` / `id="demo"`) but not a
  real booking backend. The actual `id="demo"` button is wired to a
  `mailto:` link rather than an invented scheduling URL. Swap this for a
  real booking link (Calendly, etc.) before launch.

### Footer
- "© 2026 Passdesk" — explicitly pre-approved wording in the brief, no
  separate legal entity implied.

## Things deliberately left out
- No "zero trust," "military-grade," padlock/shield imagery, robot
  imagery, customer logos, quotes, or invented numbers/stats anywhere on
  the page. The header wordmark icon is a key (matching the hero's key),
  not a padlock.
- "Tools," never "skills," throughout.
- GitHub, npm, PyPI, Jira and Gemini appear only as plain text, never as
  styled brand logos, and never phrased as endorsements.
- No fake CLI transcript: the denial example is phrased as a tool
  call/response pair (`→`/`←`), not a `$ passdesk ...` shell command,
  since no such CLI is a shipped product surface.
