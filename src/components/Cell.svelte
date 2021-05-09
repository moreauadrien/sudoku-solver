<script>
    export let index
    export let value

    let borderRight = index % 9 != 8
    let borderBottom = Math.floor(index / 9) != 8

    let largeRight = [2, 5].includes(index % 9)
    let largeBottom = [2, 5].includes(Math.floor(index / 9))

    import { currentFocus, sudoku, highlightCase } from "../stores.js"

    import { activeTask } from  '../task_manager'


    import { notificationManager } from '../notification_manager'

    import Keypad from "./Keypad.svelte"

    $: isSelected = $currentFocus == index

    const handleClick = () => {
        if($highlightCase != undefined) highlightCase.set(undefined)

        if($notificationManager?.type == 'hint') {
            notificationManager.dismiss($notificationManager.id)
        }

        if ($activeTask == "erase") {
            if(value == undefined) activeTask.set(undefined)
            sudoku.setCellValue(index, undefined)
            return
        }

        if (!isSelected) {
            currentFocus.set(index)
        } else {
            currentFocus.set(undefined)
        }
    }

    let cell

    const handleInput = (e) => {
        sudoku.setCellValue(index, e.detail.value)
        
        //value = e.detail.value
        currentFocus.set(undefined)
    }
</script>

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
        transition: transform 0.3s ease-out;
    }

    .borderRight {
        border-right: 2px solid #f5f5f5;
    }

    .borderBottom {
        border-bottom: 2px solid #f5f5f5;
    }

    .largeRight {
        border-right: 3px solid #b8b8b8;
    }

    .largeBottom {
        border-bottom: 3px solid #b8b8b8;
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

    .isHighlighted {
        background-color: #07CFAA;
    }

    span {
        -moz-user-select: none;
        user-select: none;
    }
</style>

{#if isSelected}
    <Keypad {cell} on:numberInput={handleInput} />
{/if}

<div
    class:borderRight
    class:borderBottom
    class:largeRight
    class:largeBottom
    class="cell"
    class:isSelected
    class:isHighlighted={$highlightCase == index}
    bind:this={cell}
    on:click={handleClick}
>
    <span>{value || ""}</span>
</div>


