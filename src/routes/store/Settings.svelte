<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import { goto } from '$app/navigation';
    import { storeName, publicKey, pmtAmt, mints, selectedMint, successArray } from '../stores.js';
    

    onMount(async () => {
        
       
       
       
    // Initialize KioskBoard (default/all options)

    
        
    })
    onDestroy(async ()=> {
        //document.body.setAttribute('tabindex', '-1');
       
    })
    async function reset() {
        localStorage.removeItem("successArray");
        localStorage.removeItem("selectedMint");
        $successArray = []
        goto('/', { state: { foo: 'bar' } });
    }
    
</script>

<div class="card w-96 bg-[var(--secondary-color)] shadow border md:mb-16">
        
    <div class="card-body px-6 pb-4 text-xl">
        <h1 class="align-center text-xl font-greycliffbold -mt-5 pb-1 text-transparent bg-clip-text bg-[var(--background-color)]">Paramètres</h1>
        <div class="form-control">
            <label class="label">
                <span class="label-text justify-left pr-2 text-[var(--background-color)]">Modifier la devise de paiement</span>
                <select bind:value={$selectedMint} on:click={() => {localStorage.setItem('selectedMint', $selectedMint)}} class="text-black select select-xs justify-end">
                    {#each $mints as mint}
                    <option>{mint.name}</option>
                    {/each}
                  </select>
            </label>
            
        </div>
          <div class="card-actions justify-center pt-10">
            <button on:click={reset} class="btn normal-case btn-sm bg-[var(--primary-color)]">Réinitialiser la boutique</button>
        </div>
    </div>
    


    
</div>
