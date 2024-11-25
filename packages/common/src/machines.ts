import { toCaminoDate, CaminoDate } from './date'
import { demarcheEnregistrementDemandeDateFind, DemarcheId, demarcheIdValidator } from './demarche'
import { DemarcheTypeId, DEMARCHES_TYPES_IDS, DemarchesTypes } from './static/demarchesTypes'
import { EtapeTypeId } from './static/etapesTypes'
import { TitreTypeId } from './static/titresTypes'
import { NonEmptyArray, isNullOrUndefinedOrEmpty, isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty, DeepReadonly, toSorted } from './typescript-tools'

export const DATE_DEBUT_PROCEDURE_SPECIFIQUE = toCaminoDate('2400-01-01')
export const DATE_DEBUT_PROCEDURE_SPECIFIQUE_AXM_ARM = toCaminoDate('2024-07-01')

interface DemarcheDefinition {
  titreTypeIds: NonEmptyArray<TitreTypeId>
  demarcheTypeIds: DemarcheTypeId[]
  dateDebut: CaminoDate
  demarcheIdExceptions: DemarcheId[]
  machineId: CaminoMachineId
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
  DEMARCHES_TYPES_IDS.RenonciationTotale,
  DEMARCHES_TYPES_IDS.RenonciationPartielle,
  DEMARCHES_TYPES_IDS.ResiliationAnticipeeDAmodiation,
  DEMARCHES_TYPES_IDS.Retrait,
]
const plusVieilleDateEnBase = toCaminoDate('1717-01-09')
const CAMINO_MACHINES = ['ArmOct', 'ArmRenPro', 'PrmOct', 'AxmOct', 'AxmPro', 'ProcedureSimplifiee', 'ProcedureSpecifique'] as const
export type CaminoMachineId = (typeof CAMINO_MACHINES)[number]
export const demarchesDefinitions = [
  {
    titreTypeIds: ['arm'],
    demarcheTypeIds: ['oct'],
    dateDebut: toCaminoDate('2019-10-31'),
    demarcheIdExceptions: [demarcheIdValidator.parse('QauHUIPuv1a5neW3JqVEWh8n'), demarcheIdValidator.parse('XrNwRcLK39y6JZKcsJTV7nju')],
    machineId: 'ArmOct',
  },
  {
    titreTypeIds: ['arm'],
    demarcheTypeIds: [DEMARCHES_TYPES_IDS.RenonciationTotale, DEMARCHES_TYPES_IDS.RenonciationPartielle, DEMARCHES_TYPES_IDS.Prolongation],
    dateDebut: toCaminoDate('2019-10-31'),
    demarcheIdExceptions: [],
    machineId: 'ArmRenPro',
  },
  {
    titreTypeIds: ['prm'],
    demarcheTypeIds: ['oct'],
    dateDebut: toCaminoDate('2019-10-31'),
    demarcheIdExceptions: [
      demarcheIdValidator.parse('FfJTtP9EEfvf3VZy81hpF7ms'),
      demarcheIdValidator.parse('lynG9hx3x05LaqpySr0qxeca'),
      demarcheIdValidator.parse('xjvFNG3I8YOv2xLw6FQJjTab'),
      demarcheIdValidator.parse('fWlR3sADjURm21wM2j7UZF3R'),
      demarcheIdValidator.parse('eySDrrpK4KKukIw3II3nk3G1'),
      demarcheIdValidator.parse('PYrSWWMeDDDYfJfgWa09LVlp'),
    ],
    machineId: 'PrmOct',
  },
  {
    titreTypeIds: ['axm'],
    demarcheTypeIds: ['oct'],
    // https://camino.beta.gouv.fr/titres/m-ax-crique-tumuc-humac-2020
    dateDebut: toCaminoDate('2020-10-01'),
    demarcheIdExceptions: [
      demarcheIdValidator.parse('C3rs92l1eci3mLvsAGkv7gVV'),
      demarcheIdValidator.parse('YEWeODXiFb7xKJB2OQlTyc14'),
      // avis dgtm moins de 30 jours après la saisine des services
      demarcheIdValidator.parse('ktPyoaDYzJi2faPMtAeKFZ5l'),
      // pas d'enregistrement de la demande
      demarcheIdValidator.parse('xbKfuhPmphDd68x4QqtyRctj'),
      demarcheIdValidator.parse('TUI2aBCJRv7Fc1torDlVu8HB'),
      demarcheIdValidator.parse('FPcbrdR79tjerabHbxtLkMZa'),
    ],
    machineId: 'AxmOct',
  },
  {
    titreTypeIds: ['axm'],
    demarcheTypeIds: ['pro'],
    dateDebut: toCaminoDate('2000-01-01'),
    demarcheIdExceptions: [
      // Complète mais ne respectant pas le cacoo
      demarcheIdValidator.parse('Fq6lCWTS6h8k5dAsG6LLm3Gw'),
      demarcheIdValidator.parse('TlqKNgdYzYVrUXieMJAqWYBD'),
      demarcheIdValidator.parse('ka8jUJq3ESxAdhE6QacBlqS8'),
      demarcheIdValidator.parse('d2443R01mLB8Nv2ZAhNSZdx3'),
      demarcheIdValidator.parse('Od6oeREEAXvUyvdQWUOgKhTS'),
      demarcheIdValidator.parse('M7VhIeD27VR0kKrkPTQHyXeH'),
      demarcheIdValidator.parse('VWBvpOx3n4dN7WCQoYUEC6vM'),
      demarcheIdValidator.parse('A17SapPN5NzwSBEOeoagQcHt'),
      demarcheIdValidator.parse('tuQqpnDSYhnTGlkkxTsDUf0r'),
      demarcheIdValidator.parse('s8ONjdmsJivnfnhE4ENNVmOb'),
      demarcheIdValidator.parse('nk5alZi7lSkxGVMlmsmyaqOv'),
      demarcheIdValidator.parse('Eg3T3fvnJETbYBmd8BJYfc1h'),
      demarcheIdValidator.parse('ohHg9uU2zd9m3MvF6yJ3KxLr'),
      demarcheIdValidator.parse('zsDao5HywdHx7YRlWjEMklZJ'),
      demarcheIdValidator.parse('51G6AmHKKX5wFjbN6zJ3kufK'),
      demarcheIdValidator.parse('08eC26bUf4PCr6qj9Rl4Qa1F'),
      demarcheIdValidator.parse('OBKZ23yRO6e4VP7MyXwgCp6U'),
    ],
    machineId: 'AxmPro',
  },
  {
    titreTypeIds: ['pxg', 'arg', 'cxr', 'inr', 'prr', 'pxr', 'cxf', 'prf', 'pxf', 'arc', 'apc', 'pcc'],
    demarcheTypeIds: allDemarcheNotTravaux,
    dateDebut: plusVieilleDateEnBase,
    demarcheIdExceptions: [],
    machineId: 'ProcedureSimplifiee',
  },
  {
    titreTypeIds: ['cxg', 'prg', 'cxs', 'prs', 'aph', 'cxh', 'prh', 'pxh'],
    demarcheTypeIds: demarcheTypeIdsCxPr_G,
    dateDebut: plusVieilleDateEnBase,
    demarcheIdExceptions: [],
    machineId: 'ProcedureSimplifiee',
  },
  {
    titreTypeIds: ['arc', 'cxg', 'cxw', 'cxh', 'cxm', 'cxs', 'pcc', 'prg', 'prw', 'prh', 'prm', 'prs'],
    demarcheTypeIds: [
      DEMARCHES_TYPES_IDS.Octroi,
      DEMARCHES_TYPES_IDS.Prolongation,
      DEMARCHES_TYPES_IDS.Prolongation1,
      DEMARCHES_TYPES_IDS.Prolongation2,
      DEMARCHES_TYPES_IDS.ProlongationExceptionnelle,
      DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
      DEMARCHES_TYPES_IDS.ExtensionDeSubstance,
      DEMARCHES_TYPES_IDS.Prorogation,
    ],
    dateDebut: DATE_DEBUT_PROCEDURE_SPECIFIQUE,
    demarcheIdExceptions: [],
    machineId: 'ProcedureSpecifique',
  },
  {
    titreTypeIds: ['arm', 'axm'],
    demarcheTypeIds: [
      DEMARCHES_TYPES_IDS.Octroi,
      DEMARCHES_TYPES_IDS.Prolongation,
      DEMARCHES_TYPES_IDS.Prolongation1,
      DEMARCHES_TYPES_IDS.Prolongation2,
      DEMARCHES_TYPES_IDS.ProlongationExceptionnelle,
      DEMARCHES_TYPES_IDS.ExtensionDePerimetre,
      DEMARCHES_TYPES_IDS.ExtensionDeSubstance,
      DEMARCHES_TYPES_IDS.Prorogation,
    ],
    dateDebut: DATE_DEBUT_PROCEDURE_SPECIFIQUE_AXM_ARM,
    demarcheIdExceptions: [],
    machineId: 'ProcedureSpecifique',
  },
] as const satisfies readonly DemarcheDefinition[]

export const machineIdFind = (
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId,
  titreEtapes: DeepReadonly<{ date: CaminoDate; typeId: EtapeTypeId }[]> | undefined,
  demarcheId: DemarcheId,
  overrideDate: CaminoDate | null = null
): CaminoMachineId | undefined => {
  const date = demarcheEnregistrementDemandeDateFind(titreEtapes) ?? overrideDate
  const definition = toSorted(demarchesDefinitions, (a, b) => b.dateDebut.localeCompare(a.dateDebut)).find(
    d => (isNullOrUndefinedOrEmpty(date) || d.dateDebut <= date) && d.titreTypeIds.includes(titreTypeId) && d.demarcheTypeIds.includes(demarcheTypeId)
  )
  if (isNotNullNorUndefined(definition) && isNotNullNorUndefinedNorEmpty(definition.demarcheIdExceptions) && definition.demarcheIdExceptions.includes(demarcheId)) {
    return undefined
  }

  return definition?.machineId
}
