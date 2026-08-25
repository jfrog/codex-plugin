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

test('validateInstallDocs passes when README links shared guide and has Verify section', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex-docs-'));
  writeReadme(
    root,
    '# Codex\n\n[shared flow](shared-install-and-verify.md)\n\n## Verify\n\n1. list plugins\n'
  );
  mkdirSync(join(root, 'docs'), { recursive: true });
  writeFileSync(join(root, 'docs', 'install-jfrog-plugin-for-codex.md'), '# web doc');
  assert.deepEqual(validateInstallDocs({ repoRoot: root, harness: 'codex' }), []);
});

test('validateInstallDocs flags missing shared guide link', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex-docs-'));
  writeReadme(root, '# Codex\n\n## Verify\n\n1. ok\n');
  mkdirSync(join(root, 'docs'), { recursive: true });
  writeFileSync(join(root, 'docs', 'install-jfrog-plugin-for-codex.md'), '# web doc');
  const errors = validateInstallDocs({ repoRoot: root, harness: 'codex' });
  assert.ok(errors.some((e) => e.includes('shared-install-and-verify')));
});

test('validateInstallDocs requires codex web doc source file', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex-docs-'));
  writeReadme(root, '# Codex\n\nshared-install-and-verify\n\n## Verify\n');
  const errors = validateInstallDocs({ repoRoot: root, harness: 'codex' });
  assert.ok(errors.some((e) => e.includes('install-jfrog-plugin-for-codex.md')));
});

test('validateInstallDocs rejects contradictory failed-init env-var recovery claims', () => {
  const root = mkdtempSync(join(tmpdir(), 'codex-docs-'));
  writeReadme(
    root,
    '# x\nshared-install-and-verify\n## Verify\nSetting environment variables after a failed init may repair MCP registration.'
  );
  mkdirSync(join(root, 'docs'), { recursive: true });
  writeFileSync(join(root, 'docs', 'install-jfrog-plugin-for-codex.md'), '# web doc');
  const errors = validateInstallDocs({ repoRoot: root, harness: 'codex' });
  assert.ok(errors.some((e) => e.includes('env vars repair failed init')));
});
