import { ITitreEtape } from '../../types.js'
import { DemarcheId } from 'camino-common/src/demarche.js'
import { titreDemarcheDepotDemandeDateFind } from '../rules/titre-demarche-depot-demande-date-find.js'
import { CaminoMachines } from './machines.js'
import { ArmOctMachine } from './arm/oct.machine.js'
import { AxmOctMachine } from './axm/oct.machine.js'
import { AxmProMachine } from './axm/pro.machine.js'
import { PxgOctMachine } from './pxg/oct.machine.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date.js'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
import { TitreTypeId } from 'camino-common/src/static/titresTypes.js'
import { ArmRenProMachine } from './arm/ren-pro.machine.js'
import { PrmOctMachine } from './prm/oct.machine.js'

interface DemarcheDefinitionCommon {
  titreTypeId: TitreTypeId
  demarcheTypeIds: DemarcheTypeId[]
  dateDebut: CaminoDate
  demarcheIdExceptions?: DemarcheId[]
}
export interface DemarcheDefinition extends DemarcheDefinitionCommon {
  machine: CaminoMachines
}

const plusVieilleDateEnBase = toCaminoDate('1717-01-09')
export const demarchesDefinitions: DemarcheDefinition[] = [
  {
    titreTypeId: 'arm',
    demarcheTypeIds: ['oct'],
    machine: new ArmOctMachine(),
    dateDebut: toCaminoDate('2019-10-31'),
  },
  {
    titreTypeId: 'arm',
    demarcheTypeIds: ['ren', 'pro'],
    machine: new ArmRenProMachine(),
    dateDebut: toCaminoDate('2019-10-31'),
  },
  {
    titreTypeId: 'prm',
    demarcheTypeIds: ['oct'],
    machine: new PrmOctMachine(),
    dateDebut: toCaminoDate('2019-10-31'),
    demarcheIdExceptions: [
      newDemarcheId('FfJTtP9EEfvf3VZy81hpF7ms'),
      newDemarcheId('lynG9hx3x05LaqpySr0qxeca'),
      newDemarcheId('xjvFNG3I8YOv2xLw6FQJjTab'),
      newDemarcheId('fWlR3sADjURm21wM2j7UZF3R'),
      newDemarcheId('eySDrrpK4KKukIw3II3nk3G1'),
      newDemarcheId('PYrSWWMeDDDYfJfgWa09LVlp'),
      newDemarcheId('R0XYcNUZrJFzZ8DghumpwqXw'),
    ],
  },
  {
    titreTypeId: 'axm',
    demarcheTypeIds: ['oct'],
    machine: new AxmOctMachine(),
    // https://camino.beta.gouv.fr/titres/m-ax-crique-tumuc-humac-2020
    dateDebut: toCaminoDate('2020-09-30'),
    demarcheIdExceptions: [
      newDemarcheId('C3rs92l1eci3mLvsAGkv7gVV'),
      newDemarcheId('YEWeODXiFb7xKJB2OQlTyc14'),
      // avis dgtm moins de 30 jours après la saisine des services
      newDemarcheId('ktPyoaDYzJi2faPMtAeKFZ5l'),
    ],
  },
  {
    titreTypeId: 'axm',
    demarcheTypeIds: ['pro'],
    machine: new AxmProMachine(),
    dateDebut: toCaminoDate('2000-01-01'),
    demarcheIdExceptions: [
      // Complète mais ne respectant pas le cacoo
      newDemarcheId('Fq6lCWTS6h8k5dAsG6LLm3Gw'),
      newDemarcheId('TlqKNgdYzYVrUXieMJAqWYBD'),
      newDemarcheId('ka8jUJq3ESxAdhE6QacBlqS8'),
      newDemarcheId('d2443R01mLB8Nv2ZAhNSZdx3'),
      newDemarcheId('Od6oeREEAXvUyvdQWUOgKhTS'),
      newDemarcheId('M7VhIeD27VR0kKrkPTQHyXeH'),
      newDemarcheId('VWBvpOx3n4dN7WCQoYUEC6vM'),
      newDemarcheId('A17SapPN5NzwSBEOeoagQcHt'),
      newDemarcheId('tuQqpnDSYhnTGlkkxTsDUf0r'),
      newDemarcheId('s8ONjdmsJivnfnhE4ENNVmOb'),
      newDemarcheId('nk5alZi7lSkxGVMlmsmyaqOv'),
      newDemarcheId('Eg3T3fvnJETbYBmd8BJYfc1h'),
      newDemarcheId('ohHg9uU2zd9m3MvF6yJ3KxLr'),
      newDemarcheId('zsDao5HywdHx7YRlWjEMklZJ'),
      newDemarcheId('51G6AmHKKX5wFjbN6zJ3kufK'),
      newDemarcheId('08eC26bUf4PCr6qj9Rl4Qa1F'),
      newDemarcheId('OBKZ23yRO6e4VP7MyXwgCp6U'),
    ],
  },
  {
    titreTypeId: 'pxg',
    demarcheTypeIds: ['oct'],
    machine: new PxgOctMachine(),
    dateDebut: plusVieilleDateEnBase,
    demarcheIdExceptions: [
      // Ne respectent pas le cacoo
      newDemarcheId('fqDEYKmkLijEx0b7HRmkXxUP'),
      newDemarcheId('fML5J37ugo6iWC3ugXfQ2AIk'),
      newDemarcheId('Umr7TPPxiuGDOzzlKfu4S8Dm'),
    ],
  },
]

export const demarcheDefinitionFind = (
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  titreEtapes: Pick<ITitreEtape, 'date' | 'typeId'>[] | undefined,
  demarcheId: DemarcheId
): DemarcheDefinition | undefined => {
  const date = titreDemarcheDepotDemandeDateFind(titreEtapes)

  const definition = demarchesDefinitions
    .sort((a, b) => b.dateDebut.localeCompare(a.dateDebut))
    .find(d => (!date || d.dateDebut < date) && d.titreTypeId === titreTypeId && d.demarcheTypeIds.includes(demarcheTypeId))

  if (definition?.demarcheIdExceptions?.includes(demarcheId)) {
    return undefined
  }

  return definition
}
