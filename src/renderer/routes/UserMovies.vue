<style lang="css">
table.list_tree tbody tr.movie td.title img {
	width: calc(calc(calc(v-bind("zoomLevel + 'px'") - 20px) / 9) * 16);
}
</style>
<script setup lang="ts">
import { apiServer } from "../utils/AppInit";
import type { FieldIdOf, ListFieldColumn, SelectedListSort } from "../interfaces/ListTypes";
import ListTree from "../components/list/ListTree.vue";
import type { Movie } from "../interfaces/Movie";
import MovieRowOptions from "../components/list/options/MovieRowOptions.vue";
import MovieListRow from "../components/list/MovieListRow.vue";
import Navbar from "../components/Navbar.vue";
import type { NavbarEntry } from "../components/Navbar.vue";
import {
	onMounted,
	ref,
	toValue,
	useTemplateRef,
	watch
} from "vue";
import useListStore from "../composables/useListStore";
import { useRoute } from "vue-router";
const listTree = useTemplateRef("list-tree");
const { pendingRefresh, zoomLevel } = useListStore();
const route = useRoute();
const currentFolder = ref<string>();
const isLoading = ref(false);
let listPage:"movie"|"starter";
const movieList = ref<{
	folders: [],
	entries: Movie[]
}>();
const navbarEntries = ref<NavbarEntry[]>([]);
let columnWidths = JSON.parse(localStorage.getItem("movie_list-columnWidths")) ??
	{ "title":250, "id":100, "duration":100, "date":180 };
let columns:ListFieldColumn<Movie>[] = [
	{
		id: "title",
		width: ref(columnWidths["title"]),
	},
	{
		id: "id",
		width: ref(columnWidths["id"]),
	},
	{
		id: "duration",
		width: ref(columnWidths["duration"]),
	},
	{
		id: "date",
		width: ref(columnWidths["date"]),
	}
];
const selectedSort = ref<SelectedListSort<Movie>>(
	JSON.parse(localStorage.getItem("movie_list-selectedSort")) ??
		{
			id: "title",
			descending: true
		}
);
function initList() {
	movieList.value = {
		folders: [],
		entries: [],
	};
}
function timestampToSeconds(time:string) {
	const nums = time.split(":").map((v) => Number(v));
	for (const index in nums) {
		if (index == (nums.length - 1).toString()) {
			return nums[index];
		}
		nums[index + 1] += nums[index] * 60;
	}
}
function movieSortCb(movie1:Movie, movie2:Movie): number {
	let mul = toValue(selectedSort).descending ? 1 : -1;
	const sortOption = toValue(selectedSort).id;
	switch (sortOption) {
		case "id":
		case "title": {
			return movie1[sortOption].localeCompare(movie2[sortOption]) * mul;
		}
		case "duration": {
			const secs1 = timestampToSeconds(movie1.duration);
			const secs2 = timestampToSeconds(movie2.duration);
			return (secs2 - secs1) * mul;
		}
		case "date": {
			const date1 = new Date(movie1.date);
			const date2 = new Date(movie2.date);
			return (+date1 - +date2) * mul;
		}
	}
}
function changeSort(newSort:FieldIdOf<Movie>) {
	if (selectedSort.value.id == newSort) {
		selectedSort.value.descending = !selectedSort.value.descending;
	} else {
		selectedSort.value = {
			id: newSort,
			descending: true,
		};
	}
	localStorage.setItem("movie_list-selectedSort", JSON.stringify(toValue(selectedSort)));
	movieList.value.entries = movieList.value.entries.sort(movieSortCb);
}
function columnResized(id:FieldIdOf<Movie>, newWidth:number) {
	columnWidths[id] = newWidth;
	localStorage.setItem("movie_list-columnWidths", JSON.stringify(columnWidths));
}
function getMovieTree(filter:"starter"): Promise<{
	list_data: {
		folders: [],
		entries: Movie[],
	}
}>
function getMovieTree(filter:"movie", folderId:string): Promise<{
	navbar_parent_folders: NavbarEntry[],
	list_data: {
		folders: [],
		entries: Movie[],
	}
}>
function getMovieTree(filter:"movie"|"starter", folderId?:string) {
	return new Promise((res) => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			let responseJson = JSON.parse(this.responseText);
			let parentFolderEntries: NavbarEntry[] | void;
			if (filter == "movie") {
				parentFolderEntries = responseJson.folder_path.map(v => ({
					path: "/movies/" + v.id,
					title: v.title
				}));
			}
			res({
				navbar_parent_folders: parentFolderEntries,
				list_data: {
					folders: responseJson.folders,
					entries: responseJson.movies,
				}
			});
		};
		let url = `${apiServer}/api/movie/list?type=${filter}`;
		if (folderId && folderId.length > 0) {
			url += `&path=${folderId}`;
		}
		xhttp.open("GET", url, true);
		xhttp.send();
	});
}
async function routeUpdated() {
	listTree.value.resetSelection();
	initList();
	listPage = route.name == "movie_list" ? "movie" : "starter";
	if (listPage == "movie") {
		currentFolder.value = route.params.folderId as string || "";
	}
	isLoading.value = true;
	await loadMovieList();
}
async function loadMovieList() {
	if (listPage == "movie") {
		const response = await getMovieTree(listPage, toValue(currentFolder));
		navbarEntries.value = [
			{
				path: "/movies",
				title: "Videos"
			},
			...response.navbar_parent_folders
		];
		movieList.value = response.list_data;
	} else {
		const response = await getMovieTree(listPage);
		navbarEntries.value = [
			{
				path: "/starters",
				title: "Starters"
			}
		];
		movieList.value = response.list_data;
	}
	movieList.value.entries = movieList.value.entries.sort(movieSortCb);
	setTimeout(() => {
		isLoading.value = false;
	}, 80);
}
watch(() => pendingRefresh.value, routeUpdated);
watch(() => route.path, routeUpdated);
onMounted(async () => {
	routeUpdated();
});
initList();
</script>
<template>
	<div>
		<Navbar
			:count="movieList.entries.length"
			:entries="navbarEntries"
			:supported="{
				newFolder: listPage != 'starter',
				search: true,
				viewMode: true,
				zoom: true
			}"/>
		<div class="page_contents">
			<ListTree
				:class="{
					load_state: isLoading
				}"
				ref="list-tree"
				:data="movieList"
				:row-component="MovieListRow"
				:row-options-component="MovieRowOptions"
				:columns="columns"
				:selected-sort="selectedSort"
				@column-resize="columnResized"
				@sort-change="changeSort"/>
		</div>
	</div>
</template>
