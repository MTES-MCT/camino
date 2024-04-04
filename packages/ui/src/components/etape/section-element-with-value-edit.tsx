
import { elementContenuBuild, contenuBuild, contenuCompleteCheck } from '@/utils/contenu'
import { DeepReadonly, computed, defineComponent, watch } from 'vue'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { FullEtapeHeritage, HeritageProp } from 'camino-common/src/etape'
import { getSections, getSectionsWithValue } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections'
import { isNotNullNorUndefined, isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { useState } from '../../utils/vue-tsx-utils'
import { ElementWithValue, SectionWithValue } from 'camino-common/src/sections'
import { HeritageEdit } from './heritage-edit'
import { SectionElement } from '../_common/new-section-element'
import { SectionElementEdit } from '../_common/new-sections-edit'

type Props = {
  sectionId: string
  elementWithValue: DeepReadonly< ElementWithValue>
  elementHeritage: DeepReadonly<HeritageProp<Pick<FullEtapeHeritage, 'contenu' | 'typeId' | 'date'>>>
  updateElement: (element: Props['elementWithValue'])=> void
  updateHeritage: (etape: Props['elementHeritage'])=> void
}
export const SectionElementWithValueEdit = defineComponent<Props>(props => {

  const updateHeritage = () => {
    //FIXME
  }

  const updateValue = () => {
    //FIXME
  }

  const read = (etape?: DeepReadonly<Pick<FullEtapeHeritage, 'contenu' | 'typeId' | 'date'>>) => {
    if (isNotNullNorUndefined(etape)) {
      // @ts-ignore FIXME regarder si on peut narrow l'élément value
      return <SectionElement element={{...props.elementWithValue, value: etape.contenu[props.sectionId][props.elementWithValue.id]}}/>
    } else {
      return <></>
    }
  }

  const write = () => {
    return <SectionElementEdit element={props.elementWithValue} onValueChange={updateValue}/>
  }


  return () =>   <HeritageEdit prop={props.elementHeritage} propId='contenu' read={read} write={write} updateHeritage={updateHeritage} />
})


// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
SectionElementWithValueEdit.props = ['elementWithValue', 'elementHeritage', 'updateElement', 'updateHeritage', 'sectionId']
