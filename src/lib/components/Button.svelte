<script lang="ts">
    interface Props {
        type?: 'upload' | 'submit' | 'next' | 'back' |'default';
        label?: string;
        onclick?: () => void;
        disabled?: boolean;
        className?: string;
    }

    let { 
        type = 'default', 
        label,
        onclick = () => {},
        className = "" 
    }: Props = $props();

    const buttonConfig = {
        upload: {
        btnClass: "bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-8 shadow-sm border-none transition-colors duration-300 cursor-pointer",
        defaultLabel: "Upload"
        },
        submit: {
        btnClass: "bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-8 shadow-sm border-none transition-colors duration-300 cursor-pointer ",
        defaultLabel: "Submit"
        },
        next: {
        btnClass: "w-full text-xl h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:visible disabled:bg-gray-400 shadow-sm",
        defaultLabel: "Next"
        },
        back: {
        btnClass: "btn btn-outline w-full max-w-lg text-lg h-14 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-600 rounded-xl",
        defaultLabel: "Back"
        },
        default: {
        btnClass: "btn-ghost",
        defaultLabel: "Click"
        }
    };

    const config = $derived(buttonConfig[type]);
</script>

<button 
    class="btn {config.btnClass} {className}"
>
    {label ?? config.defaultLabel}
</button>
