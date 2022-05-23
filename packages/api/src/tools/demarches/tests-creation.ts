import '../../init'

import { titresDemarchesGet } from '../../database/queries/titres-demarches'
import { userSuper } from '../../database/user-super'
import { titreDemarcheDepotDemandeDateFind } from '../../business/rules/titre-demarche-depot-demande-date-find'
import { Etape } from '../../business/rules-demarches/arm/oct.machine'
import { writeFileSync } from 'fs'
import {
  isEtapesOk,
  toMachineEtape
} from '../../business/rules-demarches/machine-helper'

const writeEtapesForTest = async () => {
  const demarcheDefinition = {
    titreTypeId: 'arm',
    demarcheTypeIds: ['oct'],
    dateDebut: '2019-10-31'
  }
  const demarches = await titresDemarchesGet(
    {
      titresTypesIds: [demarcheDefinition.titreTypeId.slice(0, 2)],
      titresDomainesIds: [demarcheDefinition.titreTypeId.slice(2)],
      typesIds: demarcheDefinition.demarcheTypeIds
    },
    {
      fields: {
        titre: { id: {}, demarches: { etapes: { id: {} } } },
        etapes: { id: {} },
        type: { etapesTypes: { etapesStatuts: { id: {} } } }
      }
    },
    userSuper
  )

  const toutesLesEtapes = demarches
    .filter(demarche => demarche.etapes?.length)
    .filter(demarche => {
      const date = titreDemarcheDepotDemandeDateFind(demarche.etapes!)

      return (date ?? '') > demarcheDefinition.dateDebut
    })
    .filter(demarche => {
      if (
        [
          // Trés bizarre
          'KUjfw8g45vJ8Jgthwkf3YIpN',
          // rajouter la pfd en prod
          'rivW6W2OsA2PWIysYGZzd2SO',
          'SPvat9xMCgLHmN8fMT3k53CT',
          'gvlDYw1s8d22iMj8F5sM7IAS',
          'kcJzw0h3dJEwPhSUgDXq0smA',
          // rde sans franchissement ? soit pas de franchissement lors du mfr, soit pas de rde
          'FWVRSGQx2IpHjcVj1LwgRf0o',
          'Dtd3Zuj4m7ZszvUDPoKJi1Of',
          // reception de complements de rde sans franchissements de cours d'eau (null au lieu de 0 ou plus)
          'vvxX7ntbBKLCbUf2DqxKuVmf'
        ].includes(demarche.titreId)
      ) {
        console.log(`${demarche.titreId} ne respecte pas le cacoo`)

        return false
      }

      return true
    })
    .map((demarche, index) => {
      const etapes: Etape[] =
        demarche?.etapes
          ?.sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
          ?.map(etape => {
            if (etape?.contenu?.arm) {
              etape.contenu = { arm: etape.contenu?.arm }
            } else {
              delete etape.contenu
            }

            return toMachineEtape(etape)
          }) ?? []
      try {
        if (!isEtapesOk(etapes)) {
          console.log(
            `https://camino.beta.gouv.fr/titres/${demarche.titreId} => démarche "${demarche.typeId}"`
          )
        }
      } catch (e) {
        console.log(
          `https://camino.beta.gouv.fr/titres/${demarche.titreId} => démarche "${demarche.typeId}"`
        )
      }

      const etapesAnonymes = etapes.map((etape, index) => {
        return { ...etape, date: index.toString() }
      })

      return { id: index, etapes: etapesAnonymes }
    })
  writeFileSync(
    'src/business/rules-demarches/arm/oct.cas.json',
    JSON.stringify(toutesLesEtapes)
  )
}

writeEtapesForTest()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
