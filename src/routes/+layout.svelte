<script>
  import { inject } from '@vercel/analytics';

  import 'maplibre-gl/dist/maplibre-gl.css';
  import '../app.css';

  inject();
</script>

<svelte:head>
  <title>cartokit</title>
  <meta
    name="description"
    content="cartokit is a new direct manipulation programming environment for interactive cartography on the web."
  />
</svelte:head>

<slot />
