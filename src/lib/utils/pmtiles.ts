import { PMTiles } from 'pmtiles';

import type {
  TileStats,
  VectorTileAttribute,
  VectorTileLayer
} from '$lib/types';

interface Metadata {
  type?: string;
  vector_layers: VectorTileLayer[];
  tilestats: TileStats;
}

export class CartoKitPMTiles {
  private archive: PMTiles;

  constructor(url: string) {
    this.archive = new PMTiles(url);
  }

  async getMetadata() {
    return (await this.archive.getMetadata()) as Metadata;
  }

  async getVectorLayers() {
    const m = await this.getMetadata();
    return m.vector_layers;
  }
}

export function selectVectorQuantitativeAttribute(
  attributes: VectorTileAttribute[]
): string {
  for (const attr of attributes) {
    if (attr.type === 'number') {
      return attr.attribute;
    }
  }

  throw new Error('No quantitative attributes found in dataset.');
}

export function enumerateVectorAttributeCategories(
  attributes: VectorTileAttribute[],
  attribute: string
): unknown[] {
  const categories = new Set<unknown>();
  const attr = attributes.find((attr) => attr.attribute === attribute);

  if (attr) {
    for (const value of attr.values) {
      categories.add(value);
    }
  }

  return Array.from(categories);
}

export function selectVectorCategoricalAttribute(
  attributes: VectorTileAttribute[]
): string {
  for (const attr of attributes) {
    if (attr.type === 'string') {
      return attr.attribute;
    }
  }

  throw new Error('No categorical attributes found in dataset.');
}
