export interface Pvz {
  address: string
  cfo: string
  city: string
  code: string
  currentTaEmail: string
  currentTaReg: string
  descr: string
  forP: boolean
  forU: boolean
  gpsLat: string
  gpsLng: string
  gpscoords: string
  id: number
  isActive: boolean
  name: string
  ownerid: number
  payVariants: string
  phones: string
  times: string
}

export type PvzsListItem = Pick<
  Pvz,
  'id' | 'name' | 'address' | 'phones' | 'isActive' | 'gpscoords' | 'city' | 'times'
>

export type PvzsItem = Omit<Pvz, 'currentTaEmail' | 'currentTaReg' | 'gpscoords' | 'ownerid'>
