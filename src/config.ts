import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
  yearField?: string
  recorteField?: string
}

export type IMConfig = ImmutableObject<Config>
