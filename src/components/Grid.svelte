<style>
    div {
        --size: 550px;
        background-color: white;
        width: var(--size);
        height: var(--size);
        box-shadow: -8px 8px 8px rgba(93, 104, 107, 0.3);
        display: grid;
        grid-template-columns: repeat(9, calc(var(--size) / 9));
        grid-template-rows: repeat(9, calc(var(--size) / 9));
    }
</style>

<script>
    import Cell from './Cell.svelte';
</script>


<div>
    {#each Array(81) as _, i}
        <Cell index={i} />
    {/each}
</div>
