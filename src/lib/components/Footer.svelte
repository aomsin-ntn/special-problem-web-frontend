<script lang="ts">
    import type { ComponentType } from 'svelte';
    import { Facebook, Mail } from 'lucide-svelte';

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

<footer class="bg-gray-300 text-white py-8 px-6 md:px-20 lg:px-30">
    <div class="w-full mx-auto flex flex-row justify-between items-center gap-8">
        
        <div class="flex flex-col gap-2">
            <p class="text-sm md:text-sm lg:text-sm font-light">
                {universityNameTh}
            </p>
            <p class="text-sm md:text-sm lg:text-sm font-light">
                {universityNameEn}
            </p>
        </div>

        <div class="flex flex-col gap-2 max-w-75">
            <p class="text-sm md:text-base lg:text-base font-medium">
                Contact us
            </p>
            {#each contactDetails as contact (contact.label)}
                {@const Icon = contact.icon}
                <div class="flex gap-2">
                    <Icon size={20} strokeWidth={2} />
                    <a href={contact.link} class="hover:underline transition-all">
                        <p class="text-sm md:text-sm lg:text-sm font-light">
                            {contact.value}
                        </p>
                    </a>
                </div>
            {/each}
            <p class="text-sm md:text-sm lg:text-sm font-light">
                {address}
            </p>
        </div>
    </div>
</footer>