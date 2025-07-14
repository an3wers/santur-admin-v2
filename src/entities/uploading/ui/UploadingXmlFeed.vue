<script setup lang="ts">
import { NCard, NInput, NButton, NIcon } from 'naive-ui'
import { Copy, ExternalLink } from '@vicons/tabler'
import { useCopyToClipboard } from '~/shared/libs/copy-to-clipboard'

const link = 'https://isantur.ru/Client/GetCatalogFeed'

const openInNewTabHandler = () => {
  window.open(link, '_blank')
}
const copyToClipboard = useCopyToClipboard()
const copyHandler = async () => {
  await copyToClipboard(link)
}
</script>

<template>
  <n-card title="Ссылка на получение XML">
    <div class="row">
      <n-input class="row__input" :value="link" readonly />
      <div class="row__btns">
        <n-button ghost @click="openInNewTabHandler">
          <n-icon size="20px" :component="ExternalLink" />
        </n-button>
        <n-button ghost @click="copyHandler">
          <n-icon size="20px" :component="Copy" />
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.row {
  display: flex;
  gap: 0.5rem;
}

.row__input {
  max-width: 320px;
  flex-shrink: 1;
}

.row__btns {
  display: flex;
  gap: 0.5rem;
}
</style>
