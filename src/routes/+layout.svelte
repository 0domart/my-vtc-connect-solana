<script>
    import "../app.css";
    import "../global.css";
    import { fullScreen } from './stores';
    import Fullscreen from "svelte-fullscreen";

  </script>
  <Fullscreen let:onRequest let:onExit>
    <div style="background-color: var(--background-color);" class="h-screen">
      {#if !$fullScreen}
      <button on:click={() => (onRequest(), $fullScreen=true)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 inline m-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
      </button>
      {:else }
        <button on:click={() => (onExit(), $fullScreen=false)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 inline m-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
        </svg>
        </button>
      {/if}
      <slot />
      <div class="flex justify-center flex-row bg-[var(--background-color)]">
        <footer class="footer footer-center text-base-content rounded-md fixed bottom-4 w-full">
       <div class="items-center">
         <span class="text-sm text-white">MY VTC CONNECT © 2017 - 2023 Tous droits réservés</span>
       </div>
     </footer>
   </div>
    </div>
   
  </Fullscreen>

 