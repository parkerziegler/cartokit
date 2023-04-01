<script lang="ts">
  import choropleth from '$lib/assets/choropleth.png';

  export let mapType: 'Choropleth';
  export let className: string = '';

  const mapTypeToImage = new Map<typeof mapType, string>([
    ['Choropleth', choropleth]
  ]);
</script>

<button class={className} on:click>
  <div class="stack stack-xs">
    <p class="self-start font-semibold"><em>{mapType}</em></p>
    <img
      src={mapTypeToImage.get(mapType)}
      alt={mapType}
      class="rounded shadow-md"
    />
  </div>
</button>
