import { ITitreEtape } from '../../types'

import { titreDemarchePublicFind } from './titre-demarche-public-find'
import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { newDemarcheId, newEtapeId, newTitreId } from '../../database/models/_format/id-create'
import { toCaminoDate } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
import { ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { TITRES_TYPES_IDS } from 'camino-common/src/static/titresTypes'
import { ETAPES_STATUTS } from 'camino-common/src/static/etapesStatuts'
const etapesBuild = (etapesProps: Partial<ITitreEtape>[]) =>
  etapesProps.map(
    (etapeProps, i) =>
      ({
        id: newEtapeId(`${i}+1`),
        communes: null,
        surface: null,
        contenu: null,
        ...etapeProps,
        ordre: i + 1,
        date: toCaminoDate('0001-01-01'),
      }) as unknown as ITitreEtape
  )

describe("publicité d'une démarche", () => {
  test("une démarche sans étape n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          id: newDemarcheId(),
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          etapes: [],
          titreId: newTitreId('titreId'),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
      )
    ).toMatchObject({
      publicLecture: false,
      entreprisesLecture: false,
    })
  })

  test("une démarche d'octroi sans étape décisive n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          id: newDemarcheId(),
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_ }]),
          titreId: newTitreId('titreId'),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: false, entreprisesLecture: false })
  })

  test("une démarche de retrait dont l'étape la plus récente est saisine du préfet est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.saisineDuPrefet }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: false, entreprisesLecture: false })
  })

  test("une démarche de retrait dont l'étape la plus récente est saisine du préfet est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Retrait,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.saisineDuPrefet }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true, entreprisesLecture: true })
  })

  test("une démarche de déchéance dont l'étape la plus récente est saisine du préfet est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Decheance,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.saisineDuPrefet }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true, entreprisesLecture: true })
  })

  test("une démarche dont l'étape la plus récente est demande est visible uniquement par l'entreprise", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.demande }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: false, entreprisesLecture: true })
  })

  test("une démarche d'une machine simplifiée dont l'étape la plus récente est décision de l'administration est visible", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2023-01-01'),
          demarcheDateFin: toCaminoDate('2026-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, date: toCaminoDate('2023-01-01'), statutId: ETAPES_STATUTS.ACCEPTE, isBrouillon: ETAPE_IS_NOT_BROUILLON }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_GEOTHERMIE
      )
    ).toMatchObject({ publicLecture: true, entreprisesLecture: true })
  })

  test("une démarche dont l'étape la plus récente est classement sans suite n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.classementSansSuite }, { typeId: ETAPES_TYPES.demande }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: false })
  })

  test("une démarche d'un titre AXM dont l'étape la plus récente est classement sans suite ne change pas de visibilité", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.recevabiliteDeLaDemande, date: toCaminoDate('2000-01-01') }, { typeId: ETAPES_TYPES.classementSansSuite }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est classement sans suite ne change pas de visibilité", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([
            { typeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, date: toCaminoDate('2000-01-01') },
            { typeId: ETAPES_TYPES.classementSansSuite },
          ]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est désistement du demandeur est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.desistementDuDemandeur, date: toCaminoDate('2000-01-01') }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre AXM dont l'étape la plus récente est désistement du demandeur est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.desistementDuDemandeur, date: toCaminoDate('2000-01-01') }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche ne pouvant pas faire l'objet d'une mise en concurrence dont l'étape la plus récente est recevabilité est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Prolongation1,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.recevabiliteDeLaDemande }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM ne pouvant pas faire l'objet d'une mise en concurrence dont l'étape la plus récente est recevabilité n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.recevabiliteDeLaDemande, date: toCaminoDate('2000-01-01') }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
      )
    ).toMatchObject({ publicLecture: false })
  })

  test("une démarche pouvant faire l'objet d'une mise en concurrence dont l'étape la plus récente est recevabilité n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.recevabiliteDeLaDemande }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.CONCESSION_GEOTHERMIE
      )
    ).toMatchObject({ publicLecture: false })
  })

  test("une démarche dont l'étape la plus récente est mise en concurrence au JORF est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est publication de l'avis de décision implicite (historique) est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.publicationDeLavisDeDecisionImplicite }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est participation du public est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.participationDuPublic }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est décision de l'ONF peu importe son statut (historique) est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets, date: toCaminoDate('2000-01-01') }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est commission ARM peu importe son statut (historique) est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, date: toCaminoDate('2000-01-01') }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est saisine de la commission ARM est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, date: toCaminoDate('2000-01-01') }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision implicite au statut accepté est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.ACCEPTE_DECISION_IMPLICITE }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision implicite au statut rejeté n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([
            { typeId: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF, statutId: ETAPES_STATUTS.FAIT, isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2021-01-01') },
            { typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.REJETE_DECISION_IMPLICITE, isBrouillon: ETAPE_IS_NOT_BROUILLON, date: toCaminoDate('2021-01-02') },
          ]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: false })
  })

  test("une démarche d'un titre non AXM dont l'étape la plus récente est décision de l'administration au statut rejeté n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.REJETE }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: false })
  })

  test("une démarche d'un titre AXM dont l'étape la plus récente est décision de l'administration au statut rejeté est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([
            { typeId: ETAPES_TYPES.recevabiliteDeLaDemande, date: toCaminoDate('2000-01-01') },
            { typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.REJETE },
          ]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre AXM dont l'étape la plus récente est décision de l'administration au statut accepté est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.ACCEPTE, date: toCaminoDate('2000-01-01') }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est publication de décision au JORF au statut au statut accepté publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.publicationDeDecisionAuJORF, statutId: ETAPES_STATUTS.ACCEPTE }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision de l'autorité administrative est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est publication de décision unilatérale est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.publicationDeDecisionAuJORF }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est publication de décision au recueil des actes administratifs est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est signature de l'autorisation de recherche minière est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2000-01-01'),
          demarcheDateFin: toCaminoDate('2001-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere, date: toCaminoDate('2000-01-01') }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est signature de l'avenant à l'autorisation de recherche minière est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere, date: toCaminoDate('2000-01-01') }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision d'annulation par le juge administratif est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.decisionDuJugeAdministratif, statutId: ETAPES_STATUTS.FAVORABLE }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision d'annulation par le juge administratif au statut fait n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.decisionDuJugeAdministratif, statutId: ETAPES_STATUTS.FAIT }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: false })
  })

  test.each<DemarcheTypeId>([DEMARCHES_TYPES_IDS.RenonciationTotale, DEMARCHES_TYPES_IDS.RenonciationPartielle, DEMARCHES_TYPES_IDS.Prolongation])(
    "une démarche %s dont l'étape la plus récente est le dépot de la demande n'est pas publique",
    demarcheTypeId => {
      expect(
        titreDemarchePublicFind(
          {
            typeId: demarcheTypeId,
            demarcheDateDebut: toCaminoDate('2020-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([{ typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2017-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON }]),
            titreId: newTitreId('titreId'),
          },
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        )
      ).toMatchObject({ publicLecture: false })
      expect(
        titreDemarchePublicFind(
          {
            typeId: demarcheTypeId,
            demarcheDateDebut: toCaminoDate('2020-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([
              { typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-02'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
            ]),
            titreId: newTitreId('titreId'),
          },
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        )
      ).toMatchObject({ publicLecture: false })
    }
  )

  test.each<DemarcheTypeId>([DEMARCHES_TYPES_IDS.RenonciationTotale, DEMARCHES_TYPES_IDS.RenonciationPartielle, DEMARCHES_TYPES_IDS.Prolongation])(
    "une démarche %s dont l'étape la plus récente est recevabilité de la demande est publique",
    demarcheTypeId => {
      expect(
        titreDemarchePublicFind(
          {
            typeId: demarcheTypeId,
            demarcheDateDebut: toCaminoDate('2020-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([{ typeId: ETAPES_TYPES.recevabiliteDeLaDemande, date: toCaminoDate('2017-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON }]),
            titreId: newTitreId('titreId'),
          },
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        )
      ).toMatchObject({ publicLecture: true })

      expect(
        titreDemarchePublicFind(
          {
            typeId: demarcheTypeId,
            demarcheDateDebut: toCaminoDate('2020-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([
              { typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-02'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.recevabiliteDeLaDemande, statutId: ETAPES_STATUTS.FAVORABLE, date: toCaminoDate('2020-01-03'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
            ]),
            titreId: newTitreId('titreId'),
          },
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        )
      ).toMatchObject({ publicLecture: true })
    }
  )

  test.each<DemarcheTypeId>([DEMARCHES_TYPES_IDS.RenonciationTotale, DEMARCHES_TYPES_IDS.RenonciationPartielle, DEMARCHES_TYPES_IDS.Prolongation])(
    "une démarche %s dont l'étape la plus récente est l’expertise de l’onf est publique",
    demarcheTypeId => {
      expect(
        titreDemarchePublicFind(
          {
            typeId: demarcheTypeId,
            demarcheDateDebut: toCaminoDate('2020-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([
              { typeId: ETAPES_TYPES.recevabiliteDeLaDemande, date: toCaminoDate('2017-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, date: toCaminoDate('2017-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
            ]),
            titreId: newTitreId('titreId'),
          },
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        )
      ).toMatchObject({ publicLecture: true })
      expect(
        titreDemarchePublicFind(
          {
            typeId: demarcheTypeId,
            demarcheDateDebut: toCaminoDate('2020-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([
              { typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-02'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.recevabiliteDeLaDemande, statutId: ETAPES_STATUTS.FAVORABLE, date: toCaminoDate('2020-01-03'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-05'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
            ]),
            titreId: newTitreId('titreId'),
          },
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        )
      ).toMatchObject({ publicLecture: true })
    }
  )

  test.each<DemarcheTypeId>([DEMARCHES_TYPES_IDS.RenonciationTotale, DEMARCHES_TYPES_IDS.RenonciationPartielle, DEMARCHES_TYPES_IDS.Prolongation])(
    "une démarche %s dont l'étape la plus récente est la décision de classement sans suite est publique",
    demarcheTypeId => {
      expect(
        titreDemarchePublicFind(
          {
            typeId: demarcheTypeId,
            demarcheDateDebut: toCaminoDate('2020-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([{ typeId: ETAPES_TYPES.classementSansSuite, date: toCaminoDate('2017-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON }]),
            titreId: newTitreId('titreId'),
          },
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        )
      ).toMatchObject({ publicLecture: true })
      expect(
        titreDemarchePublicFind(
          {
            typeId: demarcheTypeId,
            demarcheDateDebut: toCaminoDate('2020-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([
              { typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-02'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.recevabiliteDeLaDemande, statutId: ETAPES_STATUTS.FAVORABLE, date: toCaminoDate('2020-01-03'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.classementSansSuite, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-05'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
            ]),
            titreId: newTitreId('titreId'),
          },
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        )
      ).toMatchObject({ publicLecture: true })
    }
  )

  test.each<DemarcheTypeId>([DEMARCHES_TYPES_IDS.RenonciationTotale, DEMARCHES_TYPES_IDS.RenonciationPartielle, DEMARCHES_TYPES_IDS.Prolongation])(
    "une démarche %s dont l'étape la plus récente est le désistement est publique",
    demarcheTypeId => {
      // sans machine
      expect(
        titreDemarchePublicFind(
          {
            typeId: demarcheTypeId,
            demarcheDateDebut: toCaminoDate('2017-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([{ typeId: ETAPES_TYPES.desistementDuDemandeur, date: toCaminoDate('2017-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON }]),
            titreId: newTitreId('titreId'),
          },
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        )
      ).toMatchObject({ publicLecture: true })
      // avec machine
      expect(
        titreDemarchePublicFind(
          {
            typeId: demarcheTypeId,
            demarcheDateDebut: toCaminoDate('2020-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([
              { typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-01'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-02'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
              { typeId: ETAPES_TYPES.desistementDuDemandeur, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-01-05'), isBrouillon: ETAPE_IS_NOT_BROUILLON },
            ]),
            titreId: newTitreId('titreId'),
          },
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        )
      ).toMatchObject({ publicLecture: true })
    }
  )

  test.each<EtapeTypeId>([
    ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF,
    ETAPES_TYPES.decisionDeLAutoriteAdministrative,
    ETAPES_TYPES.publicationDeDecisionAuJORF,
    ETAPES_TYPES.participationDuPublic,
    ETAPES_TYPES.enquetePublique,
    ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs,
  ])("une démarche d’un titre non énergétique dont l'étape la plus récente est %s est public", etapeTypeId => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: etapeTypeId, isBrouillon: ETAPE_IS_NOT_BROUILLON }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: true })
  })

  test('la demarche d’une prolongation déposée d’un PRM en survie provisoire est public ', () => {
    expect(
      titreDemarchePublicFind(
        {
          id: newDemarcheId(),
          typeId: DEMARCHES_TYPES_IDS.Prolongation1,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: null,
          etapes: etapesBuild([
            { typeId: ETAPES_TYPES.demande, isBrouillon: ETAPE_IS_NOT_BROUILLON },
            { typeId: ETAPES_TYPES.enregistrementDeLaDemande, isBrouillon: ETAPE_IS_NOT_BROUILLON },
          ]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX
      )
    ).toMatchObject({ publicLecture: true })
  })

  test('le titre WQaZgPfDcQw9tFliMgBIDH3Z ne doit pas être public', () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: DEMARCHES_TYPES_IDS.Octroi,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.publicationDeDecisionAuJORF, isBrouillon: ETAPE_IS_NOT_BROUILLON }]),
          titreId: newTitreId('WQaZgPfDcQw9tFliMgBIDH3Z'),
        },
        TITRES_TYPES_IDS.AUTORISATION_DE_PROSPECTION_GRANULATS_MARINS
      )
    ).toMatchObject({ publicLecture: false })
  })

  test('la demarche d’une prolongation non déposée d’un PRM en survie provisoire n’est pas public ', () => {
    expect(
      titreDemarchePublicFind(
        {
          id: newDemarcheId(),
          typeId: DEMARCHES_TYPES_IDS.Prolongation1,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: null,
          etapes: etapesBuild([{ typeId: ETAPES_TYPES.demande, isBrouillon: ETAPE_IS_NOT_BROUILLON }]),
          titreId: newTitreId('titreId'),
        },
        TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX
      )
    ).toMatchObject({ publicLecture: false })
  })
})
