import Titres from '../src/database/models/titres'
import TitresDemarches from '../src/database/models/titres-demarches'
import TitresEtapes from '../src/database/models/titres-etapes'
import { ITitre, ITitreDemarche, ITitreEtape } from '../src/types'

type IEtapeInsert = Omit<ITitreEtape, 'concurrence' | 'hasTitreFrom'>
type IDemarcheInsert = Omit<ITitreDemarche, 'etapes'> & { etapes?: IEtapeInsert[] }
export type ITitreInsert = Omit<ITitre, 'demarches'> & { demarches?: IDemarcheInsert[] }
export const insertTitreGraph = async (titreGraph: ITitreInsert): Promise<void> => {
  const { demarches, ...titre } = titreGraph
  await Titres.query().insert(titre)

  for (const demarcheGraph of demarches ?? []) {
    const { etapes, ...demarche } = demarcheGraph
    await TitresDemarches.query().insert(demarche)

    for (const etape of etapes ?? []) {
      await TitresEtapes.query().insert({ etapeFondamentaleId: etape.id, ...etape })
    }
  }
}
