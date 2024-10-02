import { Storage } from '@google-cloud/storage';

const storage = new Storage();

export async function POST({ request }) {
  const { kind, duration } = await request.json();
}
