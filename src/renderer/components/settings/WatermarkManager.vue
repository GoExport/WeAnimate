<style>
.wm_manager input {
  display: none;
}
.wm_manager .watermark_container {
  width: calc(100% + 20px);
}
.wm_manager .upload_button,
.wm_manager .watermark {
  background-color: hsl(252deg 16% 97%);
  border: 1px solid hsl(252deg 16% 82%);
  border-radius: 4px;
  user-select: none;
  -webkit-user-drag: none;
  display: inline-block;
  margin: 0 14px 16px 0;
  width: 124px;
  height: 66px;
}
.wm_manager .upload_button {
  display: inline-flex;
  justify-content: center;
}
.wm_manager .upload_button small {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
  padding: 20px 0 0 5px;
}
.wm_manager .watermark .thumbnail {
  object-fit: contain;
  width: 100%;
  height: 100%;
}
.wm_manager .watermark .actions {
  display: none;
  position: relative;
  top: 4px;
  height: 0;
}
.wm_manager .watermark .actions .ico.btn {
  margin: 0 2px 0 4px;
}
.wm_manager .upload_button:hover,
.wm_manager .watermark:hover {
  background-color: hsl(290 40% 85%);
  border-color: hsl(290 40% 77%);
  cursor: pointer;
}
.wm_manager .watermark:hover .actions {
  display: block;
}
.wm_manager .upload_button.checked,
.wm_manager .watermark.checked {
  background-color: hsl(290 40% 85%);
  border-color: #daa5de;
  box-shadow: inset 0 0 0 1px #daa5de;
}
.wm_manager .watermark.checked::after {
  content: "\E207";
  font-family: "GlyphiconsRegular";
  background: #daa5de;
  color: #fff;
  border-radius: 100%;
  float: right;
  position: relative;
  top: -78px;
  right: -10px;
  padding: 0 5px 1px 6px;
}
html.dark .wm_manager .upload_button,
html.dark .wm_manager .watermark {
  background-color: hsl(250deg 10% 19%);
  border-color: hsl(250deg 11% 26%);
}
html.dark .wm_manager .upload_button:hover,
html.dark .wm_manager .watermark:hover {
  background-color: hsl(270 26% 26% / 1);
  border-color: hsl(270 26% 41% / 1);
}
html.dark .wm_manager .watermark.checked {
  background: #250d59;
  border-color: #daa5de;
  box-shadow: inset 0 0 0 1px #daa5de;
}
html.dark .wm_manager .watermark.checked::after {
  background: #daa5de;
}
</style>

<script setup lang="ts">
import { apiServer } from "../../utils/AppInit";
import Button from "../controls/Button.vue";
import { onMounted, ref, useTemplateRef } from "vue";
import useAppSettings from "../../composables/useAppSettings";
type Watermark = {
  id: string;
  thumbnail: string;
};
const appSettings = useAppSettings();
const container = useTemplateRef("wm-container");
const defaultWm = ref<string>(appSettings.get("defaultWatermark") as string);
const pendingReplaceId = ref<string>();
const wmInput = useTemplateRef<HTMLInputElement>("wm-input");
const wmReplaceInput = useTemplateRef<HTMLInputElement>("wm-replace-input");
const watermarks = ref<Watermark[]>([]);

async function loadWatermarks() {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState != 4 || this.status != 200) {
      return;
    }
    let responseJson = JSON.parse(this.responseText);
    watermarks.value = responseJson;
  };
  const url = apiServer + "/api/watermark/list";
  xhttp.open("GET", url, true);
  xhttp.send();
}
async function wmInput_input(replaceMode?: boolean) {
  const image = replaceMode
    ? wmReplaceInput.value.files[0]
    : wmInput.value.files[0];
  const id = pendingReplaceId.value;

  const body = new FormData();
  body.append("image", image);
  if (replaceMode) {
    body.append("id", id);
  }
  const res = await fetch(apiServer + "/api/watermark/save", {
    method: "POST",
    body,
  });
  wmInput.value.value = "";
  wmReplaceInput.value.value = "";
  pendingReplaceId.value = null;
  if (!res.ok) {
    return;
  }
  const json = await res.json();
  if (replaceMode) {
    const wmImage: HTMLImageElement = container.value.querySelector(
      `[src*="${id}"]`,
    );
    await fetch(wmImage.src);
    wmImage.src = wmImage.src;
    return;
  }
  watermarks.value.unshift(json);
}
async function wm_click(id: string) {
  const body = new FormData();
  if (id == defaultWm.value) {
    id = null;
  } else {
    body.append("id", id);
  }
  const res = await fetch(apiServer + "/api/watermark/set_default", {
    method: "POST",
    body,
  });
  if (res.ok) {
    defaultWm.value = id;
  }
}
async function wmReplace_click(id: string) {
  pendingReplaceId.value = id;
  wmReplaceInput.value.click();
}
async function wmDelete_click(id: string) {
  if (!confirm("Are you sure that you want to remove the watermark?")) {
    return;
  }
  const body = new FormData();
  body.append("id", id);

  const res = await fetch(apiServer + "/api/watermark/delete", {
    method: "POST",
    body,
  });
  if (res.ok) {
    const index = watermarks.value.findIndex((w) => w.id == id);
    watermarks.value.splice(index, 1);
  }
}
onMounted(loadWatermarks);
</script>

<template>
  <div class="wm_manager">
    <div class="app_setting">
      <div>
        <h3>Manage watermarks</h3>
        <p>Import, remove or set a default watermark</p>
      </div>
    </div>
    <div class="watermark_container" ref="wm-container">
      <div class="upload_button" @click="wmInput.click">
        <img src="/img/importer/import.svg" alt="Import" />
        <small>Import</small>
      </div>
      <div
        :class="{
          watermark: true,
          checked: defaultWm == '0vTLbQy9hG7k',
        }"
        @click="wm_click('0vTLbQy9hG7k')"
      >
        <img class="thumbnail" src="/img/logo.svg" />
      </div>
      <div
        v-for="wm in watermarks"
        :class="{
          watermark: true,
          checked: defaultWm == wm.id,
        }"
        @click="wm_click(wm.id)"
      >
        <div class="actions">
          <Button
            icon
            primary
            @click.stop="wmReplace_click(wm.id)"
            title="Replace"
          >
            <i class="ico arr_swap"></i>
          </Button>
          <Button icon @click.stop="wmDelete_click(wm.id)" title="Remove">
            <i class="ico trash"></i>
          </Button>
        </div>
        <img
          class="thumbnail"
          :src="
            wm.thumbnail.endsWith('.swf')
              ? '/img/importer/flash.svg'
              : wm.thumbnail
          "
        />
      </div>
    </div>
    <input type="file" ref="wm-input" accept=".png" @input="wmInput_input()" />
    <input
      type="file"
      ref="wm-replace-input"
      accept=".png"
      @input="wmInput_input(true)"
    />
  </div>
</template>
