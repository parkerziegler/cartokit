import { PMTiles } from 'pmtiles';

import type { CartoKitSource, TileStats, VectorLayer } from '$lib/types';

interface Metadata {
  type?: string;
  vector_layers: VectorLayer[];
  tilestats: TileStats;
}

/**
 * A thin wrapper around a {@link PMTiles} archive, exposing helpers for reading
 * the metadata cartokit relies on to interpret a vector tile source.
 */
export class CartoKitPMTiles {
  private archive: PMTiles;

  /**
   * @param url The URL of the PMTiles archive.
   */
  constructor(url: string) {
    this.archive = new PMTiles(url);
  }

  /**
   * Read the archive's metadata, assuming it follows the TileJSON
   * specification.
   *
   * @returns The archive's {@link Metadata}.
   */
  async getMetadata() {
    return (await this.archive.getMetadata()) as Metadata;
  }

  /**
   * Read the {@link VectorLayer}s described in the archive's metadata.
   *
   * @returns The archive's {@link VectorLayer}s.
   */
  async getVectorLayers() {
    const m = await this.getMetadata();
    return m.vector_layers;
  }
}

/**
 * Select the {@link VectorLayer} matching a vector tile source's selected
 * source layer.
 *
 * This function is primarily used to extract attribute names and types for a
 * given vector source layer, assuming the tiles are encoded in MVT and follow
 * the TileJSON specification.
 *
 * @param source The vector tile source.
 * @returns The selected {@link VectorLayer}.
 */
export function selectVectorLayer(
  source: Extract<CartoKitSource, { type: 'vector' }>
): VectorLayer {
  return source.vectorLayers.find(
    (layer) => layer.id === source.sourceLayerId
  )!;
}

/**
 * Select the {@link TileStats} layer matching a vector tile source's selected
 * source layer.
 *
 * This function is primarily used to extract attribute value distributions for
 * a given vector source layer, assuming the tiles provide tilestats metadata.
 *
 * @param source The vector tile source.
 * @returns The matching {@link TileStats} layer.
 */
export function selectTileStats(
  source: Extract<CartoKitSource, { type: 'vector' }>
) {
  return source.tilestats.layers.find(
    (layer) => layer.layer === source.sourceLayerId
  )!;
}
