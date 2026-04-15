<style lang="css" scoped>
#full_page_container {
	background-color: black;
	padding: 0;
	width: 100%;
	height: 100%;
}
#player_object {
	display: block;
	margin: auto;
	width: 100%;
	height: 100%;
}
#full_page_container.popup_mode {
	background: radial-gradient(#333, #111);
}
#full_page_container.popup_mode #player_object {
	height: 1px;
}
</style>

<script setup lang="ts">
import { apiServer, Params, staticPaths, staticServer, swfUrlBase, toAttrString } from "../utils/AppInit";
import { ref } from "vue";
import useAppSettings from "../composables/useAppSettings";
import { useRoute } from "vue-router";
const appSettings = useAppSettings();
let params:Params = {
	flashvars: {
		appCode: "go",
		autostart: "1",
		collab: "0",
		ctc: "go",
		goteam_draft_only: "1",
		isLogin: "Y",
		isWide: "0",
		lid: "0",
		nextUrl: "/",
		page: "",
		retut: "1",
		siteId: "go",
		ut: "60",
		apiserver: apiServer + "/",
		storePath: staticServer + staticPaths.storeUrl + "/<store>",
		clientThemePath: staticServer + staticPaths.clientUrl + "/<client_theme>"
	},
	allowScriptAccess: "always",
	allowFullScreen: "true",
};
const showObject = ref(false);
let swfUrl:string;

async function displayPlayer(movieId:string) {
	await appSettings.loadSettings();
    const wideSetting = appSettings.get("isWide");
    params.flashvars.isWide = wideSetting === "1" || wideSetting === true ? "1" : "0";
	swfUrl = swfUrlBase + "/player.swf";
	params.flashvars.movieId = movieId;
	params.movie = swfUrl;
	showObject.value = true;
}
const route = useRoute();
const movieId = route.params.movieId as string;
displayPlayer(movieId);
</script>

<template>
	<div id="full_page_container">
		<object v-if="showObject" id="player_object" :src="swfUrl" type="application/x-shockwave-flash" ref="player-object">
			<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
		</object>
	</div>
</template>
