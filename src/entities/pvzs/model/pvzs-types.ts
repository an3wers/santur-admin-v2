import type { PvzDto } from '../api/pvzs-schemas'

export interface Pvz extends PvzDto {}
export type PvzsListItem = Pick<
  Pvz,
  'id' | 'name' | 'address' | 'phones' | 'isActive' | 'gpscoords' | 'city' | 'times'
>

export type PvzsItem = Omit<Pvz, 'currentTaEmail' | 'currentTaReg' | 'gpscoords' | 'ownerid'>
