#!/usr/bin/env node
// Vendors skill content from jfrog/jfrog-skills into this plugin.
// Run when bumping the pin in sync-skills-vendor.json:  node scripts/sync-skills.mjs
import { promises as fs, createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

async function readJson(p) { return JSON.parse(await fs.readFile(p, "utf8")); }
async function fileExists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function downloadTarball(repo, ref, destPath) {
  const url = `https://codeload.github.com/${repo}/tar.gz/${encodeURIComponent(ref)}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Could not download ${repo}@${ref} (HTTP ${res.status})`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
  console.log(`  fetched ${url}`);
}

async function extractTarball(tarballPath, intoDir) {
  await fs.mkdir(intoDir, { recursive: true });
  const result = spawnSync("tar", ["-xzf", tarballPath, "-C", intoDir], { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`tar exited with status ${result.status}`);
  // readdir order is filesystem-dependent; select the single top-level dir deterministically.
  const entries = await fs.readdir(intoDir, { withFileTypes: true });
  const [topLevel] = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  if (!topLevel) throw new Error("no top-level directory found in extracted tarball");
  return path.join(intoDir, topLevel);
}

async function copyPath(fromDir, toDir, rel) {
  const from = path.join(fromDir, rel);
  const to = path.join(toDir, rel);
  if (!(await fileExists(from))) throw new Error(`path missing in upstream tarball: ${rel}`);
  await fs.rm(to, { recursive: true, force: true });
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.cp(from, to, { recursive: true });
  console.log(`  ${rel} -> ${path.relative(process.cwd(), to)}`);
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, "..");
  const vendorPath = path.join(repoRoot, "sync-skills-vendor.json");
  if (!(await fileExists(vendorPath))) throw new Error(`missing ${vendorPath}`);
  const { repo, pin, paths } = await readJson(vendorPath);
  if (!repo || !pin || !Array.isArray(paths) || paths.length === 0)
    throw new Error(`${vendorPath} must define repo, pin and a non-empty paths[]`);
  console.log(`--- ${repo} (ref: ${pin}) ---`);
  const workDir = await fs.mkdtemp(path.join(tmpdir(), "sync-skills-"));
  try {
    const slug = `${repo.replace("/", "-")}-${pin.replace(/[^A-Za-z0-9._-]/g, "_")}`;
    const tarball = path.join(workDir, `${slug}.tar.gz`);
    await downloadTarball(repo, pin, tarball);
    const extracted = await extractTarball(tarball, path.join(workDir, slug));
    for (const rel of paths) await copyPath(extracted, repoRoot, rel);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
  console.log("done.");
}
await main();
