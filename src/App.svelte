<style>
	.container {
		width: 100%;
		height: 100%;
		background: #E2E9F3;

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

<script>
	import Utils from './Utils.svelte';
	import Grid from './components/Grid.svelte';
	import ButtonsList from './components/ButtonsList.svelte';
	import Toolbar from './components/Toolbar.svelte';
</script>


<div class="container">
	<div class="column">
		<Grid />
		<Toolbar />
	</div>
	<ButtonsList />
</div>

<Utils />