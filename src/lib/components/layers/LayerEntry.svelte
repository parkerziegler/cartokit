<script lang="ts">
  import { map } from '$lib/stores/map';
  import type { CartoKitLayer } from '$lib/types/CartoKitLayer';

  export let layer: CartoKitLayer;

  let layerVisible = true;

  function toggleLayerVisibility() {
    if (layerVisible) {
      $map?.setLayoutProperty(layer.id, 'visibility', 'none');
    } else {
      $map?.setLayoutProperty(layer.id, 'visibility', 'visible');
    }

    layerVisible = !layerVisible;
  }
</script>

<li class="flex items-center">
  {#if layer.type === 'Fill'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        d="M3.9329 21C1.1329 20.6 5.43289 16.6667 6.4329 13C7.9329 7.5 6.53291 3 8.93291 3C11.9329 3 11.9329 7 13.9329 9C15.9329 11 17.9329 6.5 19.9329 8C21.5329 9.2 21.9329 11.8333 21.9329 13C21.7662 15 21.1329 19.2 19.9329 20C18.4329 21 15.9329 19 13.9329 18C11.9329 17 7.4329 21.5 3.9329 21Z"
        fill="currentColor"
      />
    </svg>
  {:else if layer.type === 'Choropleth'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <rect
        x="2"
        y="2"
        width="14"
        height="7"
        fill="currentColor"
        fill-opacity="0.2"
      />
      <rect x="5" y="9" width="8" height="10" fill="currentColor" />
      <rect
        x="13"
        y="14"
        width="9"
        height="8"
        fill="currentColor"
        fill-opacity="0.4"
      />
      <rect
        x="16"
        y="5"
        width="6"
        height="4"
        fill="currentColor"
        fill-opacity="0.6"
      />
      <rect
        x="13"
        y="9"
        width="6"
        height="5"
        fill="currentColor"
        fill-opacity="0.8"
      />
    </svg>
  {:else if layer.type === 'Proportional Symbol'}
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="6" fill="currentColor" />
      <circle cx="18" cy="14" r="4" fill="currentColor" />
      <circle cx="11.5" cy="19.5" r="2.5" fill="currentColor" />
      <circle cx="6" cy="17" r="1" fill="currentColor" />
    </svg>
  {:else if layer.type === 'Dot Density'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <circle cx="3" cy="3" r="1" fill="currentColor" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
      <circle cx="5" cy="8" r="1" fill="currentColor" />
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="7" cy="17" r="1" fill="currentColor" />
      <circle cx="17" cy="11" r="1" fill="currentColor" />
      <circle cx="19" cy="19" r="1" fill="currentColor" />
      <circle cx="13" cy="15" r="1" fill="currentColor" />
      <circle cx="21" cy="4" r="1" fill="currentColor" />
      <circle cx="4" cy="21" r="1" fill="currentColor" />
      <circle cx="13" cy="20" r="1" fill="currentColor" />
    </svg>
  {/if}
  <span class="ml-4 mr-8 text-sm">{layer.displayName}</span>
  {#if layerVisible}
    <button on:click={toggleLayerVisibility}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
          cx="12"
          cy="12"
          r="3"
        /></svg
      >
    </button>
  {:else}
    <button on:click={toggleLayerVisibility}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="feather feather-eye-off"
        ><path
          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        /><line x1="1" y1="1" x2="23" y2="23" /></svg
      >
    </button>
  {/if}
</li>
