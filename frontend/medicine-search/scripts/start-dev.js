/**
 * Picks a free PORT (no CRA "another port?" prompt), then runs react-scripts start.
 * Prints the URL up front and again when webpack reports "Compiled".
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const portfinder = require('portfinder');

const projectRoot = path.join(__dirname, '..');

function readPreferredPort() {
  const envPath = path.join(projectRoot, '.env');
  let port = 3000;
  if (fs.existsSync(envPath)) {
    const text = fs.readFileSync(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*PORT\s*=\s*(\d+)\s*$/);
      if (m) {
        port = parseInt(m[1], 10);
        break;
      }
    }
  }
  return port;
}

function mergeNodeOptions() {
  const prev = (process.env.NODE_OPTIONS || '').trim();
  const extra = '--no-deprecation';
  return prev.includes(extra) ? prev : `${prev} ${extra}`.trim();
}

(async () => {
  const preferred = readPreferredPort();
  const port = await portfinder.getPortPromise({ port: preferred });
  process.env.PORT = String(port);
  process.env.NODE_OPTIONS = mergeNodeOptions();

  const reactScripts = require.resolve('react-scripts/bin/react-scripts.js');

  console.log('');
  console.log(`✓ React dev server running on http://localhost:${port}`);
  console.log('');

  const child = spawn(process.execPath, [reactScripts, 'start'], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(port), NODE_OPTIONS: mergeNodeOptions() },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  let compiledPrinted = false;
  let compileBuffer = '';

  function tryPrintCompiled(chunk) {
    if (compiledPrinted) return;
    compileBuffer += chunk;
    if (compileBuffer.length > 8000) {
      compileBuffer = compileBuffer.slice(-4000);
    }
    if (/Compiled successfully|Compiled with warnings/i.test(compileBuffer)) {
      compiledPrinted = true;
      console.log(`\n  → Open: http://localhost:${port}\n`);
    }
  }

  child.stdout.on('data', (data) => {
    const s = data.toString();
    process.stdout.write(data);
    tryPrintCompiled(s);
  });
  child.stderr.on('data', (data) => {
    const s = data.toString();
    process.stderr.write(data);
    tryPrintCompiled(s);
  });
  child.on('exit', (code) => process.exit(code == null ? 1 : code));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
