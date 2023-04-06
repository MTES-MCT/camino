import { IEntrepriseEtablissement, IEntreprise } from '../../types.js'

import { objectsDiffer } from '../../tools/index.js'
import { entreprisesUpsert, entreprisesGet } from '../../database/queries/entreprises.js'
import { entreprisesEtablissementsUpsert, entreprisesEtablissementsDelete, entreprisesEtablissementsGet } from '../../database/queries/entreprises-etablissements.js'
import { apiInseeEntreprisesEtablissementsGet, apiInseeEntreprisesGet } from '../../tools/api-insee/index.js'
import { userSuper } from '../../database/user-super.js'
import { Siren, sirenValidator } from 'camino-common/src/entreprise.js'

const entreprisesEtablissementsToUpdateBuild = (entreprisesEtablissementsOld: IEntrepriseEtablissement[], entreprisesEtablissementsNew: IEntrepriseEtablissement[]) =>
  entreprisesEtablissementsNew.reduce((acc: IEntrepriseEtablissement[], entrepriseEtablissementNew) => {
    const entrepriseEtablissementOld = entreprisesEtablissementsOld.find(a => a && a.id === entrepriseEtablissementNew.id)

    const updated = !entrepriseEtablissementOld || objectsDiffer(entrepriseEtablissementNew, entrepriseEtablissementOld)

    if (updated) {
      acc.push(entrepriseEtablissementNew)
    }

    return acc
  }, [])

const entreprisesEtablissementsToDeleteBuild = (entreprisesEtablissementsOld: IEntrepriseEtablissement[], entreprisesEtablissementsNew: IEntrepriseEtablissement[]) =>
  entreprisesEtablissementsOld.reduce((acc: string[], entrepriseEtablissementOld) => {
    const deleted = !entreprisesEtablissementsNew.find(a => a && a.id === entrepriseEtablissementOld.id)

    if (deleted) {
      acc.push(entrepriseEtablissementOld.id)
    }

    return acc
  }, [])

const entreprisesToUpdateBuild = (entreprisesOld: IEntreprise[], entreprisesNew: IEntreprise[]) =>
  entreprisesNew.reduce((acc: IEntreprise[], entrepriseNew) => {
    const entrepriseOld = entreprisesOld.find(e => e.id === entrepriseNew.id)

    const updated = !entrepriseOld || objectsDiffer(entrepriseNew, entrepriseOld)

    if (updated) {
      acc.push(entrepriseNew)
    }

    return acc
  }, [])

const sirensFind = (entreprisesOld: IEntreprise[]): Siren[] =>
  Object.keys(
    entreprisesOld.reduce<{ [id in string]?: number }>((acc, entrepriseOld) => {
      const oldSiren = entrepriseOld.legalSiren
      if (!oldSiren) return acc

      const numberFound = acc[oldSiren] ?? 0
      acc[oldSiren] = numberFound + 1

      // prévient s'il y a des doublons dans les sirens
      if ((acc[oldSiren] ?? 0) > 1) {
        console.info(`SIREN en doublon: ${entrepriseOld.legalSiren}`)
      }

      return acc
    }, {})
  ).map(value => sirenValidator.parse(value))

export const entreprisesUpdate = async (): Promise<void> => {
  console.info()
  console.info('entreprises (Api Insee)…')

  const entreprisesOld = await entreprisesGet({}, {}, userSuper)
  const entreprisesEtablissementsOld = await entreprisesEtablissementsGet()

  const sirens = sirensFind(entreprisesOld)

  if (sirens.length) {
    const entreprisesNew = await apiInseeEntreprisesGet(sirens)
    const entreprisesEtablissementsNew = await apiInseeEntreprisesEtablissementsGet(sirens)

    const entreprisesToUpdate = entreprisesToUpdateBuild(entreprisesOld, entreprisesNew)

    const etablissementsToUpdate = entreprisesEtablissementsToUpdateBuild(entreprisesEtablissementsOld, entreprisesEtablissementsNew)

    const etablissementsToDelete = entreprisesEtablissementsToDeleteBuild(entreprisesEtablissementsOld, entreprisesEtablissementsNew)

    let etablissementsUpdated = [] as IEntrepriseEtablissement[]

    if (etablissementsToUpdate.length) {
      etablissementsUpdated = await entreprisesEtablissementsUpsert(etablissementsToUpdate)

      console.info('entreprises / établissements (mise a jour)', etablissementsUpdated.map(e => e.id).join(', '))
    }

    if (etablissementsToDelete.length) {
      await entreprisesEtablissementsDelete(etablissementsToDelete)

      console.info('entreprises / établissements (suppression) ->', etablissementsToDelete.join(', '))
    }

    let entreprisesUpdated: IEntreprise[] = []

    if (entreprisesToUpdate.length) {
      entreprisesUpdated = await entreprisesUpsert(entreprisesToUpdate)

      console.info('entreprises (mise à jour) ->', entreprisesUpdated.map(e => e.id).join(', '))
    }
  }
}
