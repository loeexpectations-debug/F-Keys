import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "fkeys-toolbar-"));
const chrome = process.env.CHROME_BIN || "google-chrome";
const build = spawnSync("python3", [path.join(dir, "../build.py"), temp], { encoding: "utf8" });
assert.equal(build.status, 0, build.stderr);

function runPage(pagePath, script) {
  const content = fs.readFileSync(pagePath, "utf8");
  const instrumented = path.join(temp, "check.html");
  fs.writeFileSync(instrumented, content + "<script>" + script + "</script>");
  const result = spawnSync(chrome, [
    "--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    "--user-data-dir=" + path.join(temp, "profile"), "--force-dark-mode",
    "--window-size=412,850", "--virtual-time-budget=5000", "--dump-dom",
    pathToFileURL(instrumented).href
  ], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /<body[^>]+data-test-result="passed"/, result.stdout.slice(-1600));
}

// The generated setup screen must become a working non-editable receiver.
try {
  runPage(path.join(temp, "F-Keys-Mobile.html"), `
    document.querySelector('#demo').click();
    if (document.querySelector('input, textarea, [contenteditable]')) throw Error('Editable field in demo');
    const host = document.getElementById('f-keys-overlay-5cc9');
    const root = host.shadowRoot;
    const received = [];
    document.addEventListener('keydown', event => received.push([event.key, event.keyCode, event.target]));
    const controls = [...root.querySelectorAll('.keys button')];
    const expected = Array.from({length:12}, (_,i) => 'F' + (i+1)).concat('Enter');
    if (controls.length !== 13) throw Error('Missing toolbar keys');
    for (const btn of controls) btn.click();
    if (!expected.every((key,i) => received[i][0] === key && received[i][1] === (i===12?13:112+i) && received[i][2] === document.body)) throw Error('Wrong keys or focus');
    if (document.querySelector('#result').textContent !== 'Page received Enter.') throw Error('Demo did not receive Enter');
    root.querySelectorAll('header button')[1].click();
    if (getComputedStyle(root.querySelector('section')).display !== 'none') throw Error('Open toolbar still visible');
    root.querySelector('.launcher').click();
    if (getComputedStyle(root.querySelector('section')).display === 'none') throw Error('Launcher did not reopen toolbar');
    document.body.dataset.testResult = 'passed';
  `);

  const address = fs.readFileSync(path.join(temp, "F-Keys-Bookmark.txt"), "utf8").trim();
  const imported = fs.readFileSync(path.join(temp, "F-Keys-Import.html"), "utf8");
  const bookmark = imported.match(/<A HREF="([^"]+)">F Keys Pad<\/A>/);
  assert.ok(bookmark);
  const blank = path.join(temp, "noneditable.html");
  fs.writeFileSync(blank, '<!doctype html><body><p>Plain page</p><a id="bookmark" href="' + bookmark[1] + '">Open</a>');
  runPage(blank, `
    const bookmark = document.querySelector('#bookmark');
    if (bookmark.getAttribute('href') !== ${JSON.stringify(address)}) throw Error('Bookmark import differs from mobile URL');
    bookmark.click();
    setTimeout(() => {
      document.addEventListener('keydown', event => {
        if (event.key === 'F8' && event.target === document.body) document.body.dataset.testResult = 'passed';
      });
      document.getElementById('f-keys-overlay-5cc9').shadowRoot.querySelectorAll('.keys button')[7].click();
    }, 500);
  `);
  console.log("Passed. All 13 keys reached the page body, minimize/reopen worked, and the imported bookmark ran.");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
