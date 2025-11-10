const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class AgentDB {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath);
    this.initSchema();
  }

  initSchema() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS agent_config (
          jobId TEXT PRIMARY KEY,
          state TEXT NOT NULL DEFAULT 'planning',
          planMarkdown TEXT,
          costUSD REAL DEFAULT 0.0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    });
  }

  createJob(jobId, planMarkdown = '') {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO agent_config (jobId, planMarkdown) VALUES (?, ?)',
        [jobId, planMarkdown],
        function(err) {
          if (err) reject(err);
          else resolve(jobId);
        }
      );
    });
  }

  updateJob(jobId, updates) {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE agent_config SET ${fields} WHERE jobId = ?`,
        [...values, jobId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  getJob(jobId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM agent_config WHERE jobId = ?',
        [jobId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
}

module.exports = { AgentDB };