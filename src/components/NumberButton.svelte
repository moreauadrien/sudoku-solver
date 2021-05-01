<script>
    export let value;

    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    const handleClick = () => {
        dispatch('numberInput', {
            value
        });
    }
</script>

<style>
    div {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    span {
        text-align: center;
        color: white;
        font-size: 20px;
        font-family: Arial;
        font-weight: 500;
    }
</style>

<div on:click={handleClick}>
    <span>{value}</span>
</div>
