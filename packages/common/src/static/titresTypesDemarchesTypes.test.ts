import { test, expect } from 'vitest'
import { TITRES_TYPES_IDS } from './titresTypes.js'
import { getDemarchesTypesByTitreType } from './titresTypesDemarchesTypes.js'

test('getDemarchesTypesByTitreType', () => {
  expect(getDemarchesTypesByTitreType(TITRES_TYPES_IDS.CONCESSION_METAUX)).toMatchInlineSnapshot(`
      [
        {
          "description": "Démarche à l’initiative d’une personne physique ou morale en vue de l’obtention d’une autorisation ou d’un titre minier pour une première période de validité définie.",
          "duree": true,
          "id": "oct",
          "nom": "octroi",
          "ordre": 1,
          "points": true,
          "substances": true,
          "titulaires": true,
        },
        {
          "description": "Démarche appliquée à une autorisation ou un titre minier qui a fait l’objet d’un octroi initial. Des prolongations sans limitation sont applicables aux concessions pour des durées maximales successives de 25 ans, aux permis d'exploitation de géothermie pour des durées maximales successives de 15 ans, aux permis exclusifs de carrières pour des durées maximales successives de 10 ans et aux autorisations de recherches de carrières pour des durées maximales successives de 3 ans.
      Une prolongation unique est applicable aux autorisations de recherches et aux autorisations d'exploitation de minéraux et métaux en Guyane pour respectivement 4 mois et 4 ans maximum.",
          "duree": true,
          "id": "pro",
          "nom": "prolongation",
          "ordre": 2,
          "points": true,
          "renouvelable": true,
        },
        {
          "description": "Démarche appliquée aux permis exclusifs de recherches, permis d'exploitation de minéraux et métaux et concessions pour étendre leurs périmètres.",
          "duree": true,
          "id": "exp",
          "nom": "extension de périmètre",
          "ordre": 7,
          "points": true,
          "renouvelable": true,
        },
        {
          "description": "Démarche appliquée aux permis exclusifs de recherches contigus. Elle conduit à la création d’un nouveau titre à partir de la fusion des périmètres de plusieurs permis exclusifs de recherches qui se trouvent dans la même période de validité (octroi, prolongation 1 ou prolongation 2).",
          "duree": true,
          "id": "fus",
          "nom": "fusion",
          "ordre": 9,
          "points": true,
          "renouvelable": true,
          "titulaires": true,
        },
        {
          "description": "Démarche co-initiée par le titulaire de certains titres miniers d’exploitation et l’entreprise souhaitant devenir amodiataire du titre. C’est une location de l’exploitation d’un gisement à un tiers par le titulaire du titre en contrepartie d’un loyer ou / et du versement d’une quantité donnée des substances extraites. L’amodiation donne lieu à un contrat entre le titulaire du titre et l’amodiataire pour une durée fixée. Afin d’en bénéficier, l’intéressé doit satisfaire aux critères d’attribution exigés pour être détenteurs du titre minier. L’amodiation n’est pas une sous-traitance. En effet, le sous-traitant est rémunéré par le titulaire du titre pour l’exécution de prestations sur la base d’une facture et non d’un loyer.",
          "id": "amo",
          "nom": "amodiation",
          "ordre": 12,
          "renouvelable": true,
          "titulaires": true,
        },
        {
          "description": "Démarche co-initiée par le titulaire de certains titres miniers d’exploitation et l’entreprise amodiataire du titre. Elle conduit à une fin anticipée du contrat d’amodiation sur l’accord des deux parties sans affecter le statut du titre minier.",
          "id": "res",
          "nom": "résiliation anticipée d'amodiation",
          "ordre": 13,
          "renouvelable": true,
          "titulaires": true,
        },
        {
          "description": "Démarche co-initiée par le titulaire du titre minier et l’entreprise souhaitant devenir titulaire ou co-titulaire du titre. Il s’agit de la cession d’un titre minier en cours de validité par son détenteur à un tiers. Elle peut porter sur la totalité du périmètre du titre initial ou sur une partie de celui-ci. Le titulaire initial conserve ses droits sur la partie restante. Afin de  bénéficier d’une mutation, l’intéressé doit satisfaire aux critères d’attribution exigés pour les détenteurs du titre minier équivalent. La décision du ministre ne préjuge en aucun cas des conditions financières fixées entre  les deux parties.",
          "duree": true,
          "id": "mut",
          "nom": "mutation",
          "ordre": 14,
          "points": true,
          "renouvelable": true,
          "titulaires": true,
        },
        {
          "auto": true,
          "description": "Démarche virtuelle d’une démarche de mutation portant sur une partie d’un titre minier. Cette démarche a pour effet de créer un nouveau titre minier sans qu’une démarche d’octroi en soit le fait générateur.",
          "duree": true,
          "id": "vut",
          "nom": "mutation partielle",
          "ordre": 15,
          "points": true,
          "renouvelable": true,
          "titulaires": true,
        },
        {
          "description": "Démarche obsolète. Co-initiée par le titulaire du titre minier et l’entreprise souhaitant devenir titulaire ou co-titulaire elle remplit une fonction proche de la mutation dans le code minier actuel.",
          "id": "ces",
          "nom": "cession",
          "ordre": 16,
          "titulaires": true,
        },
        {
          "description": "Démarche appliquée à une autorisation ou un titre minier pour anticiper son échéance. Elle peut porter sur tout ou partie du périmètre. Cela est possible sous réserve d’avoir procédé aux mesures de remise en état dont le préfet lui aura a donné acte définitivement. La renonciation a pour effet de replacer le gisement dans la catégorie de ceux ouverts aux recherches.",
          "duree": true,
          "id": "ren",
          "nom": "renonciation",
          "ordre": 19,
          "points": true,
          "renouvelable": true,
          "titulaires": true,
        },
        {
          "description": "Démarche initiée par l’autorité administrative. Le ministre chargé des mines pour les titres et le préfet pour les autorisations d’exploitation peuvent retirer les autorisations et les titres miniers en cours de validité si l’intéressé ne remplit plus certaines prescriptions légales.
      Le retrait a pour effet de replacer le gisement dans la situation de ceux ouverts aux recherches.",
          "duree": true,
          "id": "ret",
          "nom": "retrait",
          "ordre": 20,
        },
        {
          "description": "Démarche obsolète. L’autorité administrative pouvait retirer les droits liés aux autorisations et titres miniers en cours de validité si le titulaire ne remplissait plus certaines prescriptions légales. La déchéance avait pour effet de permettre à l’Etat de réattribuer le titre ou l’autorisation lors d’un appel d’offre.",
          "id": "dec",
          "nom": "déchéance",
          "ordre": 21,
          "titulaires": true,
        },
        {
          "description": "Autorisation d'ouverture de travaux",
          "id": "aom",
          "nom": "Autorisation d'ouverture de travaux",
          "ordre": 100,
          "travaux": true,
        },
        {
          "description": "Déclaration d'ouverture de travaux",
          "id": "dot",
          "nom": "Déclaration d'ouverture de travaux",
          "ordre": 110,
          "travaux": true,
        },
        {
          "description": "Déclaration d'arrêt définitif des travaux",
          "id": "dam",
          "nom": "Déclaration d'arrêt définitif des travaux",
          "ordre": 120,
          "travaux": true,
        },
      ]
    `)
})
