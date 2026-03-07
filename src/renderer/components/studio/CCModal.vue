<style lang="css">
.cc_popup_container {
	background: #0000;
}
.cc_popup_container .popup {
	max-height: 100%;
}
.cc_popup_container .popup .contents {
	padding: 0 25px;
}
</style>

<script setup lang="ts">
import Button from "../controls/Button.vue";
import CCObject from "../CCObject.vue";
import Popup from "../Popup.vue";
import { onMounted, onUnmounted, useTemplateRef } from "vue";

type CCObjectType = InstanceType<typeof CCObject>;
const emit = defineEmits<{
	charSaved: [string],
	userClose: [],
}>();
const { show = true } = defineProps<{
	show?: boolean
}>();
const ccObject = useTemplateRef<CCObjectType>("cc-object");
function exit() {
	ccObject.value.reset();
	emit("userClose");
}
function charSaved(id:string) {
	emit("charSaved", id);
	exit();
}
function displayBrowser(themeId:string) {
	ccObject.value.displayBrowser(themeId);
}
function copyCharacter(themeId:string, assetId:string) {
	ccObject.value.copyCharacter(themeId, assetId);
}
function escPress(e:KeyboardEvent) {
	if (e.key != "Escape") {
		return;
	}
	exit();
}
onMounted(() => {
	document.addEventListener("keydown", escPress);
});
onUnmounted(() => {
	document.removeEventListener("keydown", escPress);
});
defineExpose({ displayBrowser, copyCharacter });
</script>

<template>
	<div class="cc_modal">
		<Popup class="cc_popup_container" :show="show">
			<template #small-heading>Character creator</template>
			<template #large-heading>Create a character</template>
			<template #head-right>
				<Button primary @click="exit">Exit</Button>
			</template>
	
			<CCObject ref="cc-object" :strict-theme-upload="true" @char-saved="charSaved"/>
		</Popup>
	</div>
</template>
