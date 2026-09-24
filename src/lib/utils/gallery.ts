import UrbanAreas from '$lib/assets/gallery/urban-areas.webp?enhanced';
import Earthquakes from '$lib/assets/gallery/earthquakes.webp?enhanced';
import ClimateImpacts from '$lib/assets/gallery/climate-impacts.webp?enhanced';
import PowerPlants from '$lib/assets/gallery/power-plants.webp?enhanced';
import BuildingFootprints from '$lib/assets/gallery/building-footprints.webp?enhanced';
import Election2024 from '$lib/assets/gallery/election-2024.webp?enhanced';
import JapanPop from '$lib/assets/gallery/japan-pop.webp?enhanced';
import Wildfires from '$lib/assets/gallery/wildfires.webp?enhanced';
import type { GalleryItem } from '$lib/types';

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'urban-areas',
    name: 'US Urban Areas',
    attribution: 'US Census Bureau',
    url: 'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/urban-areas.json',
    src: UrbanAreas,
    type: 'Polygon',
    format: 'GeoJSON'
  },
  {
    id: 'earthquakes',
    name: 'Magnitude 2.5+ Earthquakes in the Past 30 Days',
    attribution: 'USGS',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson',
    src: Earthquakes,
    type: 'Point',
    format: 'GeoJSON'
  },
  {
    id: 'climate-impacts',
    name: 'Climate Impact Regions',
    attribution: 'Climate Impact Lab, Carleton et al. 2022',
    url: 'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/wapo-climate-impact-regions.json',
    src: ClimateImpacts,
    type: 'Polygon',
    format: 'GeoJSON'
  },
  {
    id: 'power-plants',
    name: 'US Power Plants',
    attribution: 'US Energy Information Administration',
    url: 'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/wapo-powerplants.json',
    src: PowerPlants,
    type: 'Point',
    format: 'GeoJSON'
  },
  {
    id: 'building-footprints',
    name: 'Global Building Footprints',
    attribution: 'Google, Microsoft, and OpenStreetMap • Compiled by VIDA',
    url: 'https://data.source.coop/vida/google-microsoft-osm-open-buildings/pmtiles/goog_msft_osm.pmtiles',
    src: BuildingFootprints,
    type: 'Polygon',
    format: 'PMTiles'
  },
  {
    id: 'election-2024',
    name: '2024 Presidential Election Precinct-Level Returns',
    attribution: 'The New York Times',
    url: 'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/election-2024.pmtiles',
    src: Election2024,
    type: 'Polygon',
    format: 'PMTiles'
  },
  {
    id: 'japan-pop',
    name: 'Japan Population, 2000-2020 in H3 Grid',
    attribution: 'UN Smart Maps Group',
    url: 'https://data.source.coop/smartmaps/h3ys-worldpop/jpn.pmtiles',
    src: JapanPop,
    type: 'Polygon',
    format: 'PMTiles'
  },
  {
    id: 'wildfires',
    name: '2025 Wildland Fire Perimeters',
    attribution: 'National Interagency Fire Center',
    url: 'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/wildfires-2025.pmtiles',
    src: Wildfires,
    type: 'Polygon',
    format: 'PMTiles'
  }
];
