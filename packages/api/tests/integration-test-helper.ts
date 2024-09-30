import Titres from '../src/database/models/titres'
import TitresDemarches from '../src/database/models/titres-demarches'
import TitresEtapes from '../src/database/models/titres-etapes'
import { ITitre } from '../src/types'

export const insertTitreGraph = async (titreGraph: ITitre): Promise<void> => {
  const { demarches, ...titre } = titreGraph
  await Titres.query().insert(titre)

  for (const demarcheGraph of demarches ?? []) {
    const { etapes, ...demarche } = demarcheGraph
    await TitresDemarches.query().insert(demarche)

    for (const etape of etapes ?? []) {
      await TitresEtapes.query().insert(etape)
    }
  }
}
