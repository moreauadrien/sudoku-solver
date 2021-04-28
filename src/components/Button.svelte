<style>
    div {
        width: 35px;
        height: 35px;
        background-color: white;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        display: flex;
        justify-content: center;
        align-items: center;
        
    }
</style>

<script>
    export let value;

    import { currentFocus, sudoku, setValue } from '../stores.js';
    import Erase from '../icons/Erase.svelte';

    const handleClick = () => {
        if($currentFocus == undefined) return;


        setValue($currentFocus, value == 'erase' ? undefined : parseInt(value));

    }
</script>

<div on:click={handleClick}>

    {#if value=='erase'}
        <Erase width={25} height={25} color='black'/>
    {:else}
        <span>{value}</span>
    {/if}
    
</div>