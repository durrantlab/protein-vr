<template>
    <button
        :title="title"
        :id="id"
        class="ui-button"
        :style="styles">
            <span v-html="svg"></span>
    </button>
</template>

<script lang="ts">
export default {
    "props": [
        "title", "id", "curBottom", "svg"
    ],
    "computed": {
        "styles"(): string {
            return `color:white;
                width:80px;
                height:50px;
                right:5px;
                position:absolute;
                bottom:` + this["curBottom"].toString() + `px;
                background-color:rgba(51,51,51,0.7);
                border:none;
                outline:none;
                cursor:pointer;"`.replace("\n", "");
        }
    }
};
</script>
