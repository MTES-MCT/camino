import { setDateAndOrderAndInterpretMachine } from '../machine-test-helper'
import { AxmProMachine } from './pro.machine'
import { describe, expect, test } from 'vitest'

import { EtapesTypesEtapesStatuts as ETES } from 'camino-common/src/static/etapesTypesEtapesStatuts'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS } from 'camino-common/src/static/demarchesTypes'

describe('vérifie l’arbre de prolongation d’AXM', () => {
  const axmProMachine = new AxmProMachine(TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX, DEMARCHES_TYPES_IDS.Prolongation)
  test('après la recevabilité, on peut faire une saisine des services', () => {
    const { tree } = setDateAndOrderAndInterpretMachine(axmProMachine, '2022-04-14', [ETES.demande.FAIT, ETES.enregistrementDeLaDemande.FAIT, ETES.recevabiliteDeLaDemande.FAVORABLE])
    expect(tree).toMatchInlineSnapshot(`
      [
        "RIEN                                 (confidentielle, en construction        ) -> [FAIRE_DEMANDE]",
        "FAIRE_DEMANDE                        (confidentielle, en construction        ) -> [ENREGISTRER_DEMANDE]",
        "[2022-04-15 -> null]",
        "ENREGISTRER_DEMANDE                  (confidentielle, déposé                 ) -> [DEMANDER_COMPLEMENTS_POUR_RECEVABILITE,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,FAIRE_RECEVABILITE_DEMANDE_DEFAVORABLE,FAIRE_RECEVABILITE_DEMANDE_FAVORABLE,RENDRE_DECISION_IMPLICITE_REJET]",
        "[2022-04-15 -> null]",
        "FAIRE_RECEVABILITE_DEMANDE_FAVORABLE (publique      , en instruction         ) -> [DEMANDER_INFORMATION_POUR_AVIS_DREAL,FAIRE_CLASSEMENT_SANS_SUITE,FAIRE_DESISTEMENT_DEMANDEUR,RENDRE_AVIS_DE_COLLECTIVITES,RENDRE_AVIS_DES_SERVICES_ET_COMMISSIONS_CONSULTATIVES,RENDRE_DECISION_IMPLICITE_REJET]",
        "[2022-04-15 -> null]",
      ]
    `)
  })
})
