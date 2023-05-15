<script lang="ts">
import {
    onMount,
    onDestroy,
} from "svelte";
import * as web3 from '@solana/web3.js';
import {
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
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
import mixpanel from 'mixpanel-browser';

let qrCode
let txnConfirmed = false
let duration = 5000
let timeout1: string | number | NodeJS.Timeout | undefined;
let timeout2: string | number | NodeJS.Timeout | undefined;
let timeout3: string | number | NodeJS.Timeout | undefined;
let interval: string | number | NodeJS.Timeout | undefined;
//const element = document.getElementById('qr-code');

let sol_rpc = process.env.SOLANA_RPC ? process.env.SOLANA_RPC : "https://solana-mainnet.g.alchemy.com/v2/WGBoK0YbGQZUASSAYCbCb1MNvP_oUwIu";
let connection = new web3.Connection(sol_rpc);
let currentMint: { name: string, mint: string, img: string }[] = [];
let splToken: web3.PublicKey | null = null;
const reference = web3.Keypair.generate().publicKey;
let storeText = $storeName ? $storeName : "Boutique"
let label = 'Paiement à ' + storeText;
let recipient: web3.PublicKey | null = null;
const message = 'Merci pour votre paiement !';
const memo = 'solana.pay';
let amount = BigNumber(0);
let session = "";
let isShareSupported = false;
let url = 

const unique = (value, index, self) => {
    return self.indexOf(value) === index
}

async function handleShare() {
    try {
      await navigator.share({
        title: 'My VTC Connect',
        text: 'Voici le lien de paiement',
        url: "https://phantom.app/ul/browse/" + recipient + "/" + amount + "/" + splToken
      });
      console.log('Shared successfully!');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

onMount(async () => {

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
        isShareSupported = true;
    }

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

    if (selectedMintStore !== null) {
        selectedMint.set(selectedMintStore);
    }

    recipient = new web3.PublicKey($publicKey)
    currentMint = $mints.filter(item => item.name == $selectedMint)
    splToken = new web3.PublicKey(currentMint[0].mint);

    amount = new BigNumber($pmtAmt);
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
    console.log("url", url);

    let size = 330
    const mobileMediaQuery = window.matchMedia("(max-width: 850px)");
    if(mobileMediaQuery.matches){
        size = 230;
    }

    try {
        qrCode = createQR(url, size, 'white');
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
    signAndSendTransaction();
    
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

function copyTextToClipboard(text: string) {
  // Create a temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = text;

  // Append the textarea to the DOM
  document.body.appendChild(textarea);

  // Select the text within the textarea
  textarea.select();

  // Copy the selected text to the clipboard
  document.execCommand('copy');

  // Remove the temporary textarea
  document.body.removeChild(textarea);
}

function copyLink(){
    let urlLink = "https://phantom.app/ul/browse/" + recipient + "/" + amount + "/" + splToken;
    copyTextToClipboard(urlLink);
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
                console.log("La transaction est validée", confirmedTxn);
                let token = localStorage.getItem("selectedMint");
                var new_entry = {};
                var new_entry = {
                    "timestamp": confirmedTxn.blockTime,
                    "txid": confirmedTxn.transaction.signatures[0],
                    "uiToken": token ? token : ''
                };

                if(token == "SOL"){
                    new_entry.uiAmount = confirmedTxn.transaction.message.instructions[1].parsed.info.lamports / 1000000000;
                }
                else {
                    new_entry.uiAmount = confirmedTxn.transaction.message.instructions[1].parsed.info.tokenAmount.uiAmount
                }

                mixpanel.init('0daa20bc6454804716cd560d090453a0', {debug: true}); 
                mixpanel.identify($publicKey,"","","","","","","");
                mixpanel.track('Transaction valide', {
                    'receiveur addresse': $publicKey.toString(),
                    'transaction addresse': new_entry.txid.toString(),
                    'montant': new_entry.uiAmount.toString(),
                    'spl': token.toString(),
                });

                console.log("newEntry", new_entry)
                //item.transaction.message.accountKeys.flatMap(k => k.pubkey.toBase58())
                console.log("!$successArray.flatMap");
                if (!$successArray.flatMap(k => k.txid).includes(new_entry.txid)) {
                    console.log("INside");
                    $successArray.push(new_entry)
                }
            }

            $successArray = $successArray.filter(unique)
            $successArray = $successArray
            $mostRecentTxn = signatureInfo.signature;
            console.log("$successArray", $successArray);
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
            <img src={currentMint[0].img} class="w-11" />
        </span>
        {/if}
        </div>
        <div class="pt-6 h-62 md:h-92" id="qr-code" >
            <qrCode/>
                </div>
                </div>
                </div>
                <div class="grid grid-flow-row justify-center pt-6 md:pt-12 gap-3">
                    <div class="indicator justify-items-center place-self-center">
                        <div class="">
                            {#if !txnConfirmed}
                            <span class="text-[var(--primary-color)]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                En attente de validation du paiement</span>
                            {:else}
                            <span class="text-green-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Transaction validée ! Merci pour votre paiement</span>
                            {/if}
                        </div>
                    </div>
                </div>
                <div class="grid grid-flow-row justify-center items-center pt-4">
                    <div class="grid grid-flow-row justify-center items-center pb-4">
                        <button on:click={cancel} class="btn normal-case w-80 btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-6 h-6 ">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                        <span class="pl-2">{txnConfirmed? "Retour" : "Annuler"}</span></button>
                    </div>
                    <div class="grid grid-flow-row justify-center items-center pb-4">
                        {#if !txnConfirmed}
                        <button on:click={copyLink} class="btn normal-case w-80 btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-6 h-6 ">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 6H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-4M8 2h12a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2z" />
                        </svg>
                        <span class="pl-2">Copier le lien</span></button>
                        {/if}
                    </div>
                    <div class="grid grid-flow-row justify-center items-center pb-4">
                        {#if isShareSupported}
                        <button on:click={copyLink} class="btn normal-case w-80 btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-6 h-6 ">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8 6H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-4M8 2h12a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2z" />
                        </svg>
                        <span class="pl-2">Partager le lien</span></button>
                        {/if}
                    </div>
                    <div class="grid grid-flow-row justify-center items-center pb-2 md:pb-16">
                        {#if !txnConfirmed}
                        <button on:click={refresh} class="btn normal-case w-80 btn-lg bg-[var(--primary-color)] text-[var(--secondary-color)]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="inline w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v4m0 0v4m0-4h4m-4 0H8" />
                            <path d="M20.25 12C19.561 6.927 15.073 3 10 3S.438 6.927.75 12H3m2 0h4m4 0h4M3 12h1m1 0h4m4 0h1M9 16l2 2 2-2M12 2v4" />
                        </svg>
                        <span class="pl-2">{txnConfirmed? "Retour" : "Rafraîchir la transaction"}</span></button>
                        {/if}
                    </div>
                </div>
