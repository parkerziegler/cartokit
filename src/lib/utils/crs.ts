/**
 * Generate DuckDB macros to infer an appropriate per-row CRS for
 * transformations that require them (e.g., ST_Buffer).
 *
 * The generated macros uses a very similar (though simplified) algorithm to
 * PostGIS' geography_bestsrid function:
 * https://github.com/postgis/postgis/blob/58fb58832c49c47cf5834f71eaec7e5dea49631f/postgis/geography_measurement.c#L794
 *
 * 1. If the candidate features is at the poles or covers more than 1 UTM zone
 * of area (6°-wide), use an Azimuthal Equidistant projection centered on the
 * middle of the feature's bounding box.
 * 2. Otherwise, find its UTM zone and use the appropriate EPSG identifier.
 *
 * @returns A string containing the SQL macros required to call iner_crs in a
 * query.
 */
export function inferCRS() {
  const utmZone = `CREATE MACRO estimate_utm_zone(cx, cy) AS CASE
  WHEN cy >= 0 THEN 32601 + floor((cx + 180) / 6)
  ELSE 32701 + floor((cx + 180) / 6)
END;`;

  const crsFromBounds = `CREATE MACRO crs_from_bounds(cx, cy, w, h) AS CASE
  WHEN abs(cy) > 70 OR w >= 6 THEN printf('+proj=aeqd +lat_0=%f +lon_0=%f +datum=WGS84 +units=m +no_defs', cy, cx)
  ELSE 'EPSG:' || estimate_utm_zone(cx, cy)
END;`;

  const crsFromBox = `CREATE MACRO crs_from_box(b) AS crs_from_bounds(
  (ST_XMin(b) + ST_XMax(b)) / 2,
  (ST_YMin(b) + ST_YMax(b)) / 2,
  ST_XMax(b) - ST_XMin(b),
  ST_YMax(b) - ST_YMin(b)
);`;

  const crs = `CREATE MACRO infer_crs(g) AS crs_from_box(ST_Extent(g));`;

  return [utmZone, crsFromBounds, crsFromBox, crs].join('\n\n');
}
