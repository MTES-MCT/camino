import { CaminoAnnee } from "camino-common/src/date"
import { SubstanceFiscaleId } from "camino-common/src/static/substancesFiscales"
import { isNullOrUndefined } from "camino-common/src/typescript-tools"
import Decimal from "decimal.js"
import { z } from "zod"

const anneeData = ['2017', '2018', '2019', '2020', '2021', '2022', '2023'] as const
const anneeDataValidator = z.enum(anneeData)
type AnneeData = z.infer<typeof anneeDataValidator>
const redevanceCommunale = {
  '2017': {
    auru: new Decimal(141.2),
    anti: new Decimal(11.20),
    arge: new Decimal(229.40),
    arse: new Decimal(621.30),
    aloh: new Decimal(540.30),
    bism: new Decimal(54.40),
    hydb: new Decimal(46.40),
    hyda: new Decimal(1388.30),
    hydd: new Decimal(8.00),
    cfxa: new Decimal(215.70),
    cuiv: new Decimal(18.10),
    hyde: new Decimal(7.30),
    etai: new Decimal(112.40),
    ferb: new Decimal(319.00),
    fera: new Decimal(463.00),
    fluo: new Decimal(702.40),
    coox: new Decimal(302.50),
    hydf: new Decimal(298.40),
    cfxb: new Decimal(826.00),
    cfxc: new Decimal(200.70),
    lith: new Decimal(46.30),
    mang: new Decimal(345.00),
    moly: new Decimal(229.40),
    hydc: new Decimal(1067.00),
    plom: new Decimal(582.80),
    kclx: new Decimal(243.30),
    naca: new Decimal(668.00),
    nacc: new Decimal(135.80),
    nacb: new Decimal(406.60),
    souf: new Decimal(2.60),
    wolf: new Decimal(126.20),
    uran: new Decimal(274.80),
    zinc: new Decimal(463.00),
    reference: 'https://beta.legifrance.gouv.fr/codes/id/LEGISCTA000006191913/2018-01-01',
  },
  '2018': {
    auru: new Decimal(145.3),
    anti: new Decimal(11.50),
    arge: new Decimal(236.10),
    arse: new Decimal(639.30),
    aloh: new Decimal(556.00),
    bism: new Decimal(56.00),
    hydb: new Decimal(47.60),
    hyda: new Decimal(1428.60),
    hydd: new Decimal(8.20),
    cfxa: new Decimal(222.00),
    cuiv: new Decimal(18.60),
    hyde: new Decimal(7.50),
    etai: new Decimal(115.70),
    ferb: new Decimal(328.30),
    fera: new Decimal(476.40),
    fluo: new Decimal(722.80),
    coox: new Decimal(311.30),
    hydf: new Decimal(307.10),
    cfxb: new Decimal(850.00),
    cfxc: new Decimal(206.50),
    lith: new Decimal(47.60),
    mang: new Decimal(355.00),
    moly: new Decimal(236.10),
    hydc: new Decimal(1067.00),
    plom: new Decimal(599.70),
    kclx: new Decimal(250.40),
    naca: new Decimal(687.40),
    nacc: new Decimal(139.70),
    nacb: new Decimal(418.40),
    souf: new Decimal(2.70),
    wolf: new Decimal(129.90),
    uran: new Decimal(282.80),
    zinc: new Decimal(476.40),
    reference: 'https://beta.legifrance.gouv.fr/codes/id/LEGISCTA000006191913/2019-01-01',
  },
  '2019': {
    auru: new Decimal(149.7),
    anti: new Decimal(11.80),
    arge: new Decimal(243.20),
    arse: new Decimal(658.50),
    aloh: new Decimal(572.70),
    bism: new Decimal(57.70),
    hydb: new Decimal(49.00),
    hyda: new Decimal(1471.50),
    hydd: new Decimal(8.40),
    cfxa: new Decimal(228.70),
    cuiv: new Decimal(19.20),
    hyde: new Decimal(7.70),
    etai: new Decimal(119.20),
    ferb: new Decimal(338.10),
    fera: new Decimal(490.70),
    fluo: new Decimal(744.50),
    coox: new Decimal(320.60),
    hydf: new Decimal(316.30),
    cfxb: new Decimal(875.50),
    cfxc: new Decimal(212.70),
    lith: new Decimal(49.00),
    mang: new Decimal(365.70),
    moly: new Decimal(243.20),
    hydc: new Decimal(1099.00),
    plom: new Decimal(617.70),
    kclx: new Decimal(257.90),
    naca: new Decimal(708.00),
    nacc: new Decimal(143.90),
    nacb: new Decimal(431.00),
    souf: new Decimal(2.80),
    wolf: new Decimal(133.80),
    uran: new Decimal(291.30),
    zinc: new Decimal(490.70),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006191913/2020-01-01',
  },
  '2020': {
    auru: new Decimal(153.6),
    anti: new Decimal(12.10),
    arge: new Decimal(249.50),
    arse: new Decimal(675.60),
    aloh: new Decimal(587.60),
    bism: new Decimal(59.20),
    hydb: new Decimal(50.30),
    hyda: new Decimal(1509.80),
    hydd: new Decimal(8.60),
    cfxa: new Decimal(234.60),
    cuiv: new Decimal(19.70),
    hyde: new Decimal(7.90),
    etai: new Decimal(122.30),
    ferb: new Decimal(346.90),
    fera: new Decimal(503.50),
    fluo: new Decimal(763.90),
    coox: new Decimal(328.90),
    hydf: new Decimal(324.50),
    cfxb: new Decimal(898.30),
    cfxc: new Decimal(218.20),
    lith: new Decimal(50.30),
    mang: new Decimal(375.20),
    moly: new Decimal(249.50),
    hydc: new Decimal(1127.60),
    plom: new Decimal(633.80),
    kclx: new Decimal(264.60),
    naca: new Decimal(726.40),
    nacc: new Decimal(147.60),
    nacb: new Decimal(442.20),
    souf: new Decimal(2.90),
    wolf: new Decimal(137.30),
    uran: new Decimal(298.90),
    zinc: new Decimal(503.50),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006191913/2020-07-25',
  },
  '2021': {
    auru: new Decimal(166.3),
    anti: new Decimal(13.10),
    arge: new Decimal(270.20),
    arse: new Decimal(731.70),
    aloh: new Decimal(636.40),
    bism: new Decimal(64.10),
    hydb: new Decimal(54.50),
    hyda: new Decimal(1635.10),
    hydd: new Decimal(9.30),
    cfxa: new Decimal(254.10),
    cuiv: new Decimal(21.30),
    hyde: new Decimal(8.60),
    etai: new Decimal(132.50),
    ferb: new Decimal(375.70),
    fera: new Decimal(545.30),
    fluo: new Decimal(827.30),
    coox: new Decimal(356.20),
    hydf: new Decimal(351.40),
    cfxb: new Decimal(972.90),
    cfxc: new Decimal(236.30),
    lith: new Decimal(54.50),
    mang: new Decimal(406.30),
    moly: new Decimal(270.20),
    hydc: new Decimal(1221.20),
    plom: new Decimal(686.40),
    kclx: new Decimal(286.60),
    naca: new Decimal(786.70),
    nacc: new Decimal(159.90),
    nacb: new Decimal(478.90),
    souf: new Decimal(3.10),
    wolf: new Decimal(148.70),
    uran: new Decimal(323.70),
    zinc: new Decimal(545.30),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000043663105/2021-06-12/',
  },
  '2022': {
    auru: new Decimal(175.4),
    anti: new Decimal(13.80),
    arge: new Decimal(285.10),
    arse: new Decimal(771.90),
    aloh: new Decimal(671.40),
    bism: new Decimal(67.60),
    hydb: new Decimal(57.50),
    hyda: new Decimal(1725.0),
    hydd: new Decimal(9.80),
    cfxa: new Decimal(268.10),
    cuiv: new Decimal(22.50),
    hyde: new Decimal(9.10),
    etai: new Decimal(139.80),
    ferb: new Decimal(396.40),
    fera: new Decimal(575.30),
    fluo: new Decimal(872.80),
    coox: new Decimal(375.80),
    hydf: new Decimal(370.70),
    cfxb: new Decimal(1026.40),
    cfxc: new Decimal(249.30),
    lith: new Decimal(57.50),
    mang: new Decimal(428.60),
    moly: new Decimal(285.10),
    hydc: new Decimal(1288.40),
    plom: new Decimal(724.20),
    kclx: new Decimal(302.40),
    naca: new Decimal(830.0),
    nacc: new Decimal(168.70),
    nacb: new Decimal(505.20),
    souf: new Decimal(3.30),
    wolf: new Decimal(156.90),
    uran: new Decimal(341.50),
    zinc: new Decimal(575.30),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000045765025/2022-05-07/',
  },
  '2023': {
    auru: new Decimal(183.5),
    anti: new Decimal(14.40),
    arge: new Decimal(298.20),
    arse: new Decimal(807.40),
    aloh: new Decimal(702.30),
    bism: new Decimal(70.70),
    hydb: new Decimal(60.10),
    hyda: new Decimal(1804.30),
    hydd: new Decimal(10.20),
    cfxa: new Decimal(280.40),
    cuiv: new Decimal(23.50),
    hyde: new Decimal(9.50),
    etai: new Decimal(146.20),
    ferb: new Decimal(414.60),
    fera: new Decimal(601.80),
    fluo: new Decimal(912.90),
    coox: new Decimal(393.10),
    hydf: new Decimal(387.70),
    cfxb: new Decimal(1073.60),
    cfxc: new Decimal(260.80),
    lith: new Decimal(60.10),
    mang: new Decimal(448.30),
    moly: new Decimal(298.20),
    hydc: new Decimal(1347.70),
    plom: new Decimal(757.50),
    kclx: new Decimal(316.30),
    naca: new Decimal(868.20),
    nacc: new Decimal(176.50),
    nacb: new Decimal(528.40),
    souf: new Decimal(3.40),
    wolf: new Decimal(164.10),
    uran: new Decimal(357.20),
    zinc: new Decimal(601.80),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000045765025/2023-06-03/',
  },
  } as const satisfies Record<AnneeData, Record<SubstanceFiscaleId, Decimal> & { reference: string }>

const redevanceDepartementale = {
  '2017': {
    auru: new Decimal(28.2),
    hyde: new Decimal(5.40),
    cuiv: new Decimal(3.70),
    cfxa: new Decimal(104.80),
    hyda: new Decimal(276.40),
    hydb: new Decimal(9.50),
    bism: new Decimal(11.10),
    aloh: new Decimal(108),
    arse: new Decimal(126.20),
    arge: new Decimal(45.70),
    anti: new Decimal(2.50),
    etai: new Decimal(22.30),
    ferb: new Decimal(66.40),
    fera: new Decimal(94.70),
    fluo: new Decimal(142.80),
    coox: new Decimal(61.80),
    hydf: new Decimal(435.70),
    cfxb: new Decimal(163.60),
    cfxc: new Decimal(44.50),
    lith: new Decimal(9.40),
    mang: new Decimal(69.80),
    moly: new Decimal(46.30),
    hydc: new Decimal(1371),
    plom: new Decimal(112.40),
    kclx: new Decimal(48.50),
    hydd: new Decimal(6.10),
    naca: new Decimal(135.80),
    nacc: new Decimal(26.30),
    nacb: new Decimal(80.20),
    souf: new Decimal(1.60),
    uran: new Decimal(54.60),
    wolf: new Decimal(24.70),
    zinc: new Decimal(94.70),
    reference: 'https://beta.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069577/LEGISCTA000006162672/2018-01-01/',
  },
  '2018': {
    auru: new Decimal(29),
    hyde: new Decimal(5.60),
    cuiv: new Decimal(3.80),
    cfxa: new Decimal(107.80),
    hyda: new Decimal(284.40),
    hydb: new Decimal(9.80),
    bism: new Decimal(11.40),
    aloh: new Decimal(111.10),
    arse: new Decimal(129.90),
    arge: new Decimal(47),
    anti: new Decimal(2.60),
    etai: new Decimal(22.90),
    ferb: new Decimal(68.30),
    fera: new Decimal(97.40),
    fluo: new Decimal(146.90),
    coox: new Decimal(63.60),
    hydf: new Decimal(448.30),
    cfxb: new Decimal(168.30),
    cfxc: new Decimal(45.80),
    lith: new Decimal(9.70),
    mang: new Decimal(71.80),
    moly: new Decimal(47.60),
    hydc: new Decimal(1371),
    plom: new Decimal(115.70),
    kclx: new Decimal(49.90),
    hydd: new Decimal(6.30),
    naca: new Decimal(139.70),
    nacc: new Decimal(27.10),
    nacb: new Decimal(82.50),
    souf: new Decimal(1.60),
    uran: new Decimal(56.20),
    wolf: new Decimal(25.40),
    zinc: new Decimal(97.40),
    reference: 'https://beta.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069577/LEGISCTA000006162672/2019-01-01/',
  },
  '2019': {
    auru: new Decimal(29.9),
    hyde: new Decimal(5.80),
    cuiv: new Decimal(3.90),
    cfxa: new Decimal(111.00),
    hyda: new Decimal(292.90),
    hydb: new Decimal(10.10),
    bism: new Decimal(11.70),
    aloh: new Decimal(114.40),
    arse: new Decimal(133.80),
    arge: new Decimal(48.40),
    anti: new Decimal(2.70),
    etai: new Decimal(23.60),
    ferb: new Decimal(70.30),
    fera: new Decimal(100.30),
    fluo: new Decimal(151.30),
    coox: new Decimal(65.50),
    hydf: new Decimal(461.70),
    cfxb: new Decimal(173.30),
    cfxc: new Decimal(47.20),
    lith: new Decimal(10.00),
    mang: new Decimal(74.00),
    moly: new Decimal(49.00),
    hydc: new Decimal(1412.10),
    plom: new Decimal(119.20),
    kclx: new Decimal(51.40),
    hydd: new Decimal(6.50),
    naca: new Decimal(143.90),
    nacc: new Decimal(27.90),
    nacb: new Decimal(85.00),
    souf: new Decimal(1.60),
    uran: new Decimal(57.90),
    wolf: new Decimal(26.20),
    zinc: new Decimal(100.30),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000038686694/2019-06-08/',
  },
  '2020': {
    auru: new Decimal(30.7),
    hyde: new Decimal(6.00),
    cuiv: new Decimal(4.00),
    cfxa: new Decimal(113.90),
    hyda: new Decimal(300.50),
    hydb: new Decimal(10.40),
    bism: new Decimal(12.00),
    aloh: new Decimal(117.40),
    arse: new Decimal(137.30),
    arge: new Decimal(49.70),
    anti: new Decimal(2.80),
    etai: new Decimal(24.20),
    ferb: new Decimal(72.10),
    fera: new Decimal(102.90),
    fluo: new Decimal(155.20),
    coox: new Decimal(67.20),
    hydf: new Decimal(473.70),
    cfxb: new Decimal(177.80),
    cfxc: new Decimal(48.40),
    lith: new Decimal(10.30),
    mang: new Decimal(75.90),
    moly: new Decimal(50.30),
    hydc: new Decimal(1448.80),
    plom: new Decimal(112.30),
    kclx: new Decimal(52.70),
    hydd: new Decimal(6.70),
    naca: new Decimal(147.60),
    nacc: new Decimal(28.60),
    nacb: new Decimal(87.20),
    souf: new Decimal(1.60),
    uran: new Decimal(59.40),
    wolf: new Decimal(26.90),
    zinc: new Decimal(102.90),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000042159975/2020-07-25/',
  },
  '2021': {
    auru: new Decimal(33.2),
    hyde: new Decimal(6.50),
    cuiv: new Decimal(4.30),
    cfxa: new Decimal(123.40),
    hyda: new Decimal(325.40),
    hydb: new Decimal(11.30),
    bism: new Decimal(13.0),
    aloh: new Decimal(127.10),
    arse: new Decimal(148.70),
    arge: new Decimal(53.80),
    anti: new Decimal(3.0),
    etai: new Decimal(26.20),
    ferb: new Decimal(78.10),
    fera: new Decimal(111.40),
    fluo: new Decimal(168.10),
    coox: new Decimal(72.80),
    hydf: new Decimal(513.0),
    cfxb: new Decimal(192.60),
    cfxc: new Decimal(52.40),
    lith: new Decimal(11.20),
    mang: new Decimal(82.20),
    moly: new Decimal(54.50),
    hydc: new Decimal(1569.10),
    plom: new Decimal(132.50),
    kclx: new Decimal(57.10),
    hydd: new Decimal(7.30),
    naca: new Decimal(159.90),
    nacc: new Decimal(31.0),
    nacb: new Decimal(94.40),
    souf: new Decimal(1.70),
    uran: new Decimal(64.30),
    wolf: new Decimal(29.10),
    zinc: new Decimal(111.40),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000043663002/2021-06-12/',
  },
  '2022': {
    auru: new Decimal(35.0),
    hyde: new Decimal(6.90),
    cuiv: new Decimal(4.50),
    cfxa: new Decimal(130.20),
    hyda: new Decimal(343.30),
    hydb: new Decimal(11.90),
    bism: new Decimal(13.70),
    aloh: new Decimal(134.10),
    arse: new Decimal(156.90),
    arge: new Decimal(56.80),
    anti: new Decimal(3.20),
    etai: new Decimal(27.60),
    ferb: new Decimal(82.40),
    fera: new Decimal(117.50),
    fluo: new Decimal(177.30),
    coox: new Decimal(76.80),
    hydf: new Decimal(541.20),
    cfxb: new Decimal(203.20),
    cfxc: new Decimal(55.30),
    lith: new Decimal(11.80),
    mang: new Decimal(86.70),
    moly: new Decimal(57.50),
    hydc: new Decimal(1655.40),
    plom: new Decimal(139.80),
    kclx: new Decimal(60.20),
    hydd: new Decimal(7.70),
    naca: new Decimal(168.70),
    nacc: new Decimal(32.70),
    nacb: new Decimal(99.60),
    souf: new Decimal(1.80),
    uran: new Decimal(67.80),
    wolf: new Decimal(30.70),
    zinc: new Decimal(117.50),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000045764991/2022-05-07/',
  },
  '2023': {
    auru: new Decimal(36.6),
    hyde: new Decimal(7.20),
    cuiv: new Decimal(4.70),
    cfxa: new Decimal(136.20),
    hyda: new Decimal(359.10),
    hydb: new Decimal(12.40),
    bism: new Decimal(14.30),
    aloh: new Decimal(140.30),
    arse: new Decimal(164.10),
    arge: new Decimal(59.40),
    anti: new Decimal(3.30),
    etai: new Decimal(28.90),
    ferb: new Decimal(86.20),
    fera: new Decimal(122.90),
    fluo: new Decimal(185.50),
    coox: new Decimal(80.30),
    hydf: new Decimal(566.10),
    cfxb: new Decimal(212.50),
    cfxc: new Decimal(57.80),
    lith: new Decimal(12.30),
    mang: new Decimal(90.70),
    moly: new Decimal(60.10),
    hydc: new Decimal(1731.50),
    plom: new Decimal(146.20),
    kclx: new Decimal(63),
    hydd: new Decimal(8.10),
    naca: new Decimal(176.50),
    nacc: new Decimal(34.20),
    nacb: new Decimal(104.20),
    souf: new Decimal(1.90),
    uran: new Decimal(70.90),
    wolf: new Decimal(32.10),
    zinc: new Decimal(122.90),
    reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000045764991/2023-06-03/',
  },
} as const satisfies Record<AnneeData, Record<SubstanceFiscaleId, Decimal> & { reference: string }>

export type EntrepriseCategory = 'pme' | 'autre'
const categoriesForTaxeAurifereGuyane = {
  pme: {
    '2017': {
      value: new Decimal(362.95),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036016552/2018-01-01',
    },
    '2018': {
      value: new Decimal(358.3),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037342798/2019-01-01',
    },
    '2019': {
      value: new Decimal(345.23),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000039355892/2020-01-01',
    },
    '2020': {
      value: new Decimal(400.35),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042327688/2020-09-13',
    },
    '2021': {
      value: new Decimal(498.06),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044329274/2021-11-17',
    },
    '2022': {
      value: new Decimal(488.97),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044329274/2022-07-27/',
    },
    '2023': {
      value: new Decimal(549.88),
      reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000048046958/2023-09-07',
    },
  },
  autre: {
    '2017': {
      value: new Decimal(725.9),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036016552/2018-01-01',
    },
    '2018': {
      value: new Decimal(716.6),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037342798/2019-01-01',
    },
    '2019': {
      value: new Decimal(690.47),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000039355892/2020-01-01',
    },
    '2020': {
      value: new Decimal(800.71),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042327688/2020-09-13',
    },
    '2021': {
      value: new Decimal(996.13),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044329274/2021-11-17',
    },
    '2022': {
      value: new Decimal(977.95),
      reference: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044329274/2022-07-27/',
    },
    '2023': {
      value: new Decimal(1099.77),
      reference: 'https://www.legifrance.gouv.fr/codes/id/LEGIARTI000048046958/2023-09-07',
    },
  },
} as const satisfies Record<EntrepriseCategory, Record<AnneeData, { value: Decimal; reference: string }>>

export const getRedevanceCommunale = (annee: CaminoAnnee, substanceId: SubstanceFiscaleId): Decimal => {
  const {success, data} = anneeDataValidator.safeParse(annee)
  if (!success) {
    if (annee <= anneeData[0]) {
      throw new Error('Impossible de calculer la redevance pour cette année (données absentes)')
    }

    return redevanceCommunale[anneeData[anneeData.length -1]][substanceId]
  } else {
    return redevanceCommunale[data][substanceId]
  }
}

export const getRedevanceDepartementale = (annee: CaminoAnnee, substanceId: SubstanceFiscaleId): Decimal => {
  const {success, data} = anneeDataValidator.safeParse(annee)
  if (!success) {
    if (annee <= anneeData[0]) {
      throw new Error('Impossible de calculer la redevance pour cette année (données absentes)')
    }

    return redevanceDepartementale[anneeData[anneeData.length -1]][substanceId]
  } else {
    return redevanceDepartementale[data][substanceId]
  }
}

export const getCategoriesForTaxeAurifereGuyane = (annee: CaminoAnnee, category: EntrepriseCategory): Decimal => {
  const {success, data} = anneeDataValidator.safeParse(annee)
  if (!success) {
    if (annee <= anneeData[0]) {
      throw new Error('Impossible de calculer la redevance pour cette année (données absentes)')
    }

    return categoriesForTaxeAurifereGuyane[category][anneeData[anneeData.length -1]].value
  } else {
    return categoriesForTaxeAurifereGuyane[category][data].value
  }
}


type TarifsBySubstances = Record<SubstanceFiscaleId, { tarifDepartemental: Decimal; tarifCommunal: Decimal }>
export const getAllTarifsBySubstances = (annee: CaminoAnnee): TarifsBySubstances => {
let {success, data} = anneeDataValidator.safeParse(annee)
if (!success) {
  if (annee <= anneeData[0]) {
    throw new Error('Impossible de calculer la redevance pour cette année (données absentes)')
  }

  data = anneeData[anneeData.length -1]
}
if (isNullOrUndefined(data)) {
  throw new Error('cas impossible, pour typescript seulement')
}

return {
    auru: {
      tarifCommunal: redevanceCommunale[data].auru,
      tarifDepartemental: redevanceDepartementale[data].auru
    },
    aloh: {
      tarifDepartemental: redevanceDepartementale[data].aloh,
      tarifCommunal: redevanceCommunale[data].aloh
    },
    anti: {
      tarifDepartemental: redevanceDepartementale[data].anti,
      tarifCommunal: redevanceCommunale[data].anti
    },
    arge: {
      tarifDepartemental: redevanceDepartementale[data].arge,
      tarifCommunal: redevanceCommunale[data].arge
    },
    arse: {
      tarifDepartemental: redevanceDepartementale[data].arse,
      tarifCommunal: redevanceCommunale[data].arse
    },
    bism: {
      tarifDepartemental: redevanceDepartementale[data].bism,
      tarifCommunal: redevanceCommunale[data].bism
    },
    cfxa: {
      tarifDepartemental: redevanceDepartementale[data].cfxa,
      tarifCommunal: redevanceCommunale[data].cfxa
    },
    cfxb: {
      tarifDepartemental: redevanceDepartementale[data].cfxb,
      tarifCommunal: redevanceCommunale[data].cfxb
    },
    cfxc: {
      tarifDepartemental: redevanceDepartementale[data].cfxc,
      tarifCommunal: redevanceCommunale[data].cfxc
    },
    coox: {
      tarifDepartemental: redevanceDepartementale[data].coox,
      tarifCommunal: redevanceCommunale[data].coox
    },
    cuiv: {
      tarifDepartemental: redevanceDepartementale[data].cuiv,
      tarifCommunal: redevanceCommunale[data].cuiv
    },
    etai: {
      tarifDepartemental: redevanceDepartementale[data].etai,
      tarifCommunal: redevanceCommunale[data].etai
    },
    fera: {
      tarifDepartemental: redevanceDepartementale[data].fera,
      tarifCommunal: redevanceCommunale[data].fera
    },
    ferb: {
      tarifDepartemental: redevanceDepartementale[data].ferb,
      tarifCommunal: redevanceCommunale[data].ferb
    },
    fluo: {
      tarifDepartemental: redevanceDepartementale[data].fluo,
      tarifCommunal: redevanceCommunale[data].fluo
    },
    hyda: {
      tarifDepartemental: redevanceDepartementale[data].hyda,
      tarifCommunal: redevanceCommunale[data].hyda
    },
    hydb: {
      tarifDepartemental: redevanceDepartementale[data].hydb,
      tarifCommunal: redevanceCommunale[data].hydb
    },
    hydc: {
      tarifDepartemental: redevanceDepartementale[data].hydc,
      tarifCommunal: redevanceCommunale[data].hydc
    },
    hydd: {
      tarifDepartemental: redevanceDepartementale[data].hydd,
      tarifCommunal: redevanceCommunale[data].hydd
    },
    hyde: {
      tarifDepartemental: redevanceDepartementale[data].hyde,
      tarifCommunal: redevanceCommunale[data].hyde
    },
    hydf: {
      tarifDepartemental: redevanceDepartementale[data].hydf,
      tarifCommunal: redevanceCommunale[data].hydf
    },
    kclx: {
      tarifDepartemental: redevanceDepartementale[data].kclx,
      tarifCommunal: redevanceCommunale[data].kclx
    },
    lith: {
      tarifDepartemental: redevanceDepartementale[data].lith,
      tarifCommunal: redevanceCommunale[data].lith
    },
    mang: {
      tarifDepartemental: redevanceDepartementale[data].mang,
      tarifCommunal: redevanceCommunale[data].mang
    },
    moly: {
      tarifDepartemental: redevanceDepartementale[data].moly,
      tarifCommunal: redevanceCommunale[data].moly
    },
    naca: {
      tarifDepartemental: redevanceDepartementale[data].naca,
      tarifCommunal: redevanceCommunale[data].naca
    },
    nacb: {
      tarifDepartemental: redevanceDepartementale[data].nacb,
      tarifCommunal: redevanceCommunale[data].nacb
    },
    nacc: {
      tarifDepartemental: redevanceDepartementale[data].nacc,
      tarifCommunal: redevanceCommunale[data].nacc
    },
    plom: {
      tarifDepartemental: redevanceDepartementale[data].plom,
      tarifCommunal: redevanceCommunale[data].plom
    },
    souf: {
      tarifDepartemental: redevanceDepartementale[data].souf,
      tarifCommunal: redevanceCommunale[data].souf
    },
    uran: {
      tarifDepartemental: redevanceDepartementale[data].uran,
      tarifCommunal: redevanceCommunale[data].uran
    },
    wolf: {
      tarifDepartemental: redevanceDepartementale[data].wolf,
      tarifCommunal: redevanceCommunale[data].wolf
    },
    zinc: {
      tarifDepartemental: redevanceDepartementale[data].zinc,
      tarifCommunal: redevanceCommunale[data].zinc
    }
  }
}

// 2009-01-01: https://www.legifrance.gouv.fr/codes/id/LEGIARTI000020058692/2009-01-01
// 2016-01-01: https://www.legifrance.gouv.fr/codes/id/LEGIARTI000031817025/2016-01-01
export const taxeAurifereGuyaneDeductionMontantMax = new Decimal(5000)

// 2009-01-01: https://www.legifrance.gouv.fr/codes/id/LEGIARTI000020058692/2009-01-01
// 2016-01-01: https://www.legifrance.gouv.fr/codes/id/LEGIARTI000031817025/2016-01-01
export const taxeAurifereBrutDeductionTaux = new Decimal(0.45)
