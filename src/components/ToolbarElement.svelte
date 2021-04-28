<script>
    export let name;
    import Candidates from '../icons/Candidates.svelte';
    import Hint from '../icons/Hint.svelte';
    import Check from '../icons/Check.svelte';
    import Solve from '../icons/Solve.svelte';

    let defaultIconColor = '#D3D3D3';
    let selectedIconColor = '#04CDAA';

    const capitalize = (text) => {
        return text[0].toUpperCase() + text.slice(1).toLowerCase();
    }
</script>

<style>
    .tool {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        width: auto;
    }

    span {
        color: #DCDBE0;
        font-family: Arial;
        font-weight: 700;
        margin-top: 5px;
    }
</style>

<div class="tool">
    {#if name.toLowerCase() == 'candidates'}
        <Candidates width={55} height={55} color={defaultIconColor}/>

    {:else if name.toLowerCase() == 'hint'}
        <Hint width={44} height={44} color={defaultIconColor} />

    {:else if name.toLowerCase() == 'check'}
        <Check width={30} height={30} color={defaultIconColor} />

    {:else if name.toLowerCase() == 'solve'}
        <Solve width={30} height={30} color={defaultIconColor} />
    {/if}

    <span>{capitalize(name)}</span>

</div>