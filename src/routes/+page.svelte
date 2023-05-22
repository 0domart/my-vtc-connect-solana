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
                            <svg class= "inline pl-1 h-8 pb-1" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.7439 21.253C22.7714 21.3361 22.7714 21.4259 22.7439 21.5089C22.7279 21.5918 22.6885 21.6683 22.6304 21.7293L18.8783 25.6748C18.7956 25.7599 18.6968 25.8276 18.5875 25.8738C18.478 25.9219 18.3595 25.9462 18.24 25.9449H0.444308C0.361894 25.9456 0.280888 25.9235 0.210248 25.8809C0.139655 25.8328 0.0833028 25.7665 0.0471156 25.689C0.0221236 25.6104 0.0221236 25.5259 0.0471156 25.4473C0.0618237 25.3655 0.0986193 25.2892 0.153506 25.2269L3.91265 21.2815C3.99533 21.1963 4.09422 21.1286 4.20346 21.0824C4.31277 21.0337 4.43137 21.0094 4.551 21.0113H22.3183C22.404 21.0097 22.4882 21.0345 22.5594 21.0824C22.6393 21.1154 22.7047 21.1759 22.7439 21.253ZM18.8854 13.7602C18.8009 13.6773 18.7025 13.6099 18.5946 13.5612C18.484 13.5164 18.3663 13.4924 18.2471 13.4901H0.444308C0.360864 13.4913 0.27943 13.5159 0.209231 13.5612C0.139032 13.6064 0.0828724 13.6704 0.0471156 13.746C0.0225831 13.8247 0.0225831 13.909 0.0471156 13.9877C0.0590607 14.0704 0.0962206 14.1474 0.153506 14.2081L3.91265 18.1606C3.99717 18.2436 4.09561 18.311 4.20346 18.3597C4.31383 18.405 4.43173 18.4291 4.551 18.4308H22.3183C22.404 18.4324 22.4882 18.4076 22.5594 18.3597C22.6311 18.3178 22.6861 18.2526 22.7155 18.1749C22.7518 18.0992 22.7639 18.0141 22.7499 17.9314C22.7359 17.8486 22.6966 17.7722 22.6375 17.7128L18.8854 13.7602ZM0.210248 10.8455C0.280888 10.8881 0.361894 10.9102 0.444308 10.9095H18.2471C18.3666 10.9108 18.4851 10.8865 18.5946 10.8384C18.7038 10.7922 18.8027 10.7246 18.8854 10.6394L22.6375 6.69394C22.6956 6.63288 22.7349 6.55639 22.7509 6.47356C22.7755 6.39487 22.7755 6.31055 22.7509 6.23186C22.7216 6.15414 22.6665 6.08889 22.5949 6.04702C22.5237 5.99912 22.4395 5.9743 22.3538 5.97593H4.52263C4.403 5.97402 4.2844 5.99828 4.17509 6.04702C4.06585 6.09322 3.96696 6.1609 3.88428 6.24607L0.132229 10.2057C0.0727337 10.2658 0.0331119 10.3427 0.0187441 10.4261C-0.00624802 10.5047 -0.00624802 10.5892 0.0187441 10.6678C0.0647789 10.7438 0.131116 10.8054 0.210248 10.8455V10.8455Z" fill="url(#paint0_linear_127_5269)"/>
                            </svg>
                            <a href="https://phantom.app/download" target="_blank" rel="noopener noreferrer" class="md:inline flex flex-col md:flex-row text-blue-600 underline">Créez-le dès maintenant sur Phantom !</a>
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
