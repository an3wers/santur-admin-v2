<script setup lang="ts">
import { NSpace, NCard, NList, NListItem, NText, NThing } from 'naive-ui'
import type { ClientProjectDetailDto } from '../api/types'

defineProps<{
  projects: ClientProjectDetailDto
}>()
</script>

<template>
  <n-space vertical size="large">
    <n-card title="Информация о проекте">
      <n-list>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3">Номер</n-text>
            </span>
            <span class="item-value">{{ projects.id }}</span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3">Наименование проекта</n-text>
            </span>
            <span v-if="projects.projectName" class="item-value">{{ projects.projectName }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3">Наименование проектной организации</n-text>
            </span>
            <span v-if="projects.projectOrganization" class="item-value">{{
              projects.projectOrganization
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3">Наименование инженерной системы</n-text>
            </span>
            <span v-if="projects.projectName" class="item-value">{{
              projects.engineeringSystem
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <n-thing
            :theme-overrides="{
              titleFontWeight: '400'
            }"
          >
            <template #header>
              <n-text>Адрес объекта</n-text>
            </template>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Область</n-text>
              </span>
              <span v-if="projects.region" class="item-value">{{ projects.region }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Город</n-text>
              </span>
              <span v-if="projects.city" class="item-value">{{ projects.city }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Улица</n-text>
              </span>
              <span v-if="projects.street" class="item-value">{{ projects.street }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Дом</n-text>
              </span>
              <span v-if="projects.houseNumber" class="item-value">{{ projects.houseNumber }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
          </n-thing>
        </n-list-item>
        <n-list-item>
          <n-thing
            :theme-overrides="{
              titleFontWeight: '400'
            }"
          >
            <template #header>
              <n-text>Ожидаемый срок выпуска проекта</n-text>
            </template>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Месяц</n-text>
              </span>
              <span v-if="projects.expectedMonth" class="item-value">{{
                projects.expectedMonth
              }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Год</n-text>
              </span>
              <span v-if="projects.expectedYear" class="item-value">{{
                projects.expectedYear
              }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
          </n-thing>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3">Бренды</n-text>
            </span>
            <span v-if="projects.brands.length > 0" class="item-value">{{
              projects.brands.join(', ')
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
      </n-list>
    </n-card>

    <n-card title="Информация о заказчике">
      <n-list>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3">Наименование заказчика</n-text>
            </span>
            <span v-if="projects.customerName" class="item-value">{{ projects.customerName }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <n-thing
            :theme-overrides="{
              titleFontWeight: '400'
            }"
          >
            <template #header>
              <n-text>Адрес заказчика</n-text>
            </template>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Область</n-text>
              </span>
              <span v-if="projects.customerRegion" class="item-value">{{
                projects.customerRegion
              }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Город</n-text>
              </span>
              <span v-if="projects.customerCity" class="item-value">{{
                projects.customerCity
              }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Улица</n-text>
              </span>
              <span v-if="projects.customerStreet" class="item-value">{{
                projects.customerStreet
              }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Дом</n-text>
              </span>
              <span v-if="projects.customerHouseNumber" class="item-value">{{
                projects.customerHouseNumber
              }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
          </n-thing>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3">Контактное лицо заказчика</n-text>
            </span>
            <span v-if="projects.customerContactPerson" class="item-value">{{
              projects.customerContactPerson
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3"> Должность контактного лица заказчика </n-text>
            </span>
            <span v-if="projects.customerContactPosition" class="item-value">{{
              projects.customerContactPosition
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3"> Email </n-text>
            </span>
            <span v-if="projects.customerEmail" class="item-value">{{
              projects.customerEmail
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3"> Телефон </n-text>
            </span>
            <span v-if="projects.customerPhone" class="item-value">{{
              projects.customerPhone
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3"> Телефон (Моб.) </n-text>
            </span>
            <span v-if="projects.customerMobilePhone" class="item-value">{{
              projects.customerMobilePhone
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
      </n-list>
    </n-card>

    <n-card title="Информация о покупателе">
      <n-list>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3">Наименование покупателя</n-text>
            </span>
            <span v-if="projects.buyerName" class="item-value">{{ projects.buyerName }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <n-thing
            :theme-overrides="{
              titleFontWeight: '400'
            }"
          >
            <template #header>
              <n-text>Адрес покупателя</n-text>
            </template>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Область</n-text>
              </span>
              <span v-if="projects.buyerRegion" class="item-value">{{ projects.buyerRegion }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Город</n-text>
              </span>
              <span v-if="projects.buyerCity" class="item-value">{{ projects.buyerCity }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Улица</n-text>
              </span>
              <span v-if="projects.buyerStreet" class="item-value">{{ projects.buyerStreet }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
            <div class="n-list-item-row">
              <span class="item-label">
                <n-text depth="3">Дом</n-text>
              </span>
              <span v-if="projects.buyerHouseNumber" class="item-value">{{
                projects.buyerHouseNumber
              }}</span>
              <span v-else class="item-value">
                <n-text depth="3" italic>не заполнено</n-text>
              </span>
            </div>
          </n-thing>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3">Контактное лицо покупателя</n-text>
            </span>
            <span v-if="projects.buyerContactPerson" class="item-value">{{
              projects.buyerContactPerson
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3">Должность контактного лица покупателя</n-text>
            </span>
            <span v-if="projects.buyerContactPosition" class="item-value">{{
              projects.buyerContactPosition
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3"> Email </n-text>
            </span>
            <span v-if="projects.buyerEmail" class="item-value">{{ projects.buyerEmail }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3"> Телефон </n-text>
            </span>
            <span v-if="projects.buyerPhone" class="item-value">{{ projects.buyerPhone }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
        <n-list-item>
          <div class="n-list-item-row">
            <span class="item-label">
              <n-text depth="3"> Телефон (Моб.) </n-text>
            </span>
            <span v-if="projects.buyerMobilePhone" class="item-value">{{
              projects.buyerMobilePhone
            }}</span>
            <span v-else class="item-value">
              <n-text depth="3" italic>не заполнено</n-text>
            </span>
          </div>
        </n-list-item>
      </n-list>
    </n-card>
  </n-space>
</template>

<style scoped>
.n-list-item-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 1.5rem;
}

.n-list-item-row .item-label {
  width: 12rem;
  flex-shrink: 0;
}

.n-list-item-row .item-value {
  flex-grow: 1;
}
</style>
