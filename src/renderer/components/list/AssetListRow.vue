<script setup lang="ts" generic="T extends Asset">
import type { Asset } from "../../interfaces/Asset";
import AssetEntryOptions from "./options/AssetRowOptions.vue";
import AssetImage from "../AssetImage.vue";
import AssetInfoModal from "../AssetInfoModal.vue";
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import { inject, ref, toValue } from "vue";
import type { FieldIdOf } from "../../interfaces/ListTypes";
import { flattenAssetType } from "../../utils/flattenAssetType";
import locale from "../../locale/en_US";

function deleteBtn_click() {
	emit("entryDelete", props.entry.id);
}
const emit = defineEmits<{
	entryDelete: [string],
	entryClick: [],
	entryCtrlClick: [],
	entryDblClick: [],
	entryShiftClick: [],
}>();
const props = defineProps<{
	checked: boolean,
	entry: T
}>();
defineExpose({ id:props.entry.id });
const columns = inject(genericColumnIdKey<T>(), []);
const key = ref("assetlist-entry" + props.entry.id);
const showPreview = ref(false);
function entryElem_click() {
	emit("entryClick");
}
function entryElem_ctrlClick() {
	emit("entryCtrlClick");
}
function entryElem_dblClick() {
	showPreview.value = true;
	emit("entryDblClick");
}
function entryElem_shiftClick() {
	emit("entryShiftClick");
}
function assetPreviewClose_click() {
	showPreview.value = false;
}
function assetInfoUpdated({ title }:Partial<T>) {
	props.entry.title = title;
	const origKey = toValue(key);
	key.value = null;
	key.value = origKey;
}
function assetInfo(field:FieldIdOf<T>): string {
	switch (field) {
		case "type": {
			const flatType = flattenAssetType(
				props.entry.type,
				props.entry.subtype,
				props.entry.ptype
			);
			return locale.asset.flat_type_map[flatType];
		}
		default: return props.entry[field].toString();
	}
}
</script>
<template>
	<tr
		:key="key"
		:class="{ checked }"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.shift.exact="entryElem_shiftClick"
		@click.exact="entryElem_click">
		<td class="hidden">
			<input ref="select-box" type="checkbox" @input="entryElem_ctrlClick" @click.stop :checked="checked"/>
		</td>
		<td v-for="columnId in columns" :class="{ title:columnId=='title' }">
			<template v-if="columnId == 'title'" class="title">
				<AssetImage :asset="entry"/>
			</template>
			<span>{{ assetInfo(columnId) }}</span>
		</td>
		<td class="hidden">
			<AssetEntryOptions 
			:entry="entry" 
			@entry-delete="deleteBtn_click"
		/>
		</td>
		<Teleport to="body">
			<AssetInfoModal
				v-if="showPreview"
				:asset="entry"
				@close-clicked="assetPreviewClose_click"
				@update="assetInfoUpdated"/>
		</Teleport>
	</tr>
</template>
