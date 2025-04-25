import { type Db, MongoClient } from 'mongodb';

import { MONGODB_URI } from '$env/static/private';

export function connectToMongoDB(): Db {
  const mongoClient = new MongoClient(MONGODB_URI!);

  const db = mongoClient.db('cartokit');

  return db;
}
