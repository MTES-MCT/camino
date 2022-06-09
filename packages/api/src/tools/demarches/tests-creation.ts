import '../../init'
import { userSuper } from '../../database/user-super'
import { SubstancesFiscales } from 'camino-common/src/substance'
import { titresActivitesGet } from '../../database/queries/titres-activites'

const writeEtapesForTest = async () => {
  const activites = await titresActivitesGet(
    {
      typesIds: ['grx', 'gra', 'wrp'],
      statutsIds: ['dep']
    },
    { fields: { titre: { substances: { legales: { id: {} } } } } },
    userSuper
  )

  activites.forEach(activites => {
    const substanceLegalesWithFiscales = (activites.titre?.substances ?? [])
      .flatMap(s => s.legales)
      .filter(s =>
        SubstancesFiscales.some(
          ({ substanceLegaleId }) => substanceLegaleId === s.id
        )
      )

    if (substanceLegalesWithFiscales.length > 1) {
      console.error(
        'BOOM, titre avec plusieurs substances ',
        activites.titre?.id
      )
      console.error(activites.contenu)

      substanceLegalesWithFiscales.forEach(s => {
        SubstancesFiscales.some(
          ({ substanceLegaleId }) => substanceLegaleId === s.id
        )
        console.error(
          s.id,
          SubstancesFiscales.filter(
            ({ substanceLegaleId }) => substanceLegaleId === s.id
          ).map(({ id }) => id)
        )
      })
    }
  })
}

writeEtapesForTest()
  .then(() => {
    process.exit()
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
