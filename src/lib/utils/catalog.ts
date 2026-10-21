import * as d3 from 'd3';
import { set, isFinite } from 'lodash-es';
import { ckmeans } from 'simple-statistics';

import { db } from '$lib/state/db.svelte';
import type { CartoKitSource } from '$lib/types';
import type {
  AttributeEntry,
  BooleanAttributeEntry,
  Catalog,
  NumericAttributeEntry
} from '$lib/types/catalog';
import { type DuckDBTable } from '$lib/types/db';
import { quoteIdentifier } from '$lib/utils/db';
import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';
import { getGeoParquetGeometryType } from '$lib/utils/geoparquet';
import { selectTileStats } from '$lib/utils/pmtiles';

/** Matches the DuckDB column types cataloged as numeric attributes. */
const NUMERIC_COLUMN_TYPE =
  /^(U?(TINYINT|SMALLINT|INTEGER|BIGINT|HUGEINT)|FLOAT|DOUBLE|DECIMAL\(\d+,\d+\))$/;

/**
 * Derive Jenks breaks for a domain using ckmeans clustering.
 *
 * @param domain The values of a numeric attribute.
 * @param k The number of classes.
 * @returns The k - 1 breaks between classes.
 */
function deriveJenksBreaks(domain: number[], k: number): number[] {
  const breaks = ckmeans(domain, k).map(
    (cluster) => cluster[cluster.length - 1]
  );

  // Remove the last break—this corresponds to the max.
  breaks.pop();

  return breaks;
}

/**
 * Derive the catalog entry for a numeric attribute from its domain.
 *
 * @param domain The finite values of the attribute. Must be non-empty.
 * @returns The {@link NumericAttributeEntry} for the attribute.
 */
function deriveNumericAttributeEntry(domain: number[]): NumericAttributeEntry {
  const [min, max] = d3.extent(domain) as [number, number];
  const jenks = {} as NumericAttributeEntry['jenks'];

  d3.range(3, 10).forEach((k) => {
    // If we have too few features for the number of classes, do not add an
    // entry to the catalog.
    if (domain.length < k) {
      return;
    }

    jenks[k as keyof NumericAttributeEntry['jenks']] = {
      breaks: deriveJenksBreaks(domain, k)
    };
  });

  return {
    type: 'number',
    min,
    max,
    unique: new Set(domain).size,
    quantiles: { domain },
    jenks
  };
}

/**
 * Build a catalog of pre-computed statistics for a {@link CartoKitLayer}.
 *
 * @param layerId The id of the {@link CartoKitLayer} to add to the catalog.
 * @param source The {@link CartoKitSource} of the layer.
 * @param table The layer's {@link DuckDBTable}. Required for GeoParquet sources.
 * @returns The built {@link Catalog}.
 */
export async function buildCatalog(
  layerId: string,
  source: CartoKitSource,
  table?: DuckDBTable
): Promise<Catalog> {
  const catalog: Catalog = {};

  switch (source.type) {
    case 'geojson': {
      const features = source.data.features;
      const attributes: Record<string, AttributeEntry> = {};

      Object.entries(features[0].properties || {}).forEach(
        ([attribute, value]) => {
          if (isFinite(value)) {
            attributes[attribute] = deriveNumericAttributeEntry(
              features
                .map((feature) => feature.properties?.[attribute])
                .filter(Number.isFinite)
            );
          } else if (typeof value === 'string') {
            const values = features
              .map((feature) => feature.properties?.[attribute])
              .filter((v) => typeof v === 'string');
            const distinct = Array.from(new Set(values));

            attributes[attribute] = {
              type: 'string',
              values: distinct,
              unique: distinct.length
            };
          } else if (typeof value === 'boolean') {
            const values = features
              .map((feature) => feature.properties?.[attribute])
              .filter((v) => typeof v === 'boolean');
            const distinct = Array.from(new Set(values));

            attributes[attribute] = {
              type: 'boolean',
              values: distinct,
              unique: distinct.length as BooleanAttributeEntry['unique']
            };
          }
        }
      );

      catalog[layerId] = {
        type: 'geojson',
        geometryType: getFeatureCollectionGeometryType(source.data),
        count: features.length,
        attributes
      };
      break;
    }
    case 'geoparquet': {
      if (!table) {
        throw new Error('GeoParquet catalogs require the layer table.');
      }

      const { conn } = db.value!;
      const { columns, geometryColumn } = table;
      const tableName = quoteIdentifier(layerId);

      const numericColumns = columns
        .filter(({ column_type }) => NUMERIC_COLUMN_TYPE.test(column_type))
        .map(({ column_name }) => quoteIdentifier(column_name));
      const categoricalColumns = columns
        .filter(
          ({ column_type }) =>
            column_type === 'VARCHAR' || column_type === 'BOOLEAN'
        )
        .map(({ column_name }) => quoteIdentifier(column_name));

      // Query the feature count and the distinct values of all categorical
      // columns in a single pass.
      const summary = (
        await conn.query(
          `SELECT ${[
            'count(*) AS count',
            ...categoricalColumns.map(
              (column) =>
                `list(DISTINCT ${column}) FILTER (WHERE ${column} IS NOT NULL) AS ${column}`
            )
          ].join(', ')} FROM ${tableName};`
        )
      ).toArray()[0];

      // Query the domains of all numeric columns in a single pass.
      const domains =
        numericColumns.length > 0
          ? await conn.query(
              `SELECT ${numericColumns
                .map((column) => `${column}::DOUBLE AS ${column}`)
                .join(', ')} FROM ${tableName};`
            )
          : null;

      const attributes: Record<string, AttributeEntry> = {};

      for (const { column_name, column_type } of columns) {
        if (NUMERIC_COLUMN_TYPE.test(column_type)) {
          const domain = Array.from(
            domains?.getChild(column_name) ?? []
          ).filter(Number.isFinite) as number[];

          if (domain.length > 0) {
            attributes[column_name] = deriveNumericAttributeEntry(domain);
          }
        } else if (column_type === 'VARCHAR') {
          const values = Array.from<string>(summary[column_name] ?? []);

          attributes[column_name] = {
            type: 'string',
            values,
            unique: values.length
          };
        } else if (column_type === 'BOOLEAN') {
          const values = Array.from<boolean>(summary[column_name] ?? []);

          if (values.length > 0) {
            attributes[column_name] = {
              type: 'boolean',
              values,
              unique: values.length as BooleanAttributeEntry['unique']
            };
          }
        }
      }

      catalog[layerId] = {
        type: 'geoparquet',
        geometryType: await getGeoParquetGeometryType(
          conn,
          source.location.type === 'api'
            ? source.location.url
            : source.location.file.name,
          layerId
        ),
        count: summary.count as number,
        attributes,
        columns,
        geometryColumn
      };
      break;
    }
    case 'vector': {
      const { count, geometry, attributes } = selectTileStats(source);

      catalog[layerId] = {
        type: 'pmtiles',
        geometryType: geometry,
        count,
        attributes: {}
      };

      attributes.forEach((attribute) => {
        switch (attribute.type) {
          case 'number': {
            set(
              catalog,
              `${layerId}.attributes.${attribute.attribute}.type`,
              'number'
            );
            set(
              catalog,
              `${layerId}.attributes.${attribute.attribute}.min`,
              attribute.min
            );
            set(
              catalog,
              `${layerId}.attributes.${attribute.attribute}.max`,
              attribute.max
            );
            set(
              catalog,
              `${layerId}.attributes.${attribute.attribute}.unique`,
              attribute.count
            );
            set(
              catalog,
              `${layerId}.attributes.${attribute.attribute}.values`,
              attribute.values
            );
            break;
          }
          case 'string':
          case 'boolean': {
            set(
              catalog,
              `${layerId}.attributes.${attribute.attribute}.type`,
              attribute.type
            );
            set(
              catalog,
              `${layerId}.attributes.${attribute.attribute}.values`,
              attribute.values
            );
            set(
              catalog,
              `${layerId}.attributes.${attribute.attribute}.unique`,
              attribute.count
            );
            break;
          }
        }
      });
      break;
    }
  }

  return catalog;
}
