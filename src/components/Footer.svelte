<script lang="ts">
    import type { ComponentType } from 'svelte';
    import { Facebook, Mail , MapPin} from 'lucide-svelte';

    interface ContactInfo {
        label: string;
        value: string;
        icon: ComponentType;
        link?: string;
    }

    const universityNameTh: string = "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง";
    const universityNameEn: string = "King Mongkut's Institute of Technology Ladkrabang";

    const contactDetails: ContactInfo[] = [
        { 
        label: "Facebook", 
        value: "KMITL", 
        icon: Facebook, 
        link: "https://www.facebook.com/kmitlofficial" 
        },
        { 
        label: "Email", 
        value: "saraban@kmitl.ac.th", 
        icon: Mail, 
        link: "mailto:saraban@kmitl.ac.th" 
        }
    ];

    const address: string = "1 Chalong Krung 1 Alley, Lat Krabang, Bangkok 10520, Thailand";
</script>

<footer class="bg-gray-300 text-white py-10 sm:px-6 md:px-20 lg:px-30">
    <div class="max-w-7xl mx-auto flex flex-row justify-between items-center gap-8">
        
        <div class="flex flex-col gap-2">
            <h5>{universityNameTh}</h5>
            <h5>{universityNameEn}</h5>
        </div>

        <div class="flex flex-col gap-2 max-w-75">
            <p>Contact us</p>
            {#each contactDetails as contact}
            <div class="flex gap-2">
                <svelte:component this={contact.icon} size={20} strokeWidth={2} />
                <a href={contact.link} class="hover:underline transition-all">
                    <h5>{contact.value}</h5>
                </a>
            </div>
            {/each}
            <h5>{address}</h5>
        </div>
    </div>
</footer>