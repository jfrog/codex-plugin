#!/usr/bin/env node
// Copyright (c) JFrog Ltd. 2026
// Licensed under the Apache License, Version 2.0
// Validates install/recovery documentation invariants for AX-2162.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = process.cwd();

const REQUIRED_README_MARKERS = [
  'shared-install-and-verify',
  '## Verify',
];

const FORBIDDEN_PATTERNS = [
  {
    re: /setting\s+(?:the\s+)?environment\s+variables?\s+after\s+a\s+failed\s+init\s+may\s+repair/i,
    message: 'README must not claim env vars repair failed init',
  },
  {
    re: /set\s+JFROG_URL.*after.*failed.*init.*fix/i,
    message: 'README must not claim JFROG_URL fixes failed init',
  },
];

export function validateInstallDocs({ repoRoot: root, harness }) {
  const errors = [];
  const readmePath = join(root, 'README.md');
  if (!existsSync(readmePath)) {
    return [`${harness}: missing README.md`];
  }
  const readme = readFileSync(readmePath, 'utf8');
  for (const marker of REQUIRED_README_MARKERS) {
    if (!readme.includes(marker)) {
      errors.push(`${harness}: README.md missing required marker: ${marker}`);
    }
  }
  for (const { re, message } of FORBIDDEN_PATTERNS) {
    if (re.test(readme)) errors.push(`${harness}: ${message}`);
  }

  if (harness === 'codex') {
    const webDoc = join(root, 'docs', 'install-jfrog-plugin-for-codex.md');
    if (!existsSync(webDoc)) errors.push('codex: missing docs/install-jfrog-plugin-for-codex.md');
  }
  if (harness === 'devin') {
    const webDoc = join(root, 'docs', 'install-jfrog-plugin-for-devin.md');
    if (!existsSync(webDoc)) errors.push('devin: missing docs/install-jfrog-plugin-for-devin.md');
  }
  return errors;
}

function main() {
  const harness = process.env.JFROG_PLUGIN_HARNESS ?? inferHarness(repoRoot);
  const errors = validateInstallDocs({ repoRoot, harness });
  if (errors.length) {
    console.error('install-docs validation failed:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log('install-docs validation passed');
}

function inferHarness(root) {
  if (existsSync(join(root, '.codex-plugin'))) return 'codex';
  if (existsSync(join(root, '.devin-plugin'))) return 'devin';
  if (existsSync(join(root, '.claude-plugin'))) return 'claude';
  if (existsSync(join(root, 'plugins', 'jfrog', '.cursor-plugin'))) return 'cursor';
  if (existsSync(join(root, 'plugin', '.claude-plugin'))) return 'vscode';
  if (existsSync(join(root, 'package.json')) && root.endsWith('opencode-jfrog-plugin')) return 'opencode';
  return 'unknown';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
