<style src="./list_row_options.css"></style>
<script setup lang="ts" generic="T extends Asset">
import { apiServer } from "../../../utils/AppInit";
import type { Asset } from "../../../interfaces/Asset";
import en_US from "../../../locale/en_US";
const emit = defineEmits<{
	entryDelete: [string[]]
}>();
const props = defineProps<{
	entry: T | string[]
}>();
const isSingular = !Array.isArray(props.entry);
function idsAsArray(): string[] {
	return Array.isArray(props.entry) ? props.entry : [props.entry.id];
}
async function deleteBtn_click() {
	const msg = isSingular ?
		en_US.list.actions.asset_delete_confirm.sing :
		en_US.list.actions.asset_delete_confirm.plr;
	if (!confirm(msg)) return;
	const ids = Array.isArray(props.entry) 
		? props.entry 
		: [(props.entry as T).id];
	const idField = ids.join(",");
	try {
		const res = await fetch(apiServer + "/api_v2/asset/delete/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				data: { id: idField }
			})
		});
		if (!res.ok) throw new Error();
		emit("entryDelete", ids);
	} catch (e) {
		alert("Failed to delete assets");
	}
}
</script>
<template>
	<div class="list_row_options">
		<a 
			class="option" 
			href="javascript:;" 
			@click.stop.prevent="deleteBtn_click" 
			title="Delete">
			<i class="ico trash"></i>
		</a>
	</div>
</template>
