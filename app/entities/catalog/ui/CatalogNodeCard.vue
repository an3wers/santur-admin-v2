<script setup lang="ts">
import { NButton, NEmpty, NIcon, NSpace, NTag, NText } from 'naive-ui'
import { Edit, Trash } from '@vicons/tabler'
import type { CatalogNode } from '../model/catalog-types'
import { getLocationLabel } from '../libs/preset-location'
import { EMPTY_FILTER_VALUE, formatPresetFilterValue } from '../libs/format-preset-filter'

const props = defineProps<{
  node: CatalogNode | null
  tnName?: string
  tkName?: string
  removing?: boolean
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'remove'): void
}>()

// Из каких фильтров собрана подфильтровая страница
const sourceFilters = computed(() => {
  if (props.node?.kind !== 'preset') {
    return []
  }

  return props.node.filters.map((filter) => {
    const value = formatPresetFilterValue(filter)
    return { name: filter.name, value, isEmpty: value === EMPTY_FILTER_VALUE }
  })
})

const breadcrumb = computed(() => [props.tnName, props.tkName].filter(Boolean).join(' › '))
</script>

<template>
  <div v-if="!node" class="placeholder">
    <n-empty description="Выберите элемент, чтобы посмотреть карточку" size="small" />
  </div>

  <div v-else class="card">
    <div class="card__body">
      <div class="card__head">
        <div class="card__badges">
          <n-tag :type="node.kind === 'vid' ? 'success' : 'info'" size="tiny">
            {{ node.kind === 'vid' ? 'вид' : 'фильтр' }}
          </n-tag>
          <n-text :depth="3" class="card__id">{{ node.id }}</n-text>
        </div>
        <p class="card__title">{{ node.name }}</p>
        <n-text v-if="breadcrumb" :depth="3" tag="p" class="card__breadcrumb">
          {{ breadcrumb }}
        </n-text>
        <n-text v-if="node.alias" :depth="3" tag="p" class="card__alias">/{{ node.alias }}</n-text>
      </div>

      <template v-if="node.kind === 'preset'">
        <section class="section">
          <p class="section__title">Создано из фильтров</p>
          <div v-if="sourceFilters.length" class="section__list">
            <div v-for="filter in sourceFilters" :key="filter.name" class="filter-row">
              <span class="filter-row__name">{{ filter.name }}</span>
              <span
                class="filter-row__value"
                :class="{ 'filter-row__value--empty': filter.isEmpty }"
              >
                {{ filter.value }}
              </span>
            </div>
          </div>
          <div v-else class="section__empty">Фильтры не заданы</div>
          <n-text :depth="3" tag="p" class="section__hint">
            Страница автоматически показывает товары категории, подходящие под эти значения
            фильтров.
          </n-text>
        </section>

        <section class="section">
          <p class="section__title">Расположение</p>
          <n-tag
            :type="node.location === 'hidden' ? 'warning' : 'default'"
            :bordered="node.location !== 'hidden'"
            size="small"
          >
            {{ getLocationLabel(node.location) }}
          </n-tag>
        </section>
      </template>

      <n-text v-else :depth="3" tag="p" class="section__hint">
        Вид объединяет товары внутри категории. Подфильтровые страницы создаются на уровне
        категории.
      </n-text>
    </div>

    <div class="card__actions">
      <!-- <n-space justify="end"></n-space> -->
      <n-button
        v-if="node.kind === 'preset'"
        secondary
        type="error"
        size="small"
        :loading="removing"
        :disabled="removing"
        @click="$emit('remove')"
      >
        <template #icon>
          <n-icon><Trash /></n-icon>
        </template>
        Удалить
      </n-button>
      <n-button type="primary" size="small" @click="$emit('edit')">
        <template #icon>
          <n-icon><Edit /></n-icon>
        </template>
        Редактировать
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
}

.card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

.card__badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.card__id {
  font-size: var(--font-size-xs);
}

.card__title {
  font-size: var(--font-size-h4);
  font-weight: 500;
  line-height: 1.35;
  margin: 0;
}

.card__breadcrumb,
.card__alias {
  font-size: var(--font-size-xs);
  margin: 0.375rem 0 0 0;
}

.section__title {
  font-size: var(--font-size-xs);
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--gray-600);
  margin: 0 0 0.625rem 0;
}

.section__list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  padding: 0.5rem 0.75rem;
}

.filter-row__name {
  flex-grow: 1;
  font-size: var(--font-size-sm);
  min-width: 0;
}

.filter-row__value {
  background-color: var(--blue-200);
  border-radius: 0.25rem;
  color: var(--primary-color-pressed);
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  max-width: 55%;
  overflow-wrap: anywhere;
  padding: 0.125rem 0.5rem;
}

.filter-row__value--empty {
  background-color: var(--gray-100);
  color: var(--gray-500);
}

.section__empty {
  border: 1px dashed var(--gray-300);
  border-radius: var(--border-radius);
  color: var(--gray-500);
  font-size: var(--font-size-sm);
  padding: 1rem;
  text-align: center;
}

.section__hint {
  font-size: var(--font-size-xs);
  line-height: 1.5;
  margin: 0.5rem 0 0 0;
}

.card__actions {
  display: flex;
  justify-content: end;
  gap: 0.5rem;
  border-top: 1px solid var(--gray-200);
  flex-shrink: 0;
  padding: 0.75rem 1.25rem;
  min-height: 54px;
}
</style>
