<script>
    import { activeTask } from '../stores'

    let show = false

    activeTask.subscribe((task) => {
        if (task == 'hint') {
            show = true
        }
    })

    function handleClick() {
        show = false
        activeTask.set(undefined)
    }
</script>

<style>
    .graybackground {
        position: absolute;
        top: 0;
        z-index: 10; 
        background-color: rgba(0, 0, 0, .5);
        width: 100%;
        height: 100%;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .popup {
        background-color: white;
        width: 600px;
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    p {
        font-size: 24px;
    }

    button {
        width: 100px;
        background-color: #00d1b2;
        border-color: transparent;
        color: #fff;
    }
</style>


{#if show}
<div class="graybackground">
    <div class="popup">
        <p>La case mise en valeur ne peux contenir qu'un 8</p>
        <button on:click={handleClick}>Ok</button>
    </div>
</div>
{/if}
