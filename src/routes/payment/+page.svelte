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
    showWarning,
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
import QRCodeStyling from '@solana/qr-code-styling'
import BigNumber from 'bignumber.js';
import InlineSVG from 'svelte-inline-svg'
import card_svg from './card.svg'

let cnx;
let keyboardRef = null;
let qrCode
let qrCode2
let qrRef = null
let svg_container;
let txnConfirmed = false
let duration = 5000
let timeout1: string | number | NodeJS.Timeout | undefined;
let timeout2: string | number | NodeJS.Timeout | undefined;
let timeout3: string | number | NodeJS.Timeout | undefined;
let interval: string | number | NodeJS.Timeout | undefined;
//const element = document.getElementById('qr-code');

let sol_rpc = process.env.SOLANA_RPC ? process.env.SOLANA_RPC : "https://solana-mainnet.g.alchemy.com/v2/WGBoK0YbGQZUASSAYCbCb1MNvP_oUwIu";
let connection = new web3.Connection(sol_rpc);
let currentMint = $mints.filter(item => item.name == $selectedMint)
console.log("currentMint", currentMint);
let splToken = new web3.PublicKey(currentMint[0].mint);
console.log("splToken", splToken);
const reference = web3.Keypair.generate().publicKey;
let storeText = $storeName ? $storeName : "Boutique"
let label = 'Payement à ' + storeText
const message = 'Merci pour votre payement !';
const memo = 'solana.pay';

const unique = (value, index, self) => {
    return self.indexOf(value) === index
}

onMount(async () => {

    let publicKeyStore = localStorage.getItem('publicKey');
    let storeNameStore = localStorage.getItem('storeName');
    let successArrayStore = localStorage.getItem('successArray');
    let mostRecentTxnStore = localStorage.getItem('mostRecentTxn');
    let pmtAmtStore = localStorage.getItem('pmtAmt');

    if (pmtAmtStore !== null) {
        pmtAmt.set(pmtAmtStore);
    }

    if (publicKeyStore !== null) {
        publicKey.set(publicKeyStore);
    }

    if (publicKeyStore !== null) {
        publicKey.set(publicKeyStore);
    }

    if (storeNameStore !== null) {
        storeName.set(storeNameStore);
        storeText = storeNameStore;
        label = 'Payement à ' + storeText;
    }

    if (successArrayStore !== null) {
        successArray.set(JSON.parse(successArrayStore));
    }

    if (mostRecentTxnStore !== null) {
        mostRecentTxn.set(mostRecentTxnStore);
    }

    let recipient = new web3.PublicKey($publicKey)

    let amount = new BigNumber($pmtAmt);
    let url = null;
    if (currentMint[0].name == "SOL") {
        url = ($publicKey) ? encodeURL({
            recipient,
            amount,
            reference,
            label,
            message,
            memo
        }) : null;
    } else {
        url = ($publicKey) ? encodeURL({
            recipient,
            amount,
            splToken,
            reference,
            label,
            message,
            memo
        }) : null;
    }

    try {
        qrCode = createQR(url, 360, 'white')
        // qrCode2 = qrCode._svg.innerHTML
        const element = document.getElementById('qr-code');
        qrCode.append(element);
        console.log(qrCode)
        //console.log(await qrCode.getRawData())
        //()
    } catch (e) {
        // qrCode = null
        qrCode._svg = ""
        console.log("error making QR ", e)

    }

    timeout1 = setTimeout(() => {
        clearInterval(interval);
        duration = 20000;
        startInterval();
    }, 120000);

    timeout2 = setTimeout(() => {
        clearInterval(interval);
        duration = 30000;
        startInterval();
    }, 300000);

    timeout3 = setTimeout(() => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearInterval(interval)
    }, 1000000);

    startInterval();

    //qrCode2 =decodeURIComponent(qrCode.toString()).replace('data:image/svg+xml,', '')

})
onDestroy(async () => {
    //document.body.setAttribute('tabindex', '-1');
    // <img src={qrCode._qr.createDataURL()}/>
    // <svg width=512 height=512 viewBox="-1 -1 2 2" bind:this={qrCode}/>
})
async function cancel() {
    goto('/store', {
        state: {
            foo: 'bar'
        }
    });
}

function refresh() {

    checkTransactionDone();

    clearTimeout(timeout1);
    clearTimeout(timeout2);
    clearTimeout(timeout3);

    timeout1 = setTimeout(() => {
        clearInterval(interval);
        duration = 15000;
        startInterval();
    }, 120000);

    timeout2 = setTimeout(() => {
        clearInterval(interval);
        duration = 100000;
        startInterval();
    }, 300000);

    timeout3 = setTimeout(() => {
        clearInterval(interval);
        duration = 200000;
        startInterval();
    }, 1000000);
}

function startInterval() {
    interval = setInterval(async () => {
        checkTransactionDone()
    }, duration)
    return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearInterval(interval)
    }
}

async function checkTransactionDone() {
    try {
        // Check if there is any transaction for the reference
        let untilTxn = undefined
        if ($mostRecentTxn != "") {
            untilTxn = $mostRecentTxn
        }
        const signatureInfo = await findReference(connection, reference, {
            until: untilTxn
        });
        if (signatureInfo.confirmationStatus == "finalized" || signatureInfo.confirmationStatus == "confirmed") {
            console.log("Transaction confirmée !");
            txnConfirmed = true
            let confirmedTxn = await connection.getParsedTransaction(signatureInfo.signature)
            if (confirmedTxn) {
                let token = localStorage.getItem("selectedMint");
                var new_entry = {
                    "timestamp": confirmedTxn.blockTime,
                    "txid": confirmedTxn.transaction.signatures[0],
                    "uiAmount": confirmedTxn.transaction.message.instructions[1].parsed.info.tokenAmount.uiAmount,
                    "uiToken": token ? token : ''
                }
                //item.transaction.message.accountKeys.flatMap(k => k.pubkey.toBase58())
                if (!$successArray.flatMap(k => k.txid).includes(new_entry.txid)) {
                    $successArray.push(new_entry)
                }
            }

            $successArray = $successArray.filter(unique)
            $successArray = $successArray
            $mostRecentTxn = signatureInfo.signature;

            localStorage.setItem('successArray', JSON.stringify($successArray)); // Store successArray in localStorage
            localStorage.setItem('mostRecentTxn', $mostRecentTxn); // Store mostRecentTxn in localStorage

            clearTimeout(timeout1);
            clearTimeout(timeout2);
            clearTimeout(timeout3);
            clearInterval(interval)

            return
        }
        //notify({ type: 'success', message: 'Transaction confirmed', txid: signatureInfo.signature });

    } catch (e) {
        if (e instanceof FindReferenceError) {
            // No transaction found yet, ignore this error
            return;
        }
        console.error('Unknown error', e)
    }
}
</script>

<div class="grid grid-flow-row justify-center gap-4">
    <div class="grid grid-flow-row justify-center pt-2 gap-3">
        <h1 class="sm:pt-3 font-greycliffbold text-4xl text-center text-transparent bg-clip-text bg-[var(--primary-color)]">
            {$storeName}</h1>
        {#if $pmtAmt && currentMint[0].name}
        <p class="sm:pt-3 font-greycliffbold text-4xl text-center text-transparent bg-clip-text bg-[var(--primary-color)]">{ $pmtAmt } {currentMint[0].name}</p>
        {/if}
        <div class="pt-6 h-96" id="qr-code" >
            <qrCode/>
                </div>
                </div>
                </div>
                <div class="grid grid-flow-row justify-center pt-10 gap-3">
                    <div class="indicator justify-items-center place-self-center">
                        <div class="">
                            {#if !txnConfirmed}
                            <span class="text-purple-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                En attente de validation de paiement</span>
                            {:else}
                            <span class="text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Transaction validée ! Merci pour votre payement</span>
                            {/if}
                        </div>
                    </div>
                </div>
                <div class="grid grid-flow-row justify-center items-center pt-4 pb-4">
                    <div class="grid grid-flow-row justify-center items-center pb-4">
                        <button on:click={cancel} class="btn normal-case w-80 btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-6 h-6 ">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                        <span class="pl-2">{txnConfirmed? "Retour" : "Annuler"}</span></button>
                    </div>
                    <div class="grid grid-flow-row justify-center items-center">
                        <button on:click={refresh} class="btn normal-case w-80 btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="inline w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v4m0 0v4m0-4h4m-4 0H8" />
                            <path d="M20.25 12C19.561 6.927 15.073 3 10 3S.438 6.927.75 12H3m2 0h4m4 0h4M3 12h1m1 0h4m4 0h1M9 16l2 2 2-2M12 2v4" />
                        </svg>
                        <span class="pl-2">{txnConfirmed? "Retour" : "Rafraîchir la transaction"}</span></button>
                    </div>
                </div>
                {#if $showWarning}
                <div class="grid grid-flow-row justify-center pb-16">
                    <div class="indicator justify-items-center place-self-center">
                        <div class="text-orange-500">

                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                            </svg>
                            Cet appareil ne stocke aucune crypto-monnaie.
                        </div>
                    </div>
                </div>
                {/if}
