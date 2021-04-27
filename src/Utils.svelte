<script>
    let innerWidth;
    let innerHeight;
</script>

<style>
    p {
        color: black;
        position: fixed;
        left: 0;
        top: 0;
        margin: 5px;
    }
</style>

<svelte:window bind:innerWidth bind:innerHeight />

<p>{innerWidth} x {innerHeight}</p>