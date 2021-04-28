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
        background-color: #07CFAA;
        color: white;
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

    import { currentFocus } from '../stores.js';

    $: isSelected = $currentFocus == index;

    const handleClick = () => {
        if(!isSelected) {
            currentFocus.set(index);
        } else {
            currentFocus.set(undefined);
        }
        
    }
</script>



<div 
    class:borderRight
    class:borderBottom
    class:largeRight
    class:largeBottom
    class='cell'
    class:isSelected

    on:click={handleClick}
>
    <span>{value || ''}</span>
</div>
