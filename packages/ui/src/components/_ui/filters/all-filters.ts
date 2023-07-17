import { ZodType, z } from 'zod'
import { Domaine, DomaineId } from 'camino-common/src/static/domaines'
import { TitreTypeTypeId } from 'camino-common/src/static/titresTypesTypes'
import { Couleur } from 'camino-common/src/static/couleurs'
import { Definition } from 'camino-common/src/definition'
import { TitreStatutId } from 'camino-common/src/static/titresStatuts'
import { OmitDistributive } from 'camino-common/src/typescript-tools'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { CaminoDate } from 'camino-common/src/date'

export interface FilterInput {
  type: 'input'
  placeholder: string
  value: string
}

export type FilterCheckbox = {
  type: 'checkboxes'
  value: any[]
} & (
  | { component: 'FiltreDomaine'; elements: Domaine[] }
  | { component: 'FiltresTypes'; elements: { id: `${TitreTypeTypeId}-${DomaineId}` | TitreTypeTypeId; nom: string }[] }
  | { component: 'FiltresStatuts'; elements: { id: string; couleur: Couleur; nom: string }[] }
  | { component: 'FiltresTitresStatuts'; elements: Pick<Definition<TitreStatutId>, 'id' | 'nom'>[] }
  | { component: 'FiltresLabel'; elements: { id: string; nom: string }[] }
)

type Element<T extends string> = { id: T; nom: string }

type RemoteFilter<T extends string> = {
  lazy: true
  search: (input: string) => Promise<{ elements: Element<T>[] }>
  load: (ids: T[]) => Promise<{ elements: Element<T>[] }>
}

type LocalFilter = {
  lazy: false
  /**
   * @deprecated supprimer du store et faire passer l'info
   */
  elementsFormat: (id: string, metas: unknown) => unknown
}

export type FilterAutocomplete<Id extends string> = {
  type: 'autocomplete'
  elements: Element<Id>[]
  value: Id[]
} & (LocalFilter | RemoteFilter<Id>)

export type FilterEtapeValue = {
  typeId: EtapeTypeId | ''
  statutId?: EtapeStatutId
  dateDebut: CaminoDate | null
  dateFin: CaminoDate | null
}

export type FilterEtape = {
  type: 'etape'
  value: FilterEtapeValue[]
}

export interface CommonFilter<FilterId extends string, ElementType> {
  id: FilterId
  validator: ZodType<ElementType>
  name: string
}

type AllFilters<AutocompleteElementId extends string> = FilterInput | FilterCheckbox | FilterAutocomplete<AutocompleteElementId> | FilterEtape

export type FiltersDeclaration<FilterId extends string, ElementType, AutocompleteElementId extends string> = CommonFilter<FilterId, ElementType> & AllFilters<AutocompleteElementId>

export type FilterComponentProp<Filter extends AllFilters<AutocompleteElementId>, AutocompleteElementId extends string = never> = OmitDistributive<
  CommonFilter<never, never> & Filter,
  'id' | 'validator' | 'type' | 'elementsFormat'
>
