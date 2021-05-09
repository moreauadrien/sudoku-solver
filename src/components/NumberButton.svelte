<script>
    export let value

    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()

    const handleClick = () => {
        dispatch('numberInput', {
            value,
        })
    }
</script>

<style>
    div {
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid rgba(136, 136, 136, 0.2);
        transition: box-shadow .1s;
    }

    div:hover {
        box-shadow: 0px 5px 15px rgb(0, 0, 0, .2);
    }

    span {
        text-align: center;
        color: white;
        font-size: 20px;
        font-family: Arial;
        font-weight: 500;
        cursor: default;
    }
</style>


<div on:click={handleClick}>
    <span>{value}</span>
</div>

