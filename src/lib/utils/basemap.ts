import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';

import MapTilerBasic from '$lib/assets/basemaps/maptiler/basic.png';
import MapTilerDark from '$lib/assets/basemaps/maptiler/dark.png';
import MapTilerDataviz from '$lib/assets/basemaps/maptiler/dataviz.png';
import MapTilerLight from '$lib/assets/basemaps/maptiler/light.png';
import MapTilerOutdoor from '$lib/assets/basemaps/maptiler/outdoor.png';
import MapTilerSatellite from '$lib/assets/basemaps/maptiler/satellite.png';
import MapTilerStreets from '$lib/assets/basemaps/maptiler/streets.png';
import MapTilerWinter from '$lib/assets/basemaps/maptiler/winter.png';
import StadiaMapsAlidadeSmooth from '$lib/assets/basemaps/stadia-maps/alidade-smooth.png';
import StadiaMapsAlidadeSmoothDark from '$lib/assets/basemaps/stadia-maps/alidade-dark-smooth.png';
import StadiaMapsOutdoors from '$lib/assets/basemaps/stadia-maps/outdoors.png';
import StamenToner from '$lib/assets/basemaps/stamen/toner.png';
import StamenTonerLite from '$lib/assets/basemaps/stamen/toner-lite.png';
import StamenTerrain from '$lib/assets/basemaps/stamen/terrain.png';

export interface Basemap {
  title: string;
  tileId: string;
  src: string;
}

const MAPTILER_BASEMAPS: Basemap[] = [
  {
    title: 'Basic',
    tileId: 'basic-v2',
    src: MapTilerBasic
  },
  {
    title: 'Dataviz Dark',
    tileId: 'dataviz-dark',
    src: MapTilerDark
  },
  {
    title: 'Dataviz',
    tileId: 'dataviz',
    src: MapTilerDataviz
  },
  {
    title: 'Dataviz Light',
    tileId: 'dataviz-light',
    src: MapTilerLight
  },
  {
    title: 'Outdoor',
    tileId: 'outdoor-v2',
    src: MapTilerOutdoor
  },
  { title: 'Satellite', tileId: 'satellite', src: MapTilerSatellite },
  {
    title: 'Streets',
    tileId: 'streets-v2',
    src: MapTilerStreets
  },
  {
    title: 'Winter',
    tileId: 'winter-v2',
    src: MapTilerWinter
  }
];

const STADIA_MAPS_BASEMAPS: Basemap[] = [
  {
    title: 'Alidade Smooth',
    tileId: 'alidade_smooth',
    src: StadiaMapsAlidadeSmooth
  },
  {
    title: 'Alidade Smooth Dark',
    tileId: 'alidade_smooth_dark',
    src: StadiaMapsAlidadeSmoothDark
  },
  { title: 'Outdoors', tileId: 'outdoors', src: StadiaMapsOutdoors }
];

const STAMEN_BASEMAPS: Basemap[] = [
  { title: 'Toner', tileId: 'stamen_toner', src: StamenToner },
  { title: 'Toner Light', tileId: 'stamen_toner_lite', src: StamenTonerLite },
  { title: 'Terrain', tileId: 'stamen_terrain', src: StamenTerrain }
];

export const BASEMAPS = {
  MapTiler: MAPTILER_BASEMAPS,
  'Stadia Maps': STADIA_MAPS_BASEMAPS,
  Stamen: STAMEN_BASEMAPS,
  Custom: []
};

export type BasemapProvider = keyof typeof BASEMAPS;

export const TILE_URLS = {
  MapTiler: (tileId: string) =>
    `https://api.maptiler.com/maps/${tileId}/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
  'Stadia Maps': (tileId: string) =>
    `https://tiles.stadiamaps.com/styles/${tileId}.json`,
  Stamen: (tileId: string) =>
    `https://tiles-beta.stadiamaps.com/styles/${tileId}.json`,
  Custom: () => ''
};
