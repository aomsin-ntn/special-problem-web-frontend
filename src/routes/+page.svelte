<script lang="ts">
	import kmitlLogo from '$lib/assets/Kmitl-logo-navbar.png';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import CardPopular from '$lib/components/CardProjectPopular.svelte';
	import MenuCategory from '$lib/components/MenuCategory.svelte';

	const cardsPopular = [
		{
			id: "1",
			category: "ปัญหาพิเศษ",
			titleThai: "การพัฒนาระบบแนะนำหนังสือโดยใช้เทคนิคการเรียนรู้ของเครื่อง",
			titleEnglish: "Development of a Book Recommendation System Using Machine Learning Techniques",
			keywords: ["ระบบแนะนำหนังสือ", "การเรียนรู้ของเครื่อง", "การประมวลผลภาษาธรรมชาติ"]
		},
		{
			id: "2",
			category: "ปัญหาพิเศษ",
			titleThai: "การวิเคราะห์ความรู้สึกในความคิดเห็นของลูกค้าเกี่ยวกับผลิตภัณฑ์บนโซเชียลมีเดีย",
			titleEnglish: "Sentiment Analysis of Customer Reviews on Social Media",
			keywords: ["วิเคราะห์ความรู้สึก", "ความคิดเห็นของลูกค้า", "โซเชียลมีเดีย"]
		},
		{
			id: "3",
			category: "ปัญหาพิเศษ",
			titleThai: "ระบบตรวจจับความผิดปกติโดยใช้การเรียนรู้เชิงลึก",
			titleEnglish: "Anomaly Detection System Using Deep Learning",
			keywords: ["การตรวจจับความผิดปกติ", "เรียนรู้เชิงลึก", "โครงข่ายประสาทเทียม"]
		},
		{
			id: "4",
			category: "ปัญหาพิเศษ",
			titleThai: "การพยากรณ์ราคาหุ้นด้วยเครือข่ายประสาทเทียม",
			titleEnglish: "Stock Price Prediction Using Neural Networks",
			keywords: ["พยากรณ์ราคา", "เครือข่ายประสาทเทียม", "ตลาดหุ้น"]
		},
		{
			id: "5",
			category: "ปัญหาพิเศษ",
			titleThai: "ระบบจดจำรูปภาพใบหน้าขั้นสูง",
			titleEnglish: "Advanced Facial Recognition System",
			keywords: ["จดจำใบหน้า", "การประมวลผลภาพ", "การรักษาความปลอดภัย"]
		}
	];

	const menuCategories = [
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

</script>

<main class="flex flex-col items-center overflow-x-hidden">

	<section class="w-full bg-linear-to-b from-orange-500 to-orange-700">
		<div class="flex flex-col items-center justify-center gap-7 pt-8 pb-12 px-4 md:px-6 lg:px-10 ">
			<img src={kmitlLogo} alt="KMITL Logo" class="h-35 md:h-42 lg:h-50"/>
			<p class="text-white text-lg md:text-xl lg:text-2xl font-semibold">
				ค้นหาเล่มปัญหาพิเศษ
			</p>
			<SearchBar />
		</div>
	</section>

	<section class="w-full bg-white">
		<div class="flex flex-col gap-10 py-12 px-10 md:px-20 lg:px-30 ">
			<p class="text-black text-lg md:text-xl lg:text-2xl font-semibold">
				ปัญหาพิเศษที่กำลังเป็นที่สนใจ
			</p>
			<ul class="flex flex-wrap justify-between">
				{#each cardsPopular.slice(0, 5) as cardPop}
					<CardPopular 
						id={cardPop.id}
						category={cardPop.category}
						titleThai={cardPop.titleThai}
						titleEnglish={cardPop.titleEnglish}
						keywords={cardPop.keywords}
					/>
				{/each}
			</ul>
		</div>
	</section>

	<section class="w-full bg-orange-700">
		<div class="py-12 px-10 md:px-20 lg:px-30 flex flex-col gap-10">
			<p class="text-white text-lg md:text-xl lg:text-2xl font-semibold">
				ค้นหาโดยคณะ
			</p>
			<div class="flex flex-wrap justify-between">
				{#each menuCategories as menuCategory}
					<MenuCategory 
						label={menuCategory.label} 
						destination={menuCategory.destination} />
				{/each}
			</div>
		</div>
	</section>

	
</main>
