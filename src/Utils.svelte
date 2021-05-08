<script>
    let innerWidth;
    let innerHeight;

    import { sudoku } from './stores'

    const handleClick = () => {
        console.log($sudoku);
    }
</script>

<style>
    div {
        position: fixed;
        left: 0;
        top: 0;
        margin: 5px;
    }
</style>

<svelte:window bind:innerWidth bind:innerHeight />

<div>
    <p>{innerWidth} x {innerHeight}</p>
    <button on:click={handleClick}>Log grid</button>
</div>