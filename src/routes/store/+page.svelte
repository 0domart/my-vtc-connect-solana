<script lang='ts'>
    import { onMount, onDestroy } from "svelte";
    import * as web3 from '@solana/web3.js';
    import CreateCharge from "./CreateCharge.svelte";
    import Settings from "./Settings.svelte";
    import Transactions from "./Transactions.svelte";

    let cnx;
  

    let activeTab = 1;

    onMount(async () => {
        
        let sol_rpc = process.env.SOLANA_RPC? process.env.SOLANA_RPC : "https://solana-mainnet.g.alchemy.com/v2/WGBoK0YbGQZUASSAYCbCb1MNvP_oUwIu";
        cnx = new web3.Connection(sol_rpc);
       

        
    })
    onDestroy(async ()=> {
        //document.body.setAttribute('tabindex', '-1');
       
    })

  

</script>

<div class="grid grid-flow-row justify-center gap-4">

    <div class="tabs tabs-boxed justify-items-center place-self-center">
            {#if activeTab == 1}
            <a class="tab bg-[var(--primary-color)] text-[#FFFFFF] rounded-lg" on:click={()=>(activeTab=1)}>Créer un paiement</a> 
            <a class="tab " on:click={()=>(activeTab=2)}>Historique</a> 
            <a class="tab " on:click={()=>(activeTab=3)}>Paramètres</a> 
        {:else if activeTab == 2}
            <a class="tab " on:click={()=>(activeTab=1)}>Créer un paiement</a> 
            <a class="tab text-[#FFFFFF] bg-[var(--primary-color)] rounded-lg" on:click={()=>(activeTab=2)}>Historique</a> 
            <a class="tab " on:click={()=>(activeTab=3)}>Paramètres</a> 
        {:else if activeTab == 3}
            <a class="tab " on:click={()=>(activeTab=1)}>Créer un paiement</a> 
            <a class="tab " on:click={()=>(activeTab=2)}>Historique</a> 
            <a class="tab text-[#FFFFFF] bg-[var(--primary-color)] rounded-lg" on:click={()=>(activeTab=3)}>Paramètres</a> 
        
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
