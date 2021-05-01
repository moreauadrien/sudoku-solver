<style>
    .keypad {
        position: absolute;
        width: 150px;
        height: 150px;
        z-index: 5;

        display: grid;
        grid-template-columns: repeat(3, calc(100% / 3));
        grid-template-rows: repeat(3, calc(100% / 3));

        box-shadow: -8px 8px 8px rgba(93, 104, 107, 0.3);

        background-color: hsla(169, 93%, 42%, .6);

        animation: scaleUp 0.3s ease-out;
        animation-fill-mode: forwards;

        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
    }


    @keyframes scaleUp {
        from {
            transform: scale(0.001);
        }

        to {
            transform: scale(1.2);
        }
    }
</style>

<script>
    export let cell;
    import { cellSize } from '../responsive';
    import { currentFocus } from '../stores.js';

    let activate = false;

    let keypad;

    const handleClick = (e) => {
        if(!activate) {
            activate = true;
            return;
        }



        let { left, top, width, height } = keypad.getBoundingClientRect();
        let x = e.clientX;
        let y = e.clientY;

        if(x <= left || x >= left+width || y <= top || y >= top + height) {
            currentFocus.set(undefined);
        }
    }


    import NumberButton from './NumberButton.svelte';
</script>

<svelte:window on:click={handleClick}/>

<div bind:this={keypad} class="keypad" style="top: {cell.getBoundingClientRect().y - cellSize}px; left: {cell.getBoundingClientRect().x - cellSize}px">
    {#each Array(9) as _, i}
        <NumberButton value={i + 1} on:numberInput/>
    {/each}
</div>