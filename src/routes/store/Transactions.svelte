<script lang="ts">
import {
    onMount,
    onDestroy
} from "svelte";
import {
    goto
} from '$app/navigation';
import {
    storeName,
    publicKey,
    pmtAmt,
    showWarning,
    successArray
} from '../stores.js';
import dayjs from 'dayjs'

onMount(async () => {

    let successArrayStore = localStorage.getItem('successArray');
    if (successArrayStore !== null) {
        successArray.set(JSON.parse(successArrayStore));
    }

    // Initialize KioskBoard (default/all options)

})
onDestroy(async () => {
    //document.body.setAttribute('tabindex', '-1');

})
async function reset() {
  successArray.set([]);
  localStorage.removeItem("successArray");
}
</script>

<div>
    <div class="card bg-[var(--secondary-color)] border">
        <div class="overflow-x-auto text-[var(--background-color)]">
            <table class="table table-compact w-full min-h-[200px]">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th class="text-center">Tx ID</th>
                        <th class="text-right">Montant</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $successArray.reverse() as item, i}
                    <tr>
                        <td>{dayjs.unix(item.timestamp).format("MM-DD HH:mm:ss")}</td>
                        <td class="text-center">
                            <a class="hover:underline hover:decoration-primary" href="https://solscan.io/tx/{item.txid}" target="_blank">
                                {item.txid.substring(0,20)}...{item.txid.substring(68,88)}</a>
                        </td>
                        <td class="text-right">{item.uiAmount} {item.uiToken}</td>
                    </tr>
                    {/each}
                    {#if $successArray.length === 0}
                    <tr>
                        <td colspan="3" class="text-center">Pas de transaction pour le moment</td>
                    </tr>
                    {/if}
                </tbody>

            </table>
        </div>
    </div>
    {#if $successArray.length !== 0}
    <div class="self-center items-center justify-center text-center">
      <button on:click={reset} class="mt-10 self-center items-center justify-center text-center btn normal-case h-2 w-92 btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]">
        <span class="text-center ">Effacer l'historique</span>
      </button>
    </div>
    {/if}
</div>
