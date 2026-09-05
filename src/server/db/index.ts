import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "../config/env";
import * as schema from "./schema";

/**
 * Initialize Neon SQL connection using serverless HTTP client.
 * Using the HTTP driver (@neondatabase/serverless with neon-http) provides fast,
 * connectionless queries over standard HTTPS, which is ideal for cloud architectures.
 */
export const sql = neon(env.DATABASE_URL);

/**
 * Initialize Drizzle ORM instance.
 * Pass the Neon client and schema to enable full type-safety for queries.
 */
export const db = drizzle(sql, { schema });
