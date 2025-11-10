const { AgentDB } = require('./db-schema');
const path = require('path');

class AgentCore {
  constructor(options = {}) {
    const dbPath = options.dbPath || path.join(process.cwd(), 'agent.db');
    this.db = new AgentDB(dbPath);
    this.sandboxEndpoint = process.env.AGENT_SANDBOX_ENDPOINT || 'unix:///var/run/bigdaddyg-sandbox.sock';
  }

  async createJob(planMarkdown = '') {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.db.createJob(jobId, planMarkdown);
    return jobId;
  }

  async updateJobState(jobId, state, updates = {}) {
    return this.db.updateJob(jobId, { state, ...updates });
  }

  async getJob(jobId) {
    return this.db.getJob(jobId);
  }

  getSandboxEndpoint() {
    return this.sandboxEndpoint;
  }

  isSandboxAvailable() {
    // For now, just check if endpoint is configured
    return this.sandboxEndpoint !== null;
  }
}

module.exports = { AgentCore };