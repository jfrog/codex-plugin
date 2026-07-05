#!/usr/bin/env node
// Validates the plugin's manifests and skill frontmatter. Zero dependencies.
// CLI: `node scripts/validate.mjs` -> exit 1 on any error, else prints "validation passed".
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function extractFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : null;
}

export function parseField(fm, field) {
  const m = fm.match(new RegExp(`^${field}:\\s*(.*)$`, 'm'));
  return m ? m[1].trim() : null;
}

// Accepts an inline scalar (`description: text`) or a YAML block scalar
// (`description: >-` / `|` followed by indented, non-empty lines).
export function hasNonEmptyDescription(fm) {
  const lines = fm.split(/\r?\n/);
  const i = lines.findIndex((l) => /^description:/.test(l));
  if (i === -1) return false;
  const inline = lines[i].replace(/^description:\s*/, '').replace(/^[|>][-+]?\d*\s*$/, '').trim();
  if (inline) return true;
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j].trim() === '') continue;
    return /^\s+\S/.test(lines[j]);
  }
  return false;
}

export function validateSkillDir(skillsRoot, dirName) {
  const errors = [];
  const skillPath = join(skillsRoot, dirName, 'SKILL.md');
  if (!existsSync(skillPath)) return [`${dirName}: missing SKILL.md`];
  const fm = extractFrontmatter(readFileSync(skillPath, 'utf8'));
  if (!fm) return [`${dirName}: missing YAML frontmatter`];
  const name = parseField(fm, 'name');
  if (name !== dirName) errors.push(`${dirName}: frontmatter name "${name}" != dir "${dirName}"`);
  if (!hasNonEmptyDescription(fm)) errors.push(`${dirName}: missing/empty description`);
  return errors;
}

export function validateManifest(obj) {
  const errors = [];
  for (const f of ['name', 'version', 'description', 'skills']) {
    if (obj == null || obj[f] == null || obj[f] === '') errors.push(`plugin.json: missing "${f}"`);
  }
  if (obj?.skills != null && obj.skills !== './skills/') {
    errors.push('plugin.json: "skills" must be "./skills/"');
  }
  if (obj?.mcpServers != null) errors.push('plugin.json: "mcpServers" must not be set in Phase 1');
  return errors;
}

export function validateMarketplace(obj) {
  const errors = [];
  if (!obj?.name) errors.push('marketplace.json: missing "name"');
  if (!Array.isArray(obj?.plugins) || obj.plugins.length === 0) {
    errors.push('marketplace.json: "plugins" must be a non-empty array');
    return errors;
  }
  for (const p of obj.plugins) {
    if (p?.source?.source !== 'local') errors.push(`marketplace.json: plugin "${p?.name}": source.source must be "local"`);
    if (typeof p?.source?.path !== 'string' || !p.source.path.startsWith('./')) {
      errors.push(`marketplace.json: plugin "${p?.name}": source.path must be a string starting with "./"`);
    }
  }
  return errors;
}

function main() {
  const root = process.cwd();
  const errors = [];

  const skillsRoot = join(root, 'skills');
  const dirs = existsSync(skillsRoot)
    ? readdirSync(skillsRoot).filter((d) => statSync(join(skillsRoot, d)).isDirectory())
    : [];
  if (dirs.length === 0) errors.push('skills/: no skill directories found');
  for (const d of dirs) errors.push(...validateSkillDir(skillsRoot, d));

  errors.push(...validateManifest(JSON.parse(readFileSync(join(root, '.codex-plugin/plugin.json'), 'utf8'))));
  errors.push(...validateMarketplace(JSON.parse(readFileSync(join(root, 'marketplace.json'), 'utf8'))));

  if (errors.length) {
    console.error('VALIDATION FAILED:\n' + errors.map((e) => ' - ' + e).join('\n'));
    process.exit(1);
  }
  console.log('validation passed');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
