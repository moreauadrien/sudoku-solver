<style>
    .content {
        margin-left: 25px;
    }

    svg {
        width: 24px;
        height: 24px;
        margin-right: 20px;
    }

    .notification {
        position: absolute;
        top: 0;
        width: 100%;
        height: 50px;
        background-color: #F5F5F5;
        box-shadow: 0px 5px 15px rgba(0, 0, 0, .2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 1000;

        animation: showNotif 0.2s ease-in-out forwards;
    }

    .success {
        background-color: #48C78E;
    }

    .success > .content {
        color: white;
    }

    .danger {
        background-color: #F14668;
    }

    .danger > .content {
        color: white;
    }

    @keyframes showNotif {
        from {
            transform: translateY(-100%);
        }

        to {
            transfrom: translateY(0);
        }
    }

    .hide {
        transform: translateY(-100%);
        animation: hideNotif 0.2s ease-in-out forwards;
    }

    @keyframes hideNotif {
        from {
            transform: translateY(0);
        }

        to {
            transfrom: translateY(-100%);
        }
    }
    
</style>


<script>
    import { notificationManager } from '../notification_manager'

    const crossClick = () => {
        notificationManager.dismiss($notificationManager.id)
    }
</script>


{#if $notificationManager != undefined}

<div class="notification {$notificationManager.status}" class:hide={$notificationManager.dismiss}>
    <div class="content">
        <p>{$notificationManager.message}</p>
    </div>

    <svg on:click={crossClick} xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" stroke="white">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
</div>

{/if}