<script>
    let innerWidth;
    let innerHeight;

    let id

    import { sudoku } from './stores'

    import { notificationManager } from './notification_manager'

    const logClick = () => {
        console.log($sudoku)
    }

    const updateClick = () => {
        sudoku.updateCandidates()
    }

    const notification = () => {
        id = notificationManager.notify("This is a notif", "success", 4)
    }

    const closeNotif = () => {
        notificationManager.dismiss(id)
    }
</script>

<style>
    div {
        position: fixed;
        left: 0;
        top: 0;
        margin: 5px;
        display: flex;
        flex-direction: column;
    }
</style>

<svelte:window bind:innerWidth bind:innerHeight />

<div>
    <!--<p>{innerWidth} x {innerHeight}</p>
    <button on:click={logClick}>Log grid</button>
    <button on:click={updateClick}>Update Candidates</button>-->

    <!--<button on:click={notification}>notification</button>
    <button on:click={closeNotif}>close notif</button>-->
</div>