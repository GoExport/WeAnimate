<style>
.app_info_popup .about {
	display: flex;
	padding-bottom: 8px;
}
.app_info_popup .about img {
	margin-right: 8px;
	width: 150px;
	height: 150px;
}
.app_info_popup .about h1 {
	margin: 0 0 4px;
}
.app_info_popup .about h3 {
	margin: 0 0 8px;
}
.app_info_popup .about p {
	margin: 0 0 16px;
}
.app_info_popup .about .links {
	text-align: center;
}
.app_info_popup .about .links a {
	margin: 0 18px;
}
</style>

<script setup lang="ts">
import Button from "./controls/Button.vue";
import Popup from "./Popup.vue";
import { wrapperVer } from "../utils/AppInit";
import { onMounted, onUnmounted } from "vue";

const emit = defineEmits<{
	userClose: []
}>();

function escPress(e:KeyboardEvent) {
	if (e.key != "Escape") {
		return;
	}
	emit("userClose");
}

onMounted(() => {
	document.addEventListener("keydown", escPress);
});
onUnmounted(() => {
	document.removeEventListener("keydown", escPress);
});
</script>

<template>
	<div class="app_info_modal">
		<Popup class="app_info_popup">
			<template #small-heading>WeAnimate</template>
			<template #large-heading>About</template>

			<div class="about">
				<img src="/img/logo_icon.svg"/>
				<div>
					<h1>WeAnimate</h1>
					<h3>Version {{ wrapperVer }}</h3>

					<p>All original code written for WeAnimate is<br/>
						distributed under the MIT license</p>
					
					<div class="links">
						<a href="javascript:window.appWindow.openDiscord();">Discord</a>
						&bull;
						<a href="javascript:window.appWindow.openFAQ();">FAQ</a>
						&bull;
						<a href="javascript:window.appWindow.openGitHub();">GitHub</a>
						<br/>
						<a href="javascript:window.appWindow.openDataFolder();">Open data folder</a>
					</div>
				</div>
			</div>

			<template #foot>
				<Button primary @click="$emit('userClose')">Close</Button>
			</template>
		</Popup>
	</div>
</template>