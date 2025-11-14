export const APP_SUB_NAME = 'Управление сервисами'

export const ROLES = {
  SADM: 'SADM',
  ADM: 'ADM',
  DEVLP: 'DEVLP',
  VCNADM: 'VCNADM',
  CLPADM: 'CLPADM',
  MRKT: 'MRKT',
  CTLCLADM: 'CTLCLADM',
  EXTRMRKT: 'EXTRMRKT',
  ISTA: 'ISTA',
  TA: 'TA',
  TP: 'TP'
} as const

export type RolesValues = (typeof ROLES)[keyof typeof ROLES]

export const PERMISSIONS = {
  // Страницы
  CONTENT: 'content',
  ANALYTICTS: 'analytics',
  CATALOG_SETTINGS: 'catalog-settings',
  CLIENT_PROJECTS: 'client-projects',
  CLIENT_ORDERS: 'client-orders',
  SERVICES: 'services'
} as const

export type PermissionValues = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
