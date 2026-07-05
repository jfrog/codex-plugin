import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  extractFrontmatter,
  parseField,
  hasNonEmptyDescription,
  validateSkillDir,
  validateManifest,
  validateMarketplace,
} from './validate.mjs';

function writeSkill(root, dir, body) {
  mkdirSync(join(root, dir), { recursive: true });
  writeFileSync(join(root, dir, 'SKILL.md'), body);
}

test('extractFrontmatter returns the block between --- fences', () => {
  assert.equal(extractFrontmatter('---\nname: x\n---\nbody'), 'name: x');
  assert.equal(extractFrontmatter('no frontmatter'), null);
});

test('parseField reads an inline scalar', () => {
  assert.equal(parseField('name: jfrog', 'name'), 'jfrog');
  assert.equal(parseField('other: y', 'name'), null);
});

test('hasNonEmptyDescription accepts inline and block scalars, rejects missing/empty', () => {
  assert.equal(hasNonEmptyDescription('description: hello'), true);
  assert.equal(hasNonEmptyDescription('description: >-\n  wrapped text'), true);
  assert.equal(hasNonEmptyDescription('name: x'), false);
  assert.equal(hasNonEmptyDescription('description:\n'), false);
});

test('validateSkillDir passes a well-formed skill', () => {
  const root = mkdtempSync(join(tmpdir(), 'skills-'));
  writeSkill(root, 'jfrog', '---\nname: jfrog\ndescription: does things\n---\nbody');
  assert.deepEqual(validateSkillDir(root, 'jfrog'), []);
});

test('validateSkillDir flags a name/dir mismatch and missing description', () => {
  const root = mkdtempSync(join(tmpdir(), 'skills-'));
  writeSkill(root, 'jfrog', '---\nname: wrong\n---\nbody');
  const errors = validateSkillDir(root, 'jfrog');
  assert.ok(errors.some((e) => e.includes('name')));
  assert.ok(errors.some((e) => e.includes('description')));
});

test('validateManifest requires fields, the skills pointer, and forbids mcpServers (Phase 1)', () => {
  assert.deepEqual(
    validateManifest({ name: 'jfrog', version: '0.1.0', description: 'd', skills: './skills/' }),
    []
  );
  assert.ok(validateManifest({ name: 'jfrog' }).some((e) => e.includes('version')));
  assert.ok(
    validateManifest({ name: 'jfrog', version: '0.1.0', description: 'd', skills: './skills/', mcpServers: './.mcp.json' })
      .some((e) => e.includes('mcpServers'))
  );
});

test('validateMarketplace requires a local source with a ./ path', () => {
  assert.deepEqual(
    validateMarketplace({ name: 'm', plugins: [{ name: 'jfrog', source: { source: 'local', path: './' } }] }),
    []
  );
  assert.ok(
    validateMarketplace({ name: 'm', plugins: [{ name: 'jfrog', source: { source: 'remote', path: 'x' } }] })
      .some((e) => e.includes('local'))
  );
});
