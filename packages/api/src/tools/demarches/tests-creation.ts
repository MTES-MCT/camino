import '../../init'
import {titresGet} from "../../database/queries/titres";
import {userSuper} from "../../database/user-super";
import {SubstancesFiscales} from "camino-common/src/substance";
import {titresActivitesGet} from "../../database/queries/titres-activites";



const writeEtapesForTest = async () => {


    const activites = await titresActivitesGet(
        {
            typesIds: ['grx', 'gra', 'wrp'],
            statutsIds: ['dep'],
            annees: [2021]
        },
        { fields: { titre: { substances: { legales: {id: {}} }}} },
        userSuper
    )

    activites.forEach((activites, i) => {
        const substanceLegalesWithFiscales = (activites.titre?.substances ?? [])
            .flatMap(s => s.legales)
            .filter(s => SubstancesFiscales.some(({substanceLegaleId}) => substanceLegaleId === s.id))

        if(substanceLegalesWithFiscales.length > 1){
            console.error('BOOM, titre avec plusieurs substances ', activites.titre?.id, i)
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
