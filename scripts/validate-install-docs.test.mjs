// Copyright (c) JFrog Ltd. 2026
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateInstallDocs } from './validate-install-docs.mjs';

function writeReadme(root, body) {
  writeFileSync(join(root, 'README.md'), body);
}

function withWebDoc(root, name = 'install-jfrog-plugin-for-codex.md') {
  mkdirSync(join(root, 'docs'), { recursive: true });
  writeFileSync(join(root, 'docs', name), '# web doc\n');
}

test('validateInstallDocs passes when README has Verify and no other-plugin links', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex-docs-'));
  writeReadme(root, '# Codex\n\n## Verify\n\n1. list plugins\n');
  withWebDoc(root);
  assert.deepEqual(validateInstallDocs({ repoRoot: root, harness: 'codex' }), []);
});

test('validateInstallDocs flags missing Verify section', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex-docs-'));
  writeReadme(root, '# Codex\n\nInstall the plugin.\n');
  withWebDoc(root);
  const errors = validateInstallDocs({ repoRoot: root, harness: 'codex' });
  assert.ok(errors.some((e) => e.includes('## Verify')));
});

test('validateInstallDocs requires codex web doc source file', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex-docs-'));
  writeReadme(root, '# Codex\n\n## Verify\n');
  const errors = validateInstallDocs({ repoRoot: root, harness: 'codex' });
  assert.ok(errors.some((e) => e.includes('install-jfrog-plugin-for-codex.md')));
});

test('validateInstallDocs rejects contradictory failed-init env-var recovery claims', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex-docs-'));
  writeReadme(
    root,
    '# x\n## Verify\nSetting environment variables after a failed init may repair MCP registration.'
  );
  withWebDoc(root);
  const errors = validateInstallDocs({ repoRoot: root, harness: 'codex' });
  assert.ok(errors.some((e) => e.includes('env vars repair failed init')));
});

test('validateInstallDocs rejects the legacy JFROG_URL env var', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex-docs-'));
  writeReadme(root, '# Codex\n## Verify\nSet `JFROG_URL` to your platform.\n');
  withWebDoc(root);
  const errors = validateInstallDocs({ repoRoot: root, harness: 'codex' });
  assert.ok(errors.some((e) => e.includes('JFROG_URL')));
});

test('validateInstallDocs rejects links to other plugin GitHub repos', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex-docs-'));
  writeReadme(
    root,
    '# Codex\n## Verify\nSee https://github.com/jfrog/claude-plugin/blob/main/docs/install-and-verify.md\n'
  );
  withWebDoc(root);
  const errors = validateInstallDocs({ repoRoot: root, harness: 'codex' });
  assert.ok(errors.some((e) => e.includes('claude-plugin')));
});
