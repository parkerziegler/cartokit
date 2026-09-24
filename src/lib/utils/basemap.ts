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

import type { Basemap, BasemapProvider } from '$lib/types/basemap';

const CARTO_BASEMAPS: Basemap[] = [
  {
    title: 'Dark Matter',
    tileId: 'dark-matter',
    src: DarkMatter,
    mode: 'dark',
    beforeId: 'watername_ocean'
  },
  {
    title: 'Positron',
    tileId: 'positron',
    src: Positron,
    mode: 'light',
    beforeId: 'watername_ocean'
  },
  {
    title: 'Voyager',
    tileId: 'voyager',
    src: Voyager,
    mode: 'light',
    beforeId: 'watername_ocean'
  }
];

const MAPTILER_BASEMAPS: Basemap[] = [
  {
    title: 'Aquarelle Dark',
    tileId: 'aquarelle-dark',
    src: AquarelleDark,
    mode: 'dark',
    beforeId: undefined
  },
  {
    title: 'Aquarelle Vivid',
    tileId: 'aquarelle-vivid',
    src: AquarelleVivid,
    mode: 'light',
    beforeId: undefined
  },
  {
    title: 'Aquarelle',
    tileId: 'aquarelle',
    src: Aquarelle,
    mode: 'light',
    beforeId: undefined
  },
  {
    title: 'Backdrop Dark',
    tileId: 'backdrop-dark',
    src: BackdropDark,
    mode: 'dark',
    beforeId: 'Ocean labels'
  },
  {
    title: 'Backdrop Light',
    tileId: 'backdrop-light',
    src: BackdropLight,
    mode: 'light',
    beforeId: 'Ocean labels'
  },
  {
    title: 'Backdrop',
    tileId: 'backdrop',
    src: Backdrop,
    mode: 'light',
    beforeId: 'Ocean labels'
  },
  {
    title: 'Basic Dark',
    tileId: 'basic-v2-dark',
    src: BasicV2Dark,
    mode: 'dark',
    beforeId: 'Airport labels'
  },
  {
    title: 'Basic Light',
    tileId: 'basic-v2-light',
    src: BasicV2Light,
    mode: 'light',
    beforeId: 'Airport labels'
  },
  {
    title: 'Basic',
    tileId: 'basic-v2',
    src: BasicV2,
    mode: 'light',
    beforeId: 'Airport labels'
  },
  {
    title: 'Bright Dark',
    tileId: 'bright-v2-dark',
    src: BrightV2Dark,
    mode: 'dark',
    beforeId: 'River labels'
  },
  {
    title: 'Bright Light',
    tileId: 'bright-v2-light',
    src: BrightV2Light,
    mode: 'light',
    beforeId: 'River labels'
  },
  {
    title: 'Bright Pastel',
    tileId: 'bright-v2-pastel',
    src: BrightV2Pastel,
    mode: 'light',
    beforeId: 'River labels'
  },
  {
    title: 'Bright',
    tileId: 'bright-v2',
    src: BrightV2,
    mode: 'light',
    beforeId: 'River labels'
  },
  {
    title: 'Dataviz Dark',
    tileId: 'dataviz-dark',
    src: DatavizDark,
    mode: 'dark',
    beforeId: 'Ocean labels'
  },
  {
    title: 'Dataviz Light',
    tileId: 'dataviz-light',
    src: DatavizLight,
    mode: 'light',
    beforeId: 'Ocean labels'
  },
  {
    title: 'Dataviz',
    tileId: 'dataviz',
    src: Dataviz,
    mode: 'light',
    beforeId: 'Ocean labels'
  },
  {
    title: 'Hybrid',
    tileId: 'hybrid',
    src: Hybrid,
    mode: 'dark',
    beforeId: 'Road labels'
  },
  {
    title: 'Landscape Dark',
    tileId: 'landscape-dark',
    src: LandscapeDark,
    mode: 'dark',
    beforeId: 'Ocean labels'
  },
  {
    title: 'Landscape Vivid',
    tileId: 'landscape-vivid',
    src: LandscapeVivid,
    mode: 'light',
    beforeId: 'Ocean labels'
  },
  {
    title: 'Landscape',
    tileId: 'landscape',
    src: Landscape,
    mode: 'light',
    beforeId: 'Ocean labels'
  },
  {
    title: 'Ocean',
    tileId: 'ocean',
    src: Ocean,
    mode: 'light',
    beforeId: 'Landform labels'
  },
  {
    title: 'Openstreetmap',
    tileId: 'openstreetmap',
    src: Openstreetmap,
    mode: 'light',
    beforeId: 'River labels'
  },
  {
    title: 'Outdoor Dark',
    tileId: 'outdoor-v2-dark',
    src: OutdoorV2Dark,
    mode: 'dark',
    beforeId: 'Contour labels'
  },
  {
    title: 'Outdoor',
    tileId: 'outdoor-v2',
    src: OutdoorV2,
    mode: 'light',
    beforeId: 'Contour labels'
  },
  {
    title: 'Satellite',
    tileId: 'satellite',
    src: Satellite,
    mode: 'dark',
    beforeId: 'Road labels'
  },
  {
    title: 'Streets Dark',
    tileId: 'streets-v2-dark',
    src: StreetsV2Dark,
    mode: 'dark',
    beforeId: 'River labels'
  },
  {
    title: 'Streets Light',
    tileId: 'streets-v2-light',
    src: StreetsV2Light,
    mode: 'light',
    beforeId: 'River labels'
  },
  {
    title: 'Streets Pastel',
    tileId: 'streets-v2-pastel',
    src: StreetsV2Pastel,
    mode: 'light',
    beforeId: 'River labels'
  },
  {
    title: 'Streets',
    tileId: 'streets-v2',
    src: StreetsV2,
    mode: 'light',
    beforeId: 'River labels'
  },
  {
    title: 'Toner Lite',
    tileId: 'toner-v2-lite',
    src: TonerV2Lite,
    mode: 'light',
    beforeId: 'River labels'
  },
  {
    title: 'Toner',
    tileId: 'toner-v2',
    src: TonerV2,
    mode: 'dark',
    beforeId: 'River labels'
  },
  {
    title: 'Topo Dark',
    tileId: 'topo-v2-dark',
    src: TopoV2Dark,
    mode: 'dark',
    beforeId: 'Contour labels'
  },
  {
    title: 'Topo Pastel',
    tileId: 'topo-v2-pastel',
    src: TopoV2Pastel,
    mode: 'light',
    beforeId: 'Contour labels'
  },
  {
    title: 'Topo Topographique',
    tileId: 'topo-v2-topographique',
    src: TopoV2Topographique,
    mode: 'light',
    beforeId: 'Contour labels'
  },
  {
    title: 'Topo',
    tileId: 'topo-v2',
    src: TopoV2,
    mode: 'light',
    beforeId: 'Contour labels'
  },
  {
    title: 'Winter Dark',
    tileId: 'winter-v2-dark',
    src: WinterV2Dark,
    mode: 'dark',
    beforeId: 'Contour labels'
  },
  {
    title: 'Winter',
    tileId: 'winter-v2',
    src: WinterV2,
    mode: 'light',
    beforeId: 'Contour labels'
  }
];

const STAMEN_BASEMAPS: Basemap[] = [
  {
    title: 'Terrain',
    tileId: 'stamen_terrain',
    src: StamenTerrain,
    mode: 'light',
    beforeId: 'road-label-simple'
  },
  {
    title: 'Toner Lite',
    tileId: 'stamen_toner_lite',
    src: StamenTonerLite,
    mode: 'light',
    beforeId: 'road-label'
  },
  {
    title: 'Toner',
    tileId: 'stamen_toner',
    src: StamenToner,
    mode: 'dark',
    beforeId: 'road-label'
  },
  {
    title: 'Watercolor',
    tileId: 'stamen_watercolor',
    src: StamenWatercolor,
    mode: 'light',
    beforeId: undefined
  }
];

const STADIA_MAPS_BASEMAPS: Basemap[] = [
  {
    title: 'Alidade Smooth Dark',
    tileId: 'alidade_smooth_dark',
    src: AlidadeSmoothDark,
    mode: 'dark',
    beforeId: 'highway_name_other'
  },
  {
    title: 'Alidade Smooth',
    tileId: 'alidade_smooth',
    src: AlidadeSmooth,
    mode: 'light',
    beforeId: 'highway_name_other'
  },
  {
    title: 'OSM Bright',
    tileId: 'osm_bright',
    src: OsmBright,
    mode: 'light',
    beforeId: 'waterway-name'
  },
  {
    title: 'Outdoors',
    tileId: 'outdoors',
    src: Outdoors,
    mode: 'light',
    beforeId: 'waterway-name'
  }
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
