/* eslint-disable sql/no-unsafe-query */
import { EtapeId, etapeIdValidator } from 'camino-common/src/etape'
import { FeatureCollectionPoints, FeatureMultiPolygon } from 'camino-common/src/perimetre'
import { GeoSystemeId, geoSystemeIdValidator } from 'camino-common/src/static/geoSystemes'
import { getKeys, isNullOrUndefined } from 'camino-common/src/typescript-tools'
import knexBuilder from 'knex'
import { knexSnakeCaseMappers } from 'objection'
import { z } from 'zod'
import { convertPoints } from '../api/rest/perimetre.queries'
import pg from 'pg'

export const knexConfig = {
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    database: 'camino2',
    user: 'postgres',
    password: 'password',
  },
  ...knexSnakeCaseMappers(),
}

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'camino2',
  user: 'postgres',
  password: 'password',
})

const knex = knexBuilder(knexConfig)

const entry = z.object({
  coordonnees: z.object({ x: z.number(), y: z.number() }),
  geo_systeme_id: geoSystemeIdValidator,
  titre_etape_id: etapeIdValidator,
  groupe: z.number(),
  contour: z.number(),
  point: z.number(),
  nom: z.string().nullable(),
  opposable: z.boolean().nullable(),
  description: z.string().nullable(),
})

type Row = z.infer<typeof entry>

const etapesWithout4326Points = [
  '04c4f3626e8ccc25ad0a4554',
  '09d0286e2931fcefde99b568',
  '0da239773247f958ced96d07',
  '0NmsqYGVQJYKhFY22Ltt4NBV',
  '11334e6bd2e69c7762a7675a',
  '157XQylsp6jGbUFYi6bXj1F0',
  '1b249ce686f74fe1a65007bf',
  '1bfbd40f6a4ef911ae462307',
  '1e9d92b325d9dd5104377358',
  '1f9309ce90370f9545083532',
  '20FKYhL73A59W9FuyoVmehe1',
  '22ad5abe0d4cef43abaa08ca',
  '22e74c9703178aedbdf4f67b',
  '2b3cc697a4903d7619fc948e',
  '2fUvtXRLB3xZMFsARS7lZglf',
  '2KdcorNbyVWUCxIhaQLpcQHO',
  '2vg7g1IguYMz9SpKuAIhiqkJ',
  '2YRa3dDL50q60CgAtFHK1SUp',
  '301e9cfc677e0e5fa3468f70',
  '30ONzQtIvkZcBaB3mXkIdi4p',
  '31lnNbqdw1tnX48UVoXOukwu',
  '3243c322978f4f43ab90e9ce',
  '37be0409a5122ca3d9d6f11d',
  '38d83be7e6f09d0ba4513b69',
  '3d0d1cfb591e86b4d6b596b1',
  '3ead98e1891ed1f218f6ca47',
  '3uhVXLI04PAFVCSy3SVN9uzd',
  '40xxmxj2gVOyx9hOa7oSV7ig',
  '4450b9cbfaf1fb55ef980845',
  '470c8fabc6f21de15132f82f',
  '4ba88a990c89d9a743dec1e0',
  '4bec48f0e8a939b85b1c71bc',
  '4f3a97c33e5449d58054f487',
  '4fe695bad01f4652a904acb7',
  '4myRvaaQZIO5Uy3nCO3nCaUe',
  '4TWKrtXkicjpjc236BApPObA',
  '4yRXpstQLC3fYgGrhQmf8cyS',
  '511765cbc9e28379f2f6bd04',
  '55d9dcdebcd8a42a1e3492f0',
  '597e2fca641257be2b64f059',
  '5np59hgvb0eEQaaEWuRBdyQ3',
  '602446e7406c895d96886363',
  '60353fb2fe4639ca9d30f4f7',
  '67ed2f98d09b433c4ee23fc9',
  '67fc34e44e3df1ba01edf015',
  '6f21c953c5582a3accc984eb',
  '6V0rFR78egIUjjC1LYpeNDtU',
  '70fda69952ed8afaa4ba07fe',
  '7b8bddb826a852af6cef8901',
  '7FXuvuWBKn8Vp64t1e8uc3kz',
  '7zZBd78QN021cb8lILsBltHP',
  '815a84e4c81a8c0526fd90fa',
  '88G6SC9dQlNPFGvYt36ey2ZC',
  '8ad2ebf0f20c299d164d292f',
  '8brefs7OWqHEewJmcjltTJGa',
  '8cc9f54cd12d2558346ced71',
  '8loTGMXRJcs6m6CDfwUFSLkC',
  '8MM99moG907PEL01QX8YG0Rn',
  '8U0HohTguNVDJHYtI28ehcgK',
  '8UiGrVMZ17pnYgZAoAmAljRJ',
  '8wHGVBLx2Ac36R1bkG2aukY4',
  '91cf23c8baed09821bbd22d0',
  '979fc0687da6822ab24825b8',
  '9a8ZcTrSJ8YkyCAoy1AITEmm',
  '9bkcAW0COXbj0rRtNcS3Xs99',
  '9c8939562919277fb18848b4',
  '9FS2R2RzDAfG86kObA5Gs2IC',
  '9SGYtLrzesHXvdXRWepz4Sjd',
  '9u7tqwZrJtqshoufuD8C9y0S',
  '9xDaEqqRoy3p6j0IGgUkGzjZ',
  'a1b9e026a5b5e72ced40fca7',
  'a1c770c36b3e928b9b97dcf0',
  'a272e1755733307184d7ada5',
  'a2sXT87xFdqaa1E2Ec4D7xJO',
  'a8b519f76fed650bc57540fe',
  'a9a391037f986bff39c34749',
  'aae53cd95a7b7586fc26641c',
  'ad8a0b9faef657eb71fddf79',
  'ALBRdVrF5jJve77Yw6T9IRgD',
  'AOGyS5GEnMIBADNTZwhJtEbP',
  'ApB78mzBKLLJYgw5HaSG1qBe',
  'aULWbpco0KLK5xgqAvLaCIEF',
  'b14fc92723c1d958d51b05c9',
  'b2924bb5354e455553fc0229',
  'b988e474d6a3cb81cbfc342f',
  'b98f810b1495e8c45cde9cc0',
  'babae00fe0facfb989ae65c9',
  'BCZoQP22wg0dibjr2ZWjC4qL',
  'bEWnyNqXn0fJn781QKdFxNuh',
  'bf13c1ae34b5bc13e0a3b9dd',
  'Bfm9EqEGESp2Sxu7JxDXOQur',
  'bKTTmOvHHHSWZNHROelwVI5u',
  'Bncf7ixyaPRAMTNLIT80Ul31',
  'bxVKRFpjjjOmm5sPNAhrEDCf',
  'c046b7638f603b76a5f5a59d',
  'c0a1f5Qcl1fCVIpAZN3Kzwk8',
  'c32fcb69e82d78cb0ab9aa9e',
  'c4bd832699733285972abd03',
  'c6d8584fb70b7ab964580d49',
  'c75279efdd48da44069e8816',
  'c781c6e0d015ee006b189d0a',
  'c7w6qpeyhMl5ZZIooP2TGHfa',
  'cab3159c39d6c5da128c9299',
  'cb4cd264e17678a7f3a60bcb',
  'cBRpGhRnGwmHs2XI9LagXqTU',
  'Ceg6yJiXPcCqlhsdCWzANYGL',
  'CFo6ZhIwBB1C8u0c2uySvmZH',
  'CIqWLPL3lah4giLseLy4UwBR',
  'd06c473209a1b1673ec2e79a',
  'd1gin9UEAWsX3RbiXrcWJQzI',
  'd43d744c8a14c3d2e663685a',
  'd5f1fe0c770df653e251f271',
  'd819b725df8e5d319cc3f478',
  'de3fdc5fbb48f65eb46150a1',
  'dKT43hzRoZGFCWDpuwgCxwwT',
  'DoG6klyDvte3Cs0TLxWxs8k2',
  'e2lIs4X4myephpIkogWMxGNY',
  'E4aK5PMSRQSzbrKgOdfjV5PM',
  'E5qotcGDVTDRn8hQDOpaoZCn',
  'Eb1R4m2yBW9Lf8KsRA9Opln0',
  'eD68hWx4yKwny1X6BOW9puXV',
  'ed8e795ddd7bf6581004d001',
  'edd5afc853e91468966d4eaf',
  'EhSHMC7ZOL397dOYKANQ4tKW',
  'ehWMSq1YTWH29KWnD2RYLK7l',
  'EIK2t6ek8PsZUd2LKQzUJCO5',
  'ENwMIq8T86mikrkXFlngqiPN',
  'epfXDA6ueqbMxKI1ZadcytCs',
  'EZGPgvKjiTAtMDTxpvosNesq',
  'f3e3adb2ee458d9671fe29de',
  'f7111a54d43cf72b80d080e3',
  'f8392bb230cb2d5c5cbbdf6f',
  'f8ae1d9333503e83f02ee438',
  'f8e6527d9af4bc7b07abf0dc',
  'f9f0537d8ff7ea5b0dd6179b',
  'fb77c88d674ff8bfd4fed246',
  'fh0q4crNDKQ2CLsBXaAd1x5V',
  'FiBVG4xsGZ7N7jtotH7hTYQ0',
  'FJlIWkO1sBiqigwbX72ORKHw',
  'FQb8bbloCqReaxVQ0SuAD1UC',
  'FqcJOCWEj6JcsTIwJugpg6ez',
  'fRDZ8A1tKQ9Mtk1fsXU4nphx',
  'FX0qvyqfk10tjjJQiBlA3q4Z',
  'FYRgV0hg1s2jXGWRkG8baNeF',
  'g0VPcVgYS87uZ74u7fngtYpC',
  'GA6nRfjeLuoGXQ4tmeFVQs2t',
  'GIdAvcbkYj3YVzMmpXkUTNci',
  'GiTcxXG8mIshZ1OxrUZh4ebo',
  'grL34Izn4Q0JYZBcI8ShtCew',
  'gwKaXiTe1VgknKjBNie5HuyI',
  'H01a3PrmAhJ92o03u00psae3',
  'h1usvmJ19Uhzf0oYjI13dNvQ',
  'h2DjZ8d1orzonXohq75hwhBR',
  'h4FqXyIFV4tG6UBucdtLlR5K',
  'HhA3RmrMMdUfXPBLY3SW1cQg',
  'HimLmn88xxnBXJzozenT31M9',
  'hnEokBxhMAq3Tk7aNLPuxmp2',
  'hr3d8B4dbpS3lgMMYkOJPASS',
  'hzNGb0v07ll1qMFFgp2kBRbv',
  'IhqxV86FxnhIT9pekv3XbHCF',
  'iPjC3n4iMkSxRqKuTdzEtBZb',
  'iRmdDeqR0AICGK3V4ZnMuk8v',
  'iTGg8paaMQrfUbIiJekaWe3l',
  'IWE6MZWbHkHM9iluQecBW24X',
  'JiJQ361ixBiRPPnrf0J9VxXP',
  'Jmmpr0O4XKOwIW4V3s8YhswF',
  'JnsYvvOv5QJYHdgcInagB3kv',
  'joYOGfymhmpmcB0BmpbavePj',
  'JTyeCKPbGAvyLOVG0qLCRH0H',
  'jViMnEyQcRJdU9DIL4li5qS9',
  'k1850hdbbkWtt8xmpJaBMu9Y',
  'KcoKvgB3rnpFvY5z4pAmwQzp',
  'KHmLput7Y4K3xePPHdO9qa82',
  'kIao1Ke14BdFhItBxO3T6isH',
  'kmO1RzT7tkFNTTD4V577lJxC',
  'KyK7CoZy8DmGA9ww9LKqb3Y4',
  'lDtzRKAx3bgBNJQ2JnxV4FvJ',
  'lmUNlWTsLXSt8GuXR9otKH1R',
  'LVgJs8NR8dyphN141FUFVeSK',
  'M0KExO4tnl1rtqs8ZGfJ2z4G',
  'M3jCyHeAq5l6A1UPDO2s6kUD',
  'M6BtmGujqAJmQwmFlnT34pkz',
  'mb8Akc2rDg2hDnQRDhbl2dZ6',
  'MkoXsHzjOdVnrqKPt50R7Fp0',
  'moIO1oQktXy3NIqwzYK7qVow',
  'NCLmAvQgQ6VWRDLtibOLyfaI',
  'NPrQweEbTFd3EpNrbS0Ev0Ci',
  'nTr73bY4mpyztAn4unzUmf7t',
  'NY4x9PfC91sWvgBLxBthOWTz',
  'NZjnmbZ0cj94PQSuOTd4LcwV',
  'O2k4uYOTTuEP8kxg0QrlN8U0',
  'o45DLeDtdRvYg84UaUMClkZ4',
  'oanMnP1msp9j67PK9BlDz2Iz',
  'oIIP0DhDOrPbqiyLRh5eARb5',
  'ojgVAxNmcMA0Ohkantw4z6IN',
  'OkiCfHkgJGOeLBejmnzzawGu',
  'omhE9RrbcED0nTQaRGdpXqAf',
  'oNqISURfon0bVNsfdNis3S5o',
  'Otc6CJYZnuhv8bvD2G7tNGGu',
  'OZ9HRRKwndjMLwFWuylVOcGN',
  'pBC309cdc0sGKCVD1MQcZWB5',
  'piy02PTBENQBAy0JvrwA9blf',
  'PtiUWUY0agDbVR7V0NbSMfbA',
  'PUE3lvyoScUWeTiUsMPd0tMw',
  'QaSGzUQ5IJ8MsgoxHHdGlbOR',
  'qlMCOkOZxVSE8FRA7JxbXr7T',
  'QoNIbBMXWQQ10ZpFbe6OJ2po',
  'qqD6STD25WNf4npSCf4oPDqi',
  'qY8ryZ8GQ16AjCvo0vZh8XHU',
  'QylOw1j8rMXEx3iQ2tqV4z4A',
  'qZuASLk9NTbRReycRH7HZsRG',
  'rcI5AFAMfsRm3fyndQLM2olG',
  'RELu2dQNPWxGjTB9CKiShaWJ',
  'rFEkpqb2SswpduaWNqS7qVZL',
  'rMhexQZhIKDabzDuY2XE17aJ',
  'RSH7AcWUYUTN1c9mrizNez7K',
  'SjoLWLmnQFiqPk8shA2TrtXy',
  'sn8QOlUramIrIFFErzn5jsCv',
  'SNeYWJPhufbFiheyPW0296UT',
  'sQpUKymt0PqjY1nLRtcWuvBJ',
  'sR2SlSQcOPLYZbWp3mhQjtsV',
  'swToQy7Zf3zxCS5oV6Narwgt',
  'sYETfcmoVHiK2zYN0BTmRWR4',
  'Sz0MzO5UDVfZZlWmd0OueELb',
  'T6Glzv2cl2SIWc1D7HdlsabV',
  'tLB5VF0rEbO5o50TDVJxJ9my',
  'tMM6P4CCrHVKqDB2L0ALMmRY',
  'tqZMw2GZPVAIFwWbP6oGDRBt',
  'Twf5OukDRo5E12x4kYB5iWF3',
  'tWpwXk3RafcQpAzeKh3Lkptk',
  'u8Wk275UrJlR7jHgGLWsoDEo',
  'UHeYjc9lZXaHDjo0XkZFjzCM',
  'UK7NbasIJRxe0otTTlSl9GEt',
  'UnCATtV7GbVrMrDWfSLUC99R',
  'uU1IW61xQXk2UCmPRTrC6A0n',
  'uXT3X3U38fcF4QZ3HItuxxcw',
  'uz66Yg6UD1YNmlOU3WP6TJEB',
  'v1otO61TQ92sDtUpytpuO7fB',
  'vQ9nW3oVOF01G6lKrq2B4lJ8',
  'VtkbsxgRw6ldKzEkBByChDmj',
  'VuX0OHQbqltxMCtnIOAuDecR',
  'VYWfeHzPuezz0KNPfKSmnF3i',
  'w62lhdLDA9hhF1AMw9hIH0U6',
  'W6tWesONJLWzoDuwglELuykw',
  'WGk00jXVPytKFe5bZryIF1wl',
  'wS0qkkRKMDYUkIM9KEa9fG4e',
  'x7ZsDMSAtyWZDZvQXDT2ck0n',
  'xBMLxh1RUWk4r3wl1mgkQG2j',
  'XEsABJEw4s7dYlHUuWBDrXLc',
  'xFNnYGEjekiuNwlPZQsRoSb6',
  'xKuf3QaEHkb3NoKOQLhmgp82',
  'xwKVWsc938dehXjnJzrNicbe',
  'xzrdGHsRbkZaBhgZ70mnE8Pm',
  'YifxpkUrzZFqmf2fUBbrqvjX',
  'yMeYpaI5ooc5stpfTmlhKG3z',
  'YoBGReJmV3vrT1uQJLwHRj4T',
  'yRoTGOoqlObY54v8XsuiLdOz',
  'yseESgojFOB3H2nUp2NoW67G',
  'YsV8SUI4dM6tI2CkbetoEONX',
  'ytAFAwteig424hENk5oMLKqS',
  'yx9smE183frGZ2kzqEHTj7st',
  'yy5KFOpcfVXN9DX9bQitR2Bf',
  'yyNQmZpn5wMjbTg6bKNMvATH',
  'ZE724PeJZzolxQoBRufgrcFM',
  'zqSr1UopzXZB4xBOJBIGIk05',
  'ZwOSw7pEhAy0F374xF2yPRP5',
]

const etapeIdsIgnored: string[] = [
  // un seul point opposable
  'ib3azhoNoXQHxd1Bnumak5ww',
  // le contour commence à 2
  'FixGOMcVwkauQyH1byBKpglp',
  // Pas bon geosysteme 27573
  // 'Nfd0MiVO16xmUL7OyRGaMMgJ',
  // pas de référentiel opposable, et les autres que 4326 sont partiels
  'LxO81gUXH7vWJk4hgceAxFFF',
  '9MBQ3hC7vrvcIK9W7IXPycV1',
  // plouf dans l'eau (mauvais référentiel ?)
  'J1whBV7ofONauCfHt2fKnHoh',
  'KjCFx9XcJs5sLuDVKLftTCSa',
  // à réparer marrant
  'KQ0FwSGvKKeSP8o6K5ADdCBm',
  'c0o3OwinINfllRdA2qgAdFmh',
  '4gPpDlohe1aPUuyhXlVroud0',
  'akwbyh6IieKZgW9lxXV1BidC',
  'C7VwUIRSA1ry9CqXZFOIdVvS',
  'dTr9TJBT1KlDnlPD1mbEBqpJ',
  'HzKEi87VBXdPbfNgX2jTRwut',
  'NOoYH3UpmSN3lfEbvFcwGiVw',
  'oZrPrJz5AO1bjouENujZPscx',
  'qhFJqfXILwIfeLf97AQ2HQMZ',
  'rCqpshHzeSvqo1JIVy8zgPUu',
  'uI4kMjDWZuclj243VlassZTx',
  'uQAQLEBI08TLS7EElbg8ntX1',
  'vtY1V9FJ9v5zbGxdCpR3qC2j',
  'lfWnRjnRaDPFHHQE0rrjOn9M',
  'Vu2u5GFV7hQ40z1xIxX6i28g',
  'h4XRWr88Xa0YDMjPe3gVdhCd',
  'IXHTQEu5EX5QYqUzHV1tugjp',
  'mXvPgzER5mj3gLKnM0lLMs8R',
  'pTPoON8dWU4r4ylo8kerDNNe',
  'yBNXGAeopu8yFmM6LqbpnFtt',
  'IlwGuEUZwB3rS5ydlzsg8l6T',
  'VMXNEznTgy8bVNyJIOJWRHZS',
  'LmNB8aPDs9u2Z9861AfL5fUW',
]

const generate = async () => {
  const pointsReferences: { rows: Row[] } = await knex.raw(
    `select tpr.coordonnees, tpr.geo_systeme_id, tp.titre_etape_id, tp.groupe, tp.contour, tp.point, tp.nom, tp.description, tpr.opposable from titres_points_references tpr join titres_points tp on tp.id = tpr.titre_point_id where tp.titre_etape_id not in (${etapeIdsIgnored
      .map(id => `'${id}'`)
      .join(', ')}) order by titre_etape_id, groupe, contour, point`
  )

  const points = z.array(entry).parse(pointsReferences.rows)

  const pointsByEtape = points.reduce<Record<EtapeId, { [key in GeoSystemeId]?: Row[] }>>((acc, point) => {
    if (isNullOrUndefined(acc[point.titre_etape_id])) {
      acc[point.titre_etape_id] = {}
    }
    if (isNullOrUndefined(acc[point.titre_etape_id][point.geo_systeme_id])) {
      acc[point.titre_etape_id][point.geo_systeme_id] = []
    }

    acc[point.titre_etape_id][point.geo_systeme_id]?.push(point)

    return acc
  }, {})

  for (const pointsBygeoSystemes of Object.values(pointsByEtape)) {
    try {
      const geoSystemes = getKeys(pointsBygeoSystemes, (value: string): value is GeoSystemeId => geoSystemeIdValidator.safeParse(value).success)

      if (!(pointsBygeoSystemes['4326']?.[0].opposable === true || (geoSystemes.length === 1 && geoSystemes[0] === '4326'))) {
        let geoSystemeId: GeoSystemeId
        if (geoSystemes.length === 1) {
          geoSystemeId = geoSystemes[0]
        } else {
          const geoSystemeFound = geoSystemes.filter(geoSysteme => pointsBygeoSystemes[geoSysteme]?.[0]?.opposable)
          if (geoSystemeFound.length === 1) {
            geoSystemeId = geoSystemeFound[0]
          } else {
            throw new Error(`plusieurs geosysteme et aucun opposable, ${pointsBygeoSystemes[geoSystemes[0]]?.[0].titre_etape_id}`)
          }
        }

        const points = pointsBygeoSystemes[geoSystemeId]

        if (isNullOrUndefined(points)) {
          throw new Error(`impossible de ne pas avoir de points ${pointsBygeoSystemes[geoSystemes[0]]?.[0].titre_etape_id}`)
        }

        const origineGeosystemeId: GeoSystemeId = points[0].geo_systeme_id

        const originePoints: FeatureCollectionPoints = {
          type: 'FeatureCollection',
          features: points.map(point => ({
            type: 'Feature',
            properties: { nom: point.nom?.replace(/'/g, '’'), description: point.description?.replace(/'/g, '’') },
            geometry: { type: 'Point', coordinates: [point.coordonnees.x, point.coordonnees.y] },
          })),
        }

        const originePerimetre: FeatureMultiPolygon = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'MultiPolygon',
            coordinates: points.reduce<[number, number][][][]>((acc, point) => {
              if (acc.length < point.groupe) {
                acc.push([])
              }

              if (acc[point.groupe - 1].length < point.contour) {
                acc[point.groupe - 1].push([])
              }

              acc[point.groupe - 1][point.contour - 1][point.point - 1] = [point.coordonnees.x, point.coordonnees.y]
              acc[point.groupe - 1][point.contour - 1][point.point] = acc[point.groupe - 1][point.contour - 1][0]

              return acc
            }, []),
          },
        }
        if (etapesWithout4326Points.includes(points[0].titre_etape_id)) {
          const points4326 = await convertPoints(pool, origineGeosystemeId, '4326', originePoints)

          const sqlQuery = `update titres_etapes set geojson_origine_geo_systeme_id = '${origineGeosystemeId}', geojson_origine_points = '${JSON.stringify(
            originePoints
          )}', geojson_origine_perimetre = '${JSON.stringify(originePerimetre)}', geojson4326_points = '${JSON.stringify(points4326)}'  where id='${points[0].titre_etape_id}';`

          console.info(sqlQuery)
        } else {
          const sqlQuery = `update titres_etapes set geojson_origine_geo_systeme_id = '${origineGeosystemeId}', geojson_origine_points = '${JSON.stringify(
            originePoints
          )}', geojson_origine_perimetre = '${JSON.stringify(originePerimetre)}'  where id='${points[0].titre_etape_id}';`

          console.info(sqlQuery)
        }
      }
    } catch (e) {
      const titreEtapeId = Object.values(pointsBygeoSystemes)[0][0].titre_etape_id
      throw new Error(`Erreur lors de l'étape https://dev.camino.beta.gouv.fr/etapes/${titreEtapeId}`)
    }
  }
}

generate()
  .then(() => {
    process.exit(0)
  })
  .catch(e => {
    console.error(e)

    process.exit(1)
  })
