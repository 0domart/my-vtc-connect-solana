<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import { goto } from '$app/navigation';
    import { storeName, publicKey, pmtAmt, selectedMint, mints } from '../stores.js';
    import * as KioskBoard from 'kioskboard';
    import englishKeypbad from "../../keyboards/kioskboard-keys-english.json"
    import Keyboard from "svelte-keyboard";
    import usdcLogo from "../../lib/images/usdcLogo.svg"
    import bonkLogo from "../../lib/images/BonkLogo.png"
    import solLogo from "../../lib/images/solanaLogoMark.png"
    import dustLogo from "../../lib/images/dustLogo.svg"
    import mvcLogo from "../../lib/images/mvcLogo.png"
    import rainLogo from "../../lib/images/rainLogo.png"
    import foxyLogo from "../../lib/images/foxyLogo.webp"
    import BigNumber from 'bignumber.js';
    import mixpanel from 'mixpanel-browser';

    const keys = [  { row: 0, value: "1"}, { row: 0, value: "2"}, { row: 0, value: "3"}, 
                    { row: 1, value: "4"}, { row: 1, value: "5"}, { row: 1, value: "6"},
                    { row: 2, value: "7"}, { row: 2, value: "8"}, { row: 2, value: "9"},
                    { row: 3, value: "<" }, { row: 3, value: "0"}, { row: 3, value: "."}];
    let keyboardRef = null;
    let keyboardLoaded = false
    let maxDecimals = 4
    let left = ""
    let right = ""
    let decimalsActive = false
    let error = false
    let showDropdown = false
    let selectedLogo: string | null | undefined = usdcLogo;

    onMount(async () => {
        let selectedMintStore = localStorage.getItem('selectedMint');

        if (selectedMintStore !== null) {
        selectedMint.set(selectedMintStore);
        }

        const currentMint = $mints.filter(item => item.name == $selectedMint)
        selectedLogo = currentMint[0].img;
    })
    onDestroy(async ()=> {       
    })

    function toggleDropdown() {
        showDropdown = !showDropdown;
    }

    function selectMint(mint: { name: any; mint?: string; img?: string; }) {
    selectedMint.set(mint.name);
    selectedLogo = mint.img;
    toggleDropdown();
    }

    async function createStore() {
        
        if(BigNumber($pmtAmt.replace(",", "")) > BigNumber(0)) {
            localStorage.setItem('selectedMint', $selectedMint);
            localStorage.setItem('pmtAmt', $pmtAmt);
            localStorage.removeItem('reference');
            let publicKeyStore = localStorage.getItem('publicKey');
            if (publicKeyStore !== null) {
                publicKey.set(publicKeyStore);
            }
            // Replace YOUR_TOKEN with your Project Token
            mixpanel.init('0daa20bc6454804716cd560d090453a0', {debug: true}); 
            mixpanel.identify($publicKey,"","","","","","","");
            mixpanel.track('Création paiement');

            goto('/payment', { state: { foo: 'bar' } });
            error = false;
        }
        else {
            error = true;
        }
    }
    const onKeydown = (event) => {
       
        if (event.detail == "<") {
            if (!decimalsActive) {
                left = left.slice(0, -1)
            }
            else {
                right = right.slice(0, -1)
                if (right == "") {
                    decimalsActive = false
                }

                
            }
            
        }
        else if (event.detail == ".") {
            decimalsActive = true
        }
        else {
            if (!decimalsActive) {
                left += event.detail
            }
            else {

                right.length < 7? right += event.detail : ""
            }
           
        }
        if (right.length > 2){
            $pmtAmt = Number(left.toString()+"."+right.toString()).toFixed(7)
        }
        else {
            $pmtAmt = Number(left.toString()+"."+right.toString()).toFixed(2)
        }
        if (left == "") {
            $pmtAmt = Number("0").toFixed(2)
       
        }
        $pmtAmt = parseFloat( $pmtAmt ).toLocaleString("en", {minimumFractionDigits:2, maximumFractionDigits: 4 })
        //console.log(parseFloat( $pmtAmt ).toLocaleString("en", { maximumFractionDigits: 4 }))
    }
</script>
    <div class="card w-96 h-max w-min-fit bg-[var(--secondary-color)] shadow border">
        <div class="card-body px-6 pb-4 text-center">
            <h1 class="align-center justify-center text-xl font-greycliffbold -mt-5 pb-1 text-transparent bg-clip-text bg-[var(--background-color)]">Entrez le montant à payer</h1>
            <div class="flex items-center justify-center">

                <div class="dropdown-container">
                    <button on:click={toggleDropdown} class="button-icon">
                      <img class="w-11 img-icon" src={selectedLogo} alt="Selected Mint Image" />
                    </button>
                    <div class="custom-dropdown" style="display: {showDropdown ? 'block' : 'none'}">
                      {#each $mints as mint}
                        <div class="dropdown-item" on:click={() => selectMint(mint)}>
                          <img class="dropdown-item-image" src={mint.img} alt={mint.name} />
                          <span class="dropdown-item-name text-black">{mint.name}</span>
                        </div>
                      {/each}
                    </div>
                  </div>
                  <div class="overlay" style="display: {showDropdown ? 'block' : 'none'}"></div>
            <input bind:value={$pmtAmt} type="number"  class="w-60 h-fit rounded-lg ml-4 justify-center text-3xl text-center input border-[#808080] w-full max-w-lg text-[var(--background-color)] placeholder:text-2xl"  placeholder="Montant en ${$selectedMint}" />
        </div>
        </div>


        <Keyboard custom="{keys}" on:keydown="{onKeydown}"
        --height="4rem"
        --background="white"
        --color="black"
        --border-radius="0.5rem"
        --border="solid 1px #808080"
        --box-shadow="none"
        --flex="1"
        --font-family="sans-serif"
        --font-size="26px"
        --font-weight="normal"
        --margin="0.225rem"
        --min-width="2rem"
        --opacity="1"
        --text-transform="none"
        --active-background="var(--primary-color)"
        --active-color="var(--background-color)"
        --active-opacity="1"
        --active-transform="none"
        />
    </div>
    <div class="indicator justify-items-center place-self-center">
        <div class="text-red-500">
            {#if error}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
            <span>Montant invalide, veuillez ressaisir.</span>
            {/if}
        </div>
    </div>
    <div class="grid grid-flow-row justify-center md:pb-16">
        <div class="indicator justify-items-center place-self-center">
            <div class="">
                <button on:click={createStore} class="btn normal-case btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                    </svg>
                    
                
                <span class="pl-2">Générer le QR</span></button>
            </div>
        </div>

    </div>