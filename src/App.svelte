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

<script lang="ts">
	import Utils from './Utils.svelte';
	import Grid from './components/Grid.svelte';
	import Toolbar from './components/Toolbar.svelte';
</script>


<div class="container">
	<div class="column">
		<Grid />
		<Toolbar />
	</div>
	<!--<ButtonsList />-->
	<p>Test</p>
</div>

<Utils />