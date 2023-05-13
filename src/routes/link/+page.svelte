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
} from "@solana/pay"
import {
    storeName,
    publicKey,
    pmtAmt,
    mostRecentTxn,
    successArray,
    mints,
    selectedMint
} from '../stores.js';
import * as KioskBoard from 'kioskboard';
import englishKeypbad from "../../keyboards/kioskboard-keys-english.json"
import {
    Focus
} from "focus-svelte";
import {
    goto
} from '$app/navigation';
import BigNumber from 'bignumber.js';
import InlineSVG from 'svelte-inline-svg'
import card_svg from './card.svg'

let sol_rpc = process.env.SOLANA_RPC ? process.env.SOLANA_RPC : "https://solana-mainnet.g.alchemy.com/v2/WGBoK0YbGQZUASSAYCbCb1MNvP_oUwIu";
let connection = new web3.Connection(sol_rpc);
const reference = web3.Keypair.generate().publicKey;
let storeText = $storeName ? $storeName : "Boutique"
let label = 'Paiement à ' + storeText
const message = 'Merci pour votre paiement !';
const memo = 'solana.pay';
let walletAddress : string | null = null;
let amount = 0;
let token : string | null = null;
let token2 : string | null = null;

const unique = (value, index, self) => {
    return self.indexOf(value) === index
}

onMount(async () => {

    const urlParams = new URLSearchParams(window.location.href);
    var parsedUrl = new URL(window.location.href)
    token2 = parsedUrl.searchParams.get('wallet')
    walletAddress = urlParams.get('wallet');
    let am = Number(urlParams.get('montant'));
    if(am){
        amount = am;
    }
    token = urlParams.get('token');

    let publicKeyStore = localStorage.getItem('publicKey');
    let storeNameStore = localStorage.getItem('storeName');
    let successArrayStore = localStorage.getItem('successArray');
    let mostRecentTxnStore = localStorage.getItem('mostRecentTxn');

    if (publicKeyStore !== null) {
        publicKey.set(publicKeyStore);
    }

    if (storeNameStore !== null) {
        storeName.set(storeNameStore);
        storeText = storeNameStore;
        label = 'Paiement à ' + storeText;
    }

    if (successArrayStore !== null) {
        successArray.set(JSON.parse(successArrayStore));
    }

    if (mostRecentTxnStore !== null) {
        mostRecentTxn.set(mostRecentTxnStore);
    }

    let recipient = new web3.PublicKey($publicKey)

    //let amount = new BigNumber($pmtAmt);

})
async function goPay() {

    /*const urlParams = new URLSearchParams(window.location.search);
    let walletAddress = urlParams.get('wallet');
    let amount = Number(urlParams.get('montant'));
    let token = urlParams.get('token');
    console.log("amount", amount);
    let currentMint = $mints.filter(item => item.name == token)
    console.log("currentMint", currentMint);
    let splToken = new web3.PublicKey(currentMint[0].mint);

    let url2 = "solana:"
        + walletAddress
        + "?amount="
        + amount
        + "&spl-token="
        + splToken
        + "&reference=" 
        + reference
        + "&label=paiement+%C3%A0+MY+VTC+Connect&message=Merci+pour+votre+paiement+%21";
        let url = "solana:G6CQw1w5FkcmMCSxf4NNZYLRXMbx355d5pZXqrcsdiZV?amount=0.01&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&reference=H2Z2RaBUdcWYViRmgTozrKT71U4ibQwAztuPBcUAaA1g&label=paiement+%C3%A0+MY+VTC+Connect&message=Merci+pour+votre+paiement+%21"
        */
    //console.log(url);

    goto("solana:3ZyLUrtP8m2JT9Lkwqic3xSjev4ZFMtimfBgZUs7KSRQ?amount=1&spl-token=DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263&reference=9omA1ufnfMxMwKjHZQmg6zbaMLX6hzM72QWxCgUqnQbm&label=Payment+to+a&message=Thank+you+for+your+payment%21&memo=rippy.xyz", {
        state: {
            foo: 'bar'
        }
    });
}
</script>

<div class="grid grid-flow-row justify-center gap-4">
    <div class="grid grid-flow-row justify-center pt-2 gap-3">
        <h1 class="sm:pt-3 font-greycliffbold text-4xl text-center text-transparent bg-clip-text bg-[var(--primary-color)]">
            {$storeName}</h1>
    </div>
    <p>HELLO</p>
    <p>amount -> {amount}</p>
    <p>walletAddress -> {walletAddress}</p>
    <p>token -> {token}</p>
    <p>token2 -> {token2}</p>
    <div class="grid grid-flow-row justify-center pt-4 pb-16">
        <div class="indicator justify-items-center place-self-center gap-10">
            <div class="">
                <button on:click={goPay} class="btn normal-case btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-6 h-6 ">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13h-1v4.75c0 .413.337.75.75.75s.75-.337.75-.75V7zm0 6.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z" />
                </svg>
                <span class="pl-2">Payer</span></button>
            </div>
        </div>
    </div>
</div>
