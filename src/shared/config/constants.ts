export const APP_SUB_NAME = 'Управление сервисами'

export const ROLES = {
  SADM: 'SADM',
  ADM: 'ADM',
  DEVLP: 'DEVLP',
  VCNADM: 'VCNADM',
  CLPADM: 'CLPADM',
  MRKT: 'MRKT',
  EXTRMRKT: 'EXTRMRKT'
} as const

// export type RolesValues = ('SADM' | 'ADM')[]

export const PERMISSIONS = {
  // Страницы
  CONTENT: 'content',
  ANALYTICTS: 'analytics',
  CATALOG_SETTINGS: 'catalog-settings',
  CLIENT_PROJECTS: 'client-projects',
  CLIENT_ORDERS: 'client-orders',
  SERVICES: 'services'
} as const

// TODO: Определить тип для значений объекта

// export type Permissions = [typeof PERMISSIONS]

// type PermissionsTuple = [
//   'content',
//   'analytics',
//   'catalog-settings',
//   'client-projects',
//   'client-orders',
//   'services'
// ];
