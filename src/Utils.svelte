<script>
    let innerWidth;
    let innerHeight;
</script>

<style>
    p {
        color: white;
        position: fixed;
        left: 0;
        top: 0;
    }
</style>

<svelte:window bind:innerWidth bind:innerHeight />

<p>{innerWidth} x {innerHeight}</p>