<style lang="css" scoped>
header {
  background: hsl(255 13% 88% / 1);
  border-bottom: 1px solid hsl(240 12% 76% / 1);
  border-radius: 10px 0 0;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 6.5px 8px;
  height: 50px;
}
header > div {
  display: flex;
  align-items: center;
  height: 100%;
}

header .nav_btn {
  border: 1px solid #0000;
  color: hsl(211 4% 32% / 1);
  border-radius: 5px;
  transition: 0.2s var(--button-anim);
  font-size: 16px;
  margin: 0 3px 0 3px;
  padding: 2px 8px;
}
header .nav_btn i {
  transform: translateY(1px);
}
header .nav_btn:hover {
  background: hsl(290 37% 83%);
  border-color: hsl(290 57% 58% / 45%);
  color: hsl(290 15% 30% / 1);
  transition: none;
  cursor: pointer;
}

header .link_container {
  margin-left: 2px;
  overflow: hidden;
  white-space: nowrap;
}
header .link_container .link {
  color: #454257;
  border-radius: 3px;
  transition: background 0.2s var(--button-anim);
  padding: 4px 8px;
  height: 100%;
}
header .link_container .link:hover {
  background: hsl(290 37% 83%);
  transition: none;
}

header .link_container .parent_link {
  text-decoration: none;
  margin: 0 20px 0 0;
}
header .link_container .parent_link .caret {
  opacity: 0.6;
  pointer-events: none;
  font-size: 12px;
  position: relative;
  display: inline;
  margin-left: -16px;
  left: 24px;
}

header .link_container .final_link {
  user-select: none;
  font-weight: bold;
}

header .btn {
  margin: 0;
}
header .search_box {
  background: hsl(255 13% 90% / 1);
  border: 1px solid hsl(255 12% 73% / 1);
  border-radius: 3px;
  transition: 0.2s var(--button-anim);
  padding: 5px 6px;
}
header .search_box:focus {
  background: hsl(255 13% 91% / 1);
  border-color: #daa5de;
  outline: none;
}

html.dark header {
  background: hsl(250 9% 13% / 1);
  border-color: hsl(250 9% 24% / 1);
}
html.dark header .nav_btn {
  color: hsl(0deg 0% 82%);
}
html.dark header .nav_btn:hover {
  background: hsl(270 21% 21% / 1);
  color: #daa5de;
}
html.dark header .link_container .link {
  color: hsl(0deg 0% 85%);
}
html.dark header .link_container .link:hover {
  background: hsl(270 21% 21% / 1);
}
html.dark header .search_box {
  background: hsl(250 9% 16% / 1);
  border-color: hsl(250 9% 24% / 1);
  color: hsl(0deg 0% 82%);
}
html.dark header .search_box:focus {
  border-color: #daa5de;
}
</style>

<script setup lang="ts">
import Dropdown from "./controls/Dropdown.vue";
import DropdownItem from "./controls/DropdownItem.vue";
import { useRouter } from "vue-router";
import useListStore from "../composables/useListStore";

export interface NavbarEntry {
  path: string;
  title: string;
}

const emit = defineEmits<{
  downloadClick: [];
  newFolderClick: [];
}>();
defineProps<{
  count?: number;

  entries: NavbarEntry[];

  supported?: {
    download?: boolean;

    newFolder?: boolean;

    search?: boolean;

    viewMode?: boolean;

    zoom?: boolean;
  };
}>();

const router = useRouter();
const { search, viewMode, zoomLevel } = useListStore();

function backButtonClick() {
  router.back();
}
function forwardButtonClick() {
  router.forward();
}

function onSearchInput(e: InputEvent) {
  const target = e.currentTarget as HTMLInputElement;
  search.set(target.value);
}

function downloadButton_click() {
  emit("downloadClick");
}

function newFolderClick() {
  emit("newFolderClick");
}

function changeView(newView: "grid" | "list") {
  viewMode.set(newView);
}

function zoomSliderMoved(e: InputEvent) {
  const target = e.currentTarget as HTMLInputElement;
  const newVal = target.valueAsNumber;
  zoomLevel.set(newVal);
}
</script>

<template>
  <header>
    <div class="head_left">
      <div class="nav_btn" @click="backButtonClick">
        <i class="ico left"></i>
      </div>
      <div class="nav_btn" @click="forwardButtonClick">
        <i class="ico right"></i>
      </div>
      <div class="link_container">
        <RouterLink
          v-for="parent in entries.slice(0, -1)"
          :to="parent.path"
          class="link parent_link"
        >
          {{ parent.title }}
          <div class="caret"><i class="ico right"></i></div>
        </RouterLink>
        <span v-if="entries.length > 0" class="link final_link">
          {{ entries[entries.length - 1].title }}
          <template v-if="count"> ({{ count }}) </template>
        </span>
      </div>
    </div>
    <div class="head_right">
      <!-- download button -->
      <div
        v-if="supported?.download"
        class="nav_btn"
        title="Download"
        @click="downloadButton_click"
      >
        <i class="ico download"></i>
      </div>
      <!-- new folder button -->
      <!-- <div v-if="supported?.newFolder"
				class="nav_btn"
				title="New folder"
				@click="newFolderClick">
				<i class="ico newfolder"></i>
			</div> -->

      <input
        v-if="supported?.search"
        class="search_box"
        type="text"
        placeholder="Search"
        @input="onSearchInput"
      />
      <!-- zoom slider -->
      <Dropdown v-if="supported?.zoom" align="right">
        <template #toggle>
          <div class="nav_btn" title="Adjust zoom level">
            <i class="ico magnify"></i>
          </div>
        </template>
        <DropdownItem>
          <input
            type="range"
            min="42"
            max="70"
            :value="zoomLevel.get()"
            @input="zoomSliderMoved"
          />
        </DropdownItem>
      </Dropdown>
      <!-- view options -->
      <div
        v-if="supported?.viewMode && viewMode.value == 'list'"
        class="nav_btn"
        title="Grid view"
        @click="() => changeView('grid')"
      >
        <i class="ico grid"></i>
      </div>
      <div
        v-if="supported?.viewMode && viewMode.value == 'grid'"
        class="nav_btn"
        title="List view"
        @click="() => changeView('list')"
      >
        <i class="ico blist"></i>
      </div>
    </div>
  </header>
</template>
