import { PUBLIC_MAPTILER_API_KEY } from '$env/static/public';

// CARTO
import DarkMatter from '$lib/assets/basemaps/carto/dark-matter.webp?enhanced';
import Positron from '$lib/assets/basemaps/carto/positron.webp?enhanced';
import Voyager from '$lib/assets/basemaps/carto/voyager.webp?enhanced';

// Maptiler
import AquarelleDark from '$lib/assets/basemaps/maptiler/aquarelle-dark.webp?enhanced';
import AquarelleVivid from '$lib/assets/basemaps/maptiler/aquarelle-vivid.webp?enhanced';
import Aquarelle from '$lib/assets/basemaps/maptiler/aquarelle.webp?enhanced';
import BackdropDark from '$lib/assets/basemaps/maptiler/backdrop-dark.webp?enhanced';
import BackdropLight from '$lib/assets/basemaps/maptiler/backdrop-light.webp?enhanced';
import Backdrop from '$lib/assets/basemaps/maptiler/backdrop.webp?enhanced';
import BasicV2Dark from '$lib/assets/basemaps/maptiler/basic-v2-dark.webp?enhanced';
import BasicV2Light from '$lib/assets/basemaps/maptiler/basic-v2-light.webp?enhanced';
import BasicV2 from '$lib/assets/basemaps/maptiler/basic-v2.webp?enhanced';
import BrightV2Dark from '$lib/assets/basemaps/maptiler/bright-v2-dark.webp?enhanced';
import BrightV2Light from '$lib/assets/basemaps/maptiler/bright-v2-light.webp?enhanced';
import BrightV2Pastel from '$lib/assets/basemaps/maptiler/bright-v2-pastel.webp?enhanced';
import BrightV2 from '$lib/assets/basemaps/maptiler/bright-v2.webp?enhanced';
import DatavizDark from '$lib/assets/basemaps/maptiler/dataviz-dark.webp?enhanced';
import DatavizLight from '$lib/assets/basemaps/maptiler/dataviz-light.webp?enhanced';
import Dataviz from '$lib/assets/basemaps/maptiler/dataviz.webp?enhanced';
import Hybrid from '$lib/assets/basemaps/maptiler/hybrid.webp?enhanced';
import LandscapeDark from '$lib/assets/basemaps/maptiler/landscape-dark.webp?enhanced';
import LandscapeVivid from '$lib/assets/basemaps/maptiler/landscape-vivid.webp?enhanced';
import Landscape from '$lib/assets/basemaps/maptiler/landscape.webp?enhanced';
import Ocean from '$lib/assets/basemaps/maptiler/ocean.webp?enhanced';
import Openstreetmap from '$lib/assets/basemaps/maptiler/openstreetmap.webp?enhanced';
import OutdoorV2Dark from '$lib/assets/basemaps/maptiler/outdoor-v2-dark.webp?enhanced';
import OutdoorV2 from '$lib/assets/basemaps/maptiler/outdoor-v2.webp?enhanced';
import Satellite from '$lib/assets/basemaps/maptiler/satellite.webp?enhanced';
import StreetsV2Dark from '$lib/assets/basemaps/maptiler/streets-v2-dark.webp?enhanced';
import StreetsV2Light from '$lib/assets/basemaps/maptiler/streets-v2-light.webp?enhanced';
import StreetsV2Pastel from '$lib/assets/basemaps/maptiler/streets-v2-pastel.webp?enhanced';
import StreetsV2 from '$lib/assets/basemaps/maptiler/streets-v2.webp?enhanced';
import TonerV2Lite from '$lib/assets/basemaps/maptiler/toner-v2-lite.webp?enhanced';
import TonerV2 from '$lib/assets/basemaps/maptiler/toner-v2.webp?enhanced';
import TopoV2Dark from '$lib/assets/basemaps/maptiler/topo-v2-dark.webp?enhanced';
import TopoV2Pastel from '$lib/assets/basemaps/maptiler/topo-v2-pastel.webp?enhanced';
import TopoV2Topographique from '$lib/assets/basemaps/maptiler/topo-v2-topographique.webp?enhanced';
import TopoV2 from '$lib/assets/basemaps/maptiler/topo-v2.webp?enhanced';
import WinterV2Dark from '$lib/assets/basemaps/maptiler/winter-v2-dark.webp?enhanced';
import WinterV2 from '$lib/assets/basemaps/maptiler/winter-v2.webp?enhanced';

// Stadia Maps
import AlidadeSmoothDark from '$lib/assets/basemaps/stadia-maps/alidade_smooth_dark.webp?enhanced';
import AlidadeSmooth from '$lib/assets/basemaps/stadia-maps/alidade_smooth.webp?enhanced';
import OsmBright from '$lib/assets/basemaps/stadia-maps/osm_bright.webp?enhanced';
import Outdoors from '$lib/assets/basemaps/stadia-maps/outdoors.webp?enhanced';

// Stamen
import StamenTerrain from '$lib/assets/basemaps/stamen/stamen_terrain.webp?enhanced';
import StamenTonerLite from '$lib/assets/basemaps/stamen/stamen_toner_lite.webp?enhanced';
import StamenToner from '$lib/assets/basemaps/stamen/stamen_toner.webp?enhanced';
import StamenWatercolor from '$lib/assets/basemaps/stamen/stamen_watercolor.webp?enhanced';

import type { Basemap, BasemapProvider } from '$lib/types';

const CARTO_BASEMAPS: Basemap[] = [
  { title: 'Dark Matter', tileId: 'dark-matter', src: DarkMatter },
  { title: 'Positron', tileId: 'positron', src: Positron },
  { title: 'Voyager', tileId: 'voyager', src: Voyager }
];

const MAPTILER_BASEMAPS: Basemap[] = [
  { title: 'Aquarelle Dark', tileId: 'aquarelle-dark', src: AquarelleDark },
  { title: 'Aquarelle Vivid', tileId: 'aquarelle-vivid', src: AquarelleVivid },
  { title: 'Aquarelle', tileId: 'aquarelle', src: Aquarelle },
  { title: 'Backdrop Dark', tileId: 'backdrop-dark', src: BackdropDark },
  { title: 'Backdrop Light', tileId: 'backdrop-light', src: BackdropLight },
  { title: 'Backdrop', tileId: 'backdrop', src: Backdrop },
  { title: 'Basic Dark', tileId: 'basic-v2-dark', src: BasicV2Dark },
  { title: 'Basic Light', tileId: 'basic-v2-light', src: BasicV2Light },
  { title: 'Basic', tileId: 'basic-v2', src: BasicV2 },
  { title: 'Bright Dark', tileId: 'bright-v2-dark', src: BrightV2Dark },
  { title: 'Bright Light', tileId: 'bright-v2-light', src: BrightV2Light },
  {
    title: 'Bright Pastel',
    tileId: 'bright-v2-pastel',
    src: BrightV2Pastel
  },
  { title: 'Bright', tileId: 'bright-v2', src: BrightV2 },
  { title: 'Dataviz Dark', tileId: 'dataviz-dark', src: DatavizDark },
  { title: 'Dataviz Light', tileId: 'dataviz-light', src: DatavizLight },
  { title: 'Dataviz', tileId: 'dataviz', src: Dataviz },
  { title: 'Hybrid', tileId: 'hybrid', src: Hybrid },
  { title: 'Landscape Dark', tileId: 'landscape-dark', src: LandscapeDark },
  { title: 'Landscape Vivid', tileId: 'landscape-vivid', src: LandscapeVivid },
  { title: 'Landscape', tileId: 'landscape', src: Landscape },
  { title: 'Ocean', tileId: 'ocean', src: Ocean },
  { title: 'Openstreetmap', tileId: 'openstreetmap', src: Openstreetmap },
  { title: 'Outdoor Dark', tileId: 'outdoor-v2-dark', src: OutdoorV2Dark },
  { title: 'Outdoor', tileId: 'outdoor-v2', src: OutdoorV2 },
  { title: 'Satellite', tileId: 'satellite', src: Satellite },
  { title: 'Streets Dark', tileId: 'streets-v2-dark', src: StreetsV2Dark },
  {
    title: 'Streets Light',
    tileId: 'streets-v2-light',
    src: StreetsV2Light
  },
  {
    title: 'Streets Pastel',
    tileId: 'streets-v2-pastel',
    src: StreetsV2Pastel
  },
  { title: 'Streets', tileId: 'streets-v2', src: StreetsV2 },
  { title: 'Toner Lite', tileId: 'toner-v2-lite', src: TonerV2Lite },
  { title: 'Toner', tileId: 'toner-v2', src: TonerV2 },
  { title: 'Topo Dark', tileId: 'topo-v2-dark', src: TopoV2Dark },
  { title: 'Topo Pastel', tileId: 'topo-v2-pastel', src: TopoV2Pastel },
  {
    title: 'Topo Topographique',
    tileId: 'topo-v2-topographique',
    src: TopoV2Topographique
  },
  { title: 'Topo', tileId: 'topo-v2', src: TopoV2 },
  { title: 'Winter Dark', tileId: 'winter-v2-dark', src: WinterV2Dark },
  { title: 'Winter', tileId: 'winter-v2', src: WinterV2 }
];

const STAMEN_BASEMAPS: Basemap[] = [
  { title: 'Terrain', tileId: 'stamen_terrain', src: StamenTerrain },
  { title: 'Toner Lite', tileId: 'stamen_toner_lite', src: StamenTonerLite },
  { title: 'Toner', tileId: 'stamen_toner', src: StamenToner },
  { title: 'Watercolor', tileId: 'stamen_watercolor', src: StamenWatercolor }
];

const STADIA_MAPS_BASEMAPS: Basemap[] = [
  {
    title: 'Alidade Smooth Dark',
    tileId: 'alidade_smooth_dark',
    src: AlidadeSmoothDark
  },
  {
    title: 'Alidade Smooth',
    tileId: 'alidade_smooth',
    src: AlidadeSmooth
  },
  { title: 'OSM Bright', tileId: 'osm_bright', src: OsmBright },
  { title: 'Outdoors', tileId: 'outdoors', src: Outdoors }
];

export const BASEMAPS: Record<BasemapProvider, Basemap[]> = {
  CARTO: CARTO_BASEMAPS,
  MapTiler: MAPTILER_BASEMAPS,
  'Stadia Maps': STADIA_MAPS_BASEMAPS,
  Stamen: STAMEN_BASEMAPS,
  Custom: []
};

export const TILE_URLS = {
  CARTO: (tileId: string) =>
    `https://tiles.basemaps.cartocdn.com/gl/${tileId}-gl-style/style.json`,
  MapTiler: (tileId: string) =>
    `https://api.maptiler.com/maps/${tileId}/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
  'Stadia Maps': (tileId: string) =>
    `https://tiles.stadiamaps.com/styles/${tileId}.json`,
  Stamen: (tileId: string) =>
    `https://tiles.stadiamaps.com/styles/${tileId}.json`,
  Custom: () => ''
};
