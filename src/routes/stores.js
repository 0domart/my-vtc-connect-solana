import { writable } from 'svelte/store';
import usdcLogo from "../lib/images/usdcLogo.svg"
import bonkLogo from "../lib/images/BonkLogo.png"
import solLogo from "../lib/images/solanaLogoMark.png"
import dustLogo from "../lib/images/dustLogo.svg"
import mvcLogo from "../lib/images/mvcLogo.png"
import rainLogo from "../lib/images/rainLogo.png"
import foxyLogo from "../lib/images/foxyLogo.webp"

export const storeName = writable("");
export const publicKey = writable();
export const pmtAmt = writable();
export const mostRecentTxn = writable("");
export const fullScreen = writable(false);
export let successArray = writable([]);


export const companyName = writable("");

export const mints = writable([
    {name:"USDC", mint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", img:usdcLogo},
    {name:"SOL", mint:"ASTkbpe5ckW1mx6WDLE9zPScWsYjSh6h5zQ89UYoUQ7D", img:solLogo},
    {name:"MVC", mint:"AFd3p9mwTS9MxLcByyDAs6h4HBepY3n8vBDHvrMorrmK", img:mvcLogo},
    {name:"BONK", mint:"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", img:bonkLogo},
    {name:"RAIN", mint:"rainH85N1vCoerCi4cQ3w6mCf7oYUdrsTFtFzpaRwjL", img:rainLogo},
    {name:"DUST", mint:"DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ", img:dustLogo},
    {name:"FOXY", mint:"FoXyMu5xwXre7zEoSvzViRk3nGawHUp9kUh97y2NDhcq", img:foxyLogo},
])
export const selectedMint = writable("USDC");