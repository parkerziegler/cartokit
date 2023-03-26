<script>
  import 'prismjs/themes/prism.css';
  import 'prism-theme-night-owl/build/style.css';

  import '../app.css';
</script>

<svelte:head>
  <title>cartokit</title>
  <link
    rel="stylesheet"
    href="https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css"
  />
</svelte:head>

<slot />
