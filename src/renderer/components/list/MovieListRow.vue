<style>
tr.movie td.title img {
	width: initial;
}
</style>

<script setup lang="ts" generic="MovieEntry extends Movie">
import { apiServer } from "../../utils/AppInit";
import type { FieldIdOf } from "../../interfaces/ListTypes";
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import { inject } from "vue";
import type { Movie } from "../../interfaces/Movie";
import MovieRowOptions from "./options/MovieRowOptions.vue";
import openPlayerWindow from "../../utils/openPlayerWindow";
import useLocalSettings from "../../composables/useLocalSettings";
import { useRouter } from "vue-router";

const emit = defineEmits<{
	entryDelete: [],
	entryClick: [],
	entryCtrlClick: [],
	entryDblClick: [],
	entryShiftClick: [],
}>();
const props = defineProps<{
	checked: boolean,
	entry: MovieEntry
}>();
defineExpose({ id:props.entry.id });

const columns = inject(genericColumnIdKey<MovieEntry>(), []);
const localSettings = useLocalSettings();
const router = useRouter();

function entryElem_click() {
	emit("entryClick");
}

function entryElem_ctrlClick() {
	emit("entryCtrlClick");
}

function entryElem_dblClick() {
	switch (localSettings.onMovieDclick) {
		case "edit": {
			router.push(`/movies/edit/${props.entry.id}`);
			break;
		}
		case "play": {
			openPlayerWindow(props.entry.id);
			break;
		}
		case "none":
		default:
			break;
	}
	emit("entryDblClick");
}

function entryElem_shiftClick() {
	emit("entryShiftClick");
}

function deleteBtn_click() {
	emit("entryDelete");
}

function movieInfo(field:FieldIdOf<MovieEntry>): string {
	switch (field) {
		case "date": {
    			const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    			if (!props.entry.date) return '—';

		const d = new Date(props.entry.date);
			if (isNaN(d.getTime())) return props.entry.date;

		const day = d.getDate();
		let ordinal = 'th';

		if (day % 10 === 1 && day !== 11) ordinal = 'st';
		else if (day % 10 === 2 && day !== 12) ordinal = 'nd';
		else if (day % 10 === 3 && day !== 13) ordinal = 'rd';

const hours = String(d.getHours()).padStart(2, '0');
const minutes = String(d.getMinutes()).padStart(2, '0');
const seconds = String(d.getSeconds()).padStart(2, '0');

return `${day}${ordinal} of ${months[d.getMonth()]} ${d.getFullYear()} - ${hours}:${minutes}:${seconds}`;}


		default: return props.entry[field].toString();
	}
}
</script>

<template>
	<tr
		:class="{ checked, movie:true }"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.shift.exact="entryElem_shiftClick"
		@click.exact="entryElem_click">
		<td class="hidden">
			<input ref="select-box" type="checkbox" @input="entryElem_ctrlClick" @click.stop :checked="checked"/>
		</td>
		<td v-for="columnId in columns" :class="{ title:columnId == 'title' }">
			<img
				v-if="columnId == 'title'"
				:src="`${apiServer}/file/movie/thumb/${movieInfo('id')}`"
				alt="thumbnail"/>
			<span :title="movieInfo(columnId)" v-html="movieInfo(columnId)"></span>
		</td>
		<td class="actions hidden" @click.stop>
			<MovieRowOptions :entry="entry" @entry-delete="deleteBtn_click"/>
		</td>
	</tr>
</template>
