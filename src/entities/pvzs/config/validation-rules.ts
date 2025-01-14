import type { FormRules } from 'naive-ui'

export const validationRules: FormRules = {
  name: {
    required: true,
    message: 'Введите название',
    trigger: 'blur'
  },
  city: {
    required: true,
    message: 'Введите город',
    trigger: 'blur'
  },
  address: {
    required: true,
    message: 'Введите адрес',
    trigger: 'blur'
  },
  gpsLat: {
    required: true,
    message: 'Введите широту',
    trigger: 'blur'
  },
  gpsLng: {
    required: true,
    message: 'Введите долготу',
    trigger: 'blur'
  }
}
