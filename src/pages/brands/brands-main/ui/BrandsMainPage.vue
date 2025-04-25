<script setup lang="ts">
import {
  NButton,
  NSpace,
  NH1,
  NCard,
  NList,
  NListItem,
  NSwitch,
  NDropdown,
  NP,
  NSpin,
  NSelect,
  NIcon,
  useMessage
} from 'naive-ui'
import { useBrands } from '../model/use-brands'
import { useNavStore } from '~/shared/navigation'
import { useChangePublishBrand } from '~/entities/brand'
import type { DropdownMixedOption } from 'naive-ui/es/dropdown/src/interface'
import { Dots } from '@vicons/tabler'
import { descriptionOptions, logoOptions, publishOptions } from '../model/filters-options'
import InputSearch from '~/shared/ui/input-search/InputSearch.vue'

const navStore = useNavStore()
const title = computed(() => navStore.currentNavigationMenu?.label ?? '')

const {
  data,
  lettersEng,
  lettersRus,
  status,
  brandsOptions,
  filtersDisabled,
  isFiltered,
  setBrandsOptions,
  updatePublishForBrandsItem,
  clearAllFilters
} = await useBrands()

if (status.value === 'error') {
  createError({ statusMessage: 'Произошла ошибка при загрузке брендов', statusCode: 400 })
}

function lettersHandler(letter: string) {
  if (brandsOptions.letter !== letter) {
    setBrandsOptions({ letter })
  }
}

const message = useMessage()

const { changePublish, status: changePublishStatus } = useChangePublishBrand()
async function handleChangePunlish(brandId: number) {
  const status = await changePublish(brandId)

  if (changePublishStatus.value === 'success' && status) {
    updatePublishForBrandsItem(brandId, status)
    message.success('Статус публикации изменен')
  }
}

const moreMenu = [{ label: 'Изменить', key: 'edit' }] as const

type MenuKeys = (typeof moreMenu)[number]['key']

const handleDropdown = (key: MenuKeys, id: number) => {
  switch (key) {
    case 'edit':
      return navigateTo(`/${navStore.currentNavigationMenu?.modelName ?? 'brends'}/${id}`)
  }
}

const searchValue = ref(brandsOptions.search)
watch(searchValue, (val) => setBrandsOptions({ search: val, letter: val ? '' : 'A' }))
</script>

<template>
  <div class="container">
    <n-space vertical size="large">
      <page-title back-label="Главная" has-back back-path="/">
        <template #title>
          <n-h1>{{ title }}</n-h1>
        </template>
        <!-- <template #actions>
          <n-button attr-type="button" disabled secondary type="info">Заполнить бренды</n-button>
          <n-button attr-type="button" disabled type="primary">Новый</n-button>
        </template> -->
      </page-title>

      <div class="letters-container">
        <div class="letters-row">
          <n-button
            size="small"
            @click="lettersHandler(item.letter)"
            :disabled="status === 'pending'"
            :type="brandsOptions.letter === item.letter ? 'primary' : 'default'"
            v-for="item in lettersEng"
            :key="item.letter"
            >{{ item.letter }}</n-button
          >
        </div>
        <div class="letters-row">
          <n-button
            size="small"
            :disabled="status === 'pending'"
            @click="lettersHandler(item.letter)"
            :type="brandsOptions.letter === item.letter ? 'primary' : 'default'"
            v-for="item in lettersRus"
            :key="item.letter"
            >{{ item.letter }}</n-button
          >
        </div>
      </div>

      <n-spin :show="status === 'pending'">
        <div class="layout">
          <div>
            <n-card>
              <div class="search-container">
                <InputSearch v-model="searchValue" :delay="1200" />
              </div>

              <n-list v-if="data && data.brends.length" hoverable>
                <n-list-item v-for="item in data.brends" :key="item.id">
                  <div class="item-row">
                    <div>
                      <!-- <img src="" /> -->
                    </div>
                    <div class="item-row__name">
                      <nuxt-link
                        :to="`/${navStore.currentNavigationMenu?.modelName ?? 'brends'}/${item.id}`"
                        >{{ item.name }}</nuxt-link
                      >
                    </div>
                    <div>{{ item.alias }}</div>
                    <div>
                      <n-switch
                        :value="item.published"
                        size="medium"
                        @update:value="handleChangePunlish(item.id)"
                      />
                    </div>
                    <div>
                      <n-dropdown
                        trigger="click"
                        :options="moreMenu as unknown as DropdownMixedOption[]"
                        @select="(key: MenuKeys) => handleDropdown(key, item.id)"
                      >
                        <n-button quaternary circle size="small">
                          <n-icon size="24px">
                            <Dots />
                          </n-icon>
                        </n-button>
                      </n-dropdown>
                    </div>
                  </div>
                </n-list-item>
              </n-list>

              <n-p class="empty" depth="3" v-if="data && !data.brends.length">{{
                brandsOptions.letter
                  ? 'Бренды не найдены'
                  : 'Выберите букву или найдите бренд через поиск'
              }}</n-p>
            </n-card>
          </div>
          <div>
            <n-card title="Фильтр">
              <template #header-extra>
                <n-button
                  secondary
                  type="info"
                  size="small"
                  :disabled="!isFiltered"
                  @click="clearAllFilters"
                  >Сбросить</n-button
                >
              </template>
              <div class="filters-layout">
                <div class="input-group">
                  <label>Публикация</label>
                  <n-select
                    :value="brandsOptions.status"
                    :disabled="filtersDisabled || status === 'pending'"
                    @update:value="(v: string) => setBrandsOptions({ status: v })"
                    :options="publishOptions"
                  />
                </div>
                <div class="input-group">
                  <label>Описание</label>
                  <n-select
                    :value="brandsOptions.statusDescr"
                    :disabled="filtersDisabled || status === 'pending'"
                    @update:value="(v: string) => setBrandsOptions({ statusDescr: v })"
                    :options="descriptionOptions"
                  />
                </div>
                <div class="input-group">
                  <label>Логотип</label>
                  <n-select
                    :value="brandsOptions.statusImg"
                    :disabled="filtersDisabled || status === 'pending'"
                    @update:value="(v: string) => setBrandsOptions({ statusImg: v })"
                    :options="logoOptions"
                  />
                </div>
              </div>
            </n-card>
          </div>
        </div>
      </n-spin>
    </n-space>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr minmax(240px, 320px);
  gap: 1rem;
}

.empty {
  margin: 2rem 0 1rem;
  text-align: center;
}

.search-container {
  max-width: 320px;
  margin-bottom: 2rem;
}

.filters-layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.letters-container {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.letters-row {
  display: flex;
  gap: 0.25rem;
}

.item-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 60px 40px;
  gap: 1rem;
}

.item-row__name > a {
  text-decoration: none;
  color: var(--gray-900);
}

.item-row__name > a:hover {
  text-decoration: none;
  color: var(--primary-color-hover);
}
</style>
