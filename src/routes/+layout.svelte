<script lang="ts">
  import { inject } from '@vercel/analytics';
  import type { Snippet } from 'svelte';

  import 'maplibre-gl/dist/maplibre-gl.css';
  import '../app.css';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  inject({
    beforeSend: (event) => {
      if (event.url.includes('playwright')) {
        return null;
      }
      return event;
    }
  });
</script>

<svelte:head>
  <title>cartokit</title>
  <meta
    name="description"
    content="cartokit is a new direct manipulation programming environment for interactive cartography on the web."
  />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

{@render children()}
