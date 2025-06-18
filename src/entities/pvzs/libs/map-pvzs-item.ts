import type { PvzDto } from '../api/pvzs-schemas'
import type { Pvz } from '../model/pvzs-types'

export function mapPvzsItem(item: PvzDto): Pvz {
  return { ...item, payvariants: item.payVariants }
}
