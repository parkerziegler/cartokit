import { json, error } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

import { connectToMongoDB } from '$lib/db';

interface DiffDoc {
  userId: string;
  diff: unknown;
  llmAvailable: boolean;
  timestamp: string;
}

/**
 * Persist user-triggered diffs to MongoDB for later analysis.
 *
 * @param userId — The ID of the user who made the request.
 * @param diff — The diff object to save.
 * @returns – The document that was saved to MongoDB.
 */
async function saveDiff(userId: string, diff: unknown, llmAvailable: boolean) {
  const db = connectToMongoDB();
  const collection = db.collection('diffs');

  const doc: DiffDoc = {
    userId,
    diff,
    llmAvailable,
    timestamp: new Date().toISOString()
  };

  try {
    await collection.insertOne(doc);

    return doc;
  } catch (error) {
    throw new Error(`Failed to save diffs: ${error}`);
  }
}

/**
 * The main function that handles the POST request to the /diff endpoint. This
 * function receives a diff from a user and saves it to MongoDB for later
 * analysis.
 */
export const POST = (async ({ request }) => {
  const { userId, diff, llmAvailable } = await request.json();

  try {
    const result = await saveDiff(userId, diff, llmAvailable);

    return json(result);
  } catch (err) {
    console.error(err);

    return error(500, {
      message: 'Internal server error'
    });
  }
}) satisfies RequestHandler;
