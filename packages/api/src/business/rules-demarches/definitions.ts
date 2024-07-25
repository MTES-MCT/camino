import { ITitreEtape } from '../../types'
import { DemarcheId } from 'camino-common/src/demarche'
import { titreDemarcheDepotDemandeDateFind } from '../rules/titre-demarche-depot-demande-date-find'
import { CaminoMachines } from './machines'
import { ArmOctMachine } from './arm/oct.machine'
import { AxmOctMachine } from './axm/oct.machine'
import { AxmProMachine } from './axm/pro.machine'
import { newDemarcheId } from '../../database/models/_format/id-create'
import { CaminoDate, toCaminoDate } from 'camino-common/src/date'
import { DEMARCHES_TYPES_IDS, DemarchesTypes, DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { ArmRenProMachine } from './arm/ren-pro.machine'
import { PrmOctMachine } from './prm/oct.machine'
import { DeepReadonly, NonEmptyArray, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, isNullOrUndefinedOrEmpty } from 'camino-common/src/typescript-tools'
import { ProcedureSimplifieeMachine } from './procedure-simplifiee/ps.machine'

interface DemarcheDefinitionCommon {
  titreTypeIds: NonEmptyArray<TitreTypeId>
  demarcheTypeIds: DemarcheTypeId[]
  dateDebut: CaminoDate
  demarcheIdExceptions: DemarcheId[]
}
export interface DemarcheDefinition extends DemarcheDefinitionCommon {
  machine: CaminoMachines
}
const allDemarcheNotTravaux = Object.values(DEMARCHES_TYPES_IDS).filter(demarcheTypeId => !DemarchesTypes[demarcheTypeId].travaux)
const demarcheTypeIdsCxPr_G: DemarcheTypeId[] = [
  DEMARCHES_TYPES_IDS.Mutation,
  DEMARCHES_TYPES_IDS.Amodiation,
  DEMARCHES_TYPES_IDS.Cession,
  DEMARCHES_TYPES_IDS.Conversion,
  DEMARCHES_TYPES_IDS.Decheance,
  DEMARCHES_TYPES_IDS.DemandeDeTitreDExploitation,
  DEMARCHES_TYPES_IDS.DeplacementDePerimetre,
  DEMARCHES_TYPES_IDS.Fusion,
  DEMARCHES_TYPES_IDS.MutationPartielle,
  DEMARCHES_TYPES_IDS.Renonciation,
  DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation,
  DEMARCHES_TYPES_IDS.Retrait,
]
const plusVieilleDateEnBase = toCaminoDate('1717-01-09')
export const demarchesDefinitions = [
  {
    titreTypeIds: ['arm'],
    demarcheTypeIds: ['oct'],
    machine: new ArmOctMachine(),
    dateDebut: toCaminoDate('2019-10-31'),
    demarcheIdExceptions: [],
  },
  {
    titreTypeIds: ['arm'],
    demarcheTypeIds: ['ren', 'pro'],
    machine: new ArmRenProMachine(),
    dateDebut: toCaminoDate('2019-10-31'),
    demarcheIdExceptions: [],
  },
  {
    titreTypeIds: ['prm'],
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
    ],
  },
  {
    titreTypeIds: ['axm'],
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
    titreTypeIds: ['axm'],
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
    titreTypeIds: ['pxg', 'arg', 'cxr', 'inr', 'prr', 'pxr', 'cxf', 'prf', 'pxf'],
    demarcheTypeIds: allDemarcheNotTravaux,
    machine: new ProcedureSimplifieeMachine(),
    dateDebut: plusVieilleDateEnBase,
    demarcheIdExceptions: [],
  },
  {
    titreTypeIds: ['cxg', 'prg'],
    demarcheTypeIds: demarcheTypeIdsCxPr_G,
    machine: new ProcedureSimplifieeMachine(),
    dateDebut: plusVieilleDateEnBase,
    demarcheIdExceptions: [],
  },
] as const satisfies readonly DemarcheDefinition[]

export const demarcheDefinitionFind = (
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  titreEtapes: DeepReadonly<Pick<ITitreEtape, 'date' | 'typeId'>[]> | undefined,
  demarcheId: DemarcheId
): DemarcheDefinition | undefined => {
  const date = titreDemarcheDepotDemandeDateFind(titreEtapes)

  const definition = demarchesDefinitions
    .toSorted((a, b) => b.dateDebut.localeCompare(a.dateDebut))
    .find(d => (isNullOrUndefinedOrEmpty(date) || d.dateDebut < date) && d.titreTypeIds.includes(titreTypeId) && d.demarcheTypeIds.includes(demarcheTypeId))
  if (isNotNullNorUndefined(definition) && isNotNullNorUndefinedNorEmpty(definition.demarcheIdExceptions) && definition.demarcheIdExceptions.includes(demarcheId)) {
    return undefined
  }

  return definition
}
