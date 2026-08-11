import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);

const expectedArtifacts = [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/index.d.cts',
  'dist/sprite.js',
  'dist/sprite.cjs',
  'dist/sprite.d.ts',
  'dist/sprite.d.cts',
];

test('dist artifacts exist', () => {
  for (const artifact of expectedArtifacts) {
    assert.equal(existsSync(artifact), true, `${artifact} should exist`);
  }
});

test('public ESM API exports createIconly', async () => {
  const mod = await import('../dist/index.js');

  assert.equal(typeof mod.createIconly, 'function');
});

test('public CJS API can be required', () => {
  const mod = require('../dist/index.cjs');

  assert.equal(typeof mod.createIconly, 'function');
});

test('public sprite ESM API exports buildSpriteString and createSprite', async () => {
  const mod = await import('../dist/sprite.js');

  assert.equal(typeof mod.buildSpriteString, 'function');
  assert.equal(typeof mod.createSprite, 'function');
});

test('public sprite CJS API can be required', () => {
  const mod = require('../dist/sprite.cjs');

  assert.equal(typeof mod.buildSpriteString, 'function');
  assert.equal(typeof mod.createSprite, 'function');
});
