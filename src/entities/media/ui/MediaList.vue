<script setup lang="ts">
import {
  NSpace,
  NSpin,
  NUpload,
  NUploadDragger,
  NGrid,
  NGridItem,
  NCard,
  NButton,
  NPagination,
  useMessage
} from 'naive-ui'
import { useMediaList } from '../libs/useMediaList'

const { data, status, page, error } = await useMediaList()
const message = useMessage()

if (status.value === 'error') {
  message.error(error.value?.message ?? 'На странице произошла ошибка')
}
</script>

<template>
  <div class="media-list-container">
    <n-space vertical size="large">
      <slot name="header" :on-upload="() => {}"></slot>
      <n-spin :show="status === 'pending'">
        <n-upload
          v-if="status !== 'error'"
          multiple
          directory-dnd
          :max="50"
          :show-file-list="false"
          @change="() => {}"
        >
          <n-upload-dragger>
            <n-grid v-if="data" :x-gap="12" :y-gap="12" cols="s:4 m:5 l:6 xl:8" responsive="screen">
              <n-grid-item>
                <n-card>
                  <template #cover></template>
                  <template #action></template>
                </n-card>
              </n-grid-item>
            </n-grid>
          </n-upload-dragger>
        </n-upload>
      </n-spin>
      <!-- Пагинация -->
      <div class="media-pagination">
        <NPagination v-model:page="page" :page-count="data?.files.totalPages" />
      </div>
    </n-space>
  </div>
</template>

<style scoped>
.media-list-container {
}

.media-pagination {
  padding: 1rem 0;
  display: flex;
  justify-content: center;
}

.n-card-item {
  position: relative;
  height: 100%;
}

.n-card-cover {
  flex-shrink: 0;
  height: 160px;
}

.n-card-cover > img {
  object-fit: contain;
  width: 100%;
  height: 160px;
}

.n-card-item > .n-card-header .n-card-header__main {
  text-wrap: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.media-container {
  padding: 1rem 1rem 3rem 1rem;
}
.options-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  display: none;
}

.n-card-item:hover .options-btn {
  display: flex;
}

.media-title {
  font-size: 0.75rem;
  line-height: 1.3;
}
</style>
