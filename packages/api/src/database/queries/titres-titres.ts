import TitresTitres from '../models/titres--titres'

interface LinkTitre {
  linkTo: string
  linkFrom: string[]
}
export const linkTitres = async (link: LinkTitre): Promise<void> => {
  await TitresTitres.query().where('titreToId', link.linkTo).delete()
  if (link.linkFrom.length) {
    await TitresTitres.query().insert(
      link.linkFrom.map(titreFromId => ({
        titreFromId,
        titreToId: link.linkTo
      }))
    )
  }
}
