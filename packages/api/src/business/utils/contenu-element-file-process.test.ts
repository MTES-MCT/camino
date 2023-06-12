import { FileUpload } from 'graphql-upload'
import { ReadStream } from 'fs'
import { afterEach, vi, describe, test, expect } from 'vitest'

import { IContenu, ITitreEtape } from '../../types.js'

import { contenuElementFilesCreate, contenuElementFilesDelete, sectionsContenuAndFilesGet } from './contenu-element-file-process.js'

import { objectClone } from '../../tools/index.js'
import dirCreate from '../../tools/dir-create.js'
import fileStreamCreate from '../../tools/file-stream-create.js'
import fileDelete from '../../tools/file-delete.js'
import { Section } from 'camino-common/src/static/titresTypes_demarchesTypes_etapesTypes/sections.js'
import { DeepReadonly } from 'camino-common/src/typescript-tools.js'

vi.mock('../../tools/dir-create', () => ({
  __esModule: true,
  default: vi.fn(),
}))
const dirCreateMock = vi.mocked(dirCreate, true)

vi.mock('../../tools/file-stream-create', () => ({
  __esModule: true,
  default: vi.fn(),
}))
const fileStreamCreateMock = vi.mocked(fileStreamCreate, true)

vi.mock('../../tools/file-delete', () => ({
  __esModule: true,
  default: vi.fn(),
}))
const fileDeleteMock = vi.mocked(fileDelete, true)

afterEach(() => {
  vi.resetAllMocks()
})

describe('sectionsContenuAndFilesGet', () => {
  test('si pas de contenu alors pas de contenu ni de fichier', () => {
    expect(sectionsContenuAndFilesGet(null, [])).toEqual({
      contenu: null,
      newFiles: [],
    })
  })

  test('si contenu sans nouveau fichier alors contenu identique', () => {
    const contenu = {
      arm: {
        mecanise: true,
        franchissements: 3,
        justificatif: 'nomdefichier.pdf',
      },
    }
    expect(
      sectionsContenuAndFilesGet(contenu, [
        {
          id: 'arm',
          elements: [
            { id: 'mecanise', nom: 'mecanise', type: 'checkbox' },
            { id: 'franchissements', nom: 'franchissements', type: 'number' },
            { id: 'justificatif', nom: 'justificatif', type: 'file' },
          ],
        },
      ])
    ).toMatchObject({
      contenu: objectClone(contenu),
      newFiles: [],
    })
  })

  test('si contenu avec nouveau fichier alors contenu modifié', () => {
    const contenu = {
      arm: {
        mecanise: true,
        franchissements: 3,
        justificatif: { file: { filename: 'super.pdf' } as FileUpload },
      },
    }

    const newContenu = objectClone(contenu) as IContenu
    newContenu.arm.justificatif = 'prefix-super.pdf'

    const res = sectionsContenuAndFilesGet(contenu, [
      {
        id: 'arm',
        elements: [
          { id: 'mecanise', nom: 'mecanise', type: 'checkbox' },
          { id: 'franchissements', nom: 'franchissements', type: 'number' },
          { id: 'justificatif', nom: 'justificatif', type: 'file' },
        ],
      },
    ])
    expect(res).toMatchObject({
      contenu: newContenu,
      newFiles: [{ filename: 'prefix-super.pdf' }],
    })
  })
})

describe('contenuElementFileProcess', () => {
  test('enregistre les nouveaux fichiers sur le disque', async () => {
    const file = {
      createReadStream: () => ({} as unknown as ReadStream),
      filename: 'toto.pdf',
      encoding: 'utf-8',
      mimetype: 'application/pdf',
    } as unknown as FileUpload

    await contenuElementFilesCreate([file, file], 'demarches', 'etapeId')

    expect(dirCreateMock).toHaveBeenCalledTimes(1)
    expect(fileStreamCreateMock).toHaveBeenCalledTimes(2)
  })

  test('supprime les anciens fichiers sur le disque', async () => {
    const sections: DeepReadonly<Section[]> = [
      {
        id: 'arm',
        elements: [
          { id: 'mecanise', nom: 'mecanise', type: 'checkbox' },
          { id: 'franchissements', nom: 'franchissements', type: 'number' },
          { id: 'justificatif', nom: 'justificatif', type: 'file' },
          { id: 'facture', nom: 'facture', type: 'file' },
        ],
      },
    ]

    const oldContenu = {
      arm: {
        mecanise: true,
        justificatif: 'fichier.pdf',
        facture: 'facture.pdf',
      },
    } as IContenu
    const contenu = {
      arm: {
        mecanise: true,
        justificatif: 'newfichier.pdf',
        facture: 'facture.pdf',
      },
    }

    await contenuElementFilesDelete('demarches', 'etapeId', sections, etape => etape.contenu, [{ contenu } as unknown as ITitreEtape], oldContenu)

    expect(fileDeleteMock).toHaveBeenCalledTimes(1)
  })
})
