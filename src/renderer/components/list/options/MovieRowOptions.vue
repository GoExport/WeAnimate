<style src="./list_row_options.css"></style>
<script setup lang="ts" generic="T extends Movie">
import { apiServer } from "../../../utils/AppInit";
import type { Movie } from "../../../interfaces/Movie";
import openPlayerWindow from "../../../utils/openPlayerWindow";
import en_US from "../../../locale/en_US";
import useAppSettings from "../../../composables/useAppSettings";
const emit = defineEmits<{
  entryDelete: [string[]];
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

function goExportHref() {
  if (!isSingular) {
    return "javascript:;";
  }
  const movieId = (props.entry as Movie).id;
  const params = new URLSearchParams({
    video_id: movieId,
    service: "local2",
    no_input: "1",
    resolution: settingValue("geResolution", "720p"),
    aspect_ratio: settingValue("geAspect", "16:9"),
    open_folder: settingValue("geOpenFolder", "false"),
    use_outro: settingValue("geOutro", "true"),
    obs_required: settingValue("geRequireObs", "false"),
  });
  return `goexport://?${params.toString()}`;
}

function playBtn_click() {
  openPlayerWindow((props.entry as Movie).id);
}
async function deleteBtn_click() {
  const msg = isSingular
    ? en_US.list.actions.movie_delete_confirm.sing
    : en_US.list.actions.movie_delete_confirm.plr;
  if (!confirm(msg)) {
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
      :href="goExportHref()"
      title="Export"
      @click.stop
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
