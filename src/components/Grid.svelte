<script>
    import Cell from "./Cell.svelte"
    import { sudoku } from "../stores.js"
</script>

<style>
    div {
        --size: 450px;
        background-color: white;
        width: var(--size);
        height: var(--size);
        box-shadow: -8px 8px 8px rgba(93, 104, 107, 0.3);
        display: grid;
        grid-template-columns: repeat(9, calc(var(--size) / 9));
        grid-template-rows: repeat(9, calc(var(--size) / 9));
    }
</style>

<div>
    {#each $sudoku as cell}
        <Cell index={cell.index} value={cell.value}/>
    {/each}
</div>
