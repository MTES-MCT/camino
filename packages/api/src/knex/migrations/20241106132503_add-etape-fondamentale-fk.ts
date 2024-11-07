import { DemarcheId, demarcheIdValidator } from 'camino-common/src/demarche'
import { EtapeId } from 'camino-common/src/etape'
import { EtapesTypes, EtapeTypeId } from 'camino-common/src/static/etapesTypes'
import { getKeys, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import { Knex } from 'knex'
type MyEtape = { id: EtapeId; type_id: EtapeTypeId; titre_demarche_id: DemarcheId; ordre: number }
export const up = async (knex: Knex): Promise<void> => {
  await knex.raw('ALTER TABLE titres_etapes ADD etape_fondamentale_id varchar NULL')
  await knex.raw('ALTER TABLE titres_etapes ADD CONSTRAINT etape_fondamentale_fk FOREIGN KEY (etape_fondamentale_id) REFERENCES public.titres_etapes(id)')

  await knex.raw('UPDATE titres_etapes set etape_fondamentale_id=id where archive is true')

  const { rows: etapes }: { rows: MyEtape[] } = await knex.raw('SELECT id, titre_demarche_id, ordre, type_id FROM titres_etapes WHERE archive is false order by titre_demarche_id, ordre')

  const etapesByDemarcheId = etapes.reduce<{ [key in DemarcheId]?: MyEtape[] }>((acc, etape) => {
    if (isNullOrUndefined(acc[etape.titre_demarche_id])) {
      acc[etape.titre_demarche_id] = []
    }
    acc[etape.titre_demarche_id]?.push(etape)
    return acc
  }, {})

  for (const demarche of getKeys(etapesByDemarcheId, (value): value is DemarcheId => demarcheIdValidator.safeParse(value).success)) {
    const etapesByDemarche = etapesByDemarcheId[demarche] ?? []
    if (etapesByDemarche.length > 0) {
      let etapeFondamentaleId = etapesByDemarche[0].id
      for (const currentEtape of etapesByDemarche) {
        if (EtapesTypes[currentEtape.type_id].fondamentale) {
          etapeFondamentaleId = currentEtape.id
        }
        await knex.raw('UPDATE titres_etapes set etape_fondamentale_id=? where id=?', [etapeFondamentaleId, currentEtape.id])
      }
    }
  }

  await knex.raw('ALTER TABLE titres_etapes ALTER COLUMN etape_fondamentale_id SET NOT NULL;')
}

export const down = (): void => {}
