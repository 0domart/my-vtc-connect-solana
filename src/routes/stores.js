import { writable } from 'svelte/store';

export const storeName = writable("");
export const publicKey = writable();
export const pmtAmt = writable();
export const mostRecentTxn = writable("");
export const fullScreen = writable(false);
export let successArray = writable([]);
export const mints = writable([
    {name:"USDC", mint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"},
    {name:"SOL", mint:"ASTkbpe5ckW1mx6WDLE9zPScWsYjSh6h5zQ89UYoUQ7D"},
    {name:"MVC", mint:"AFd3p9mwTS9MxLcByyDAs6h4HBepY3n8vBDHvrMorrmK"},
    {name:"BONK", mint:"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"},
    {name:"RAIN", mint:"rainH85N1vCoerCi4cQ3w6mCf7oYUdrsTFtFzpaRwjL"},
    {name:"DUST", mint:"DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ"},
    {name:"FOXY", mint:"FoXyMu5xwXre7zEoSvzViRk3nGawHUp9kUh97y2NDhcq"},
])
export const selectedMint = writable("USDC");