import type { PvzDto } from '../api/pvzs.schemas'

export interface IPvz extends PvzDto {}
export type TPvzsListItem = Pick<
  IPvz,
  'id' | 'name' | 'address' | 'phones' | 'isActive' | 'gpscoords'
>
