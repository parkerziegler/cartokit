import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import type { Page } from '@playwright/test';

/**
 * A type guard to check if an error is an instance of NodeJS.ErrnoException.
 *
 * @param error – The error to check.
 * @returns – A Boolean indicating whether the error is an instance of
 * NodeJS.ErrnoException.
 */
function isError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error;
}

/**
 * Appends an entry to a JSON array stored in a file. If the file does not
 * exist, it creates a new file with the entry as the initial item.
 *
 * @param path – The path to the file on disk.
 * @param entry – The entry to append to the JSON array.
 */
export async function appendToJsonArray<T>(
  path: string,
  entry: T
): Promise<void> {
  try {
    let data;

    try {
      data = await fs.readFile(path, 'utf8');
    } catch (error: unknown) {
      if (isError(error) && error.code === 'ENOENT') {
        await fs.mkdir(path.slice(0, path.lastIndexOf('/')), {
          recursive: true
        });

        await fs.writeFile(path, JSON.stringify([entry], null, 2));
        console.log('File created with initial item');
        return;
      }

      throw error;
    }

    // Parse the existing JSON data.
    const jsonArray = JSON.parse(data);

    // Add the new item to the array.
    jsonArray.push(entry);

    // Write the modified array back to the file.
    await fs.writeFile(path, JSON.stringify(jsonArray, null, 2));
    console.log('Item appended successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Reads performance metrics from the console and appends them as a structured
 * object to a JSON file.
 *
 * @param page – The Playwright page object.
 * @param playwrightWorkflowId – The Playwright workflow under test.
 */
export function registerConsoleListener(
  page: Page,
  playwrightWorkflowId: string
): void {
  page.on('console', async (msg) => {
    console.log('Console message: ', msg.text());
    const type = (await msg.args()[0]?.jsonValue()) ?? '';

    switch (type) {
      case 'recon': {
        const duration = await msg.args()[1].jsonValue();
        const programId = await msg.args()[2].jsonValue();
        await appendToJsonArray(
          path.resolve(__dirname, '../../tests/results/recon.json'),
          {
            duration,
            playwrightWorkflowId,
            programId
          }
        );
        break;
      }
      case 'recon-ttq': {
        const duration = await msg.args()[1].jsonValue();
        const programId = await msg.args()[2].jsonValue();
        await appendToJsonArray(
          path.resolve(__dirname, '../../tests/results/recon-ttq.json'),
          {
            duration,
            playwrightWorkflowId,
            programId
          }
        );
        break;
      }
      default:
        break;
    }
  });
}
