<script setup lang="ts">
import {
  NTabs,
  NTabPane,
  NSpin,
  NCheckboxGroup,
  NSpace,
  NCheckbox,
  NButton,
  useMessage,
  NModal,
  NList,
  NListItem,
  NIcon
} from 'naive-ui'
import { useSettingsEngeniring } from '../model/use-settings-engeniring'
import { useClientProjectsApi } from '~/entities/client-projects'
import { useSettingsBrands } from '../model/use-settings-brands'
import { BrandLatters } from '@/entities/brand'
import { useSaveSettings } from '../model/use-save-settings'
import { X as XIcon } from '@vicons/tabler'

const emits = defineEmits<{
  (e: 'onClose'): void
}>()

const currentTab = ref('engeniring')

const { getClientProjectsSettings } = useClientProjectsApi()

const { data: currentSettings, refresh: currentSettingsRefresh } = await useAsyncData(
  'client-project-settings',
  () => getClientProjectsSettings(),
  {
    transform: (data) => {
      const { systems, brends } = data
      const brands = brends
      return { systems, brands }
    }
  }
)

const {
  data: engeniringSystemsData,
  status: engeniringSystemsStatus,
  error: engeniringSystemsError,
  refresh: engeniringSystemsRefresh,
  selectedSystems
} = useSettingsEngeniring({ selectedSystems: currentSettings.value?.systems || [] })

const {
  brands: brandsData,
  status: brandsStatus,
  error: brandsError,
  refresh: brandsRefresh,
  toggleBrands,
  currentLetter,
  lettersEng,
  lettersRus,
  setLetter,
  selectedBrands,
  removeBrand
} = useSettingsBrands({ selectedBrands: currentSettings.value?.brands || [] })

const { saveSettings, status: saveSettingsStatus } = useSaveSettings()

const message = useMessage()

async function saveSettingsHandler() {
  const data = {
    systems: selectedSystems.value || [],
    brends: selectedBrands.value || []
  }
  await saveSettings(data)

  if (saveSettingsStatus.value === 'success') {
    message.success('Настройки успешно сохранены')
  }

  if (saveSettingsStatus.value === 'error') {
    message.error('Произошла ошибка при сохранении настроек')
  }
}

const showBrandsDetail = ref(false)
</script>

<template>
  <div>
    <n-tabs v-model:value="currentTab" type="line" animated>
      <n-tab-pane name="engeniring" tab="Инженерные системы">
        <n-spin :show="engeniringSystemsStatus === 'pending'">
          <div v-if="!engeniringSystemsData" style="height: 100px"></div>
          <n-checkbox-group v-else v-model:value="selectedSystems">
            <n-space vertical>
              <n-checkbox
                v-for="item in engeniringSystemsData"
                :key="item"
                :value="item"
                :label="item"
              />
            </n-space>
          </n-checkbox-group>
        </n-spin>
      </n-tab-pane>
      <n-tab-pane name="brands" tab="Бренды">
        <n-spin :show="brandsStatus === 'pending'">
          <div v-if="!brandsData" style="height: 100px"></div>
          <div v-else>
            <n-space vertical size="medium">
              <div>
                <n-button type="primary" ghost @click="showBrandsDetail = true"
                  >Выбрано брендов: {{ selectedBrands?.length || 0 }}</n-button
                >
              </div>

              <BrandLatters
                :current-letter="currentLetter"
                :letters-eng="lettersEng"
                :letters-rus="lettersRus"
                :status="brandsStatus"
                @on-letter-click="setLetter($event)"
              />

              <div class="brands">
                <div v-for="item in brandsData?.brends" :key="item.id" class="brands__item">
                  <n-checkbox
                    v-model:checked="item.isChecked"
                    @update:checked="toggleBrands(item.name)"
                    >{{ item.name }}</n-checkbox
                  >
                </div>
              </div>
            </n-space>
          </div>
        </n-spin>
      </n-tab-pane>
    </n-tabs>
    <n-space justify="end" style="margin-top: 1rem">
      <n-button
        type="primary"
        secondary
        :disabled="saveSettingsStatus === 'pending'"
        @click="$emit('onClose')"
        >Отменить</n-button
      >
      <n-button
        :type="saveSettingsStatus === 'success' ? 'success' : 'primary'"
        :loading="saveSettingsStatus === 'pending'"
        @click="saveSettingsHandler"
        >Сохранить</n-button
      >
    </n-space>

    <n-modal
      v-model:show="showBrandsDetail"
      style="max-width: 720px"
      size="medium"
      preset="card"
      :title="`Бренды (${selectedBrands?.length || 0})`"
    >
      <n-list hoverable class="brands-modal-list">
        <n-list-item style="padding: 6px 12px" v-for="item in selectedBrands" :key="item">
          {{ item }}
          <template #suffix>
            <n-button text @click="removeBrand(item)">
              <n-icon size="14px"><XIcon /></n-icon>
            </n-button>
          </template>
        </n-list-item>
      </n-list>
    </n-modal>
  </div>
</template>

<style scoped>
.brands {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  min-height: 100px;
}

.brands__item {
  margin-top: 0.25rem;
}

.brands-modal-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  list-style: none;
  padding: 0;
}

.brands-modal-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
}

.brands-modal-list__item:hover {
  background-color: #f3f3f5;
}
</style>
