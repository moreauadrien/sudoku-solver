<style>
    .cell {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        position: relative;
        z-index: 2;

        font-size: 20px;
        transform: scale(1);
        transition: transform .3s ease-out;
    }

    .borderRight {
        border-right: 2px solid #F5F5F5;
    }

    .borderBottom {
        border-bottom: 2px solid #F5F5F5;
    }

    .largeRight {
        border-right: 3px solid #B8B8B8;
    }

    .largeBottom {
        border-bottom: 3px solid #B8B8B8;
    }

    .isSelected {
        /*background-color: #07CFAA;*/
        color: white;


        /*opacity: 0.4;
        transform: scale(3);
        z-index: 4;
        box-shadow: 0px 15px 35px hsla(0.0%, .2);
        border: none;*/
    }

    span {
        -moz-user-select: none;
        user-select: none;
    }
    
    

</style>

<script>
    export let index;
    export let value;

    let borderRight = index%9 != 8;
    let borderBottom = Math.floor(index / 9) != 8;

    let largeRight = [2, 5].includes(index%9);
    let largeBottom = [2, 5].includes(Math.floor(index/9));

    import { currentFocus, activeTask } from '../stores.js';

    import Keypad from './Keypad.svelte';

    $: isSelected = $currentFocus == index;

    const handleClick = () => {
        if($activeTask == 'erase') {
            activeTask.set(undefined);
            value = undefined;
            return;
        }

        if(!isSelected) {
            currentFocus.set(index);
        } else {
            currentFocus.set(undefined);
        }
        
    }


    let cell;


    const handleInput = (e) => {
        value = e.detail.value;
        currentFocus.set(undefined);
    }
</script>


{#if isSelected}
    <Keypad cell={cell} on:numberInput={handleInput}/>
{/if}

<div 
    class:borderRight
    class:borderBottom
    class:largeRight
    class:largeBottom
    class='cell'
    class:isSelected
    bind:this={cell}
    on:click={handleClick}
>
    <span>{value || ''}</span>
</div>
