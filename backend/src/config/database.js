// Use simple database for demo (no external dependencies required)
const simpleDb = require('./simple-db');

// Database service wrapper
class DatabaseService {
  constructor() {
    this.db = simpleDb;
  }

  // Delegate to simple database
  async findUserByEmail(email) {
    return await this.db.findUserByEmail(email);
  }

  async findUserById(id) {
    return await this.db.findUserById(id);
  }

  // Transaction wrapper
  async $transaction(callback) {
    return await this.db.$transaction(callback);
  }

  // Disconnect
  async $disconnect() {
    await this.db.$disconnect();
  }

  // Health check
  async healthCheck() {
    return await this.db.healthCheck();
  }
}

const db = new DatabaseService();

module.exports = db;