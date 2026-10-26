import * as d3 from 'd3';

import type {
  CartoKitGeoJSONSource,
  CartoKitGeoParquetSource,
  CartoKitSource,
  QuantitativeStepCount
} from '$lib/types';
import {
  type Catalog,
  type AttributeEntry,
  type CategoricalAttributeEntry,
  type QuantitativeAttributeEntry
} from '$lib/types/catalog';
import { type DuckDBTable } from '$lib/types/db';
import { quoteIdentifier } from '$lib/utils/db';
import { getFeatureCollectionGeometryType } from '$lib/utils/geojson';
import { getGeoParquetGeometryType } from '$lib/utils/geoparquet';
import { selectTileStats } from '$lib/utils/pmtiles';
import {
  deriveEqualIntervals,
  deriveJenksBreaks,
  deriveQuantiles
} from '$lib/utils/scales';
import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

/**
 * Get the geometry type of data sources stored in DuckDB.
 *
 * @param conn active {@link AsyncDuckDBConnection} to the database.
 * @param source A {@link CartoKitGeoJSONSource} or a {@link CartoKitGeoParquetSource}.
 * @param layerId The layer id.
 * @returns The {@link Geometry['type']} of the source.
 */
async function deriveGeometryType(
  conn: AsyncDuckDBConnection,
  source: CartoKitGeoJSONSource | CartoKitGeoParquetSource,
  layerId: string
) {
  switch (source.type) {
    case 'geojson':
      return getFeatureCollectionGeometryType(source.sourceData);
    case 'geoparquet':
      return await getGeoParquetGeometryType(
        conn,
        source.location.type === 'api'
          ? source.location.url
          : source.location.file.name,
        layerId
      );
  }
}

const QUANTITATIVE_COLUMN_TYPE =
  /^(U?(TINYINT|SMALLINT|INTEGER|BIGINT|HUGEINT)|FLOAT|DOUBLE|DECIMAL\(\d+,\d+\))$/;
const CATEGORICAL_COLUMN_TYPE = /^(VARCHAR|BOOLEAN)$/;

/**
 * Derive the catalog entry for a quantitative attribute.
 *
 * @param domain The finite values of the attribute.
 * @param min The minimum value of the attribute.
 * @param max The maximum value of the attribute.
 * @returns The {@link QuantitativeAttributeEntry} for the attribute.
 */
function deriveQuantitativeAttributeEntry(
  domain: number[],
  min: number,
  max: number
): QuantitativeAttributeEntry {
  const breaks = d3.range(3, 10).reduce(
    (acc, key) => {
      const k = key as QuantitativeStepCount;
      acc.Quantile[k] = { breaks: deriveQuantiles(domain, key) };
      acc['Equal Interval'][k] = {
        breaks: deriveEqualIntervals(min, max, key)
      };
      acc.Jenks[k] = { breaks: deriveJenksBreaks(domain, key) };

      return acc;
    },
    {
      Quantile: {} as QuantitativeAttributeEntry['Quantile'],
      'Equal Interval': {} as QuantitativeAttributeEntry['Equal Interval'],
      Jenks: {} as QuantitativeAttributeEntry['Jenks']
    }
  );

  return {
    type: 'quantitative',
    min,
    max,
    domain,
    unique: new Set(domain).size,
    ...breaks
  };
}

/**
 * Derive the catalog entry for a categorical attribute.
 *
 * @param values The distinct, non-null values of the attribute.
 * @returns The {@link CategoricalAttributeEntry} for the attribute.
 */
function deriveCategoricalAttributeEntry(
  values: string[]
): CategoricalAttributeEntry {
  return {
    type: 'categorical',
    values: values,
    unique: values.length
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
  db?: {
    conn: AsyncDuckDBConnection;
    table: DuckDBTable;
  }
): Promise<Catalog> {
  const catalog: Catalog = {};

  switch (source.type) {
    case 'geojson':
    case 'geoparquet': {
      if (!db?.conn || !db?.table) {
        throw new Error(
          `Catalog construction requires an active database connection and table for layer '${layerId}'.`
        );
      }

      const { columns, geometryColumn } = db.table;
      const tableName = quoteIdentifier(layerId);

      const numericColumns = columns
        .filter(({ column_type }) => QUANTITATIVE_COLUMN_TYPE.test(column_type))
        .map(({ column_name }) => quoteIdentifier(column_name));
      const categoricalColumns = columns
        .filter(({ column_type }) => CATEGORICAL_COLUMN_TYPE.test(column_type))
        .map(({ column_name }) => quoteIdentifier(column_name));

      // Query the feature count, the domains and extents of all numeric
      // columns, and the distinct values of all categorical columns.
      const summary = (
        await db.conn.query(
          `SELECT ${[
            'count(*) AS ck_count',
            ...numericColumns.map(
              (column) =>
                `struct_pack(
                  dom := list(${column}::DOUBLE) FILTER (WHERE isfinite(${column}::DOUBLE)),
                  min := min(${column}::DOUBLE) FILTER (WHERE isfinite(${column}::DOUBLE)),
                  max := max(${column}::DOUBLE) FILTER (WHERE isfinite(${column}::DOUBLE))
                ) AS ${column}`
            ),
            ...categoricalColumns.map(
              (column) =>
                `list(DISTINCT ${column}) FILTER (WHERE ${column} IS NOT NULL AND ${column}::VARCHAR != '') AS ${column}`
            )
          ].join(', ')} FROM ${tableName};`
        )
      ).toArray()[0];

      const attributes: Record<string, AttributeEntry> = {};

      for (const { column_name, column_type } of columns) {
        if (QUANTITATIVE_COLUMN_TYPE.test(column_type)) {
          const { dom, min, max } = summary[column_name];
          const domain = Array.from<number>(dom ?? []);

          if (new Set(domain).size >= 9) {
            attributes[column_name] = deriveQuantitativeAttributeEntry(
              domain,
              min as number,
              max as number
            );
          } else {
            attributes[column_name] = deriveCategoricalAttributeEntry(
              Array.from<string>(dom ?? [])
            );
          }
        } else if (CATEGORICAL_COLUMN_TYPE.test(column_type)) {
          attributes[column_name] = deriveCategoricalAttributeEntry(
            Array.from<string>(summary[column_name] ?? [])
          );
        }
      }

      catalog[layerId] = {
        type: source.type,
        geometryType: await deriveGeometryType(db.conn, source, layerId),
        count: summary.ck_count as number,
        attributes,
        columns,
        geometryColumn
      };
      break;
    }
    case 'pmtiles': {
      const { count, geometry, attributes: attrs } = selectTileStats(source);

      const attributes: Record<string, AttributeEntry> = {};

      for (const attr of attrs) {
        if (attr.type === 'number' && new Set(attr.values).size >= 9) {
          attributes[attr.attribute] = deriveQuantitativeAttributeEntry(
            [],
            attr.min,
            attr.max
          );
        } else {
          attributes[attr.attribute] = deriveCategoricalAttributeEntry([]);
        }
      }

      catalog[layerId] = {
        type: 'pmtiles',
        geometryType: geometry,
        count,
        attributes
      };
      break;
    }
  }

  return catalog;
}
