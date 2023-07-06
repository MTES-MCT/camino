import { markRaw } from 'vue'
import { Nom } from '../_common/nom'
import { Statut } from '../_common/statut'
import { Domaine as CaminoDomaine } from '../_common/domaine'
import { List } from '../_ui/list'
import { DemarchesStatuts } from 'camino-common/src/static/demarchesStatuts'
import { TitresStatuts } from 'camino-common/src/static/titresStatuts'
import { ReferencesTypes } from 'camino-common/src/static/referencesTypes'
import { getDomaineId, getTitreTypeType } from 'camino-common/src/static/titresTypes'
import { TitresTypesTypes } from 'camino-common/src/static/titresTypesTypes'
import { DemarchesTypes } from 'camino-common/src/static/demarchesTypes'

const demarchesColonnes = [
  { id: 'titreNom', name: 'Titre' },
  { id: 'titreDomaine', name: '' },
  { id: 'titreType', name: 'Type de titre' },
  {
    id: 'titreStatut',
    name: 'Statut de titre',
    class: ['nowrap', 'min-width-6'],
  },
  { id: 'type', name: 'Type' },
  { id: 'statut', name: 'Statut', class: ['nowrap'] },
  { id: 'references', name: 'Références', class: ['nowrap'], noSort: true },
]

const demarchesLignesBuild = demarches =>
  demarches.map(demarche => {
    const titreStatut = TitresStatuts[demarche.titre.titreStatutId]
    const domaineId = getDomaineId(demarche.titre.typeId)
    const titreTypeType = TitresTypesTypes[getTitreTypeType(demarche.titre.typeId)]
    const demarcheType = DemarchesTypes[demarche.typeId]
    const columns = {
      titreNom: { value: demarche.titre.nom },
      titreDomaine: {
        component: markRaw(CaminoDomaine),
        props: { domaineId },
        value: domaineId,
      },
      titreType: {
        component: markRaw(Nom),
        props: { nom: titreTypeType.nom },
        value: titreTypeType.nom,
      },
      titreStatut: {
        component: markRaw(Statut),
        props: {
          color: titreStatut.couleur,
          nom: titreStatut.nom,
        },
        value: titreStatut.nom,
      },
      type: {
        component: markRaw(Nom),
        props: { nom: demarcheType.nom },
        value: demarcheType.nom,
      },
      statut: {
        component: markRaw(Statut),
        props: {
          color: DemarchesStatuts[demarche.statutId].couleur,
          nom: DemarchesStatuts[demarche.statutId].nom,
        },
        value: DemarchesStatuts[demarche.statutId].nom,
      },
      references: {
        component: markRaw(List),
        props: {
          elements: demarche.titre.references.map(ref => `${ReferencesTypes[ref.referenceTypeId].nom} : ${ref.nom}`),
          mini: true,
        },
        class: 'mb--xs',
      },
    }

    return {
      id: demarche.id,
      link: { name: 'titre', params: { id: demarche.titre.slug } },
      columns,
    }
  })

export { demarchesColonnes, demarchesLignesBuild }
