<style src="./list_row_options.css"></style>
<script setup lang="ts" generic="T extends Movie">
import { apiServer } from "../../../utils/AppInit";
import type { Movie } from "../../../interfaces/Movie";
import openPlayerWindow from "../../../utils/openPlayerWindow";
import en_US from "../../../locale/en_US";
import useAppSettings from "../../../composables/useAppSettings";
const emit = defineEmits<{
  entryDelete: [string[]];
  export: [Movie];
}>();
const props = defineProps<{
  entry: T | string[];
}>();
const isSingular = !Array.isArray(props.entry);
const appSettings = useAppSettings();

function settingValue(id: string, fallback: string): string {
  const value = appSettings.get(id);
  if (typeof value === "undefined" || value === null) {
    return fallback;
  }
  return value.toString();
}

function playBtn_click() {
  openPlayerWindow((props.entry as Movie).id);
}
async function deleteBtn_click() {
  const actualIsSingular = Array.isArray(props.entry)
    ? props.entry.length === 1
    : true;
  const msg = actualIsSingular
    ? en_US.list.actions.movie_delete_confirm.sing
    : en_US.list.actions.movie_delete_confirm.plr;
  const subtext = actualIsSingular
    ? "It cannot be recovered"
    : "They cannot be recovered";
  const confirmed = await window.appWindow.confirmQuit(msg, subtext);
  if (!confirmed) {
    return;
  }
  const idField = Array.isArray(props.entry)
    ? props.entry.join(",")
    : props.entry.id;
  const body = new FormData();
  body.append("id", idField);
  const res = await fetch(apiServer + "/api/movie/delete", {
    method: "POST",
    body,
  });
  if (!res.ok) {
    alert("Failed to delete movies");
    return;
  }
  emit("entryDelete", idField.split(","));
}
function idsAsArray() {
  return Array.isArray(props.entry) ? props.entry : [props.entry.id];
}
</script>
<template>
  <div class="list_row_options">
    <a
      v-show="isSingular"
      class="option"
      href="javascript:;"
      @click.stop.prevent="playBtn_click"
      title="Play"
    >
      <i class="ico play"></i>
    </a>
    <RouterLink
      v-show="isSingular"
      class="option"
      :to="`/movies/edit/${(entry as T).id}`"
      title="Edit"
      @click.stop
    >
      <i class="ico brush"></i>
    </RouterLink>
    <a
      class="option"
      :href="`${apiServer}/file/movie/file/${idsAsArray().join(',')}`"
      download="export.zip"
      title="Export project files"
      @click.stop
    >
      <i class="ico download"></i>
    </a>
    <a
      v-show="isSingular"
      class="option"
      href="javascript:;"
      title="Export"
      @click.stop.prevent="emit('export', props.entry as Movie)"
    >
      <i class="ico cloud"></i>
    </a>
    <a
      class="option"
      href="javascript:;"
      @click.stop.prevent="deleteBtn_click"
      title="Delete"
    >
      <i class="ico trash"></i>
    </a>
  </div>
</template>
