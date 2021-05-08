<script>
    import ToolbarElement from './ToolbarElement.svelte'
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
