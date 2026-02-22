<script setup lang="ts">
import {
	apiServer,
	Params,
	staticPaths,
	staticServer,
	swfUrlBase,
	toAttrString
} from "../utils/AppInit";
import extractCharThemeId from "../utils/extractCharThemeId";
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
const emit = defineEmits<{
	ccEnter: [],
	charSaved: [string],
}>();
const props = defineProps<{
	strictThemeUpload?: boolean
}>();
const ccObject = useTemplateRef("cc-object");
const showObject = ref(false);
let swfUrl:string;
let params:Params = {
	flashvars: {
		appCode: "go",
		ctc: "go",
		isEmbed: "1",
		isLogin: "Y",
		m_mode: "school",
		page: "",
		siteId: "go",
		tlang: "en_US",
		ut: "60",
		apiserver: apiServer + "/",
		storePath: staticServer + staticPaths.storeUrl + "/<store>",
		clientThemePath: staticServer + staticPaths.clientUrl + "/<client_theme>"
	},
	allowScriptAccess: "always",
	movie: ""
};
onMounted(() => {
	window.typeSelected = function typeSelected(type:string) {
		showObject.value = false;
		setTimeout(() => {
			createCharacter(params.flashvars.themeId, type);
		}, 55);
	};
	window.copyClicked = function copyClicked(assetId:string) {
		showObject.value = false;
		setTimeout(() => {
			copyCharacter(params.flashvars.themeId, assetId);
		}, 55);
	};
	window.characterSaved = function characterSaved(id:string) {
		reset();
		setTimeout(() => {
			emit("charSaved", id);
		}, 55);
	};
});
onUnmounted(() => {
	delete window.typeSelected;
	delete window.copyClicked;
	delete window.characterSaved;
});
function fileDropped(e:DragEvent) {
	const reader = new FileReader();
	reader.onload = (e2) => {
		const xml = e2.target.result.toString();
		const themeId = extractCharThemeId(xml);
		if (props.strictThemeUpload && themeId != params.flashvars.themeId) {
			return;
		}
		reset();
		setTimeout(() => {
			uploadCharacter(themeId, xml);
		}, 55);
	};
	reader.readAsText(e.dataTransfer.files[0]);
}
function getXml(): string {
	return swfUrl.endsWith("cc.swf") ? ccObject.value.getXml() : "";
}
function displayCreator() {
	emit("ccEnter");
	swfUrl = swfUrlBase + "/cc.swf";
	params.movie = swfUrl;
	showObject.value = true;
}
function displayBrowser(themeId:string) {
	swfUrl = swfUrlBase + "/cc_browser.swf";
	params.flashvars.themeId = themeId;
	params.movie = swfUrl;
	showObject.value = true;
}
function createCharacter(themeId:string, bs:string) {
	params.flashvars.themeId = themeId;
	params.flashvars.bs = bs;
	displayCreator();
}
function copyCharacter(themeId:string, assetId:string) {
	params.flashvars.themeId = themeId;
	params.flashvars.original_asset_id = assetId;
	displayCreator();
}
function uploadCharacter(themeId:string, xmlData:string) {
	params.flashvars.themeId = themeId;
	params.flashvars.xml_data = xmlData;
	displayCreator();
}
function reset() {
	delete params.flashvars.bs;
	delete params.flashvars.themeId;
	delete params.flashvars.original_asset_id;
	delete params.flashvars.xml_data;
	delete params.movie;
	showObject.value = false;
	swfUrl = "";
}
defineExpose({
	displayBrowser,
	createCharacter,
	copyCharacter,
	getXml,
	uploadCharacter,
	reset
});
</script>
<template>
	<object v-if="showObject"
		id="cc_object"
		:src="swfUrl"
		type="application/x-shockwave-flash"
		width="980"
		height="600"
		ref="cc-object"
		@dragover.prevent.stop=""
		@drop.prevent.stop="fileDropped">
		<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
	</object>
</template>
