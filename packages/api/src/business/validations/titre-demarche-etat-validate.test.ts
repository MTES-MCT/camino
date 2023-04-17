import { IDemarcheType, ITitre, ITitreEtape, ITitreType } from '../../types.js'

import { titreDemarcheUpdatedEtatValidate } from './titre-demarche-etat-validate.js'
import { newDemarcheId } from '../../database/models/_format/id-create.js'
import { EtapesTypesEtapesStatuts } from 'camino-common/src/static/etapesTypesEtapesStatuts.js'
import { describe, test, expect } from 'vitest'
import { toCaminoDate } from 'camino-common/src/date.js'

const currentDate = toCaminoDate('2023-04-06')
describe('teste titreDemarcheUpdatedEtatValidate', () => {
  test('ajoute une étape à une démarche vide', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct' } as IDemarcheType,
      {
        typeId: 'arm',
        type: {
          id: 'arm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { typeId: 'mfr', date: '2030-01-01' } as ITitreEtape,
      newDemarcheId(),
      null
    )

    expect(valid).toHaveLength(0)
  })

  test('ajoute une étape à une démarche qui contient déjà une étape', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct' } as IDemarcheType,
      {
        typeId: 'arm',
        type: {
          id: 'arm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [{ typeId: 'pro' }, { typeId: 'oct' }],
      } as ITitre,
      { typeId: 'mdp', statutId: 'fai', date: '2022-05-04' } as ITitreEtape,
      newDemarcheId(),

      [{ id: '1', typeId: 'mfr', statutId: 'fai', date: '2022-05-03' }] as ITitreEtape[]
    )

    expect(valid).toHaveLength(0)
  })

  test('modifie une étape à une démarche', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct' } as IDemarcheType,
      {
        typeId: 'arm',
        type: {
          id: 'arm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      {
        id: '1',
        typeId: 'mfr',
        statutId: 'fai',
        date: '2022-05-04',
      } as ITitreEtape,
      newDemarcheId(),

      [
        { id: '1', typeId: 'mfr', date: '2022-05-03', statutId: 'fai' },
        { id: '2', typeId: 'mdp', date: '2022-05-04', statutId: 'fai' },
      ] as ITitreEtape[]
    )

    expect(valid).toHaveLength(0)
  })

  test('l’ajout d’une étape d’une démarche historique est valide', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct' } as IDemarcheType,
      {
        typeId: 'arm',
        type: {
          id: 'arm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { id: '1', typeId: 'mfr' } as ITitreEtape,
      newDemarcheId(),

      [{ id: '1', typeId: 'mfr', date: '2000-01-01' }] as ITitreEtape[],
      false
    )

    expect(valid).toHaveLength(0)
  })

  test('l’ajout d’une étape d’une démarche sans étape est valide', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct' } as IDemarcheType,
      {
        typeId: 'arm',
        type: {
          id: 'arm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { id: '1', typeId: 'mfr' } as ITitreEtape,
      newDemarcheId(),

      [] as ITitreEtape[]
    )

    expect(valid).toHaveLength(0)
  })

  test("retourne une erreur si la démarche en cours de modification n'existe pas", () => {
    expect(() =>
      titreDemarcheUpdatedEtatValidate(
        currentDate,
        { id: 'oct' } as IDemarcheType,
        {
          typeId: 'arm',
          type: {
            id: 'arm',
            contenuIds: [],
          } as unknown as ITitreType,
          demarches: [{ typeId: 'pro' }],
        } as ITitre,
        { id: '1', typeId: 'mfr' } as ITitreEtape,
        newDemarcheId(),

        [] as ITitreEtape[]
      )
    ).toThrow()

    expect(() =>
      titreDemarcheUpdatedEtatValidate(
        currentDate,
        { id: 'oct' } as IDemarcheType,
        {
          typeId: 'arm',
          type: {
            id: 'arm',
            contenuIds: [],
          } as unknown as ITitreType,
        } as ITitre,
        { id: '1', typeId: 'mfr' } as ITitreEtape,
        newDemarcheId(),

        [] as ITitreEtape[]
      )
    ).toThrow()
  })

  test('supprime une étape', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct' } as IDemarcheType,
      {
        typeId: 'arm',
        type: {
          id: 'arm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { id: '1', typeId: 'mfr' } as ITitreEtape,
      newDemarcheId(),

      [{ id: '1', typeId: 'mfr' }] as ITitreEtape[],
      true
    )

    expect(valid).toHaveLength(0)
  })

  test("ajoute une étape sans statut à une démarche sans arbre d'instruction", () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct', nom: 'oct' } as IDemarcheType,
      {
        typeId: 'arm',
        type: {
          id: 'arm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [
          {
            typeId: 'oct',
            type: {
              id: 'oct',
              nom: 'oct',
              etapesTypes: [{ id: 'mfr', titreTypeId: 'arm', demarcheTypeId: 'oct' }],
            } as IDemarcheType,
          },
        ],
      } as ITitre,
      { typeId: 'mfr', date: '1030-01-01' } as ITitreEtape,
      newDemarcheId()
    )

    expect(valid).toHaveLength(0)
  })

  test("ajoute une étape à une démarche sans arbre d'instruction", () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct', nom: 'oct' } as IDemarcheType,
      {
        typeId: 'arm',
        type: {
          id: 'arm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [
          {
            typeId: 'oct',
            type: {
              id: 'oct',
              nom: 'oct',
              etapesTypes: [{ id: 'mfr', titreTypeId: 'arm', demarcheTypeId: 'oct' }],
            } as IDemarcheType,
          },
        ],
      } as ITitre,
      { typeId: 'mfr', date: '1030-01-01', statutId: 'fai' } as ITitreEtape,
      newDemarcheId()
    )

    expect(valid).toHaveLength(0)
  })

  test('ajoute une demande en construction à une démarche vide', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct' } as IDemarcheType,
      {
        typeId: 'axm',
        type: {
          id: 'axm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { typeId: 'mfr', statutId: 'aco', date: '2030-01-01' } as ITitreEtape,
      newDemarcheId()
    )

    expect(valid).toHaveLength(0)
  })

  test('ajoute une demande en construction à une démarche qui contient déjà une étape', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct' } as IDemarcheType,
      {
        typeId: 'axm',
        type: {
          id: 'axm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { typeId: 'mfr', statutId: 'aco' } as ITitreEtape,
      newDemarcheId(),

      [{ id: '1', typeId: 'dae', statutId: 'exe' }] as ITitreEtape[]
    )

    expect(valid).toHaveLength(0)
  })

  test('modifie une demande en construction à une démarche', () => {
    const valid = titreDemarcheUpdatedEtatValidate(
      currentDate,
      { id: 'oct' } as IDemarcheType,
      {
        typeId: 'axm',
        type: {
          id: 'axm',
          contenuIds: [],
        } as unknown as ITitreType,
        demarches: [{ typeId: 'oct' }],
      } as ITitre,
      { id: '1', typeId: 'mfr', statutId: 'aco' } as ITitreEtape,
      newDemarcheId(),

      [
        { id: '1', typeId: 'mfr', statutId: 'aco' },
        { id: '2', typeId: 'dae' },
      ] as ITitreEtape[]
    )

    expect(valid).toHaveLength(0)
  })

  test('ne peut pas ajouter une 2ème demande en construction à une démarche', () => {
    expect(
      titreDemarcheUpdatedEtatValidate(
        currentDate,
        { id: 'oct' } as IDemarcheType,
        {
          typeId: 'axm',
          type: {
            id: 'axm',
            contenuIds: [],
          } as unknown as ITitreType,
          demarches: [{ typeId: 'oct' }],
        } as ITitre,
        { id: '3', typeId: 'mfr', statutId: 'aco' } as ITitreEtape,
        newDemarcheId(),

        [
          { id: '1', typeId: 'mfr', statutId: 'aco' },
          { id: '2', typeId: 'dae' },
        ] as ITitreEtape[]
      )
    ).toContain('il y a déjà une demande en construction')
  })

  test('ne peut pas ajouter étape de type inconnu sur une machine', () => {
    expect(
      titreDemarcheUpdatedEtatValidate(
        currentDate,
        { id: 'oct' } as IDemarcheType,
        {
          typeId: 'axm',
          type: {
            id: 'axm',
            contenuIds: [],
          } as unknown as ITitreType,
          demarches: [{ typeId: 'oct' }],
        } as ITitre,
        {
          typeId: 'aaa',
          date: '2022-01-01',
          statutId: 'fai',
        } as unknown as ITitreEtape,
        newDemarcheId(),

        [
          {
            id: '1',
            typeId: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeTypeId,
            statutId: EtapesTypesEtapesStatuts.demande.EN_CONSTRUCTION.etapeStatutId,
            date: '2021-01-01',
          },
          {
            id: '2',
            typeId: EtapesTypesEtapesStatuts.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.REQUIS.etapeTypeId,
            statutId: EtapesTypesEtapesStatuts.decisionDeLaMissionAutoriteEnvironnementale_ExamenAuCasParCasDuProjet_.REQUIS.etapeStatutId,
            date: '2021-01-02',
          },
        ] as ITitreEtape[]
      )
    ).toContain('la démarche n’est pas valide')
  })
})
