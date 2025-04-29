import { type Db, MongoClient } from 'mongodb';

import { MONGODB_URI } from '$env/static/private';

/**
 * Establishes a connection to the MongoDB database using the provided URI.
 *
 * @returns – A MongoDB database instance connected to the 'cartokit' database.
 */
export function connectToMongoDB(): Db {
  const mongoClient = new MongoClient(MONGODB_URI!);

  const db = mongoClient.db('cartokit');

  return db;
}
