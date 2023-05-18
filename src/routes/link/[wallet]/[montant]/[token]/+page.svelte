<script lang="ts">
import {
    onMount,
    onDestroy,
} from "svelte";
import * as web3 from '@solana/web3.js';
import {
    createQR,
    encodeURL,
    findReference,
    FindReferenceError
} from "@solana/pay";
import BigNumber from 'bignumber.js';
import {
    storeName,
    publicKey,
    pmtAmt,
    mostRecentTxn,
    successArray,
    mints,
    selectedMint
} from '../../../../stores.js';
import {
    goto
} from '$app/navigation';
import Decimal from 'decimal.js';

let sol_rpc = process.env.SOLANA_RPC ? process.env.SOLANA_RPC : "https://solana-mainnet.g.alchemy.com/v2/WGBoK0YbGQZUASSAYCbCb1MNvP_oUwIu";
export let data;
console.log("data", data);
let walletAddress: web3.PublicKey | null = null;
let amount = "";
let token: string | null = null;
let tipAmount : number = 0;
let url: string = "";
let currentMint: {
    name: string,
    mint: string,
    img: string
} [] = [];
let splToken: web3.PublicKey | null = null;

onMount(async () => {
    url = window.location.href;
    const urlParts = url.split('/');
    let wallet = urlParts[urlParts.length - 3];
    amount = urlParts[urlParts.length - 2];
    token = urlParts[urlParts.length - 1];

    currentMint = $mints.filter(item => item.name == token)
    splToken = new web3.PublicKey(currentMint[0].mint);

    console.log(wallet); // "G6CQw1w5FkcmMCSxf4NNZYLRXMbx355d5pZXqrcsdiZV"
    console.log(amount); // "2"
    console.log(token); // "USDC"

    walletAddress = new web3.PublicKey(wallet);
})

async function goPay() {
    let somme = BigNumber(Number(Number(amount).toFixed(7)) + Number(Number(tipAmount).toFixed(7)));
    let urlToPay = "solana:" +
        walletAddress +
        "?amount=" +
        somme +
        "&spl-token=" +
        splToken +
        "&label=Paiement+%C3%A0+MY+VTC+Connect&message=Merci+pour+votre+paiement+%21";

    goto(urlToPay);
}

function limitDecimals(event: Event | undefined, maxDecimals: number | undefined) {
    const input = event.target;
  const value = input.value;

  const decimalCount = (value.split('.')[1] || '').length;
  if (decimalCount > 7) {
    input.value = parseFloat(value).toFixed(6);
  }
}

</script>

<div class="grid grid-flow-row justify-center gap-4">
    <div class="grid grid-flow-row justify-center gap-3 pt-10">
        <div class="self-center flex items-center justify-center">
            {#if amount && currentMint.length > 0 && currentMint[0].name}
            <span class="flex-shrink-0 flex justify-center font-greycliffbold text-4xl text-center text-transparent bg-clip-text bg-[var(--secondary-color)]">{((Number(amount) * 1000000) + (Number(tipAmount) * 1000000)) / (Number(amount) % 1 !== 0 || Number(tipAmount) % 1 !== 0 ? Number(Number(1000000).toFixed(7)) : 1000000)}
            </span>
            <span class="flex-shrink-0 pl-3 flex items-center justify-center">
                <img src={currentMint[0].img } class="w-11" />
            </span>
            {/if}
        </div>
    </div>
    <div class="grid grid-flow-row justify-center pt-4 pb-6">
        <div class="indicator justify-items-center place-self-center gap-10">
            <div class="">
                <button on:click={goPay} class="btn normal-case btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-6 h-6 ">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13h-1v4.75c0 .413.337.75.75.75s.75-.337.75-.75V7zm0 6.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                </svg>
                <span class="pl-2">Payer</span></button>
            </div>
        </div>
    </div>
    <div class="grid grid-flow-row justify-center pt-4 pb-40">
        <div class="indicator justify-items-center place-self-center gap-10">
            <div class="">
                <span class="pr-4 text-lg">Ajouter un pourboire ?</span>
                <input on:input={() => limitDecimals(event, 7)} type="number" min="0" step="0.25" bind:value={tipAmount} class="border text-center border-gray-300 rounded px-3 py-2 w-28 text-lg text-black" placeholder="Ajouter un pourboire" />
            </div>
        </div>
    </div>
</div>
