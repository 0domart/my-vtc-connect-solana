<script lang='ts'>
    import { onMount } from "svelte";
    import * as web3 from '@solana/web3.js';
    import { storeName, publicKey } from './stores.js';

    let cnx;

    onMount(async () => {
        
        let sol_rpc = process.env.SOLANA_RPC? process.env.SOLANA_RPC : "https://solana-mainnet.g.alchemy.com/v2/WGBoK0YbGQZUASSAYCbCb1MNvP_oUwIu";
        cnx = new web3.Connection(sol_rpc);       
       
    })

</script>

<div class="grid grid-flow-row justify-center">
    <h1 class="sm:pt-3 pt-1 font-greycliffbold text-4xl text-center text-[#0D7071] ">
        $storeName
    </h1>
</div>
