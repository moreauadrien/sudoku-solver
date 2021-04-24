<style>
    div {
        display: flex;
        justify-content: center;
        align-items: center;

        font-size: sans-serif;
        font-size: 20px;

        border: 1px solid #EDEDFA;
    }

    .borderTop {
        border-top-width: 0px;
    }

    .borderRight {
        border-right-width: 4px;
    }

    .borderBottom {
        border-bottom-width: 4px;
    }

    .noBottom {
        border-bottom-width: 0px;
    }

    .noRight {
        border-right-width: 0px;
    }

    .borderLeft {
        border-left-width: 0px;
    }
</style>

<script>
    export let index;
    export let value;

    let borderTop = index <= 8;
    let borderRight = index % 9 % 3 == 2;
    let borderBottom = Math.floor(index / 9) % 3 == 2;
    let borderLeft = index % 9 == 0;

    let noRight = index%9 == 8;
    let noBottom = Math.floor(index / 9) == 8;
</script>

<div class:borderTop class:borderRight class:borderBottom class:borderLeft class:noRight class:noBottom>
    <span>{value}</span>
</div>