<style>
    div {
        --size: 600px;
        background-color: white;
        width: var(--size);
        height: var(--size);

        display: grid;
        grid-template-columns: repeat(9, calc(100%/9));
        grid-template-rows: repeat(9, calc(100%/9));

        box-shadow: 4px 6px 4px rgba(0, 0, 0, 0.4);
    }

    @media (max-width: 800px) {
        div {
            --size: 500px;
        }
    }

    @media (max-width: 550px) {
        div {
            --size: 400px;
        }
    }
</style>

<script>
    import Cell from './Cell.svelte';
</script>

<div>
    {#each Array(81) as _, index}
        <Cell index={index} value={Math.floor(Math.random()*9+1)}/>
    {/each}
</div>