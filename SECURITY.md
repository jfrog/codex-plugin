# Security

## Reporting a vulnerability

Please report security issues responsibly so we can address them before public disclosure.

- **Email:** [security@jfrog.com](mailto:security@jfrog.com) or follow the process described on [JFrog's security page](https://jfrog.com/trust/report-vulnerability/).

Include steps to reproduce, affected versions or commits, and impact if known.

## Scope

This repository ships an OpenAI Codex plugin (skills and an MCP server manifest).

Do not commit secrets, API keys, or credentials. Skill runtime data under `**/local-cache/` must not be checked into git.
