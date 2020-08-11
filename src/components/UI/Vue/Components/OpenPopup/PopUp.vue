<template>
    <div id="btnsWrapper" :style="btnsWrapperStyle">
        <front-button
            v-for="item in runModeButtons"
            :key="item.id"
            :title="item.title"
            :id ="item.id"
            :curBottom = "item.curBottom"
            :svg = "item.svg"
            @click.native="item.clickFunc"
        ></front-button>
    </div>
</template>

<script lang="ts">
// import FrontButton from "./FrontButton.vue";

export default {
    "data"() {
        return {};
    },
    // "components": {"FrontButton": FrontButton},
    "computed": {
    },
    "methods": {},
    "mounted"(): void {

    }
};
</script>
