<script lang="ts">
    import { sudoku, highlightCase } from '../stores'
    import { notificationManager } from '../notification_manager'
    import { getHint } from '../solver/solver.js'

    import { activeTask } from  '../task_manager'

    let show = false

    let hint

    activeTask.subscribe(async (task) => {
        if (task == 'hint') {
            await sudoku.updateCandidates()

            hint = getHint($sudoku)?.getAsObject()
            if (hint != undefined) {
                highlightCase.set(hint.index)
                notificationManager.notify('hint', hint.hint, 'success')
            } else {
                notificationManager.notify('hint', "Pas d'indice disponible", 'danger')
            }
            
            activeTask.set(undefined)
        }
    })

    function handleClick() {
        show = false
        hint = undefined
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
    }

    .content {
        margin: 30px 50px;
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
<!--<div class="graybackground">
    <div class="popup">
        <div class="content">
            <p>{hint?.hint || "Aucun indice"}</p>
            <button on:click={handleClick}>Ok</button>
        </div>
    </div>
</div>-->

<!--<Notification message={hint?.hint || "Aucun indice"} on:click={() => show=false}/>-->

{/if}
