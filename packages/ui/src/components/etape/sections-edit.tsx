import { DeepReadonly, computed, defineComponent } from 'vue'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { getSections, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { useState } from '../../utils/vue-tsx-utils'
import { SectionWithValue } from 'camino-common/src/sections'
import { SectionElementWithValueEdit } from './section-element-with-value-edit'
import { FlattenEtape } from 'camino-common/src/etape-form'
import { Contenu } from 'camino-common/src/permissions/sections'

export type SectionsEditEtape = DeepReadonly<Pick<FlattenEtape, 'typeId' | 'contenu'>>
type Props = {
  titreTypeId: TitreTypeId
  demarcheTypeId: DemarcheTypeId
  etape: DeepReadonly<SectionsEditEtape>
  completeUpdate: (etape: Props['etape']) => void
}

export const SectionsEdit = defineComponent<Props>(props => {
  const [editedEtape, setEditedEtape] = useState(props.etape)

  const updateElement = (sectionId: string, elementId: string) => (element: DeepReadonly<FlattenEtape['contenu'][string][string]>) => {
    updateEtape({ contenu: { ...editedEtape.value.contenu, [sectionId]: { ...editedEtape.value.contenu[sectionId], [elementId]: element } } })
  }

  const updateEtape = (partialEtape: Partial<Props['etape']>) => {
    setEditedEtape({ ...editedEtape.value, ...partialEtape })
    props.completeUpdate({ ...props.etape, ...partialEtape })
  }

  const sections = computed(() => {
    return getSections(props.titreTypeId, props.demarcheTypeId, props.etape.typeId)
  })
  const sectionsWithValue = computed<DeepReadonly<SectionWithValue[]>>(() => {
    if (isNotNullNorUndefined(editedEtape.value.contenu)) {
      const contenu = Object.keys(editedEtape.value.contenu).reduce<DeepReadonly<Contenu>>((accSections, section) => {
        const elements = Object.keys(editedEtape.value.contenu[section]).reduce<DeepReadonly<{ [secondKey in string]?: unknown }>>((accElements, element) => {
          const contenuValue = editedEtape.value.contenu[section][element].value
          if (isNotNullNorUndefined(contenuValue)) {
            return { ...accElements, [element]: contenuValue }
          }
          return accElements
        }, {})

        return { ...accSections, [section]: elements }
      }, {})

      return getSectionsWithValue(sections.value, contenu)
    }
    return []
  })

  return () => (
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-xl-6">
        {sectionsWithValue.value.map(sectionWithValue => (
          <div key={sectionWithValue.id}>
            {isNotNullNorUndefinedNorEmpty(sectionWithValue.nom) ? <h3>{sectionWithValue.nom}</h3> : null}

            {sectionWithValue.elements.map(elementWithValue => (
              <SectionElementWithValueEdit
                key={elementWithValue.id}
                elementWithValue={elementWithValue}
                elementHeritage={props.etape.contenu[sectionWithValue.id][elementWithValue.id]}
                sectionId={sectionWithValue.id}
                updateElement={updateElement(sectionWithValue.id, elementWithValue.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
SectionsEdit.props = ['etape', 'titreTypeId', 'demarcheTypeId', 'completeUpdate']
