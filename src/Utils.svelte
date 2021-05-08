<script>
    let innerWidth;
    let innerHeight;

    import { sudoku } from './stores'

    const logClick = () => {
        console.log($sudoku)
    }

    const updateClick = () => {
        sudoku.updateCandidates()
    }
</script>

<style>
    div {
        position: fixed;
        left: 0;
        top: 0;
        margin: 5px;
        display: flex;
        flex-direction: column;
    }
</style>

<svelte:window bind:innerWidth bind:innerHeight />

<div>
    <p>{innerWidth} x {innerHeight}</p>
    <button on:click={logClick}>Log grid</button>
    <button on:click={updateClick}>Update Candidates</button>
</div>