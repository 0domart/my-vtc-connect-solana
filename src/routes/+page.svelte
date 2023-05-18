<script lang='ts'>
    import { onMount } from "svelte";
    import * as web3 from '@solana/web3.js';
    import { storeName, publicKey, companyName } from './stores';
    import { goto } from '$app/navigation';
    import logoEntreprise from "../lib/images/logo_mvc.svg";
    import mixpanel from 'mixpanel-browser';

    let cnx;
    let invalidKey = false;
    let placeholder = "Nom du magasin, ex : " + $companyName;

    onMount(async () => {
        let publicKeyStore = localStorage.getItem('publicKey');
        let storeNameStore = localStorage.getItem('storeName');

        if (publicKeyStore !== null) {
            publicKey.set(publicKeyStore);
        }

        if (storeNameStore !== null) {
            storeName.set(storeNameStore);
        }

        let sol_rpc = process.env.SOLANA_RPC? process.env.SOLANA_RPC : "https://solana-mainnet.g.alchemy.com/v2/WGBoK0YbGQZUASSAYCbCb1MNvP_oUwIu";
        cnx = new web3.Connection(sol_rpc);     
    })

    async function createStore() {
        try {
            $publicKey = $publicKey.trim()            
            if (web3.PublicKey.isOnCurve($publicKey) == true) {
                invalidKey = false;
                localStorage.setItem('publicKey', $publicKey); // Store publicKey in localStorage
                localStorage.setItem('storeName', $storeName); // Store storeName in localStorage
                goto('/store', { state: { foo: 'bar' } });
            }
            else {
                invalidKey = true
            }
        } catch(e) {
            invalidKey = true;
        }
    }

</script>
<div>
    <h1 class="card-title pt-5 justify-center text-center text-md font-greycliffbold -mt-5 pb-5 text-transparent bg-clip-text bg-[var(--primary-color)]">Créez un terminal de paiement instantanément !</h1>
    <div class="grid grid-flow-row justify-center pt-5 gap-3 w-full pb-12">
        <div class="indicator justify-items-center place-self-center w-full">
            <div class="card bg-[var(--secondary-color)] shadow border mx-auto w-3/5 min-w-fit">
                <div class="card-body px-6 pb-4 w-full mx-auto justify-center">
                    <p class="text-md -mt-3 text-center font-greycliffbold text-transparent bg-clip-text bg-[var(--background-color)]">Entrez vos coordonnées marchandes</p>
                    <div class="flex flex-col pt-4 space-y-3 w-full mx-auto justify-center items-center">
                        <input bind:value={$storeName} type="text" placeholder={placeholder} class="text-center input input-sm border-[#808080] w-full max-w-lg" style="color: black;"/> 
                        <input bind:value={$publicKey} type="text" placeholder="Adresse du portefeuille marchand (clé publique)" class="text-center input input-sm border-[#808080] w-full max-w-lg" style="color: black;"/> 
                        <p class="text-center text-sm text-[var(--background-color)] mt-2">
                            Besoin d'un portefeuille Solana ? 
                            <a href="https://phantom.app/download" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">Créez-le dès maintenant sur Phantom !</a>
                        </p>
                    </div>
                    
                      {#if invalidKey}
                        <span class="text-center text-sm text-error">Clé Solana invalide - veuillez entrer une adresse de portefeuille valide.</span>
                    {/if}
                    <div class="card-actions justify-center pt-4">
                        <button on:click={createStore} class="btn normal-case btn-sm bg-[var(--primary-color)] border-0 w-full h-10 rounded-lg flex items-center">Créer un magasin</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
