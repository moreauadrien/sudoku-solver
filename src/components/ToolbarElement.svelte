<script>
    export let name
    name = name.toLowerCase()
    import Candidates from '../icons/Candidates.svelte'
    import Hint from '../icons/Hint.svelte'
    import Check from '../icons/Check.svelte'
    import Solve from '../icons/Solve.svelte'
    import Erase from '../icons/Erase.svelte'

    import { activeTask } from '../stores'

    let defaultIconColor = '#D3D3D3'
    let selectedIconColor = '#04CDAA'

    const capitalize = (text) => {
        return text[0].toUpperCase() + text.slice(1).toLowerCase()
    }

    const handleClick = () => {
        if ($activeTask == name) {
            activeTask.set(undefined)
        } else {
            activeTask.set(name)
        }
    }

    $: isSelected = $activeTask == name

    $: color = isSelected ? selectedIconColor : defaultIconColor
</script>

<style>
    .tool {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        width: auto;
    }

    span {
        color: #dcdbe0;
        font-family: Arial;
        font-weight: 700;
        margin-top: 5px;
        font-size: 14px;
    }

    .isSelected {
        color: #04cdaa;
    }
</style>


<div class="tool" on:click={handleClick}>
    {#if name == 'candidates'}
        <Candidates width={35} height={35} {color} />
    {:else if name == 'hint'}
        <Hint width={35} height={35} {color} />
    {:else if name == 'check'}
        <Check width={25} height={25} {color} />
    {:else if name == 'solve'}
        <Solve width={25} height={25} {color} />
    {:else if name == 'erase'}
        <Erase width={25} height={25} {color} />
    {/if}

    <span class:isSelected>{capitalize(name)}</span>
</div>

