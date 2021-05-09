<style>

    .notification {
        --green: #48C78E;
       --red: #F14668;
        position: absolute;
        top: 0;
        width: 100%;
        height: 50px;
        background-color: var(--green);
        box-shadow: 0px 5px 15px rgba(0, 0, 0, .2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 1000;
    }

    .content {
        margin-left: 25px;
        color: white;
    }

    svg {
        width: 24px;
        height: 24px;
        margin-right: 20px;
    }
</style>


<script>
    export let message;
</script>


<div class="notification">
    <div class="content">
        <p>{message}</p>
    </div>

    <svg on:click xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" stroke="white">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
</div>