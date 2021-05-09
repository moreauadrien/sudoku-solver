<script lang="ts">
    import Utils from './Utils.svelte'
	import HintPopup from './components/HintPopup.svelte'
	import CheckPopup from './components/CheckPopup.svelte'
    import Grid from './components/Grid.svelte'
    import Toolbar from './components/Toolbar.svelte'
    import Notification from './components/Notification.svelte'
</script>

<style>
    .container {
        width: 100%;
        height: 100%;
        background: #e2e9f3;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .column {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>


<div class="container">
    <div class="column">
        <Grid />
        <Toolbar />
    </div>
    <!--<ButtonsList />-->
</div>

<HintPopup />
<CheckPopup />

<Utils />

<Notification />