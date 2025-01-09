import { ITitreEtape, TitreEtapesTravauxTypes as Travaux } from '../../types'

import { titreDemarcheStatutIdFind } from './titre-demarche-statut-id-find'
import { DemarchesStatutsIds as Demarches, DemarchesStatutsIds, DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { newDemarcheId } from '../../database/models/_format/id-create'
import { toCaminoDate } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'
import { ETAPES_STATUTS, EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { TitreEtapeForMachine } from '../rules-demarches/machine-common'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { ETAPES_TYPES, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TITRES_TYPES_IDS, TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DEMARCHES_TYPES_IDS, DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
const etapesBuild = (
  etapesProps: Partial<ITitreEtape>[],
  demarcheTypeId: DemarcheTypeId = DEMARCHES_TYPES_IDS.Octroi,
  titreTypeId: TitreTypeId = TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX
): TitreEtapeForMachine[] =>
  etapesProps.map(
    (etapeProps, i) =>
      ({
        ...etapeProps,
        isBrouillon: etapeProps.isBrouillon ?? ETAPE_IS_NOT_BROUILLON,
        ordre: i + 1,
        titreTypeId,
        demarcheTypeId,
        date: toCaminoDate('0001-01-01'),
      }) as unknown as TitreEtapeForMachine
  )

describe("statut d'une démarche", () => {
  test('une démarche sans étape a le statut “indéfini”', () => {
    expect(titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.Octroi, [], TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())).toEqual(DemarchesStatutsIds.Indetermine)
  })

  test("une démarche d'octroi sans étape décisive a le statut “indéfini”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([{ typeId: ETAPES_TYPES.avisDeMiseEnConcurrenceAuJORF }], DEMARCHES_TYPES_IDS.Octroi, TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Indetermine)
  })

  test("une démarche d'octroi dont l'étape de dpu la plus récente est acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild(
          [
            { typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.ACCEPTE },
            { typeId: ETAPES_TYPES.publicationDeDecisionAuJORF, statutId: ETAPES_STATUTS.ACCEPTE },
          ],
          DEMARCHES_TYPES_IDS.Octroi,
          TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX
        ),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Accepte)
  })

  test("une démarche d'octroi d'un titre AXM dont l'étape de dex la plus récente est acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild(
          [{ typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, date: toCaminoDate('2010-01-01'), statutId: ETAPES_STATUTS.ACCEPTE }],
          DEMARCHES_TYPES_IDS.Octroi,
          TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX
        ),
        TITRES_TYPES_IDS.AUTORISATION_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Accepte)
  })

  test("une démarche d'octroi d'un titre ARM dont l'étape de def la plus récente est acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([
          {
            typeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
            statutId: ETAPES_STATUTS.ACCEPTE,
            date: toCaminoDate('2010-01-01'),
          },
        ]),
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Accepte)
  })

  test("une démarche d'octroi d'un titre PRM dont l'étape de rpu la plus récente est acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild(
          [{ typeId: ETAPES_TYPES.publicationDeDecisionAuRecueilDesActesAdministratifs, date: toCaminoDate('2010-01-01'), statutId: ETAPES_STATUTS.ACCEPTE }],
          DEMARCHES_TYPES_IDS.Octroi,
          TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX
        ),
        TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Accepte)
  })

  test("une démarche de prolongation dont l'étape de dpu la plus récente est acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Prolongation,
        etapesBuild([
          { typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.ACCEPTE },
          { typeId: ETAPES_TYPES.publicationDeDecisionAuJORF, statutId: ETAPES_STATUTS.ACCEPTE },
        ]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Accepte)
  })

  test("une démarche d'octroi dont l'étape de sco est faite a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([
          {
            typeId: ETAPES_TYPES.demande,
            statutId: ETAPES_STATUTS.FAIT,
            date: toCaminoDate('2019-12-10'),
            contenu: { arm: { mecanise: true, franchissements: 3 } },
          },
          { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2019-12-11') },
          { typeId: ETAPES_TYPES.paiementDesFraisDeDossier, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2019-12-13') },
          { typeId: ETAPES_TYPES.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_, statutId: ETAPES_STATUTS.EXEMPTE, date: toCaminoDate('2020-01-14') },
          { typeId: ETAPES_TYPES.completudeDeLaDemande, statutId: ETAPES_STATUTS.COMPLETE, date: toCaminoDate('2020-01-23') },
          { typeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-02-05') },
          { typeId: ETAPES_TYPES.recevabiliteDeLaDemande, statutId: ETAPES_STATUTS.FAVORABLE, date: toCaminoDate('2020-02-06') },
          { typeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-02-07') },
          {
            typeId: ETAPES_TYPES.recepisseDeDeclarationLoiSurLeau,
            statutId: ETAPES_STATUTS.FAVORABLE,
            date: toCaminoDate('2020-02-11'),
            contenu: { arm: { franchissements: 3 } },
          },
          { typeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-06-15') },
          { typeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, statutId: ETAPES_STATUTS.FAVORABLE, date: toCaminoDate('2020-06-17') },
          { typeId: ETAPES_TYPES.notificationAuDemandeur_AvisFavorableDeLaCARM_, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-07-09') },
          { typeId: ETAPES_TYPES.paiementDesFraisDeDossierComplementaires, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-07-16') },
          { typeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossierComplementaires, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-07-17') },
          { typeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-09-28') },
        ]),
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Accepte)
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([
          {
            typeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere,
            statutId: ETAPES_STATUTS.FAIT,
            date: toCaminoDate('2010-09-28'),
          },
        ]),
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Accepte)
  })

  test("une démarche d'octroi d'un titre autre qu'ARM dont l'étape de sco est faite a le statut “indéfini”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([{ typeId: ETAPES_TYPES.signatureDeLautorisationDeRechercheMiniere, statutId: ETAPES_STATUTS.FAIT }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Indetermine)
  })

  test("une démarche d'octroi ne contenant une unique étape de dex acceptée a le statut “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([{ typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.ACCEPTE }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.EnInstruction)
  })

  test("une démarche d'octroi contenant une étape de publication acceptée après une dex acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([
          { typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.ACCEPTE },
          { typeId: ETAPES_TYPES.publicationDeDecisionAuJORF, statutId: ETAPES_STATUTS.ACCEPTE },
        ]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Accepte)
  })

  test("une démarche d'octroi dont l'unique étape de dex est rejetée a le statut “rejeté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([{ typeId: ETAPES_TYPES.decisionDeLAutoriteAdministrative, statutId: ETAPES_STATUTS.REJETE }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Rejete)
  })

  test("une démarche d'octroi dont l'étape est men a le statut “déposé”", () => {
    expect(
      titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.Octroi, etapesBuild([{ typeId: ETAPES_TYPES.enregistrementDeLaDemande }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())
    ).toEqual(DemarchesStatutsIds.Depose)
  })

  test("une démarche d'octroi d'un titre ARM dont l'étape de men (statut fai) a le statut “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild(
          [
            { typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT },
            { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT },
          ],
          DEMARCHES_TYPES_IDS.Octroi,
          TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX
        ),
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.EnInstruction)
  })

  test("une démarche d'octroi d'un titre ARM dont l'étape de mcp a le statut “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([
          { typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT },
          { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT },
          { typeId: ETAPES_TYPES.paiementDesFraisDeDossier, statutId: ETAPES_STATUTS.FAIT },
          { typeId: ETAPES_TYPES.completudeDeLaDemande, statutId: ETAPES_STATUTS.COMPLETE },
        ]),
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.EnInstruction)
  })

  test("une démarche d'octroi d'un titre ARM dont la dernière étape de def est acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([
          {
            typeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
            statutId: ETAPES_STATUTS.ACCEPTE,
            date: toCaminoDate('2010-01-01'),
          },
        ]),
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Accepte)
  })

  test("une démarche d'octroi d'un titre ARM dont la dernière étape de def est rejetée a le statut “rejeté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([
          {
            typeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets,
            statutId: ETAPES_STATUTS.REJETE,
            date: toCaminoDate('2010-01-12'),
          },
        ]),
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Rejete)
  })

  test("une démarche d'octroi d'un titre autre qu'ARM dont la dernière étape est une def a le statut “indéfini”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([{ typeId: ETAPES_TYPES.decisionDeLOfficeNationalDesForets, statutId: ETAPES_STATUTS.REJETE }]),
        TITRES_TYPES_IDS.PERMIS_EXCLUSIF_DE_RECHERCHES_HYDROCARBURE,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Indetermine)
  })

  test("une démarche d'octroi dont l'étape la plus récente est des a le statut “désisté”", () => {
    expect(
      titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.Octroi, etapesBuild([{ typeId: ETAPES_TYPES.desistementDuDemandeur }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())
    ).toEqual(DemarchesStatutsIds.Desiste)
  })

  test("une démarche d'octroi dont l'étape la plus récente est mfr a le statut “en construction”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([{ typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT, isBrouillon: ETAPE_IS_BROUILLON }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.EnConstruction)
  })

  test("une démarche d'octroi dont l'étape la plus récente est mcr a le statut “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.Octroi, etapesBuild([{ typeId: ETAPES_TYPES.recevabiliteDeLaDemande }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())
    ).toEqual(DemarchesStatutsIds.EnInstruction)
  })

  test("une démarche d'octroi dont l'étape la plus récente est css a le statut “classé sans suite”", () => {
    expect(titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.Octroi, etapesBuild([{ typeId: ETAPES_TYPES.classementSansSuite }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())).toEqual(
      DemarchesStatutsIds.ClasseSansSuite
    )
  })

  test("une démarche d'octroi dont l'étape la plus récente d'aca est défavorable a le statut “rejeté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([
          { typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2021-02-25') },
          { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2021-02-26') },
          { typeId: ETAPES_TYPES.paiementDesFraisDeDossier, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-09-03') },
          { typeId: ETAPES_TYPES.completudeDeLaDemande, statutId: ETAPES_STATUTS.COMPLETE, date: toCaminoDate('2021-02-27') },
          { typeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2021-03-10') },
          { typeId: ETAPES_TYPES.recevabiliteDeLaDemande, statutId: ETAPES_STATUTS.FAVORABLE, date: toCaminoDate('2021-03-11') },
          { typeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2021-09-23') },
          { typeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2021-09-24') },
          { typeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, statutId: ETAPES_STATUTS.DEFAVORABLE, date: toCaminoDate('2021-09-25') },
        ]),
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Rejete)
  })

  test("une démarche d'octroi dont l'étape la plus récente d'aca est favorable reste “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([
          { typeId: ETAPES_TYPES.demande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2021-02-25') },
          { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2021-02-26') },
          { typeId: ETAPES_TYPES.enregistrementDeLaDemande, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2020-09-03') },
          { typeId: ETAPES_TYPES.completudeDeLaDemande, statutId: ETAPES_STATUTS.COMPLETE, date: toCaminoDate('2021-02-27') },
          { typeId: ETAPES_TYPES.validationDuPaiementDesFraisDeDossier, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2021-03-10') },
          { typeId: ETAPES_TYPES.recevabiliteDeLaDemande, statutId: ETAPES_STATUTS.FAVORABLE, date: toCaminoDate('2021-03-11') },
          { typeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2021-09-23') },
          { typeId: ETAPES_TYPES.saisineDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, statutId: ETAPES_STATUTS.FAIT, date: toCaminoDate('2021-09-24') },
          { typeId: ETAPES_TYPES.avisDeLaCommissionDesAutorisationsDeRecherchesMinieres_CARM_, statutId: ETAPES_STATUTS.FAVORABLE, date: toCaminoDate('2021-09-25') },
        ]),
        TITRES_TYPES_IDS.AUTORISATION_DE_RECHERCHE_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.EnInstruction)
  })

  test('une démarche de retrait sans aucune étape décisive a le statut “indéterminé”', () => {
    expect(
      titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.Retrait, etapesBuild([{ typeId: ETAPES_TYPES.informationsHistoriquesIncompletes }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())
    ).toEqual(DemarchesStatutsIds.Indetermine)
  })

  test("une démarche de retrait dont l'étape la plus récente de dpu a été faite a le statut “terminé”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Retrait,
        etapesBuild([{ typeId: ETAPES_TYPES.publicationDeDecisionAuJORF, statutId: ETAPES_STATUTS.FAIT }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Termine)
  })

  test("une démarche de retrait dont l'étape la plus récente est spp a le statut “en instruction”", () => {
    expect(titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.Retrait, etapesBuild([{ typeId: ETAPES_TYPES.saisineDuPrefet }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())).toEqual(
      DemarchesStatutsIds.EnInstruction
    )
  })

  test("une démarche de retrait dont l'étape la plus récente est asc a le statut “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Retrait,
        etapesBuild([{ typeId: ETAPES_TYPES.saisineDuPrefet }, { typeId: ETAPES_TYPES.avisDesServicesEtCommissionsConsultatives }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.EnInstruction)
  })

  test("une démarche de retrait dont l'étape la plus récente est aco a le statut “terminé”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Retrait,
        etapesBuild([{ typeId: ETAPES_TYPES.avenantALautorisationDeRechercheMiniere }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Termine)
  })

  test("une démarche de retrait dont l'étape la plus récente de css a été faite a le statut “classé sans suite”", () => {
    expect(titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.Retrait, etapesBuild([{ typeId: ETAPES_TYPES.classementSansSuite }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())).toEqual(
      DemarchesStatutsIds.ClasseSansSuite
    )
  })

  test("une démarche de demande dont l'étape la plus récente est spp ne change pas de statut", () => {
    expect(titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.Octroi, etapesBuild([{ typeId: ETAPES_TYPES.saisineDuPrefet }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())).toEqual(
      DemarchesStatutsIds.Indetermine
    )
  })

  test("une démarche dont l'étape la plus récente est de type “abrogation de la décision” a le statut “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.Octroi, etapesBuild([{ typeId: ETAPES_TYPES.abrogationDeLaDecision }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())
    ).toEqual(DemarchesStatutsIds.EnInstruction)
  })

  test("une démarche dont l'étape la plus récente d'annulation de la décision est favorable a le statut “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([{ typeId: ETAPES_TYPES.decisionDuJugeAdministratif, statutId: ETAPES_STATUTS.FAIT }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.EnInstruction)
  })

  test("une démarche dont l'étape la plus récente d'annulation de la décision est favorable a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([{ typeId: ETAPES_TYPES.decisionDuJugeAdministratif, statutId: ETAPES_STATUTS.ACCEPTE }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Accepte)
  })

  test("une démarche dont l'étape la plus récente d'annulation de la décision est favorable a le statut “rejeté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        DEMARCHES_TYPES_IDS.Octroi,
        etapesBuild([{ typeId: ETAPES_TYPES.decisionDuJugeAdministratif, statutId: ETAPES_STATUTS.REJETE }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Rejete)
  })

  test('une démarche inexistante a le statut “indéfini”', () => {
    expect(
      titreDemarcheStatutIdFind(
        // @ts-ignore
        'xxx',
        etapesBuild([{ typeId: ETAPES_TYPES.demande }]),
        TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
        newDemarcheId()
      )
    ).toEqual(DemarchesStatutsIds.Indetermine)
  })

  test.each<[EtapeTypeId, EtapeStatutId, DemarcheStatutId]>([
    [Travaux.DemandeAutorisationOuverture, ETAPES_STATUTS.FAIT, Demarches.Depose],
    [Travaux.DepotDemande, ETAPES_STATUTS.FAIT, Demarches.Depose],
    [Travaux.RecevabiliteDeLaDemande, ETAPES_STATUTS.DEFAVORABLE, Demarches.EnInstruction],
    [Travaux.RecevabiliteDeLaDemande, ETAPES_STATUTS.FAVORABLE, Demarches.EnInstruction],
    [Travaux.DemandeComplements, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.ReceptionComplements, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.SaisineAutoriteEnvironmentale, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.AvisReception, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.AvisDesServicesEtCommissionsConsultatives, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.AvisAutoriteEnvironmentale, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.AvisRapportDirecteurREAL, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.TransPrescriptionsDemandeur, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.AvisPrescriptionsDemandeur, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.ArreteOuvertureTravauxMiniers, ETAPES_STATUTS.FAIT, Demarches.Accepte],
    [Travaux.PubliDecisionRecueilActesAdmin, ETAPES_STATUTS.FAIT, Demarches.Accepte],
    [Travaux.DesistementDuDemandeur, ETAPES_STATUTS.FAIT, Demarches.Desiste],
  ])("pour une démarche de travaux de type 'AutorisationDOuvertureDeTravaux' sur un titre, dont la dernière étape est '%s' au statut %s, le résultat est %s", (etapeTypeId, statutId, resultId) => {
    expect(
      titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.AutorisationDOuvertureDeTravaux, etapesBuild([{ typeId: etapeTypeId, statutId }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())
    ).toEqual(resultId)
  })

  test.each<[EtapeTypeId, EtapeStatutId, DemarcheStatutId]>([
    [Travaux.DeclarationOuverture, ETAPES_STATUTS.FAIT, Demarches.Depose],
    [Travaux.DepotDemande, ETAPES_STATUTS.FAIT, Demarches.Depose],
    [Travaux.RecevabiliteDeLaDemande, ETAPES_STATUTS.DEFAVORABLE, Demarches.EnInstruction],
    [Travaux.RecevabiliteDeLaDemande, ETAPES_STATUTS.FAVORABLE, Demarches.EnInstruction],
    [Travaux.DemandeComplements, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.ReceptionComplements, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.AvisDesServicesEtCommissionsConsultatives, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.AvisRapportDirecteurREAL, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.TransPrescriptionsDemandeur, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.AvisPrescriptionsDemandeur, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.DonneActeDeclaration, ETAPES_STATUTS.FAIT, Demarches.Accepte],
    [Travaux.DesistementDuDemandeur, ETAPES_STATUTS.FAIT, Demarches.Desiste],
  ])("pour une démarche de travaux de type 'DeclarationDOuvertureDeTravaux' sur un titre, dont la dernière étape est '%s' au statut %s, le résultat est %s", (etapeTypeId, statutId, resultId) => {
    expect(
      titreDemarcheStatutIdFind(DEMARCHES_TYPES_IDS.DeclarationDOuvertureDeTravaux, etapesBuild([{ typeId: etapeTypeId, statutId }]), TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX, newDemarcheId())
    ).toEqual(resultId)
  })

  test.each<[EtapeTypeId, EtapeStatutId, DemarcheStatutId]>([
    [Travaux.DeclarationArret, ETAPES_STATUTS.FAIT, Demarches.Depose],
    [Travaux.DepotDemande, ETAPES_STATUTS.FAIT, Demarches.Depose],
    [Travaux.RecevabiliteDeLaDemande, ETAPES_STATUTS.DEFAVORABLE, Demarches.EnInstruction],
    [Travaux.RecevabiliteDeLaDemande, ETAPES_STATUTS.FAVORABLE, Demarches.EnInstruction],
    [Travaux.AvisReception, ETAPES_STATUTS.FAVORABLE, Demarches.EnInstruction],
    [Travaux.AvisDesServicesEtCommissionsConsultatives, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.ArretePrefectoralSursis, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.AvisPrescriptionsDemandeur, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.AvisRapportDirecteurREAL, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.ArretePrefectDonneActe1, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.ArretePrescriptionComplementaire, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.MemoireFinTravaux, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.Recolement, ETAPES_STATUTS.FAIT, Demarches.EnInstruction],
    [Travaux.ArretePrefectDonneActe2, ETAPES_STATUTS.ACCEPTE, Demarches.FinPoliceMines],
    [Travaux.PubliDecisionRecueilActesAdmin, ETAPES_STATUTS.FAIT, Demarches.FinPoliceMines],
    [Travaux.PorterAConnaissance, ETAPES_STATUTS.FAIT, Demarches.FinPoliceMines],
    [Travaux.DesistementDuDemandeur, ETAPES_STATUTS.FAIT, Demarches.Desiste],
  ])(
    "pour une démarche de travaux de type 'DeclarationDArretDefinitifDesTravaux' sur un titre, dont la dernière étape est '%s' au statut %s, le résultat est %s",
    (etapeTypeId, statutId, resultId) => {
      expect(
        titreDemarcheStatutIdFind(
          DEMARCHES_TYPES_IDS.DeclarationDArretDefinitifDesTravaux,
          etapesBuild([{ typeId: etapeTypeId, statutId }]),
          TITRES_TYPES_IDS.PERMIS_D_EXPLOITATION_METAUX,
          newDemarcheId()
        )
      ).toEqual(resultId)
    }
  )
})
