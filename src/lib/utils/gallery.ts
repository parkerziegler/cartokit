import UrbanAreas from '$lib/assets/gallery/urban-areas.webp?enhanced';
import Earthquakes from '$lib/assets/gallery/earthquakes.webp?enhanced';
import ClimateImpacts from '$lib/assets/gallery/climate-impacts.webp?enhanced';
import type { GalleryItem } from '$lib/types';

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'urban-areas',
    name: 'US Urban Areas',
    attribution: 'US Census Bureau',
    url: 'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/urban-areas.json',
    src: UrbanAreas,
    type: 'Polygon'
  },
  {
    id: 'earthquakes',
    name: 'Magnitude 2.5+ Earthquakes in the Past 30 Days',
    attribution: 'USGS',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson',
    src: Earthquakes,
    type: 'Point'
  },
  //   {
  //     id: 'presidential-elections',
  //     name: '2024 Presidential Election Results',
  //     url: 'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/nyt-election-2024-national.json',
  //     src: Earthquakes
  //   },
  {
    id: 'climate-impacts',
    name: 'Climate Impact Regions',
    attribution: 'Climate Impact Lab, Carleton et al. 2022',
    url: 'https://pub-7182966c1afe48d3949439f93d0d4223.r2.dev/wapo-climate-impact-regions.json',
    src: ClimateImpacts,
    type: 'Polygon'
  }
];
