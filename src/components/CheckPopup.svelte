<script lang="ts">
    import { activeTask, sudoku } from '../stores'
    import { getHint } from '../solver/solver.js'
    import { copyGrid, calculateCandidates } from '../solver/utils.js'

    let show = false


    let asSolution = true;
    

    activeTask.subscribe(async (task) => {
        if (task == 'check') {

            console.log("go");
            show = true


            let hint
            
            let grid = copyGrid($sudoku)

            do {
                grid = calculateCandidates(grid)

                hint = getHint(grid)?.getAsObject()
                if (hint != undefined) {
                    grid[hint.index].value = hint.value
                }
            }while (hint != undefined)

            for(let i = 0; i < 81; i++) {
                if (grid[i].value == undefined) {
                    asSolution = false
                    break
                }
            }

            
        }
    })

    function handleClick() {
        show = false
        asSolution = true;
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
<div class="graybackground">
    <div class="popup">
        <div class="content">
            <p>{asSolution ? "Le sudoku peut être résolu" : "Je ne peux pas résoudre le sudoku"}</p>
            <button on:click={handleClick}>Ok</button>
        </div>
    </div>
</div>
{/if}
