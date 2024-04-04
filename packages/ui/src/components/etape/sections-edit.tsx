
import { elementContenuBuild, contenuBuild, contenuCompleteCheck } from '@/utils/contenu'
import { DeepReadonly, computed, defineComponent, watch } from 'vue'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { FullEtapeHeritage } from 'camino-common/src/etape'
import { getSections, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { useState } from '../../utils/vue-tsx-utils'
import { SectionWithValue } from 'camino-common/src/sections'
import { SectionElementWithValueEdit } from './section-element-with-value-edit'

type Props = {
  titreTypeId: TitreTypeId,
  demarcheTypeId: DemarcheTypeId
  etape: DeepReadonly<Pick<FullEtapeHeritage, 'typeId' | 'heritageContenu' | 'contenu'>>
  completeUpdate: (etape: Props['etape'], complete: boolean)=> void
}
export const SectionsEdit = defineComponent<Props>(props => {

  const [editedEtape, setEditedEtape] = useState(props.etape)

  const updateElement = () => {
    // FIXME
  }
  const updateHeritage = () => {
    // FIXME
  }
  watch(() => editedEtape.value, () => {
    const complete = contenuCompleteCheck(sections.value, editedEtape.value.contenu)

    props.completeUpdate(editedEtape.value, complete),
    {immediate: true}
  })

  const sections = computed(() => {
    return getSections(props.titreTypeId, props.demarcheTypeId, props.etape.typeId)
  })

  const sectionsWithValue = computed<SectionWithValue[]>(() => {
    return getSectionsWithValue(sections.value, editedEtape.value.contenu)
  })

  return () =>   <div>
    {sectionsWithValue.value.map(sectionWithValue => <div key={sectionWithValue.id}>
      {isNotNullNorUndefinedNorEmpty(sectionWithValue.nom) ? <h3>{ sectionWithValue.nom }</h3> : null}


      {sectionWithValue.elements.map(elementWithValue => <SectionElementWithValueEdit key={elementWithValue.id} elementWithValue={elementWithValue} elementHeritage={props.etape.heritageContenu[sectionWithValue.id][elementWithValue.id]}  sectionId={sectionWithValue.id} updateElement={updateElement} updateHeritage={updateHeritage}/>)}

  </div>)}

</div>
})


// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
SectionsEdit.props = ['etape', 'titreTypeId', 'demarcheTypeId', 'completeUpdate']
