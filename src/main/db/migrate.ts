import type { DatabaseClient } from "./client";
import { schemaSql } from "./schema";

export function migrate(client: DatabaseClient) {
  client.exec(schemaSql);
}
