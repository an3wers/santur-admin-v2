import type { PvzDto } from '../api/pvzs-schemas'
import type { Pvz } from '../../../features/pvzs/model/types'

export function mapPvzsItem(item: PvzDto): Pvz {
  return { ...item, payvariants: item.payVariants || item.payvariants || '' } // WTF BACKEND!!!
}
