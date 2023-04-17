import { ITitreEtape } from '../../types.js'

import { titreDemarchePublicFind } from './titre-demarche-public-find.js'
import { EtapeTypeId } from 'camino-common/src/static/etapesTypes.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { toCaminoDate } from 'camino-common/src/date.js'
import { describe, expect, test } from 'vitest'
import { DemarcheTypeId } from 'camino-common/src/static/demarchesTypes.js'
const etapesBuild = (etapesProps: Partial<ITitreEtape>[]) =>
  etapesProps.map(
    (etapeProps, i) =>
      ({
        ...etapeProps,
        ordre: i + 1,
      } as unknown as ITitreEtape)
  )

describe("publicité d'une démarche", () => {
  test("une démarche sans étape n'est pas publique", () => {
    expect(
      titreDemarchePublicFind({ id: newDemarcheId(), typeId: 'oct', etapes: [], titreId: 'titreId', demarcheDateDebut: toCaminoDate('2020-01-01'), demarcheDateFin: toCaminoDate('2021-01-01') }, 'arm')
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
          typeId: 'oct',
          etapes: etapesBuild([{ typeId: 'dae' }]),
          titreId: 'titreId',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: false, entreprisesLecture: false })
  })

  test("une démarche de retrait dont l'étape la plus récente est saisine du préfet est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'spp' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: false, entreprisesLecture: false })
  })

  test("une démarche de retrait dont l'étape la plus récente est saisine du préfet est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'ret',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'spp' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true, entreprisesLecture: true })
  })

  test("une démarche de déchéance dont l'étape la plus récente est saisine du préfet est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'dec',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'spp' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true, entreprisesLecture: true })
  })

  test("une démarche dont l'étape la plus récente est demande est visible uniquement par l'entreprise", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'mfr' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: false, entreprisesLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision de l'administration est visible uniquement par l'entreprise", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'dex', date: toCaminoDate('2000-01-01') }]),
          titreId: 'titreId',
        },
        'arg'
      )
    ).toMatchObject({ publicLecture: false, entreprisesLecture: true })
  })

  test("une démarche dont l'étape la plus récente est classement sans suite n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'css' }, { typeId: 'mfr' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: false })
  })

  test("une démarche d'un titre AXM dont l'étape la plus récente est classement sans suite ne change pas de visibilité", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'mcr', date: toCaminoDate('2000-01-01') }, { typeId: 'css' }]),
          titreId: 'titreId',
        },
        'axm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est classement sans suite ne change pas de visibilité", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'sca', date: toCaminoDate('2000-01-01') }, { typeId: 'css' }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est désistement du demandeur est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'des', date: toCaminoDate('2000-01-01') }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre AXM dont l'étape la plus récente est désistement du demandeur est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'des', date: toCaminoDate('2000-01-01') }]),
          titreId: 'titreId',
        },
        'axm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche ne pouvant pas faire l'objet d'une mise en concurrence dont l'étape la plus récente est recevabilité est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'pr1',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'mcr' }]),
          titreId: 'titreId',
        },
        'cxf'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM ne pouvant pas faire l'objet d'une mise en concurrence dont l'étape la plus récente est recevabilité n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'mcr', date: toCaminoDate('2000-01-01') }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: false })
  })

  test("une démarche pouvant faire l'objet d'une mise en concurrence dont l'étape la plus récente est recevabilité n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'mcr' }]),
          titreId: 'titreId',
        },
        'cxf'
      )
    ).toMatchObject({ publicLecture: false })
  })

  test("une démarche dont l'étape la plus récente est mise en concurrence au JORF est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'anf' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est publication de l'avis de décision implicite (historique) est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'apu' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est mise en concurrence au JOUE est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'ane' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est participation du public est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'ppu' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est décision de l'ONF peu importe son statut (historique) est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'def', date: toCaminoDate('2000-01-01') }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est commission ARM peu importe son statut (historique) est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'aca', date: toCaminoDate('2000-01-01') }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est saisine de la commission ARM est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'sca', date: toCaminoDate('2000-01-01') }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision implicite au statut accepté est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([{ typeId: 'dim', statutId: 'acc' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision implicite au statut rejeté n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          id: newDemarcheId(),
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          etapes: etapesBuild([
            { typeId: 'anf', statutId: 'fai' },
            { typeId: 'dim', statutId: 'rej' },
          ]),
          titreId: 'titreId',
        },
        'cxf'
      )
    ).toMatchObject({ publicLecture: false })
  })

  test("une démarche d'un titre non AXM dont l'étape la plus récente est décision de l'administration au statut rejeté n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'dex', statutId: 'rej' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: false })
  })

  test("une démarche d'un titre AXM dont l'étape la plus récente est décision de l'administration au statut rejeté est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([
            { typeId: 'mcr', date: toCaminoDate('2000-01-01') },
            { typeId: 'dex', statutId: 'rej' },
          ]),
          titreId: 'titreId',
        },
        'axm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre AXM dont l'étape la plus récente est décision de l'administration au statut accepté est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'dex', statutId: 'acc', date: toCaminoDate('2000-01-01') }]),
          titreId: 'titreId',
        },
        'axm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est publication de décision au JORF au statut au statut accepté publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'dpu', statutId: 'acc' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision unilatérale est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'dux' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est publication de décision unilatérale est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'dup' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est publication de décision au recueil des actes administratifs est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'rpu' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est signature de l'autorisation de recherche minière est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2000-01-01'),
          demarcheDateFin: toCaminoDate('2001-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'sco', date: toCaminoDate('2000-01-01') }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche d'un titre ARM dont l'étape la plus récente est signature de l'avenant à l'autorisation de recherche minière est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'sco', date: toCaminoDate('2000-01-01') }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision d'annulation par le juge administratif est publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'and', statutId: 'fav' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test("une démarche dont l'étape la plus récente est décision d'annulation par le juge administratif au statut fait n'est pas publique", () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'and', statutId: 'fai' }]),
          titreId: 'titreId',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: false })
  })

  test.each<DemarcheTypeId>(['ren', 'pro'])("une démarche %s dont l'étape la plus récente est le dépot de la demande n'est pas publique", demarcheTypeId => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: demarcheTypeId,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'mdp', statutId: 'fai' }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: false })
  })

  test.each<DemarcheTypeId>(['ren', 'pro'])("une démarche %s dont l'étape la plus récente est recevabilité de la demande n'est pas publique", demarcheTypeId => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: demarcheTypeId,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'mcr' }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: false })
  })

  test.each<DemarcheTypeId>(['ren', 'pro'])("une démarche %s dont l'étape la plus récente est l’expertise de l’onf est publique", demarcheTypeId => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: demarcheTypeId,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'eof' }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test.each<DemarcheTypeId>(['ren', 'pro'])("une démarche %s dont l'étape la plus récente est la décisision de classement sans suite est publique", demarcheTypeId => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: demarcheTypeId,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'css' }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test.each<DemarcheTypeId>(['ren', 'pro'])("une démarche %s dont l'étape la plus récente est le désistement est publique", demarcheTypeId => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: demarcheTypeId,
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'des' }]),
          titreId: 'titreId',
        },
        'arm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test.each<EtapeTypeId>(['ane', 'anf', 'dex', 'dpu', 'dup', 'rpu', 'ppu', 'ppc', 'epu', 'epc'])(
    "une démarche d’un titre non énergétique dont l'étape la plus récente est %s est public",
    etapeTypeId => {
      expect(
        titreDemarchePublicFind(
          {
            typeId: 'oct',
            demarcheDateDebut: toCaminoDate('2020-01-01'),
            demarcheDateFin: toCaminoDate('2021-01-01'),
            id: newDemarcheId(),
            etapes: etapesBuild([{ typeId: etapeTypeId }]),
            titreId: 'titreId',
          },
          'pcc'
        )
      ).toMatchObject({ publicLecture: true })
    }
  )

  test('le titre WQaZgPfDcQw9tFliMgBIDH3Z ne doit pas être public', () => {
    expect(
      titreDemarchePublicFind(
        {
          typeId: 'oct',
          demarcheDateDebut: toCaminoDate('2020-01-01'),
          demarcheDateFin: toCaminoDate('2021-01-01'),
          id: newDemarcheId(),
          etapes: etapesBuild([{ typeId: 'ane' }]),
          titreId: 'WQaZgPfDcQw9tFliMgBIDH3Z',
        },
        'pcc'
      )
    ).toMatchObject({ publicLecture: false })
  })

  test('la demarche d’une prolongation déposée d’un PRM en survie provisoire est public ', () => {
    expect(
      titreDemarchePublicFind(
        { id: newDemarcheId(), typeId: 'pr1', demarcheDateDebut: toCaminoDate('2020-01-01'), demarcheDateFin: null, etapes: etapesBuild([{ typeId: 'mfr' }, { typeId: 'mdp' }]), titreId: 'titreId' },
        'prm'
      )
    ).toMatchObject({ publicLecture: true })
  })

  test('la demarche d’une prolongation non déposée d’un PRM en survie provisoire n’est pas public ', () => {
    expect(
      titreDemarchePublicFind(
        { id: newDemarcheId(), typeId: 'pr1', demarcheDateDebut: toCaminoDate('2020-01-01'), demarcheDateFin: null, etapes: etapesBuild([{ typeId: 'mfr' }]), titreId: 'titreId' },
        'prm'
      )
    ).toMatchObject({ publicLecture: false })
  })
})
