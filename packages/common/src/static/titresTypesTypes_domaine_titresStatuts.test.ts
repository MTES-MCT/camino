import { DEMARCHES_TYPES_IDS } from './demarchesTypes'
import { DOMAINES_IDS } from './domaines'
import { TitresStatutIds } from './titresStatuts'
import { TITRES_TYPES_TYPES_IDS } from './titresTypesTypes'
import { titrePublicFind } from './titresTypesTypes_domaine_titresStatuts'

describe("publicité d'un titre", () => {
  test('un titre est toujours visible par son demandeur ou titulaire', () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_TYPES_IDS.CONCESSION, DOMAINES_IDS.METAUX, [])).toMatchObject({
      entreprisesLecture: true
    })
  })

  test("un titre sans démarche n'est pas public", () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_TYPES_IDS.CONCESSION, DOMAINES_IDS.METAUX, [])).toMatchObject({
      publicLecture: false
    })
  })

  test("un titre dont l'autorisation pour son statut est mise à `false` n'est pas public", () => {
    expect(
      titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_TYPES_IDS.PERMIS_EXCLUSIF_DE_CARRIERES, DOMAINES_IDS.METAUX, [{ typeId: DEMARCHES_TYPES_IDS.Octroi, publicLecture: true }])
    ).toMatchObject({
      publicLecture: false
    })
  })

  test("un titre dont l'autorisation pour son statut est mise à `true` et dont la démarche d'octroi n'est pas publique n'est pas public", () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_TYPES_IDS.CONCESSION, DOMAINES_IDS.METAUX, [{ typeId: DEMARCHES_TYPES_IDS.Octroi, publicLecture: false }])).toMatchObject({
      publicLecture: false
    })
  })

  test("un titre dont l'autorisation pour son statut est mise à `true` et dont la démarche de mutation virtuelle n'est pas publique n'est pas public", () => {
    expect(
      titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_TYPES_IDS.CONCESSION, DOMAINES_IDS.METAUX, [{ typeId: DEMARCHES_TYPES_IDS.MutationPartielle, publicLecture: false }])
    ).toMatchObject({ publicLecture: false })
  })

  test("un titre dont l'autorisation pour son statut est mise à `true` et qui n'a pas de démarche d'octroi n'est pas public", () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_TYPES_IDS.CONCESSION, DOMAINES_IDS.METAUX, [{ typeId: DEMARCHES_TYPES_IDS.Prolongation, publicLecture: true }])).toMatchObject(
      { publicLecture: false }
    )
  })

  test("un titre dont l'autorisation pour son statut est mise à `true` et dont la démarche d'octroi est publique est public", () => {
    expect(titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_TYPES_IDS.CONCESSION, DOMAINES_IDS.METAUX, [{ typeId: DEMARCHES_TYPES_IDS.Octroi, publicLecture: true }])).toMatchObject({
      publicLecture: true
    })
  })

  test("un titre dont l'autorisation pour son statut est mise à `true` et dont la mutation partielle est publique est public", () => {
    expect(
      titrePublicFind(TitresStatutIds.DemandeInitiale, TITRES_TYPES_TYPES_IDS.CONCESSION, DOMAINES_IDS.METAUX, [{ typeId: DEMARCHES_TYPES_IDS.MutationPartielle, publicLecture: true }])
    ).toMatchObject({ publicLecture: true })
  })
})
