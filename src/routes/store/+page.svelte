<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import * as web3 from '@solana/web3.js';
    import { storeName, publicKey, pmtAmt,  } from '../stores.js';

	import { Focus } from "focus-svelte";
    import { goto } from '$app/navigation';
    import CreateCharge from "./CreateCharge.svelte";
    import Settings from "./Settings.svelte";
    import Transactions from "./Transactions.svelte";

    let cnx;
  

    let activeTab = 1;

    onMount(async () => {
        
        let sol_rpc = process.env.SOLANA_RPC? process.env.SOLANA_RPC : "https://api.mainnet-beta.solana.com";
        cnx = new web3.Connection(sol_rpc);
       

        
    })
    onDestroy(async ()=> {
        //document.body.setAttribute('tabindex', '-1');
       
    })

  

</script>

<div class="grid grid-flow-row justify-center gap-4">
    <h1 class="sm:pt-3 pt-1 font-greycliffbold text-4xl text-center text-transparent bg-clip-text bg-gradient-to-br from-[#20BF55] to-[#01BAEF]">
        {$storeName}</h1>

    <div class="tabs tabs-boxed justify-items-center place-self-center">
    
        {#if activeTab == 1}
            <a class="tab text-[#FFFFFF] bg-gradient-to-br from-[#20BF55] to-[#01BAEF] rounded-lg" on:click={()=>(activeTab=1)}>Create Charge</a> 
            <a class="tab " on:click={()=>(activeTab=2)}>Transactions</a> 
            <a class="tab " on:click={()=>(activeTab=3)}>Settings</a> 
        {:else if activeTab == 2}
            <a class="tab " on:click={()=>(activeTab=1)}>Create Charge</a> 
            <a class="tab text-[#FFFFFF] bg-gradient-to-br from-[#20BF55] to-[#01BAEF] rounded-lg" on:click={()=>(activeTab=2)}>Transactions</a> 
            <a class="tab " on:click={()=>(activeTab=3)}>Settings</a> 
        {:else if activeTab == 3}
            <a class="tab " on:click={()=>(activeTab=1)}>Create Charge</a> 
            <a class="tab " on:click={()=>(activeTab=2)}>Transactions</a> 
            <a class="tab text-[#FFFFFF] bg-gradient-to-br from-[#20BF55] to-[#01BAEF] rounded-lg" on:click={()=>(activeTab=3)}>Settings</a> 
        
        {/if}
        
    </div>


    {#if activeTab == 1}
        <CreateCharge/>
    {:else if activeTab == 2}
        <Transactions/>
    {:else if activeTab == 3}
        <Settings/>
    {/if}
</div>

<div class="flex justify-center flex-row pt-2">
    <footer class="footer footer-center p-2 text-base-content rounded-md">
        
        <div class="items-center ">

            <span class=" text-sm ">Odomart © 2023</span>
            </div>
    
    </footer>
</div>
