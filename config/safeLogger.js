const fs = require('node:fs');
const path = require('node:path');

const logFile = process.env.SMARTBUS_LOG_FILE;
const maxLogBytes = 5 * 1024 * 1024;

function logEvent(level, event) {
  const entry = JSON.stringify({
    '@timestamp': new Date().toISOString(),
    level,
    service: 'smartbus-backend',
    event,
  });

  if (level === 'error') console.error(entry);
  else console.log(entry);

  if (!logFile) return;

  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    const size = fs.existsSync(logFile) ? fs.statSync(logFile).size : 0;
    if (size + Buffer.byteLength(entry) + 1 > maxLogBytes) {
      const rotatedFile = `${logFile}.1`;
      if (fs.existsSync(rotatedFile)) fs.unlinkSync(rotatedFile);
      if (fs.existsSync(logFile)) fs.renameSync(logFile, rotatedFile);
    }
    fs.appendFileSync(logFile, `${entry}\n`, { mode: 0o640 });
  } catch {
    console.error('{"level":"error","service":"smartbus-backend","event":"structured_log_write_failed"}');
  }
}

module.exports = { logEvent };
