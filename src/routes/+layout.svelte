<script>
  import ogImage from '$lib/assets/social/og-image.png';
  import '../app.css';
</script>

<svelte:head>
  <title>cartokit</title>
  <meta
    name="description"
    content="cartokit is a new direct manipulation programming environment for interactive cartography on the Web."
  />
  <meta name="og:image" content={ogImage} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:creator" content="@parker_ziegler" />
  <meta name="twitter:image" content={ogImage} />
  <meta
    name="twitter:description"
    content="cartokit is a new direct manipulation programming environment for interactive cartography on the Web."
  />
  <link
    rel="stylesheet"
    href="https://unpkg.com/maplibre-gl@3.3.1/dist/maplibre-gl.css"
  />
</svelte:head>

<slot />
