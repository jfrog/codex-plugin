// (c) JFrog Ltd. (2026)
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
  validateMcp,
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
  assert.equal(hasNonEmptyDescription('description: >-\n'), false);
  assert.equal(hasNonEmptyDescription('description: |\n'), false);
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

test('validateSkillDir flags an empty block-scalar description', () => {
  const root = mkdtempSync(join(tmpdir(), 'skills-'));
  writeSkill(root, 'jfrog', '---\nname: jfrog\ndescription: >-\n---\nbody');
  const errors = validateSkillDir(root, 'jfrog');
  assert.ok(errors.some((e) => e.includes('description')));
});

test('validateManifest requires fields, the skills pointer, and accepts the mcpServers pointer', () => {
  assert.deepEqual(
    validateManifest({ name: 'jfrog', version: '0.1.0', description: 'd', skills: './skills/' }),
    []
  );
  assert.ok(validateManifest({ name: 'jfrog' }).some((e) => e.includes('version')));
  assert.deepEqual(
    validateManifest({ name: 'jfrog', version: '0.1.0', description: 'd', skills: './skills/', mcpServers: './.mcp.json' }),
    []
  );
  assert.ok(
    validateManifest({ name: 'jfrog', version: '0.1.0', description: 'd', skills: './skills/', mcpServers: './mcp.json' })
      .some((e) => e.includes('mcpServers'))
  );
});

test('validateMcp accepts direct and wrapped server maps, flags servers without url/command', () => {
  assert.deepEqual(validateMcp({ jfrog: { url: 'https://x/mcp' } }), []);
  assert.deepEqual(validateMcp({ mcp_servers: { jfrog: { url: 'https://x/mcp' } } }), []);
  assert.deepEqual(validateMcp({ local: { command: 'node', args: ['s.js'] } }), []);
  assert.ok(validateMcp({}).some((e) => e.includes('no MCP servers')));
  assert.ok(validateMcp({ jfrog: {} }).some((e) => e.includes('url') && e.includes('command')));
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
