import { ITitreEtape, TitreEtapesTravauxTypes as Travaux } from '../../types'

import { titreDemarcheStatutIdFind } from './titre-demarche-statut-id-find'
import { DemarchesStatutsIds as Demarches, DemarcheStatutId } from 'camino-common/src/static/demarchesStatuts'
import { newDemarcheId } from '../../database/models/_format/id-create'
import { toCaminoDate } from 'camino-common/src/date'
import { describe, expect, test } from 'vitest'
import { EtapeStatutId } from 'camino-common/src/static/etapesStatuts'
import { TitreEtapeForMachine } from '../rules-demarches/machine-common'
import { ETAPE_IS_BROUILLON, ETAPE_IS_NOT_BROUILLON } from 'camino-common/src/etape'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { TitreTypeId } from 'camino-common/src/static/titresTypes'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes'
const etapesBuild = (etapesProps: Partial<ITitreEtape>[], demarcheTypeId: DemarcheTypeId = 'oct', titreTypeId: TitreTypeId = 'axm'): TitreEtapeForMachine[] =>
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
    expect(titreDemarcheStatutIdFind('oct', [], 'pxm', newDemarcheId())).toEqual('ind')
  })

  test("une démarche d'octroi sans étape décisive a le statut “indéfini”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'anf' }], 'oct', 'pxm'), 'pxm', newDemarcheId())).toEqual('ind')
  })

  test("une démarche d'octroi dont l'étape de dpu la plus récente est acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild(
          [
            { typeId: 'dex', statutId: 'acc' },
            { typeId: 'dpu', statutId: 'acc' },
          ],
          'oct',
          'pxm'
        ),
        'pxm',
        newDemarcheId()
      )
    ).toEqual('acc')
  })

  test("une démarche d'octroi d'un titre AXM dont l'étape de dex la plus récente est acceptée a le statut “accepté”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'dex', date: toCaminoDate('2010-01-01'), statutId: 'acc' }], 'oct', 'axm'), 'axm', newDemarcheId())).toEqual('acc')
  })

  test("une démarche d'octroi d'un titre ARM dont l'étape de def la plus récente est acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild([
          {
            typeId: 'def',
            statutId: 'acc',
            date: toCaminoDate('2010-01-01'),
          },
        ]),
        'arm',
        newDemarcheId()
      )
    ).toEqual('acc')
  })

  test("une démarche d'octroi d'un titre PRM dont l'étape de rpu la plus récente est acceptée a le statut “accepté”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'rpu', date: toCaminoDate('2010-01-01'), statutId: 'acc' }], 'oct', 'prm'), 'prm', newDemarcheId())).toEqual('acc')
  })

  test("une démarche de prolongation dont l'étape de dpu la plus récente est acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'pro',
        etapesBuild([
          { typeId: 'dex', statutId: 'acc' },
          { typeId: 'dpu', statutId: 'acc' },
        ]),
        'pxm',
        newDemarcheId()
      )
    ).toEqual('acc')
  })

  test("une démarche d'octroi dont l'étape de sco est faite a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild([
          {
            typeId: 'mfr',
            statutId: 'fai',
            date: toCaminoDate('2019-12-10'),
            contenu: { arm: { mecanise: true, franchissements: 3 } },
          },
          { typeId: 'mdp', statutId: 'fai', date: toCaminoDate('2019-12-11') },
          { typeId: 'pfd', statutId: 'fai', date: toCaminoDate('2019-12-13') },
          { typeId: 'dae', statutId: 'exe', date: toCaminoDate('2020-01-14') },
          { typeId: 'mcp', statutId: 'com', date: toCaminoDate('2020-01-23') },
          { typeId: 'vfd', statutId: 'fai', date: toCaminoDate('2020-02-05') },
          { typeId: 'mcr', statutId: 'fav', date: toCaminoDate('2020-02-06') },
          { typeId: 'asc', statutId: 'fai', date: toCaminoDate('2020-02-07') },
          {
            typeId: 'rde',
            statutId: 'fav',
            date: toCaminoDate('2020-02-11'),
            contenu: { arm: { franchissements: 3 } },
          },
          { typeId: 'sca', statutId: 'fai', date: toCaminoDate('2020-06-15') },
          { typeId: 'aca', statutId: 'fav', date: toCaminoDate('2020-06-17') },
          { typeId: 'mnb', statutId: 'fai', date: toCaminoDate('2020-07-09') },
          { typeId: 'pfc', statutId: 'fai', date: toCaminoDate('2020-07-16') },
          { typeId: 'vfc', statutId: 'fai', date: toCaminoDate('2020-07-17') },
          { typeId: 'sco', statutId: 'fai', date: toCaminoDate('2020-09-28') },
        ]),
        'arm',
        newDemarcheId()
      )
    ).toEqual('acc')
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild([
          {
            typeId: 'sco',
            statutId: 'fai',
            date: toCaminoDate('2010-09-28'),
          },
        ]),
        'arm',
        newDemarcheId()
      )
    ).toEqual('acc')
  })

  test("une démarche d'octroi d'un titre autre qu'ARM dont l'étape de sco est faite a le statut “indéfini”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'sco', statutId: 'fai' }]), 'pxm', newDemarcheId())).toEqual('ind')
  })

  test("une démarche d'octroi ne contenant une unique étape de dex acceptée a le statut “en instruction”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'dex', statutId: 'acc' }]), 'pxm', newDemarcheId())).toEqual('ins')
  })

  test("une démarche d'octroi contenant une étape de publication acceptée après une dex acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild([
          { typeId: 'dex', statutId: 'acc' },
          { typeId: 'dpu', statutId: 'acc' },
        ]),
        'pxm',
        newDemarcheId()
      )
    ).toEqual('acc')
  })

  test("une démarche d'octroi dont l'unique étape de dex est rejetée a le statut “rejeté”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'dex', statutId: 'rej' }]), 'pxm', newDemarcheId())).toEqual('rej')
  })

  test("une démarche d'octroi dont l'étape est men a le statut “en instruction”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'men' }]), 'pxm', newDemarcheId())).toEqual('ind')
  })

  test("une démarche d'octroi d'un titre ARM dont l'étape de mdp (statut fai) a le statut “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild(
          [
            { typeId: 'mfr', statutId: 'fai' },
            { typeId: 'mdp', statutId: 'fai' },
          ],
          'oct',
          'arm'
        ),
        'arm',
        newDemarcheId()
      )
    ).toEqual('ins')
  })

  test("une démarche d'octroi d'un titre ARM dont l'étape de mcp a le statut “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild([
          { typeId: 'mfr', statutId: 'fai' },
          { typeId: 'mdp', statutId: 'fai' },
          { typeId: 'pfd', statutId: 'fai' },
          { typeId: 'mcp', statutId: 'com' },
        ]),
        'arm',
        newDemarcheId()
      )
    ).toEqual('ins')
  })

  test("une démarche d'octroi d'un titre ARM dont la dernière étape de def est acceptée a le statut “accepté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild([
          {
            typeId: 'def',
            statutId: 'acc',
            date: toCaminoDate('2010-01-01'),
          },
        ]),
        'arm',
        newDemarcheId()
      )
    ).toEqual('acc')
  })

  test("une démarche d'octroi d'un titre ARM dont la dernière étape de def est rejetée a le statut “rejeté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild([
          {
            typeId: 'def',
            statutId: 'rej',
            date: toCaminoDate('2010-01-12'),
          },
        ]),
        'arm',
        newDemarcheId()
      )
    ).toEqual('rej')
  })

  test("une démarche d'octroi d'un titre autre qu'ARM dont la dernière étape est une def a le statut “indéfini”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'def', statutId: 'rej' }]), 'prh', newDemarcheId())).toEqual('ind')
  })

  test("une démarche d'octroi dont l'étape la plus récente est des a le statut “désisté”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'des' }]), 'pxm', newDemarcheId())).toEqual('des')
  })

  test("une démarche d'octroi dont l'étape la plus récente est mdp (statut fai) a le statut “déposé”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'mdp', statutId: 'fai' }]), 'pxm', newDemarcheId())).toEqual('dep')
  })

  test("une démarche d'octroi dont l'étape la plus récente est mfr a le statut “en construction”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'mfr', statutId: 'fai', isBrouillon: ETAPE_IS_BROUILLON }]), 'pxm', newDemarcheId())).toEqual('eco')
  })

  test("une démarche d'octroi dont l'étape la plus récente est mcr a le statut “en instruction”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'mcr' }]), 'pxm', newDemarcheId())).toEqual('ins')
  })

  test("une démarche d'octroi dont l'étape la plus récente est css a le statut “classé sans suite”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'css' }]), 'pxm', newDemarcheId())).toEqual('cls')
  })

  test("une démarche d'octroi dont l'étape la plus récente d'aca est défavorable a le statut “rejeté”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild([
          { typeId: 'mfr', statutId: 'fai', date: toCaminoDate('2021-02-25') },
          { typeId: 'mdp', statutId: 'fai', date: toCaminoDate('2021-02-26') },
          { typeId: 'pfd', statutId: 'fai', date: toCaminoDate('2020-09-03') },
          { typeId: 'mcp', statutId: 'com', date: toCaminoDate('2021-02-27') },
          { typeId: 'vfd', statutId: 'fai', date: toCaminoDate('2021-03-10') },
          { typeId: 'mcr', statutId: 'fav', date: toCaminoDate('2021-03-11') },
          { typeId: 'asc', statutId: 'fai', date: toCaminoDate('2021-09-23') },
          { typeId: 'sca', statutId: 'fai', date: toCaminoDate('2021-09-24') },
          { typeId: 'aca', statutId: 'def', date: toCaminoDate('2021-09-25') },
        ]),
        'arm',
        newDemarcheId()
      )
    ).toEqual('rej')
  })

  test("une démarche d'octroi dont l'étape la plus récente d'aca est favorable reste “en instruction”", () => {
    expect(
      titreDemarcheStatutIdFind(
        'oct',
        etapesBuild([
          { typeId: 'mfr', statutId: 'fai', date: toCaminoDate('2021-02-25') },
          { typeId: 'mdp', statutId: 'fai', date: toCaminoDate('2021-02-26') },
          { typeId: 'pfd', statutId: 'fai', date: toCaminoDate('2020-09-03') },
          { typeId: 'mcp', statutId: 'com', date: toCaminoDate('2021-02-27') },
          { typeId: 'vfd', statutId: 'fai', date: toCaminoDate('2021-03-10') },
          { typeId: 'mcr', statutId: 'fav', date: toCaminoDate('2021-03-11') },
          { typeId: 'asc', statutId: 'fai', date: toCaminoDate('2021-09-23') },
          { typeId: 'sca', statutId: 'fai', date: toCaminoDate('2021-09-24') },
          { typeId: 'aca', statutId: 'fav', date: toCaminoDate('2021-09-25') },
        ]),
        'arm',
        newDemarcheId()
      )
    ).toEqual('ins')
  })

  test('une démarche de retrait sans aucune étape décisive a le statut “indéterminé”', () => {
    expect(titreDemarcheStatutIdFind('ret', etapesBuild([{ typeId: 'ihi' }]), 'pxm', newDemarcheId())).toEqual('ind')
  })

  test("une démarche de retrait dont l'étape la plus récente de dpu a été faite a le statut “terminé”", () => {
    expect(titreDemarcheStatutIdFind('ret', etapesBuild([{ typeId: 'dpu', statutId: 'fai' }]), 'pxm', newDemarcheId())).toEqual('ter')
  })

  test("une démarche de retrait dont l'étape la plus récente est spp a le statut “en instruction”", () => {
    expect(titreDemarcheStatutIdFind('ret', etapesBuild([{ typeId: 'spp' }]), 'pxm', newDemarcheId())).toEqual('ins')
  })

  test("une démarche de retrait dont l'étape la plus récente est asc a le statut “en instruction”", () => {
    expect(titreDemarcheStatutIdFind('ret', etapesBuild([{ typeId: 'spp' }, { typeId: 'asc' }]), 'pxm', newDemarcheId())).toEqual('ins')
  })

  test("une démarche de retrait dont l'étape la plus récente est aco a le statut “terminé”", () => {
    expect(titreDemarcheStatutIdFind('ret', etapesBuild([{ typeId: 'aco' }]), 'pxm', newDemarcheId())).toEqual('ter')
  })

  test("une démarche de retrait dont l'étape la plus récente de css a été faite a le statut “classé sans suite”", () => {
    expect(titreDemarcheStatutIdFind('ret', etapesBuild([{ typeId: 'css' }]), 'pxm', newDemarcheId())).toEqual('cls')
  })

  test("une démarche de demande dont l'étape la plus récente est spp ne change pas de statut", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'spp' }]), 'pxm', newDemarcheId())).toEqual('ind')
  })

  test("une démarche dont l'étape la plus récente est de type “abrogation de la décision” a le statut “en instruction”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'abd' }]), 'pxm', newDemarcheId())).toEqual('ins')
  })

  test("une démarche dont l'étape la plus récente d'annulation de la décision est favorable a le statut “en instruction”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'and', statutId: 'fai' }]), 'pxm', newDemarcheId())).toEqual('ins')
  })

  test("une démarche dont l'étape la plus récente d'annulation de la décision est favorable a le statut “accepté”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'and', statutId: 'acc' }]), 'pxm', newDemarcheId())).toEqual('acc')
  })

  test("une démarche dont l'étape la plus récente d'annulation de la décision est favorable a le statut “rejeté”", () => {
    expect(titreDemarcheStatutIdFind('oct', etapesBuild([{ typeId: 'and', statutId: 'rej' }]), 'pxm', newDemarcheId())).toEqual('rej')
  })

  test('une démarche inexistante a le statut “indéfini”', () => {
    expect(
      titreDemarcheStatutIdFind(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        'xxx',
        etapesBuild([{ typeId: 'mfr' }]),
        'pxm',
        newDemarcheId()
      )
    ).toEqual('ind')
  })

  test.each<[EtapeTypeId, EtapeStatutId, DemarcheStatutId]>([
    [Travaux.DemandeAutorisationOuverture, 'fai', Demarches.Depose],
    [Travaux.DepotDemande, 'fai', Demarches.Depose],
    [Travaux.Recevabilite, 'def', Demarches.EnInstruction],
    [Travaux.Recevabilite, 'fav', Demarches.EnInstruction],
    [Travaux.DemandeComplements, 'fai', Demarches.EnInstruction],
    [Travaux.ReceptionComplements, 'fai', Demarches.EnInstruction],
    [Travaux.SaisineAutoriteEnvironmentale, 'fai', Demarches.EnInstruction],
    [Travaux.MemoireReponseExploitant, 'fai', Demarches.EnInstruction],
    [Travaux.AvisReception, 'fai', Demarches.EnInstruction],
    [Travaux.AvisDesServicesEtCommissionsConsultatives, 'fai', Demarches.EnInstruction],
    [Travaux.AvisAutoriteEnvironmentale, 'fai', Demarches.EnInstruction],
    [Travaux.MemoireReponseExploitant, 'fai', Demarches.EnInstruction],
    [Travaux.AvisRapportDirecteurREAL, 'fai', Demarches.EnInstruction],
    [Travaux.TransPrescriptionsDemandeur, 'fai', Demarches.EnInstruction],
    [Travaux.AvisPrescriptionsDemandeur, 'fai', Demarches.EnInstruction],
    [Travaux.ArreteOuvertureTravauxMiniers, 'fai', Demarches.Accepte],
    [Travaux.PubliDecisionRecueilActesAdmin, 'fai', Demarches.Accepte],
    [Travaux.Abandon, 'fai', Demarches.Desiste],
  ])("pour une démarche de travaux de type 'aom' sur un titre, dont la dernière étape est '%s' au statut %s, le résultat est %s", (etapeTypeId, statutId, resultId) => {
    expect(titreDemarcheStatutIdFind('aom', etapesBuild([{ typeId: etapeTypeId, statutId }]), 'pxm', newDemarcheId())).toEqual(resultId)
  })

  test.each<[EtapeTypeId, EtapeStatutId, DemarcheStatutId]>([
    [Travaux.DeclarationOuverture, 'fai', Demarches.Depose],
    [Travaux.DepotDemande, 'fai', Demarches.Depose],
    [Travaux.Recevabilite, 'def', Demarches.EnInstruction],
    [Travaux.Recevabilite, 'fav', Demarches.EnInstruction],
    [Travaux.DemandeComplements, 'fai', Demarches.EnInstruction],
    [Travaux.ReceptionComplements, 'fai', Demarches.EnInstruction],
    [Travaux.AvisDesServicesEtCommissionsConsultatives, 'fai', Demarches.EnInstruction],
    [Travaux.AvisRapportDirecteurREAL, 'fai', Demarches.EnInstruction],
    [Travaux.TransPrescriptionsDemandeur, 'fai', Demarches.EnInstruction],
    [Travaux.AvisPrescriptionsDemandeur, 'fai', Demarches.EnInstruction],
    [Travaux.DonneActeDeclaration, 'fai', Demarches.Accepte],
    [Travaux.Abandon, 'fai', Demarches.Desiste],
  ])("pour une démarche de travaux de type 'dot' sur un titre, dont la dernière étape est '%s' au statut %s, le résultat est %s", (etapeTypeId, statutId, resultId) => {
    expect(titreDemarcheStatutIdFind('dot', etapesBuild([{ typeId: etapeTypeId, statutId }]), 'pxm', newDemarcheId())).toEqual(resultId)
  })

  test.each<[EtapeTypeId, EtapeStatutId, DemarcheStatutId]>([
    [Travaux.DeclarationArret, 'fai', Demarches.Depose],
    [Travaux.DepotDemande, 'fai', Demarches.Depose],
    [Travaux.Recevabilite, 'def', Demarches.EnInstruction],
    [Travaux.Recevabilite, 'fav', Demarches.EnInstruction],
    [Travaux.AvisReception, 'fav', Demarches.EnInstruction],
    [Travaux.AvisDesServicesEtCommissionsConsultatives, 'fai', Demarches.EnInstruction],
    [Travaux.ArretePrefectoralSursis, 'fai', Demarches.EnInstruction],
    [Travaux.AvisPrescriptionsDemandeur, 'fai', Demarches.EnInstruction],
    [Travaux.AvisRapportDirecteurREAL, 'fai', Demarches.EnInstruction],
    [Travaux.ArretePrefectDonneActe1, 'fai', Demarches.EnInstruction],
    [Travaux.ArretePrescriptionComplementaire, 'fai', Demarches.EnInstruction],
    [Travaux.MemoireFinTravaux, 'fai', Demarches.EnInstruction],
    [Travaux.Recolement, 'fai', Demarches.EnInstruction],
    [Travaux.ArretePrefectDonneActe2, 'acc', Demarches.FinPoliceMines],
    [Travaux.PubliDecisionRecueilActesAdmin, 'fai', Demarches.FinPoliceMines],
    [Travaux.PorterAConnaissance, 'fai', Demarches.FinPoliceMines],
    [Travaux.Abandon, 'fai', Demarches.Desiste],
  ])("pour une démarche de travaux de type 'dam' sur un titre, dont la dernière étape est '%s' au statut %s, le résultat est %s", (etapeTypeId, statutId, resultId) => {
    expect(titreDemarcheStatutIdFind('dam', etapesBuild([{ typeId: etapeTypeId, statutId }]), 'pxm', newDemarcheId())).toEqual(resultId)
  })
})
