import { useAppRequest } from '~/shared/libs/api/use-app-requests'
import type { ExportConstructorDto } from './types'

// POST
// apiTmp/SaveExportConstructor?key=...
// в боди:
// struct sExportConstructorZnak
// {
//     string znak
//     bool incash
//     bool price
//     bool selected
// }
// struct sExportConstructor
// {
//     public List<int> catalog
//     public List<string> brends
//     public List<sExportConstructorZnak> znaks

// }

// {
//         "catalog": [100858,101843,100960],
//         "brends": ["Aquasfera","BELIMO","Aquatech"],
//         "znaks": [
//             {
//                 "znak": "S",
//                 "incash": false,
//                 "price": true,
//                 "selected": true
//             },
//             {
//                 "znak": "Z1",
//                 "incash": true,
//                 "price": true,
//                 "selected": true
//             },
//             {
//                 "znak": "Z6",
//                 "incash": true,
//                 "price": true,
//                 "selected": false
//             },
//             {
//                 "znak": "Z7",
//                 "incash": true,
//                 "price": true,
//                 "selected": false
//             }
//         ]
//     }

export const useUploadingApi = () => {
  const { baseFetch, checkError } = useAppRequest()

  async function getExportConstructor(key: string) {
    const res = await baseFetch<ExportConstructorDto>('/apiTmp/GetExportConstructor?key=' + key)
    const _data = checkError(res).data
    return _data
  }

  async function SaveExportConstructor(key: string, data: ExportConstructorDto) {
    const res = await baseFetch<ExportConstructorDto>('/apiTmp/SaveExportConstructor?key=' + key, {
      method: 'POST',
      body: data
    })
    const _data = checkError(res).data
    return _data
  }

  return { getExportConstructor, SaveExportConstructor }
}
