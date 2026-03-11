<style lang="css">
.list_tree_container {
  background: repeating-linear-gradient(
      #0000 0,
      #0000 v-bind("zoomLevel.css()"),
      hsl(257deg 14% 96.5%) v-bind("zoomLevel.css()"),
      hsl(257deg 14% 96.5%) calc(v-bind("zoomLevel.css()") * 2)
    )
    0 36px;
  overflow-x: auto;
  min-height: 100%;
}
table.list_tree {
  border-collapse: collapse;
  border-spacing: 0;
  table-layout: auto;
  width: 100%;
  min-width: 600px;
}
.select_mode_options {
  background-color: #eeedf2;
  opacity: 0;
  transition: none;
  transform: translateX(-15px);
  display: flex;
  height: 0;
}
.select_mode_options .side_padding {
  margin-right: 6px;
  padding: 1px 6px;
}
.list_tree_container.select_mode table.list_tree {
  margin-top: 33px;
}
.list_tree_container.select_mode thead.list_head {
  border: none;
  visibility: hidden;
}
.list_tree_container.select_mode thead.list_head .sort_option {
  line-height: 0;
  padding: 0 6px;
}
.list_tree_container.select_mode .select_mode_options {
  opacity: 1;
  padding: 5px 0;
  transition: transform 0.1s var(--slide-anim);
  transform: none;
  position: absolute;
  width: 100%;
  height: 35px;
}
.list_tree_container.select_mode .select_mode_options::after {
  content: "";
  height: 1px;
  width: 100%;
  display: block;
  background-color: hsl(240 12% 76% / 1);
  position: absolute;
  margin-top: 30px;
}
thead.list_head {
  background-color: #eeedf2;
  border-bottom: 1px solid hsl(240 12% 76% / 1);
  top: 0;
}
thead.list_head th {
  border-left: 1px solid;
  border-color: #bfbeca;
  top: 0;
}
thead.list_head .space.side_padding {
  border: none;
  width: 25px;
}
thead.list_head .sort_option {
  color: hsl(218deg 14% 24%);
  transition: background 0.2s var(--button-anim);
  font-weight: normal;
  text-align: center;
  line-height: 15px;
  padding: 10px 6px;
}
thead.list_head .sort_option.active {
  font-weight: bold;
}
thead.list_head .sort_option.active::after {
  content: "🞃";
  opacity: 0.7;
  float: right;
  transform: translate(-2px, 0);
}
thead.list_head .sort_option.active.desc::after {
  transform: translate(-2px, 0) rotate(180deg);
}
thead.list_head .sort_option:hover {
  background: hsl(290 40% 91%);
  transition: none;
}
thead.list_head th .dragger {
  cursor: col-resize;
  position: absolute;
  float: right;
  margin-top: -23px;
  width: 6px;
  height: 32px;
}
thead.list_head th .dragger:hover {
  background: #489cf7a3;
  transition: 0.1s ease-in;
}
table.list_tree tbody {
  transition: 0.08s var(--slide-anim);
  height: 100%;
}
table.list_tree tbody tr {
  align-items: center;
  height: v-bind("zoomLevel.css()");
}
table.list_tree tbody tr td {
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 10px 6px;
  text-align: center;
}
table.list_tree tbody tr td.hidden {
  opacity: 0;
}
table.list_tree tbody tr td.title {
  display: flex;
  align-items: center;
}
table.list_tree tbody tr td.title img {
  display: block;
  margin-right: 7px;
  width: calc(v-bind("zoomLevel.css()") - 20px);
  height: calc(v-bind("zoomLevel.css()") - 20px);
}
table.list_tree tbody tr td.title span {
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
table.list_tree tbody tr:first-of-type td:first-of-type {
  overflow: hidden;
}
table.list_tree tbody tr:hover {
  background: hsl(290 40% 91%);
}
table.list_tree tbody tr.checked {
  background: rgba(37, 13, 89, 0.55);
  color: #fff;
}
table.list_tree tbody tr:hover td.hidden,
table.list_tree tbody tr.checked td.hidden {
  opacity: 1;
}
.multiselect table.list_tree tbody tr td.actions.hidden {
  opacity: 0;
}
.list_tree_container.load_state tbody {
  transition: none;
  transform: translateX(-40px);
  opacity: 0;
}
.list_tree_container.grid {
  background: #0000;
}
.list_tree_container.grid table.list_tree {
  display: block;
}
.list_tree_container.grid table.list_tree thead.list_head {
  display: none;
}
.list_tree_container.grid table.list_tree tbody {
  display: block;
  padding-top: 20px;
  padding-left: 25px;
}
.list_tree_container.grid table.list_tree tbody tr {
  background-color: hsl(252deg 16% 97%);
  border: 1px solid hsl(252deg 16% 82%);
  border-radius: 4px;
  transition: width 0.2s var(--button-anim);
  align-items: start;
  display: inline-flex;
  flex-direction: column;
  margin: 0 10px 20px;
  padding: 6px 7px;
  width: calc(4 * v-bind("zoomLevel.css()"));
  height: auto;
}
.list_tree_container.grid table.list_tree tbody tr td {
  padding: 0;
}
.list_tree_container.grid table.list_tree tbody tr td:first-of-type {
  margin: -20px 0 0;
  position: relative;
  top: 20px;
  left: 3px;
  z-index: 1;
}
.list_tree_container.grid table.list_tree tbody tr td.title {
  display: block;
}
.list_tree_container.grid table.list_tree tbody tr td.title img {
  transition: filter 0.2s var(--button-anim);
  margin: 0;
  width: 100%;
  height: auto;
}
.list_tree_container.grid table.list_tree tbody tr td.title span {
  font-weight: bold;
  text-align: center;
  line-height: 17px;
  margin: 6px 0 4px;
  width: calc(calc(4 * v-bind("zoomLevel.css()")) - 14px);
}
.list_tree_container.grid table.list_tree tbody tr td:nth-child(3),
.list_tree_container.grid table.list_tree tbody tr td:nth-child(4) {
  background: #000a;
  color: #fff;
  font-family: monospace;
  font-size: calc(v-bind("zoomLevel.css()") * 0.2);
  padding: 0 6px;
  text-align: center;
  border-radius: 4px;
}
.list_tree_container.grid table.list_tree tbody tr td:nth-child(3) {
  display: none;
  margin: -20px 0 0 auto;
  position: relative;
  top: -30px;
  right: 2px;
}
.list_tree_container.grid table.list_tree tbody tr td:nth-child(4) {
  margin: -20px 0 0;
  position: relative;
  top: -30px;
  left: 4px;
}
.list_tree_container.grid table.list_tree tbody tr td.actions {
  background: #000c;
  border-radius: 16px;
  margin: -26px auto 0;
  padding: 7px 11px 5px 1px;
  position: relative;
  top: calc(-37px - (((9 / 16) * ((4 * v-bind("zoomLevel.css()")) - 8px)) / 2));
}
.list_tree_container.grid table.list_tree tbody tr:hover {
  background-color: hsl(290 40% 85%);
  border-color: hsl(290 40% 77%);
}
.list_tree_container.grid table.list_tree tbody tr:hover td.title img {
  filter: brightness(0.5);
}
.list_tree_container.grid table.list_tree tbody tr:hover td:nth-child(3) {
  display: block;
}
.list_tree_container.grid table.list_tree tbody tr.checked {
  background-color: rgba(37, 13, 89, 0.55);
}
.list_tree_container.grid.select_mode table.list_tree {
  margin-top: 34px;
}
.list_tree_container.grid table.list_tree tbody tr td {
  display: none;
}
.list_tree_container.grid table.list_tree tbody tr td:first-of-type,
.list_tree_container.grid table.list_tree tbody tr td.title,
.list_tree_container.grid table.list_tree tbody tr td:nth-child(3),
.list_tree_container.grid table.list_tree tbody tr td:nth-child(4),
.list_tree_container.grid table.list_tree tbody tr td.actions {
  display: block;
}
html.dark .list_tree_container:not(.grid) {
  background: repeating-linear-gradient(
      #0000 0,
      #0000 v-bind("zoomLevel.css()"),
      hsl(250 8% 17.5% / 1) v-bind("zoomLevel.css()"),
      hsl(250 8% 17.5% / 1) calc(v-bind("zoomLevel.css()") * 2)
    )
    0 36px;
}
html.dark .select_mode_options {
  background-color: hsl(250 9% 16% / 1);
}
html.dark .list_tree_container.select_mode .select_mode_options::after {
  background-color: hsl(250 9% 24% / 1);
}
html.dark thead.list_head {
  background-color: hsl(250 9% 16% / 1);
  border-color: hsl(250 9% 24% / 1);
}
html.dark thead.list_head th {
  border-color: #32313f;
}
html.dark thead.list_head .sort_option {
  color: hsl(0deg 0% 92%);
}
html.dark thead.list_head .sort_option:hover,
html.dark table.list_tree tbody tr:hover {
  background: hsl(270 26% 21% / 1);
}
html.dark table.list_tree tbody tr.checked {
  background: #250d59;
}
html.dark .list_tree_container.grid table.list_tree tbody tr {
  background-color: hsl(246deg 8% 18%);
  border-color: hsl(250deg 11% 26%);
}
html.dark .list_tree_container.grid table.list_tree tbody tr td:nth-child(3),
html.dark .list_tree_container.grid table.list_tree tbody tr td:nth-child(4) {
  background: #000a;
  color: #fff;
  font-family: monospace;
  font-size: calc(v-bind("zoomLevel.css()") * 0.2);
  padding: 0 6px;
  text-align: center;
  border-radius: 4px;
}
html.dark .list_tree_container.grid table.list_tree tbody tr:hover {
  background-color: #250d59;
}
html.dark .list_tree_container.grid table.list_tree tbody tr.checked {
  background: #daa5de;
}
</style>
<script
  setup
  lang="ts"
  generic="
    ListEntry extends GenericListEntry,
    ListRow extends typeof GenericListRow<ListEntry>,
    RowOptions extends typeof GenericRowOptions<ListEntry>
  "
>
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import type {
  FieldIdOf,
  GenericListEntry,
  ListFieldColumn,
  SelectedListSort,
} from "../../interfaces/ListTypes";
import FolderIcon from "../icons/FolderIcon.vue";
import GenericListRow from "./GenericListRow.vue";
import GenericRowOptions from "./options/GenericRowOptions.vue";
import locale from "../../locale/en_US";
import {
  onMounted,
  onUnmounted,
  provide,
  ref,
  toValue,
  useTemplateRef,
  watch,
} from "vue";
import useListStore from "../../composables/useListStore";
import { useRoute, useRouter } from "vue-router";

interface Folder {
  id: string;
  title: string;
  color: string;
  parent_id: string;
}
interface ListData {
  folders: Folder[];
  entries: ListEntry[];
}
const emit = defineEmits<{
  columnResize: [string, number];
  sortChange: [string];
}>();
const props = defineProps<{
  data: ListData;
  columns: ListFieldColumn<ListEntry>[];
  selectedSort: SelectedListSort<ListEntry>;
  restrictions?: {
    mode?: "list" | "grid";
  };
  rowComponent: ListRow;
  rowOptionsComponent: RowOptions;
}>();
const modeRestriction = props?.restrictions?.mode ?? false;
const route = useRoute();
const router = useRouter();
const { search, viewMode, zoomLevel } = useListStore();
const columnIds = props.columns.map((v) => v.id);
const selectAllBox = useTemplateRef("select-all-box");
const selection = ref<{
  anchor: number;
  entries: string[];
}>({
  anchor: 0,
  entries: [],
});
const filteredEntryIds: {
  folders: string[];
  entries: string[];
} = {
  folders: [],
  entries: [],
};
const listRows = useTemplateRef("list-row");
const mode = () => (modeRestriction ? modeRestriction : viewMode.value);
function dataFilterFunc(
  v: Folder | ListEntry,
  shouldContain: string,
  resultArray: string[],
) {
  if (v.title.toLowerCase().includes(shouldContain)) {
    resultArray.push(v.id);
  }
}
function syncSelectAllBox() {
  const allSelected =
    selection.value.entries.length == props.data.entries.length;
  selectAllBox.value.checked = allSelected;
}
function resetSelection() {
  selection.value.anchor = 0;
  selection.value.entries = [];
  syncSelectAllBox();
}
function sortOption_click(fieldId: string) {
  emit("sortChange", fieldId);
}
function dragger_down(id: FieldIdOf<ListEntry>, e: MouseEvent) {
  document.body.classList.add("col_resize");
  const option = props.columns.find((v) => v.id == id);
  const startX = e.clientX;
  const startWidth = toValue(option.width);
  const moveCb = (moveE2: MouseEvent) => {
    let newWidth = Math.max(startWidth - startX + moveE2.clientX, 95);
    newWidth = Math.min(newWidth, 400);
    option.width.value = newWidth;
  };
  window.addEventListener("mousemove", moveCb);
  window.addEventListener("mouseup", () => {
    window.removeEventListener("mousemove", moveCb);
    document.body.classList.remove("col_resize");
    emit("columnResize", id.toString(), option.width.value);
  });
}
function entry_click(id: string) {
  selection.value.entries = [id];
  selection.value.anchor = 0;
  syncSelectAllBox();
}
function selectAll_click() {
  const equal = props.data.entries.length == selection.value.entries.length;
  const allSelected = equal && props.data.entries.length > 0;
  if (allSelected) {
    resetSelection();
  } else {
    selection.value.entries = props.data.entries.map((v) => v.id);
  }
}
function folder_click(folderId: string) {
  router.push({
    name: route.name,
    params: {
      folderId,
    },
  });
}
function entry_delete(ids: string[]) {
  for (const id of ids) {
    const index = props.data.entries.findIndex((v) => v.id == id);
    if (index !== -1) {
      props.data.entries.splice(index, 1);
    }
  }
  filteredEntryIds.entries = filteredEntryIds.entries.filter(
    (id) => !ids.includes(id),
  );
  selection.value.entries = selection.value.entries.filter(
    (id) => !ids.includes(id),
  );
  selection.value.anchor = 0;
  syncSelectAllBox();
}
function entry_ctrlClick(id: string) {
  const index = selection.value.entries.indexOf(id);
  if (index !== -1) {
    const oldLength = selection.value.entries.length;
    selection.value.entries.splice(index, 1);
    if (index === oldLength - 1) {
      selection.value.anchor = selection.value.entries.length - 1;
      if (selection.value.anchor < 0) selection.value.anchor = 0;
    } else {
      selection.value.anchor = 0;
    }
  } else {
    selection.value.entries.push(id);
    selection.value.anchor = selection.value.entries.length - 1;
  }
  syncSelectAllBox();
}
function entry_dblClick() {
  resetSelection();
}
function entry_shiftClick(id: string) {
  const anchoredId = selection.value.entries[selection.value.anchor];
  if (typeof anchoredId == "undefined") {
    selection.value.entries = [id];
    selection.value.anchor = 0;
    syncSelectAllBox();
    return;
  }
  selection.value.entries = [anchoredId];
  selection.value.anchor = 0;
  const indicies = [
    listRows.value.findIndex((e) => e.id == anchoredId),
    listRows.value.findIndex((e) => e.id == id),
  ].sort((a, b) => a - b);
  for (let i = indicies[0]; i <= indicies[1]; i++) {
    const id = listRows.value[i].id;
    if (id == anchoredId) continue;
    selection.value.entries.push(id);
  }
  syncSelectAllBox();
}
function ctrlADown(e: KeyboardEvent) {
  if (!e.ctrlKey || e.key != "a") {
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  selection.value.entries = listRows.value.map((e) => e.id);
  selection.value.anchor = 0;
  syncSelectAllBox();
}
provide(genericColumnIdKey<ListEntry>(), columnIds);
watch(
  () => search.value,
  (newSearch: string) => {
    resetSelection();
    filteredEntryIds.entries = [];
    filteredEntryIds.folders = [];
    props.data.entries.forEach((v) =>
      dataFilterFunc(v, newSearch, filteredEntryIds.entries),
    );
    props.data.folders.forEach((v) =>
      dataFilterFunc(v, newSearch, filteredEntryIds.folders),
    );
  },
);
onMounted(() => {
  document.addEventListener("keydown", ctrlADown);
});
onUnmounted(() => {
  document.removeEventListener("keydown", ctrlADown);
});
defineExpose({ resetSelection });
</script>
<template>
  <div
    :class="{
      list_tree_container: true,
      grid: mode() == 'grid',
      multiselect: selection.entries.length > 1,
      select_mode: selection.entries.length > 0,
    }"
    @click.self="resetSelection"
  >
    <div class="select_mode_options">
      <div class="side_padding">
        <input
          ref="select-all-box"
          type="checkbox"
          :value="
            selection.entries.length == data.entries.length &&
            data.entries.length > 0
          "
          @input="selectAll_click"
        />
      </div>
      {{ selection.entries.length }} selected
      <component
        :is="rowOptionsComponent"
        :entry="selection.entries"
        @entry-delete="entry_delete"
      />
    </div>
    <table class="list_tree">
      <thead class="list_head">
        <tr>
          <th class="space side_padding"></th>
          <th
            v-for="field in columns"
            :class="{
              active: selectedSort.id == field.id,
              desc: selectedSort.descending,
              sort_option: true,
            }"
            :style="{
              width: mode() == 'list' ? field.width.value + 'px' : '150px',
            }"
            @click.self="sortOption_click(field.id.toString())"
          >
            {{ locale.list.column_name?.[field.id.toString()] ?? field.id }}
            <div
              v-if="mode() == 'list'"
              class="dragger"
              :style="{ marginLeft: field.width.value - 11 + 'px' }"
              @mousedown.stop.prevent="(e) => dragger_down(field.id, e)"
            ></div>
          </th>
          <th class="space"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="folder in data.folders">
          <tr
            v-if="
              search.value.length > 0
                ? filteredEntryIds.folders.includes(folder.id)
                : true
            "
            class="entry folder"
            @click="folder_click(folder.id)"
          >
            <td></td>
            <template v-for="columnId in columnIds">
              <td v-if="columnId == 'title'" class="title">
                <FolderIcon :color="folder.color" />
                <span>
                  {{ folder.title }}
                </span>
              </td>
              <td v-else></td>
            </template>
            <td></td>
          </tr>
        </template>
        <template v-for="entry in data.entries">
          <component
            :is="rowComponent"
            v-if="
              search.value.length > 0
                ? filteredEntryIds.entries.includes(entry.id)
                : true
            "
            ref="list-row"
            :checked="selection.entries.includes(entry.id)"
            :entry="entry"
            @entry-delete="entry_delete([entry.id])"
            @entry-click="entry_click(entry.id)"
            @entry-ctrl-click="entry_ctrlClick(entry.id)"
            @entry-dbl-click="entry_dblClick()"
            @entry-shift-click="entry_shiftClick(entry.id)"
          />
        </template>
      </tbody>
    </table>
  </div>
</template>
