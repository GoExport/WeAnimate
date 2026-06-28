<style lang="css">
.export_modal .contents {
	width: 500px;
	height: 350px;
}

.export_modal .form_group {
	margin-bottom: 20px;
}

.export_modal label {
	display: block;
	margin-bottom: 5px;
	font-weight: bold;
}

.export_modal select, .export_modal input[type="text"] {
	width: 100%;
	padding: 8px;
	border-radius: 4px;
	border: 1px solid #444;
	background: #333;
	color: #fff;
}

.export_modal .checkbox_group {
	display: flex;
	align-items: center;
	gap: 10px;
}

.export_modal .actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 20px;
}

.export_modal .file_picker {
	display: flex;
	gap: 10px;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Popup from "../Popup.vue";
import Button from "../controls/Button.vue";
import type { Movie } from "../../interfaces/Movie";

const props = defineProps<{
	movie: Movie;
}>();

const emit = defineEmits<{
	userClose: [];
}>();

const resolution = ref("1280x720");
const format = ref("mp4");
const isWidescreen = ref(true);
const outputPath = ref("");

async function pickFile() {
	const result = await (window as any).appWindow.showSaveDialog({
		title: "Select output location",
		defaultPath: `${props.movie.title}.${format.value}`,
		filters: [
			{ name: "Video Files", extensions: [format.value] }
		]
	});
	if (!result.canceled && result.filePath) {
		outputPath.value = result.filePath;
	}
}

async function exportMovie() {
	if (!outputPath.value) {
		alert("Please select an output location.");
		return;
	}

	try {
		await (window as any).appWindow.exportMovie({
			movieId: props.movie.id,
			resolution: resolution.value,
			format: format.value,
			isWidescreen: isWidescreen.value,
			outputPath: outputPath.value
		});
		emit("userClose");
	} catch (err) {
		alert("Export failed. Please choose a location outside WeAnimate.app and try again.");
	}
}

function escPress(e: KeyboardEvent) {
	if (e.key === "Escape") {
		emit("userClose");
	}
}

onMounted(() => {
	document.addEventListener("keydown", escPress);
});
onUnmounted(() => {
	document.removeEventListener("keydown", escPress);
});
</script>

<template>
	<div class="export_modal">
		<Popup class="export_popup">
			<template #small-heading>Export Video</template>
			<template #large-heading>{{ movie.title }}</template>

			<div class="form_group">
				<label>Resolution</label>
				<select v-model="resolution">
					<option value="1280x720">1280x720 (720p)</option>
					<option value="1920x1080">1920x1080 (1080p)</option>
					<option value="854x480">854x480 (480p)</option>
					<option value="640x360">640x360 (360p)</option>
				</select>
			</div>

			<div class="form_group">
				<label>Output Format</label>
				<select v-model="format">
					<option value="mp4">MP4</option>
					<option value="avi">AVI</option>
					<option value="gif">GIF</option>
					<option value="mkv">MKV</option>
					<option value="mov">MOV</option>
				</select>
			</div>

			<div class="form_group checkbox_group">
				<input type="checkbox" id="widescreen" v-model="isWidescreen" />
				<label for="widescreen">Widescreen (16:9)</label>
			</div>

			<div class="form_group">
				<label>Output Location</label>
				<div class="file_picker">
					<input type="text" v-model="outputPath" readonly placeholder="Click Browse to select..." />
					<Button @click="pickFile">Browse</Button>
				</div>
			</div>

			<div class="actions">
				<Button @click="emit('userClose')">Cancel</Button>
				<Button primary @click="exportMovie">Export</Button>
			</div>
		</Popup>
	</div>
</template>
