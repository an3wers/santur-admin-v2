<script setup lang="ts">
import { NConfigProvider, type GlobalThemeOverrides, NMessageProvider } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#1976d2',
    primaryColorHover: '#1565C0',
    primaryColorPressed: '#1257A6',
    primaryColorSuppl: '#1976d2',
    borderRadius: '0.5rem',
    borderColor: '#e2e8f0',
    bodyColor: '#0f172a',
    textColorBase: '#0f172a'
  },
  Menu: {
    itemColorHover: '#EBF3FE',
    itemColorActive: '#dbeafe',
    itemTextColor: '#0f172a'
  },
  Card: {
    borderColor: '#e2e8f0',
    textColor: '#0f172a',
    actionColor: '#f1f5f9'
  },
  Form: {
    labelFontWeight: '500',
    feedbackPadding: '6px 0 12px 0px',
    feedbackFontSizeMedium: '12px'
  },
  Switch: {
    railColorActive: '#18a058'
  },
  Table: {
    borderColor: '#e2e8f0'
  },
  DataTable: {
    borderColor: '#e2e8f0'
  }
}
</script>

<template>
  <NConfigProvider :theme-overrides="themeOverrides">
    <NMessageProvider>
      <slot />
    </NMessageProvider>
  </NConfigProvider>
</template>
