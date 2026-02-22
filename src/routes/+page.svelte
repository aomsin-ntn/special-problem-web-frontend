<script lang="ts">
	import kmitlLogo from '$lib/assets/Kmitl-logo-navbar.png';
	import SearchBar from '../components/SearchBar.svelte';
	import CardPopular from '../components/CardPopular.svelte';
	import MenuCategory from '../components/MenuCategory.svelte';

	let searchTerm: string = "";
	let cardsPopular = [
		{
			category: "สหกิจศึกษา",
			titleThai: "ชื่อโปรเจคภาษาไทย",
			titleEnglish: "ชื่อโปรเจคภาษาอังกฤษ",
			keywords: ["2", "1", "คำสำคัญ", "คำสำคัญ", "คำสำคัญ"]
		},
		{
			category: "ปัญหาพิเศษ",
			titleThai: "ชื่อโปรเจคภาษาไทยยยยยย",
			titleEnglish: "ชื่อโปรเจคภาษาอังกฤษuuuuuuu",
			keywords: ["คำสำคัญ", "3", "คำสำคัญ", "คำสำคัญ", "คำสำคัญ"]
		},
		{
			category: "ปัญหาพิเศษ",
			titleThai: "ชื่อโปรเจคภาษาไทยlllllllllllllllllllllllllllllllllllllllll",
			titleEnglish: "ชื่อโปรเจคภาษาอังกฤษ",
			keywords: ["4", "คำสำคัญ", "คำสำคัญ", "คำสำคัญ", "คำสำคัญ"]
		},
		{
			category: "ปัญหาพิเศษ",
			titleThai: "ชื่อโปรเจคภาษาไทย",
			titleEnglish: "ชื่อโปรเจคภาษาอังกฤษ",
			keywords: ["คำสำคัญ", "5", "คำสำคัญ", "คำสำคัญ", "คำสำคัญ"]
		},
		{
			category: "ปัญหาพิเศษ",
			titleThai: "ชื่อโปรเจคภาษาไทย",
			titleEnglish: "ชื่อโปรเจคภาษาอังกฤษ",
			keywords: ["คำสำคัญ", "5", "คำสำคัญ", "คำสำคัญ", "คำสำคัญ"]
		}
	];

	let menuCategories = [
		{ label: "คณะวิศวกรรมศาสตร์", destination: "/faculty/engineering" },
		{ label: "คณะวิทยาศาสตร์", destination: "/faculty/science" },
		{ label: "คณะสถาปัตยกรรมศาสตร์", destination: "/faculty/architecture" },
		{ label: "คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี", destination: "/faculty/industrial-education" },
		{ label: "คณะเทคโนโลยีสารสนเทศ", destination: "/faculty/information-technology" },
		{ label: "คณะเทคโนโลยีการเกษตร", destination: "/faculty/agricultural-technology" },
		{ label: "คณะอุตสาหกรรมอาหาร", destination: "/faculty/food-industry" },
		{ label: "คณะบริหารธุรกิจ", destination: "/faculty/business" },
		{ label: "คณะศิลปศาสตร์", destination: "/faculty/liberal-arts" },
		{ label: "คณะแพทยศาสตร์", destination: "/faculty/medicine" },
		{ label: "คณะทันตแพทยศาสตร์", destination: "/faculty/dentistry" },
		{ label: "คณะพยาบาลศาสตร์", destination: "/faculty/Nursing" }
	];


	// ฟังก์ชันรองรับการค้นหา
	async function handleSearch(event: CustomEvent<string>): Promise<void> {
		const query = event.detail; // TypeScript จะรู้ทันทีว่า query คือ string
		
		console.log("Searching for:", query);
		
		// ตัวอย่างการเตรียมยิง API ไปที่ FastAPI
		try {
		// const response = await fetch(`http://localhost:8000/search?q=${query}`);
		// const data = await response.json();
		// console.log(data);
		} catch (error) {
		console.error("Search failed:", error);
		}
	}

</script>

<main class="min-h-screen bg-orange-500 flex flex-col items-center w-screen overflow-x-hidden">
	<div class="w-full bg-linear-to-b from-orange-500 to-orange-700 gap-7 pt-8 pb-12 px-4 sm:px-6 md:px-10 flex flex-col items-center">
		<img src={kmitlLogo} alt="KMITL Logo" class="h-35 md:h-42 lg:h-50"/>
		<h3 class="text-white">ค้นหาเล่มปัญหาพิเศษ</h3>
		<SearchBar bind:value={searchTerm} on:search={handleSearch} />
	</div>
	
	<div class="w-full bg-white gap-10 sm:px-10 md:px-20 lg:px-30 py-10 flex flex-col">
		<h3 class="text-black">ปัญหาพิเศษที่กำลังเป็นที่สนใจ</h3>
		<div class="flex flex-wrap justify-between">
			{#each cardsPopular.slice(0, 5) as cardPop}
				<CardPopular 
					category={cardPop.category}
					titleThai={cardPop.titleThai}
					titleEnglish={cardPop.titleEnglish}
					keywords={cardPop.keywords}
				/>
        	{/each}
		</div>
	</div>

	<div class="w-full bg-orange-700 gap-10 sm:px-10 md:px-20 lg:px-30 py-10 flex flex-col">
		<h3 class="text-white">ค้นหาโดยคณะ</h3>
		<div class="flex flex-wrap justify-between">
			{#each menuCategories as menuCategory}
				<MenuCategory 
					label={menuCategory.label} 
					destination={menuCategory.destination} />
        	{/each}
		</div>
	</div>

</main>
