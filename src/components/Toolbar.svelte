<script>
    import ToolbarElement from './ToolbarElement.svelte'
    import { activeTask, sudoku } from '../stores.js'
    import { getHint } from '../solver/solver'

    activeTask.subscribe(async (task) => {
        if (task == 'solve') {
            let hint = -1

            let interval = setInterval(async () => {
                if (hint == undefined) {
                    clearInterval(interval)
                    activeTask.set(undefined)
                    return
                }

                await sudoku.updateCandidates()

                hint = getHint($sudoku)?.getAsObject()
                if (hint != undefined) {
                    //@ts-ignore
                    sudoku.setCellValue(hint.index, hint.value)
                }
            }, 50)
        }

        
    })
</script>

<div>
    <ToolbarElement name="candidates" />
    <ToolbarElement name="hint" />
    <ToolbarElement name="check" />
    <ToolbarElement name="solve" />
    <ToolbarElement name="erase" />
</div>

<style>
    div {
        width: 450px;
        height: 65px;
        background-color: white;
        margin-top: 25px;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 25px;
        display: flex;
        align-items: center;
        justify-content: space-around;
    }
</style>
