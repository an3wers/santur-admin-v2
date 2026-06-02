export interface GetCatalogItemDto {
  id: number
  parent_id: number
  parent_name: string
  vid: string
  name: string
  num: number
  seotitle: string
  keywords: string
  alias: string
  descr: string
  shortDescr: string
  imgExist: boolean
  image: {
    id: number
    mediaType: string
    url: string
  }
  gimg: string | null
}

export type DownloadTemplateOption = 'all' | 'full' | 'empty'

export interface PresetFilter {
  name: string
  minLimit: string
  maxLimit: string
  minSelect: string
  maxSelect: string
  selected: string
}

export interface PresetItem {
  id: number
  catalogItemId: number
  title: string
  descr: string
  shortDescr: string
  presets: PresetFilter[]
  alias: string
}

export interface GetPresetsFilters {
  catalogItemId: number
  catalogItemVid: string
  catalogItemName: string
  presets: PresetItem[]
}

export interface CharFilterItem {
  nn: number
  name: string
  qtyRecords: number
}

export interface CharFilter {
  nn: number
  name: string
  typeValue: string
  isNumeric: boolean
  minLimit: string
  maxLimit: string
  minSelect: string
  maxSelect: string
  selected: string
  isSelected: boolean
  items: CharFilterItem[]
}

export interface GetPresetFiltersByCatalogItemRes {
  presets: PresetItem[]
  charFilters: CharFilter[]
}

// Example GetPresetFiltersByCatalogItemRes
/*
{
        "presets": [
            {
                "id": 100000,
                "catalogItemId": 100824,
                "title": "Гидры на давление 10атм",
                "descr": "<p>самые крупные гидроаккумы</p>",
                "shortDescr": "Крупняк",
                "presets": [
                    {
                        "name": "Максимальное давление",
                        "minLimit": "",
                        "maxLimit": "",
                        "minSelect": "",
                        "maxSelect": "",
                        "selected": "10атм"
                    }
                ],
                "alias": "krupnyak"
            },
            {
                "id": 100001,
                "catalogItemId": 100824,
                "title": "Гидры больше 500 литров",
                "descr": "<p>самые огромные гидроаккумы</p>",
                "shortDescr": "Очень крупные",
                "presets": [
                    {
                        "name": "Объем",
                        "minLimit": "",
                        "maxLimit": "",
                        "minSelect": "",
                        "maxSelect": "",
                        "selected": "500л;750л"
                    }
                ],
                "alias": "ochkrupnyie"
            }
        ],
        "charFilters": [
            {
                "nn": 4,
                "name": "Максимальное давление",
                "typeValue": "s",
                "isNumeric": false,
                "minLimit": "",
                "maxLimit": "",
                "minSelect": "",
                "maxSelect": "",
                "selected": "",
                "isSelected": false,
                "items": [
                    {
                        "nn": 1,
                        "name": "10атм",
                        "qtyRecords": 41
                    },
                    {
                        "nn": 2,
                        "name": "16атм",
                        "qtyRecords": 6
                    },
                    {
                        "nn": 3,
                        "name": "D 90",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 4,
                        "name": "6бар",
                        "qtyRecords": 5
                    },
                    {
                        "nn": 5,
                        "name": "10бар",
                        "qtyRecords": 4
                    },
                    {
                        "nn": 6,
                        "name": "25бар",
                        "qtyRecords": 1
                    }
                ]
            },
            {
                "nn": 5,
                "name": "Модель",
                "typeValue": "s",
                "isNumeric": false,
                "minLimit": "",
                "maxLimit": "",
                "minSelect": "",
                "maxSelect": "",
                "selected": "",
                "isSelected": false,
                "items": [
                    {
                        "nn": 1,
                        "name": "WAV",
                        "qtyRecords": 22
                    },
                    {
                        "nn": 2,
                        "name": "В 50",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 3,
                        "name": "EPDM",
                        "qtyRecords": 3
                    },
                    {
                        "nn": 4,
                        "name": "200 В",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 5,
                        "name": "WAO",
                        "qtyRecords": 5
                    },
                    {
                        "nn": 6,
                        "name": "500 В",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 7,
                        "name": "_",
                        "qtyRecords": 18
                    },
                    {
                        "nn": 8,
                        "name": "для гидроаккумулятора",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 9,
                        "name": "со штуцером 3/4\"",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 10,
                        "name": "1 D 140",
                        "qtyRecords": 3
                    },
                    {
                        "nn": 11,
                        "name": "ГПк",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 12,
                        "name": "ВПк",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 13,
                        "name": "крепления расширительного бака",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 14,
                        "name": "для баков",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 15,
                        "name": "Г 50 «ХИТ»",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 16,
                        "name": "В 100 «ХИТ»",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 17,
                        "name": "D 240",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 18,
                        "name": "ГА",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 19,
                        "name": "WAV Premium",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 20,
                        "name": "Г 24 «ХИТ»",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 21,
                        "name": "200 ВПк",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 22,
                        "name": "ГА 8В",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 23,
                        "name": "ГА 12В",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 24,
                        "name": "ГА 19В",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 25,
                        "name": "ГА 24В",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 26,
                        "name": "ГА 35В",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 27,
                        "name": "VT.AV.R",
                        "qtyRecords": 3
                    },
                    {
                        "nn": 28,
                        "name": "ГА 100В",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 29,
                        "name": "ГА 100Г",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 30,
                        "name": "ГА 19Г",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 31,
                        "name": "ГА 24Г",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 32,
                        "name": "ГА 50Г",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 33,
                        "name": "ГА 80Г",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 34,
                        "name": "ГА 50В",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 35,
                        "name": "ГА 80В",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 36,
                        "name": "ГА 24Г (П)",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 37,
                        "name": "ГА 24В (П)",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 38,
                        "name": "ГА 50В (П)",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 39,
                        "name": "ГА 50Г (П)",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 40,
                        "name": "ГА 80В (П)",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 41,
                        "name": "ГА 80Г (П)",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 42,
                        "name": "ГА 100В (П)",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 43,
                        "name": "ГА 100Г (П)",
                        "qtyRecords": 1
                    }
                ]
            },
            {
                "nn": 6,
                "name": "Объем",
                "typeValue": "s",
                "isNumeric": false,
                "minLimit": "",
                "maxLimit": "",
                "minSelect": "",
                "maxSelect": "",
                "selected": "",
                "isSelected": false,
                "items": [
                    {
                        "nn": 1,
                        "name": "8л",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 2,
                        "name": "12л",
                        "qtyRecords": 4
                    },
                    {
                        "nn": 3,
                        "name": "18л",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 4,
                        "name": "24л",
                        "qtyRecords": 14
                    },
                    {
                        "nn": 5,
                        "name": "35л",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 6,
                        "name": "50л",
                        "qtyRecords": 15
                    },
                    {
                        "nn": 7,
                        "name": "80л",
                        "qtyRecords": 10
                    },
                    {
                        "nn": 8,
                        "name": "100л",
                        "qtyRecords": 12
                    },
                    {
                        "nn": 9,
                        "name": "500л",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 10,
                        "name": "200л",
                        "qtyRecords": 4
                    },
                    {
                        "nn": 11,
                        "name": "300л",
                        "qtyRecords": 3
                    },
                    {
                        "nn": 12,
                        "name": "750л",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 13,
                        "name": "1000л",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 14,
                        "name": "150л",
                        "qtyRecords": 3
                    },
                    {
                        "nn": 15,
                        "name": "_",
                        "qtyRecords": 13
                    },
                    {
                        "nn": 16,
                        "name": "2000л",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 17,
                        "name": "80-100л",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 18,
                        "name": "19л",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 19,
                        "name": "8-35л",
                        "qtyRecords": 2
                    }
                ]
            },
            {
                "nn": 7,
                "name": "Присоединительный размер",
                "typeValue": "s",
                "isNumeric": false,
                "minLimit": "",
                "maxLimit": "",
                "minSelect": "",
                "maxSelect": "",
                "selected": "",
                "isSelected": false,
                "items": [
                    {
                        "nn": 1,
                        "name": "3/4\"",
                        "qtyRecords": 10
                    },
                    {
                        "nn": 2,
                        "name": "1\"",
                        "qtyRecords": 28
                    },
                    {
                        "nn": 3,
                        "name": "3/4\"180-230мм",
                        "qtyRecords": 1
                    }
                ]
            },
            {
                "nn": 8,
                "name": "Тип установки",
                "typeValue": "s",
                "isNumeric": false,
                "minLimit": "",
                "maxLimit": "",
                "minSelect": "",
                "maxSelect": "",
                "selected": "",
                "isSelected": false,
                "items": [
                    {
                        "nn": 1,
                        "name": "(top)",
                        "qtyRecords": 5
                    },
                    {
                        "nn": 2,
                        "name": "для гидроаккумулятора",
                        "qtyRecords": 11
                    },
                    {
                        "nn": 3,
                        "name": "горизонт",
                        "qtyRecords": 17
                    },
                    {
                        "nn": 4,
                        "name": "3/4\"",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 5,
                        "name": "пластиковый фланец",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 6,
                        "name": "верт",
                        "qtyRecords": 17
                    },
                    {
                        "nn": 7,
                        "name": "с горловиной диам. 51,5мм",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 8,
                        "name": "с гайкой 3/4\"",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 9,
                        "name": "для баков 200-750л",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 10,
                        "name": "для расш. баков до 25 л",
                        "qtyRecords": 1
                    }
                ]
            },
            {
                "nn": 9,
                "name": "Исполнение",
                "typeValue": "s",
                "isNumeric": false,
                "minLimit": "",
                "maxLimit": "",
                "minSelect": "",
                "maxSelect": "",
                "selected": "",
                "isSelected": false,
                "items": [
                    {
                        "nn": 1,
                        "name": "проходная",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 2,
                        "name": "3/4\"",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 3,
                        "name": "со штуцером 1\"",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 4,
                        "name": "со штуцером 3/4\"",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 5,
                        "name": "со штуцером 1 1/4\"",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 6,
                        "name": "с оцинк.фланцем",
                        "qtyRecords": 13
                    },
                    {
                        "nn": 7,
                        "name": "непроходная",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 8,
                        "name": "красный",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 9,
                        "name": "с полиамидным фланцем",
                        "qtyRecords": 8
                    },
                    {
                        "nn": 10,
                        "name": "D 140 со штуцером 1\"",
                        "qtyRecords": 3
                    }
                ]
            },
            {
                "nn": 10,
                "name": "Назначение",
                "typeValue": "s",
                "isNumeric": false,
                "minLimit": "",
                "maxLimit": "",
                "minSelect": "",
                "maxSelect": "",
                "selected": "",
                "isSelected": false,
                "items": [
                    {
                        "nn": 1,
                        "name": "для гидроаккумулятора",
                        "qtyRecords": 4
                    },
                    {
                        "nn": 2,
                        "name": "для баков с горловиной 89мм",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 3,
                        "name": "для гидроаккумулятора 50-60л",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 4,
                        "name": "для гидроаккумулятора 80-100л",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 5,
                        "name": "для гидроаккумулятора 12-24л",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 6,
                        "name": "для баков 200-750л",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 7,
                        "name": "для расширительных баков до 25л",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 8,
                        "name": "для крепления расширительного бака",
                        "qtyRecords": 2
                    },
                    {
                        "nn": 9,
                        "name": "для мембранных баков",
                        "qtyRecords": 3
                    }
                ]
            },
            {
                "nn": 11,
                "name": "Материал",
                "typeValue": "s",
                "isNumeric": false,
                "minLimit": "",
                "maxLimit": "",
                "minSelect": "",
                "maxSelect": "",
                "selected": "",
                "isSelected": false,
                "items": [
                    {
                        "nn": 1,
                        "name": "сталь нерж",
                        "qtyRecords": 5
                    },
                    {
                        "nn": 2,
                        "name": "нерж.сталь",
                        "qtyRecords": 5
                    },
                    {
                        "nn": 3,
                        "name": "оц",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 4,
                        "name": "пластик",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 5,
                        "name": "сталь",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 6,
                        "name": "полиамид",
                        "qtyRecords": 1
                    },
                    {
                        "nn": 7,
                        "name": "сталь оцинк",
                        "qtyRecords": 1
                    }
                ]
            }
        ]
    }
*/

export interface SaveNewPresetFilterItem {
  catalogItemId: number
  title: string
  descr: string
  shortDescr: string
  presets: { name: string; selected: string; minSelect: string; maxSelect: string }[]
  alias: string
}
