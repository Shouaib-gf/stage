const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const buildDirectory = path.join(__dirname, '..', 'build');
const bundlePath = path.join(buildDirectory, 'static', 'js', 'main.3f321086.js');

test('bundled React app uses this VM API and suppresses production console logs', () => {
  const bundle = fs.readFileSync(bundlePath, 'utf8');
  const html = fs.readFileSync(path.join(buildDirectory, 'index.html'), 'utf8');

  assert.match(bundle, /https:\/\/192\.168\.43\.129:00443\/api\/session/);
  assert.doesNotMatch(bundle, /https:\/\/smartbus\.emkatech\.tn/);
  assert.doesNotMatch(bundle, /console\.log\("Envoi de la requ\\xeate API avec :"/);
  assert.doesNotMatch(bundle, /console\.log\("Donn\\xe9es de la r\\xe9ponse :"/);
  assert.match(html, /window\.console\.log=function\(\)\{\}/);
});
