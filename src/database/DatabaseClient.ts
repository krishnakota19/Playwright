import { Logger } from '../utils/Logger';

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  type: 'postgres' | 'mysql' | 'sqlite';
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database: string;
  path?: string; // For SQLite
}

/**
 * Database Client for executing queries and validations
 * Supports PostgreSQL, MySQL, and SQLite
 */
export class DatabaseClient {
  private connection: any;
  private logger: Logger;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.logger = new Logger('DatabaseClient');
    this.config = config;
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    try {
      switch (this.config.type) {
        case 'postgres':
          await this.connectPostgres();
          break;
        case 'mysql':
          await this.connectMySQL();
          break;
        case 'sqlite':
          await this.connectSQLite();
          break;
        default:
          throw new Error(`Unsupported database type: ${this.config.type}`);
      }
      this.logger.info(`Connected to ${this.config.type} database`);
    } catch (error) {
      this.logger.error(`Failed to connect to database: ${error}`);
      throw error;
    }
  }

  /**
   * Connect to PostgreSQL
   */
  private async connectPostgres(): Promise<void> {
    const { Pool } = require('pg');
    this.connection = new Pool({
      host: this.config.host,
      port: this.config.port || 5432,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
    });

    await this.connection.query('SELECT NOW()');
  }

  /**
   * Connect to MySQL
   */
  private async connectMySQL(): Promise<void> {
    const mysql = require('mysql2/promise');
    this.connection = await mysql.createConnection({
      host: this.config.host,
      port: this.config.port || 3306,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
    });

    await this.connection.ping();
  }

  /**
   * Connect to SQLite
   */
  private async connectSQLite(): Promise<void> {
    const sqlite3 = require('sqlite3').verbose();
    this.connection = new sqlite3.Database(this.config.path || ':memory:', (error: any) => {
      if (error) {
        this.logger.error(`SQLite connection error: ${error}`);
      }
    });
  }

  /**
   * Execute SELECT query
   * @param query - SQL query
   * @param params - Query parameters
   */
  async query(query: string, params?: any[]): Promise<any[]> {
    try {
      this.logger.info(`Executing query: ${query}`);

      let result;
      if (this.config.type === 'postgres' || this.config.type === 'mysql') {
        const queryResult = await this.connection.query(query, params);
        result = this.config.type === 'postgres' ? queryResult.rows : queryResult[0];
      } else {
        // SQLite
        result = await this.sqliteQuery(query, params);
      }

      this.logger.info(`Query returned ${result.length} rows`);
      return result;
    } catch (error) {
      this.logger.error(`Query execution failed: ${error}`);
      throw error;
    }
  }

  /**
   * Execute INSERT/UPDATE/DELETE query
   * @param query - SQL query
   * @param params - Query parameters
   */
  async execute(query: string, params?: any[]): Promise<any> {
    try {
      this.logger.info(`Executing: ${query}`);

      let result;
      if (this.config.type === 'postgres' || this.config.type === 'mysql') {
        result = await this.connection.query(query, params);
      } else {
        // SQLite
        result = await this.sqliteRun(query, params);
      }

      this.logger.info(`Execution successful`);
      return result;
    } catch (error) {
      this.logger.error(`Execution failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get single row
   * @param query - SQL query
   * @param params - Query parameters
   */
  async queryOne(query: string, params?: any[]): Promise<any> {
    const results = await this.query(query, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get single value
   * @param query - SQL query
   * @param params - Query parameters
   */
  async queryValue(query: string, params?: any[]): Promise<any> {
    const result = await this.queryOne(query, params);
    if (!result) return null;
    return Object.values(result)[0];
  }

  /**
   * Verify row exists with condition
   * @param table - Table name
   * @param condition - Where condition
   */
  async rowExists(table: string, condition: Record<string, any>): Promise<boolean> {
    const where = Object.entries(condition)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(' AND ');

    const result = await this.queryOne(`SELECT COUNT(*) as count FROM ${table} WHERE ${where}`);
    return result.count > 0;
  }

  /**
   * Verify row data
   * @param table - Table name
   * @param where - Where condition
   * @param expectedData - Expected data
   */
  async verifyRowData(table: string, where: Record<string, any>, expectedData: Record<string, any>): Promise<boolean> {
    const whereClause = Object.entries(where)
      .map(([key, value]) => `${key} = '${value}'`)
      .join(' AND ');

    const row = await this.queryOne(`SELECT * FROM ${table} WHERE ${whereClause}`);
    if (!row) return false;

    for (const [key, value] of Object.entries(expectedData)) {
      if (row[key] !== value) return false;
    }
    return true;
  }

  /**
   * Count rows in table
   * @param table - Table name
   */
  async countRows(table: string): Promise<number> {
    const result = await this.queryValue(`SELECT COUNT(*) FROM ${table}`);
    return result;
  }

  /**
   * Clear table data
   * @param table - Table name
   */
  async clearTable(table: string): Promise<void> {
    this.logger.info(`Clearing table: ${table}`);
    await this.execute(`DELETE FROM ${table}`);
  }

  /**
   * SQLite query helper
   */
  private sqliteQuery(query: string, params?: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.connection.all(query, params || [], (error: any, rows: any[]) => {
        if (error) reject(error);
        else resolve(rows);
      });
    });
  }

  /**
   * SQLite run helper
   */
  private sqliteRun(query: string, params?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.run(query, params || [], (error: any) => {
        if (error) reject(error);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    try {
      if (this.config.type === 'postgres') {
        await this.connection.end();
      } else if (this.config.type === 'mysql') {
        await this.connection.end();
      } else {
        this.connection.close();
      }
      this.logger.info('Database connection closed');
    } catch (error) {
      this.logger.error(`Failed to close connection: ${error}`);
    }
  }
}
