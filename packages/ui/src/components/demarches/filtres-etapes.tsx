import { EtapeTypeId, EtapesTypes } from "camino-common/src/static/etapesTypes"
import { FilterComponentProp, FilterEtape } from "../_ui/all-filters"
import { InputDate } from '../_ui/input-date'
import { Icon } from '@/components/_ui/icon'
import { ButtonIcon } from '@/components/_ui/button-icon'
import { getEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { CaminoDate } from "camino-common/src/date"
import { HTMLAttributes } from "vue"

type Props = {
  filter: FilterComponentProp<FilterEtape>
} & Pick<HTMLAttributes, 'class'>

export const FiltresEtapes = (props: Props) => {
  const dateDebutChanged = (n: number, date: CaminoDate | null) => {
    props.filter.value[n].dateDebut = date
  }
  const dateFinChanged = (n: number, date: CaminoDate | null) => {
    props.filter.value[n].dateFin = date
  }
  const statutsFind = (typeId: EtapeTypeId) => {
    return getEtapesStatuts(typeId)
  }

  const valueAdd = () => {
    props.filter.value.push({ typeId: '', dateDebut: null, dateFin: null })
  }

  const valueRemove = (n: number) => {
    return () => props.filter.value.splice(n, 1)
  }

  const valueReset = (n: number) => {
    delete props.filter.value[n].statutId
  }

  const statutValueReset = (n: number) =>  {
    // si l'utilisateur déselectionne le statut (chaine vide)
    if (!props.filter.value[n].statutId) {
      delete props.filter.value[n].statutId
    }
  }


  // TODO 2023-07-13 mettre un composant typeahead pour les types d'étapes plutôt qu'un select de l'enfer
  return (<div class="mb">
  <h5>{ props.filter.name }</h5>
  <hr class="mb-s" />


{props.filter.value.map((value, n) => (<div key={n}>
    <div class="flex mb-s">
      <select v-model={value.typeId} class="p-s mr-s" onChange={() => valueReset(n)}>
        <option value="">–</option>
        {Object.values(EtapesTypes).map(type => (<option key={type.id} value={type.id}>
          { type.nom }
        </option>))}
        
      </select>

      <ButtonIcon class="btn py-s px-m rnd-xs" onClick={() => valueRemove(n)} icon="minus" title="Supprime la valeur" aria-label="Supprime la valeur" />
    </div>
    {value.typeId ? (<div>
      <div class="blobs mb-s">
        <div class="blob-1-4">
          <h5 class="mb-0">Statut</h5>
          <p class="h6 italic mb-0">Optionnel</p>
        </div>
        <div class="blob-3-4">
          <select v-model={value.statutId} class="p-s mr-s cap-first" onChange={() => statutValueReset(n)}>
            <option value=''>–</option>
            {statutsFind(value.typeId).map(statut => <option key={statut.id} value={statut.id}>
              { statut.nom }
            </option>)}
            
          </select>
        </div>
      </div>
      <div class="blobs mb-s">
        <div class="blob-1-4">
          <h5 class="mb-0">Après le</h5>
          <p class="h6 italic mb-0">Optionnel</p>
        </div>
        <div class="blob-3-4">
          <InputDate initialValue={props.filter.value[n].dateDebut} dateChanged={date => dateDebutChanged(n, date)} />
        </div>
      </div>
      <div class="blobs mb-s">
        <div class="blob-1-4">
          <h5 class="mb-0">Avant le</h5>
          <p class="h6 italic mb-0">Optionnel</p>
        </div>
        <div class="blob-3-4">
          <InputDate initialValue={props.filter.value[n].dateFin} dateChanged={date => dateFinChanged(n, date)} />
        </div>
      </div>
    </div>) : null}
    
    <hr class="mb-s" />
  </div>))}
  
  <button
    v-if="!filter.value || !filter.value.some(v => v.typeId === '')"
    class="btn rnd-xs py-s px-m full-x flex mb-s h6"
    title="Ajouter un type d’étape"
    aria-label="Ajouter un type d’étape"
    onClick={valueAdd}
  >
    <span class="mt-xxs">Ajouter un type d'étape</span>
    <Icon name="plus" size="M" class="flex-right" aria-hidden="true" />
  </button>
</div>)
}

