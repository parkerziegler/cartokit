<script lang="ts">
  import { inject } from '@vercel/analytics';
  import type { Snippet } from 'svelte';

  import 'maplibre-gl/dist/maplibre-gl.css';
  import '../app.css';
  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  inject();
</script>

<svelte:head>
  <title>cartokit</title>
  <meta
    name="description"
    content="cartokit is a new direct manipulation programming environment for interactive cartography on the web."
  />
</svelte:head>

{@render children()}
