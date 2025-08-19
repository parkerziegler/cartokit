<script lang="ts">
  import CloseIcon from '$lib/components/icons/CloseIcon.svelte';

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();
</script>

<div
  class="appear absolute bottom-12 left-4 z-10 flex max-w-2xs flex-col gap-2 rounded-md bg-slate-900 p-2 font-sans shadow-lg"
>
  <div class="flex flex-col">
    <div class="flex justify-between">
      <h2 class="text-xl font-light text-white">
        Like <code>cartokit</code>?
      </h2>
      <button class="text-sm text-white" onclick={onClose} aria-label="Close">
        <CloseIcon />
      </button>
    </div>
    <p class="text-sm font-light text-white">
      Consider joining our
      <a
        href="https://forms.gle/5uNFkkgKq6fRqLdd6"
        class="text-valkyrie underline">paid user study</a
      >.
    </p>
  </div>
  <video
    src="/cartokit-llm-min.mp4"
    autoplay
    loop
    muted
    playsinline
    class="rounded-xs"
  ></video>
  <p class="font-light text-slate-300">
    Study participants also get free Preview Access to
    <code>cartokit</code>'s GPT-5 integration.
  </p>
</div>

<style>
  .appear {
    animation:
      slide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
      fade 0.15s ease-out;
  }

  @keyframes slide {
    from {
      transform: translateY(10px);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
