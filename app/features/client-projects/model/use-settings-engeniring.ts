import { useClientProjectsApi } from '~/entities/client-projects'

interface initState {
  selectedSystems: string[]
}

export const useSettingsEngeniring = (initState: initState) => {
  const selectedSystems = ref<string[] | null>(initState.selectedSystems)

  const { getEngenitingSystems } = useClientProjectsApi()

  const { data, status, error, refresh } = useAsyncData(
    'client-projects-settings-engeniring',
    () => getEngenitingSystems(),
    {
      lazy: true,
      transform: () => {
        // TODO: Удалить замоканные данные после реализации запроса
        return [
          'Отопление',
          'Водопровод',
          'Канализация',
          'Фаянс',
          'Система пожаротушения',
          'ИТП',
          'Холодильный центр',
          'Кондиционирование',
          'Вентиляция',
          'Котельная',
          'НВК',
          'Другая'
        ]
      },
      getCachedData(key, nuxtApp) {
        return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
      }
    }
  )

  return { data, status, error, selectedSystems, refresh }
}
