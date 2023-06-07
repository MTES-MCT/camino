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
      { typeId: 'mfr', date: '2030-01-01' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
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
      { typeId: 'mdp', statutId: 'fai', date: '2022-05-04' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
      newDemarcheId(),

      [{ id: '1', typeId: 'mfr', statutId: 'fai', date: '2022-05-03' }] as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>[]
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
      } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
      newDemarcheId(),

      [
        { id: '1', typeId: 'mfr', date: '2022-05-03', statutId: 'fai' },
        { id: '2', typeId: 'mdp', date: '2022-05-04', statutId: 'fai' },
      ] as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>[]
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
      { id: '1', typeId: 'mfr' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
      newDemarcheId(),

      [{ id: '1', typeId: 'mfr', date: '2000-01-01' }] as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>[],
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
      { id: '1', typeId: 'mfr' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
      newDemarcheId(),

      []
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
        { id: '1', typeId: 'mfr' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
        newDemarcheId(),

        []
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
        { id: '1', typeId: 'mfr' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
        newDemarcheId(),

        []
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
      { id: '1', typeId: 'mfr' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
      newDemarcheId(),

      [{ id: '1', typeId: 'mfr' }] as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>[],
      true
    )

    expect(valid).toHaveLength(0)
  })

  test('ajoute une étape sans statut à une démarche sans machine', () => {
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
      { typeId: 'mfr', date: '1030-01-01' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
      newDemarcheId()
    )

    expect(valid).toHaveLength(0)
  })

  test('ajoute une étape à une démarche sans machine', () => {
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
      { typeId: 'mfr', date: '1030-01-01', statutId: 'fai' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
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
      { typeId: 'mfr', statutId: 'aco', date: '2030-01-01' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
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
      { typeId: 'mfr', statutId: 'aco' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
      newDemarcheId(),

      [{ id: '1', typeId: 'dae', statutId: 'exe' }] as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>[]
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
      { id: '1', typeId: 'mfr', statutId: 'aco' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
      newDemarcheId(),

      [
        { id: '1', typeId: 'mfr', statutId: 'aco' },
        { id: '2', typeId: 'dae' },
      ] as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>[]
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
        { id: '3', typeId: 'mfr', statutId: 'aco' } as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
        newDemarcheId(),

        [
          { id: '1', typeId: 'mfr', statutId: 'aco' },
          { id: '2', typeId: 'dae' },
        ] as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>[]
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
        } as unknown as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>,
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
        ] as Pick<Required<ITitreEtape>, 'id' | 'statutId' | 'typeId' | 'date' | 'ordre' | 'contenu' | 'titreDemarcheId' | 'communes'>[]
      )
    ).toContain('la démarche n’est pas valide')
  })
})
