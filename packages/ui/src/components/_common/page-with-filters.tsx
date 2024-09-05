
import { FunctionalComponent } from 'vue'
import type { JSX } from 'vue/jsx-runtime'
export type Props = {
  content: JSX.Element
  filtres: JSX.Element
}

export const PageWithFilters: FunctionalComponent<Props> = props => {
          // FIXME sur titres on voit tout le temps la marge à droite
  return (
    <div class="fr-container--fluid">
           <div class="fr-grid-row">
             <div class="fr-col-12 fr-col-md-3">
               <div class="fr-sidemenu  fr-sidemenu--sticky-full-height"  aria-labelledby="fr-sidemenu-title">
                 <div class="fr-sidemenu__inner fr-pt-3w fr-pl-md-2w fr-pb-3w">
                   <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper" aria-expanded="false">
                     Filtres
                   </button>
                   <div class="fr-collapse" id="fr-sidemenu-wrapper">
                     <div class="fr-sidemenu__title" id="fr-sidemenu-title">
                       Filtres
                     </div>

                       {props.filtres}

                   </div>
                 </div>
               </div>
             </div>

             <div class="fr-col-12 fr-col-md-9 fr-pt-3w fr-pr-4w fr-pb-3w">
            { props.content}


             </div>
           </div>
         </div>
  )
}
