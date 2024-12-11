<script setup lang="ts">
import { NConfigProvider, type GlobalThemeOverrides, NMessageProvider } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#1976d2',
    primaryColorHover: '#1565C0',
    primaryColorPressed: '#1257A6',
    primaryColorSuppl: '#1976d2',
    borderColor: '#e2e8f0',
    borderRadius: '0.5rem',
    bodyColor: '#0f172a',
    textColorBase: '#0f172a'
  },
  Menu: {
    itemColorHover: '#EBF3FE',
    borderRadius: '0.5rem',
    itemColorActive: '#dbeafe',
    itemTextColor: '#0f172a'
  },
  Card: {
    borderColor: '#e2e8f0',
    textColor: '#0f172a'
  },
  Form: {
    labelFontWeight: '600',
    feedbackPadding: '6px 0 12px 0px',
    feedbackFontSizeMedium: '12px'
  },
  Switch: {
    railColorActive: '#18a058'
  }
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <slot />
    </n-message-provider>
  </n-config-provider>
</template>
