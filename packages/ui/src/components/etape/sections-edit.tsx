import { DeepReadonly, computed, defineComponent, toRaw, watch } from 'vue'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { FullEtapeHeritage, HeritageContenu } from 'camino-common/src/etape'
import { getSections, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { isNotNullNorUndefinedNorEmpty, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { useState } from '../../utils/vue-tsx-utils'
import { ElementWithValue, SectionWithValue } from 'camino-common/src/sections'
import { ElementHeritage, SectionElementWithValueEdit } from './section-element-with-value-edit'
import { sectionsWithValueCompleteValidate } from 'camino-common/src/permissions/sections'

export type SectionsEditEtape = DeepReadonly<Pick<FullEtapeHeritage, 'typeId' | 'heritageContenu' | 'contenu'>>
type Props = {
  titreTypeId: TitreTypeId
  demarcheTypeId: DemarcheTypeId
  etape: SectionsEditEtape
  completeUpdate: (etape: Props['etape']) => void
}

export const sectionsStepIsVisible = (etape: Pick<FullEtapeHeritage, 'typeId'>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  return getSections(titreTypeId, demarcheTypeId, etape.typeId).length > 0
}
export const sectionsStepIsComplete = (etape: DeepReadonly<Pick<FullEtapeHeritage, 'typeId' | 'contenu'>>, demarcheTypeId: DemarcheTypeId, titreTypeId: TitreTypeId): boolean => {
  if( !sectionsStepIsVisible(etape, demarcheTypeId, titreTypeId) ){
    return true
  }

  const sections = getSections(titreTypeId, demarcheTypeId, etape.typeId)
  const sectionsWithValue = getSectionsWithValue(sections, etape.contenu)
  return sectionsWithValueCompleteValidate(sectionsWithValue).length === 0

}
export const SectionsEdit = defineComponent<Props>(props => {
  const [editedEtape, setEditedEtape] = useState(props.etape)

  const updateElement = (sectionId: string) => (element: DeepReadonly<ElementWithValue>) => {
    setEditedEtape({ ...editedEtape.value, contenu: { ...editedEtape.value.contenu, [sectionId]: { [element.id]: element.value } } })
  }
  const updateHeritage = (elementId: string, sectionId: string) => (heritage: ElementHeritage) => {
    setEditedEtape({ ...editedEtape.value, heritageContenu: { ...editedEtape.value.heritageContenu, [sectionId]: { [elementId]: heritage } } })
  }

  const sections = computed(() => {
    return getSections(props.titreTypeId, props.demarcheTypeId, props.etape.typeId)
  })

  const sectionsWithValue = computed<SectionWithValue[]>(() => {
    return getSectionsWithValue(sections.value, editedEtape.value.contenu)
  })

  watch(
    () => editedEtape.value,
    () => {
      props.completeUpdate(editedEtape.value)
    }
  )

  const heritageContenu = computed<DeepReadonly<HeritageContenu>>(() => {
    const heritage: HeritageContenu = structuredClone(toRaw(props.etape.heritageContenu))
    for (const section of sectionsWithValue.value) {
      if (isNullOrUndefined(heritage[section.id])) {
        heritage[section.id] = {}
      }
      for (const element of section.elements) {
        if (isNullOrUndefined(heritage[section.id][element.id])) {
          heritage[section.id][element.id] = { actif: false }
        }
      }
    }

    return heritage
  })

  return () => (
    <div>
      {sectionsWithValue.value.map(sectionWithValue => (
        <div key={sectionWithValue.id}>
          {isNotNullNorUndefinedNorEmpty(sectionWithValue.nom) ? <h3>{sectionWithValue.nom}</h3> : null}

          {sectionWithValue.elements.map(elementWithValue => (
            <SectionElementWithValueEdit
              key={elementWithValue.id}
              elementWithValue={elementWithValue}
              elementHeritage={heritageContenu.value[sectionWithValue.id][elementWithValue.id]}
              sectionId={sectionWithValue.id}
              updateElement={updateElement(sectionWithValue.id)}
              updateHeritage={updateHeritage(sectionWithValue.id, elementWithValue.id)}
            />
          ))}
        </div>
      ))}
    </div>
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
SectionsEdit.props = ['etape', 'titreTypeId', 'demarcheTypeId', 'completeUpdate']
