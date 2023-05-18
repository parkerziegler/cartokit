import DatavizLight from '$lib/assets/basemaps/dataviz-light.png';
import DatavizDark from '$lib/assets/basemaps/dataviz-dark.png';
import Outdoor from '$lib/assets/basemaps/outdoor.png';

export interface Basemap {
  title: string;
  tileId: string;
  src: string;
}

export const MAPTILER_BASEMAPS: Basemap[] = [
  {
    title: 'Dataviz Light',
    tileId: 'dataviz-light',
    src: DatavizLight
  },
  {
    title: 'Dataviz Dark',
    tileId: 'dataviz-dark',
    src: DatavizDark
  },
  {
    title: 'Outdoor',
    tileId: 'outdoor-v2',
    src: Outdoor
  }
];
