<script>
  import '../app.css';
</script>

<svelte:head>
  <title>cartokit</title>
  <meta
    name="description"
    content="cartokit is a new direct manipulation programming environment for interactive cartography on the web."
  />
  <meta name="og:image" content="https://alpha.cartokit.dev/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@parker_ziegler" />
  <meta name="twitter:creator" content="@parker_ziegler" />
  <meta
    name="twitter:title"
    content="cartokit: A direct manipulation programming environment for interactive cartography on the web."
  />
  <meta
    name="twitter:description"
    content="cartokit is a new direct manipulation programming environment for interactive cartography on the web."
  />
  <meta
    name="twitter:image"
    content="https://alpha.cartokit.dev/og-image.png"
  />
  <link
    rel="stylesheet"
    href="https://unpkg.com/maplibre-gl@3.5.2/dist/maplibre-gl.css"
  />
</svelte:head>

<slot />
