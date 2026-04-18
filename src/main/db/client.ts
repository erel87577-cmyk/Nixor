import fs from "node:fs/promises";
import path from "node:path";
import initSqlJs, { type Database, type SqlJsStatic, type Statement } from "sql.js";

import { migrate } from "./migrate";

export interface QueryResultRow {
  [key: string]: unknown;
}

export interface DatabaseClient {
  exec(sql: string): void;
  run(sql: string, params?: unknown[]): void;
  get<T extends QueryResultRow>(sql: string, params?: unknown[]): T | null;
  all<T extends QueryResultRow>(sql: string, params?: unknown[]): T[];
  close(): Promise<void>;
}

export interface CreateDatabaseClientOptions {
  inMemory?: boolean;
  filePath?: string;
}

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: (file: string) => path.resolve("node_modules", "sql.js", "dist", file),
    });
  }

  return sqlJsPromise;
}

function bindParams(statement: Statement, params: unknown[] = []) {
  statement.bind(params.map((value) => (value === undefined ? null : value)));
}

function createClient(database: Database, filePath?: string): DatabaseClient {
  const flush = async () => {
    if (!filePath) {
      return;
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, Buffer.from(database.export()));
  };

  return {
    exec(sql) {
      database.exec(sql);
    },
    run(sql, params = []) {
      const statement = database.prepare(sql);

      try {
        bindParams(statement, params);
        statement.step();
      } finally {
        statement.free();
      }
    },
    get<T extends QueryResultRow>(sql: string, params = []) {
      const statement = database.prepare(sql);

      try {
        bindParams(statement, params);
        if (!statement.step()) {
          return null;
        }

        return statement.getAsObject() as T;
      } finally {
        statement.free();
      }
    },
    all<T extends QueryResultRow>(sql: string, params = []) {
      const statement = database.prepare(sql);

      try {
        bindParams(statement, params);
        const rows: T[] = [];

        while (statement.step()) {
          rows.push(statement.getAsObject() as T);
        }

        return rows;
      } finally {
        statement.free();
      }
    },
    async close() {
      await flush();
      database.close();
    },
  };
}

export async function createDatabaseClient(
  options: CreateDatabaseClientOptions = {},
): Promise<DatabaseClient> {
  const SQL = await getSqlJs();
  let database: Database;

  if (options.inMemory) {
    database = new SQL.Database();
  } else if (options.filePath) {
    const bytes = await fs.readFile(options.filePath).catch(() => null);
    database = bytes ? new SQL.Database(bytes) : new SQL.Database();
  } else {
    database = new SQL.Database();
  }

  const client = createClient(database, options.inMemory ? undefined : options.filePath);
  migrate(client);
  return client;
}
