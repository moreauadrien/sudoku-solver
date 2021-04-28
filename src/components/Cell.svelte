<style>
    div {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
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

    
</style>

<script>
    export let index;

    let borderRight = index%9 != 8;
    let borderBottom = Math.floor(index / 9) != 8;

    let largeRight = [2, 5].includes(index%9);
    let largeBottom = [2, 5].includes(Math.floor(index/9));
</script>

<div 
    class:borderRight
    class:borderBottom
    class:largeRight
    class:largeBottom
    >
        <span>{index}</span>
</div>