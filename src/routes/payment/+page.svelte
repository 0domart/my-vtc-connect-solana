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
import QRCodeStyling from '@solana/qr-code-styling'
import BigNumber from 'bignumber.js';
import InlineSVG from 'svelte-inline-svg'
import card_svg from './card.svg'
import bonkLogo from "../../lib/images/BonkLogo.png"
import solLogo from "../../lib/images/solanaLogoMark.png"
import dustLogo from "../../lib/images/dustLogo.svg"
import mvcLogo from "../../lib/images/mvcLogo.png"
import rainLogo from "../../lib/images/rainLogo.png"
import foxyLogo from "../../lib/images/foxyLogo.webp"

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
let currentMint: { name: string, mint: string }[] = [];
let splToken: web3.PublicKey | null = null;
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
    let selectedMintStore = localStorage.getItem('selectedMint');

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

    if (selectedMintStore !== null) {
        selectedMint.set(selectedMintStore);
    }

    let recipient = new web3.PublicKey($publicKey)
    currentMint = $mints.filter(item => item.name == $selectedMint)
    splToken = new web3.PublicKey(currentMint[0].mint);

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
        if(splToken){
            url = ($publicKey) ? encodeURL({
            recipient,
            splToken,
            amount,
            reference,
            label,
            message,
            memo
        }) : null;
        }
    }

    try {
        qrCode = createQR(url, 360, 'white');
        qrCode._options.image = mvcLogo;
        qrCode._options.cornersDotOptions.color = "#deb320";
        qrCode._options.cornersSquareOptions.color = "#deb320";
        // qrCode2 = qrCode._svg.innerHTML
        const element = document.getElementById('qr-code');
        qrCode.append(element);
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
    clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearInterval(interval)

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
    <div class="grid grid-flow-row justify-center gap-3">
        <div class="self-center flex items-center justify-center">
        {#if $pmtAmt && currentMint.length > 0 && currentMint[0].name}
        <span class="flex-shrink-0 flex justify-center font-greycliffbold text-4xl text-center text-transparent bg-clip-text bg-[var(--secondary-color)]">{ $pmtAmt }</span>
        <span class="flex-shrink-0 pl-2 flex items-center justify-center">
            {#if currentMint[0].name == "USDC"}
            <svg class="w-11" xmlns="http://www.w3.org/2000/svg" data-name="86977684-12db-4850-8f30-233a7c267d11" viewBox="0 0 2000 2000">
                <path d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z" fill="#2775ca"/>
                <path d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z" fill="#fff"/>
                <path d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z" fill="#fff"/>
            </svg>
            
            {:else if currentMint[0].name == "SOL"}
                <img src={solLogo} class="w-11" />
            {:else if currentMint[0].name == "BONK"}
                <img src={bonkLogo} class="w-11" />
            {:else if currentMint[0].name == "MVC"}
                <img src={mvcLogo} class="w-11 bg-white rounded-full" />
            {:else if currentMint[0].name == "RAIN"}
                <img src={rainLogo} class="w-11" />
            {:else if currentMint[0].name == "DUST"}
                <img src={dustLogo} class="w-11" />
            {:else if currentMint[0].name == "FOXY"}
                <img src={foxyLogo} class="w-11" />
            {/if}
        </span>
        {/if}
        </div>
        <div class="pt-6 h-96" id="qr-code" >
            <qrCode/>
                </div>
                </div>
                </div>
                <div class="grid grid-flow-row justify-center pt-10 gap-3">
                    <div class="indicator justify-items-center place-self-center">
                        <div class="">
                            {#if !txnConfirmed}
                            <span class="text-[var(--primary-color)]">
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
                    <div class="grid grid-flow-row justify-center items-center pb-20">
                        <button on:click={refresh} class="btn normal-case w-80 btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="inline w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v4m0 0v4m0-4h4m-4 0H8" />
                            <path d="M20.25 12C19.561 6.927 15.073 3 10 3S.438 6.927.75 12H3m2 0h4m4 0h4M3 12h1m1 0h4m4 0h1M9 16l2 2 2-2M12 2v4" />
                        </svg>
                        <span class="pl-2">{txnConfirmed? "Retour" : "Rafraîchir la transaction"}</span></button>
                    </div>
                </div>
