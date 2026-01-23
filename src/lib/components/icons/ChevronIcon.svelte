<script lang="ts">
  interface Props {
    rotate?: number;
    class?: string;
  }

  let { rotate = 0, class: className = '' }: Props = $props();
</script>

<svg
  height="16"
  stroke-linejoin="round"
  viewBox="0 0 16 16"
  width="16"
  style="color: currentcolor;"
  transform="rotate({rotate})"
  class={[className, 'transition-transform']}
  ><path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M14.0607 5.49999L13.5303 6.03032L8.7071 10.8535C8.31658 11.2441 7.68341 11.2441 7.29289 10.8535L2.46966 6.03032L1.93933 5.49999L2.99999 4.43933L3.53032 4.96966L7.99999 9.43933L12.4697 4.96966L13 4.43933L14.0607 5.49999Z"
    fill="currentColor"
  ></path></svg
>
