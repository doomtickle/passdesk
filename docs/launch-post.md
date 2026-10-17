# Four 2026 incidents, and what a gateway can do about them

This is a walk through four security write-ups published in the first four
months of 2026, what they have in common, and what Passdesk does about the
pattern. It's not a claim that Passdesk would have stopped any one of
them outright — three of the four happened inside a GitHub Actions job, a
different environment than the one Passdesk runs in. The pattern is still
worth naming, because it's the same pattern Passdesk's core design answers:
an agent read something it didn't control, and that led to a credential
leaving.

## The four incidents

**claude-code-action, January–June 2026.** RyotaK of GMO Flatt Security
found that the permission check in Anthropic's `claude-code-action` GitHub
Action let any GitHub App's bot account through. "It also unconditionally
allows any GitHub App to pass, regardless of its actual permissions." A
crafted GitHub issue could use that gap to steer the action into
exfiltrating CI secrets and pushing commits. It was privately reported and
fixed in January, published in June; no CVE was assigned.
([flatt.tech](https://flatt.tech/research/posts/poisoning-claude-code-one-github-issue-to-break-the-supply-chain/))

**Clinejection, February 2026.** Adnan Khan showed that an instruction
hidden in a GitHub issue title could prompt-inject Cline's AI issue-triage
workflow. That workflow didn't hold Cline's publish tokens itself; instead
it poisoned a GitHub Actions cache shared with the nightly publish
workflows, which then leaked the `VSCE_PAT`, `OVSX_PAT` and
`NPM_RELEASE_TOKEN` secrets: "The attack chain leverages GitHub Actions
cache poisoning to pivot from the triage workflow to the Publish Nightly
Release and Publish NPM Nightly workflows and steal the VSCE_PAT, OVSX_PAT,
and NPM_RELEASE_TOKEN secrets." The GHSA was filed 1 January 2026 and made
public 9 February 2026 (GHSA-9ppg-jx86-fqw7). On 17 February a third party,
not Khan, used the still-valid npm token to publish an unauthorized
`cline@2.3.0`. It stayed live for about eight hours and installed
`openclaw`, a legitimate, non-malicious package.
([adnanthekhan.com](https://adnanthekhan.com/posts/clinejection/),
[cline.bot](https://cline.bot/blog/post-mortem-unauthorized-cline-cli-npm))

**OpenAI Codex, reported December 2025, public March 2026.** BeyondTrust's
Phantom Labs team found that Codex used an attacker-crafted GitHub branch
name, unsanitized, in a shell command during its container setup. That let
an attacker run commands inside the container and steal the GitHub OAuth
token Codex held there. It was fixed before the write-up was published.
([siliconangle.com](https://siliconangle.com/2026/03/30/openai-codex-vulnerability-enabled-github-token-theft-via-command-injection-report-finds/))
<!-- OWNER: verify attribution and "fixed before publication" against BeyondTrust's Phantom Labs post; not reachable from the factory -->

**Comment and Control, April 2026.** Aonan Guan, with Johns Hopkins
University's Zhengyu Liu and Gavin Zhong, showed that PR titles, issue
bodies and comments could hijack three different agents running in GitHub
Actions — Anthropic's Claude Code Security Review, Google's Gemini CLI
Action and GitHub Copilot Agent — into leaking their own API keys and
tokens back through GitHub itself. "Comment and Control — a play on
Command and Control (C2) — is a class of prompt injection attacks where
GitHub comments (PR titles, issue bodies, issue comments) hijack AI agents
running in GitHub Actions." Made public 15 April 2026.
([oddguan.com](https://oddguan.com/blog/comment-and-control-prompt-injection-credential-theft-claude-code-gemini-cli-github-copilot/))

## The common shape, and where Passdesk fits

In every case, an agent read something it didn't control — an issue, a
title, a comment, a branch name — and that reading used a credential, or
set off a chain that ended with one leaking. In the first, second and
fourth incidents, the agent in question was running as a GitHub Actions
job, with secrets supplied to that job the way CI secrets normally are.
Passdesk doesn't run there. It's a gateway that runs on a developer's own
machine, in its own sandbox, mediating the tool calls of agents working on
that machine — not a replacement for how a CI job manages its own
permissions or its own cache. For those three incidents, the honest answer
is that Passdesk's design doesn't reach into that failure: a broken
permission check in a GitHub Action, a poisoned Actions cache, and prompt
injection against three different CI-hosted agents are all outside what a
local gateway mediates.

The Codex incident is the closer match, with a caveat. There, the
credential that got stolen — a GitHub OAuth token — was one the agent's
own container held, so that a shell-command bug inside that container
could read it out. That's the specific failure mode Passdesk's first
capability is built against: Passdesk never gives the agent, or even its
own process, the token. The sandbox's egress proxy attaches the GitHub
token directly to outbound traffic, so there's nothing sitting in the
agent's environment for a bug elsewhere in that environment to expose. This
is a description of how Passdesk's design differs from an agent holding
its own token, not a claim about what would have happened inside Codex's
own container, which Passdesk doesn't run.

Where Passdesk's design does apply straightforwardly is the piece common
to all four write-ups: an agent on a developer's machine is working from
untrusted text — a web page, a Jira ticket, an error message — on its way
to a push, a pull request, or a package install. Passdesk marks that
incoming text as untrusted and strips terminal escapes from it. Before any
push, pull request, or prompt sent to Gemini goes out, Passdesk scans it
for common key and token formats — GitHub, AWS, Anthropic, OpenAI, Slack,
Google, private keys, password assignments — and blocks the call if one
turns up. That's a safety net, not a full data-loss-prevention tool: it
catches a credential crossing the gateway in that call, not every way one
could leave. Each agent also only gets the tools its own grant lists; nothing
else is reachable. Each repo and branch is bounded by a policy file
(protected branches, a required branch prefix, size limits), and every one
of those calls — allowed or denied — goes on an append-only audit record:
time, agent, tool, redacted arguments, the decision, the reason. None of
that stops an agent from being tricked by a crafted issue or comment into
asking for the wrong thing. It does mean that asking isn't the same as
getting: the request still has to pass the policy, the secret scan, and,
with Pro, a person.

## The approval card

That's where Passdesk Pro Approvals comes in — a paid add-on, built and
tested, currently in private beta. It adds one more step between an
agent's request and the outside world: `git_push` and `github_create_pr`
calls wait for a person to approve or decline them, instead of going
straight through.

The approver sees this as a card in a terminal (`factory approvals`), or
is pointed at one by an optional webhook to Slack, Discord or ntfy — the
webhook only notifies, it doesn't decide. For a push, the card shows the
repo and branch, the commit and file counts, and the diff stat. For a
pull request, it shows the repo, the title, and the base branch. Because
Passdesk's secret scan runs before the hold, every card an approver sees
has already passed it — a push that fails the scan is denied outright and
never reaches a card at all.

If a decision lands quickly enough, the agent gets the outcome in that
same call: approved, the push or pull request goes through; declined, it
gets the approver's reason back. If nothing's decided within a short hold,
the call ends in a denial that names the pending approval and tells the
agent to retry; a later retry picks up whatever was decided in the
meantime, rather than starting over. Either way, the decision and the
approver's name go on the same audit record as everything else the
gateway does. A card nobody acts on simply expires.

This is the direct answer to the pattern above: even when an agent is
steered by something it read — a title, a comment, a branch name — into
asking for a push or a pull request it shouldn't make, that request still
has to clear a person who can see what's actually being pushed before
anything leaves the machine. It's a narrower claim than "this would have
stopped the incident" — three of the four happened in CI, where this hold
doesn't run — but on a developer's own machine, it's the same shape of
problem with one more check in front of it.

Passdesk Pro Approvals is sold separately from the free, Apache-licensed
gateway, priced and dated as a private beta shipping in early 2027; those
details may change before launch.
