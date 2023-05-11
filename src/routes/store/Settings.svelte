<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import { goto } from '$app/navigation';
    import { storeName, publicKey, pmtAmt, showWarning, mints, selectedMint } from '../stores.js';
    

    onMount(async () => {
        
       
       
       
    // Initialize KioskBoard (default/all options)

    
        
    })
    onDestroy(async ()=> {
        //document.body.setAttribute('tabindex', '-1');
       
    })
    async function reset() {
        goto('/', { state: { foo: 'bar' } });
    }
    
</script>

<div class="card w-96 bg-[var(--secondary-color)] shadow border">
        
    <div class="card-body px-6 pb-4 text-xl">
        <h1 class="align-center text-xl font-greycliffbold -mt-5 pb-1 text-transparent bg-clip-text bg-[var(--background-color)]">Paramètres</h1>
        <div class="form-control">
            <label class="cursor-pointer label">
              <span class="label-text">Afficher le message d'avertissement ?</span>
              <input type="checkbox" bind:checked={$showWarning} class="checkbox" />
            </label>
            <label class="label">
                <span class="label-text justify-left pr-2">Modifier la devise de payement</span>
                <select bind:value={$selectedMint} class="select select-xs justify-end text-[var(--background-color)]">
                    {#each $mints as mint}
                    <option>{mint.name}</option>
                    {/each}
                  </select>
            </label>
            
        </div>
          <div class="card-actions justify-center">
            <button on:click={reset} class="btn normal-case btn-sm bg-[var(--primary-color)]">Réintialiser la boutique</button>
        </div>
    </div>
    


    
</div>
