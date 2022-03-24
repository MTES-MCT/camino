<template>
  <Pill :color="`bg-domaine-${domaineId}`" class="mono">
    {{ domaineId }}
  </Pill>
</template>

<script setup lang="ts">
import Pill from '../_ui/pill.vue'
import {DomaineId} from "@/../../common/types";
import { withDefaults} from 'vue'


withDefaults(defineProps<{
  domaineId: DomaineId
}>(), {domaineId: 'm'})

</script>
