import { FunctionalComponent } from 'vue'
import map from './road-map.svg'
import dashboard from './dashboard.svg'
import api from './code-s-slash.svg'
import building from './building.svg'
import earth from './earth.svg'
import team from './team.svg'
import nonEnergetique from './gallery-non-energetique.jpg'
import energetique from './gallery-energetique.jpg'
import travaux from './gallery-travaux.jpg'
import apresmine from './gallery-apresmine.jpg'
import stockages from './gallery-stockages.jpg'
import geothermie from './gallery-geothermie.jpg'

export const About: FunctionalComponent = () => {
  return (
    <div>
      <h1>À propos</h1>
      <div>
        <h2> L'accès aux informations sur les projets miniers est trop complexe </h2>
        <div class="fr-callout">
          <h3 class="fr-callout__title">Ce qu'il faut changer</h3>
          <p class="fr-callout__text">
            Pour les entreprises minières, gérer un projet d’exploration ou d’exploitation est un parcours du combattant, de la conception du projet jusqu'à la gestion de l'après-mine.
          </p>
        </div>

        <p>
          Quel est l’état juridique du domaine minier sur la zone ? Quelles démarches administratives dois-je suivre ? Quelles contraintes environnementales dois-je intégrer à mon projet ? Toutes ces
          questions essentielles ne trouvent pas simplement de réponses.
        </p>
        <p>
          Déposer une demande, actualiser les milliers de pages de dossiers papiers, tracer sa demande dans les multiples services de l’État impliqués, faire ses déclarations au bon moment et au bon
          format, sont <b>autant de démarches complexes et consommatrices de temps.</b>
        </p>
        <p>
          De son côté,
          <b> l’administration traite chaque année près de 2 000 démarches conduites au titre du code minier, </b>
          avec des systèmes d’information fermés, des tableaux de suivi pléthoriques, des archives papier et des gigaoctets de dossiers dispersés dans ses services nationaux et locaux.
        </p>
        <p>
          <b> L’enregistrement, la consultation et la valorisation des données de l’administration des mines est impossible ou trop peu efficace</b>.
        </p>
      </div>
      <p>
        <b> Sur le terrain, les citoyens et les élus ne découvrent les projets qui les concernent qu’au dernier moment, lors d’une consultation ou d’une enquête publique. </b>
        Ils se disent souvent pris de cours face à des dossiers complexes ou volumineux et faute d’accès simple et durable aux informations sur les projets miniers.
      </p>
      <p>
        <b> Une telle situation ne permet pas d’engager des débats ouverts, éclairés et sereins sur les projets miniers en France. </b>
      </p>

      <h2>Pour simplifier la vie de toutes les parties prenantes</h2>
      <div class="fr-callout">
        <h3 class="fr-callout__title">Camino numérise l'administration des mines</h3>
        <p class="fr-callout__text">Camino va simplifier les démarches des entreprises, ouvrir les données aux citoyens et faciliter le travail des agents publics impliqués dans ces projets.</p>
      </div>

      <div class="fr-grid-row fr-grid-row--gutters">
        <AboutCard
          isSvg={true}
          title="Les entreprises"
          description="Elles pourront connaitre l’état du domaine minier puis déposer en ligne leurs demandes, les rapports et les données réglementaires. Elles pourront aussi visualiser l’avancement des
        instructions, suivre leur portefeuille de titres et répondre simplement à leurs obligations à chaque étape des projets."
          imgSrc={building}
        />

        <AboutCard
          isSvg={true}
          title="Les ONG, les citoyens et leurs élus"
          description="Ils pourront consulter à tout moment les dossiers et les données publiques, à l’échelle de leur territoire pour mieux contribuer, sans précipitation, aux procédures de participation
                          du public et suivre de manière transparente l’actualité des projets."
          imgSrc={earth}
        />
        <AboutCard
          isSvg={true}
          title="Les agents publics"
          description="Ils pourront simplement accéder aux mêmes dossiers et données partagés entre les services des administrations et opérateurs publics. Il sera possible de co-instruire les demandes, de
                          suivre et anticiper chaque moment de vie d’un projet, de trouver et valoriser les données sur le domaine minier national simplement et sans intermédiaire.
                    "
          imgSrc={team}
        />
      </div>

      <h2 class="fr-pt-4w">Avec de nouveaux services numériques</h2>
      <div class="fr-callout">
        <h3 class="fr-callout__title">Camino change l'administration des mines</h3>
        <p class="fr-callout__text">
          Avec Camino, il sera enfin possible de consulter les caractéristiques des titres miniers sur une carte à jour et de suivre les projets en cours à chaque étape importante de leur vie.
        </p>
      </div>
      <div class="fr-grid-row fr-grid-row--gutters">
        <AboutCard isSvg={true} title="Une carte intéractive" description="Nous présenterons une cartographie complète et à jour du domaine minier national et des projets en cours." imgSrc={map} />
        <AboutCard
          isSvg={true}
          title="Des tableaux de bord"
          description="Nous dématérialiserons les premières procédures les plus fréquentes du code minier et proposerons un tableau de bord aux entreprises qui expérimenteront le service Camino."
          imgSrc={dashboard}
        />
        <AboutCard
          isSvg={true}
          title="Une API ouverte"
          description="Avec les données recueillies, nous automatiserons l’actualisation du cadastre minier et nous diffuserons dans un standard électronique ouvert les données et documents publics déjà
                          disponibles d’ici six mois, notamment via data.gouv.fr."
          imgSrc={api}
        />
      </div>

      <h2 class="fr-pt-4w">D'ici 2022 l'ensemble des procédures du code minier devront être numériques</h2>
      <div class="fr-grid-row fr-grid-row--gutters">
        <AboutCard
          isSvg={false}
          title="Ressources minérales non-énergétiques"
          description="Les matières premières minérales sont à la base du développement de l’humanité. En 200 ans, l’ère industrielle puis la croissance économique des pays émergents ont accéléré l’utilisation
                      de ces ressources non renouvelables du sous-sol. Leur développement durable s’appuie sur l’équilibre entre l’extraction des réserves accessibles et la découverte de nouveaux gisements,
                      le recyclage et l’économie circulaire."
          imgSrc={nonEnergetique}
          imgAlt="Mine de sel"
        />
        <AboutCard
          isSvg={false}
          title="Matières premières énergétiques"
          description="Les matières premières énergétiques comme le charbon, le pétrole ou le gaz se sont imposées en tant que source d’énergie au cours du 20ème siècle. Formées dans des processus géologiques
                        qui ont duré plusieurs millions d’années, elles ne sont pas renouvelables à l’échelle humaine et il est donc nécessaire de veiller à en avoir un usage rationnel."
          imgSrc={energetique}
          imgAlt="Forage"
        />
        <AboutCard
          isSvg={false}
          title="Stockages souterrains"
          description="Les capacités de stockage dans le sous-sol profond ont d’abord été utilisées pour compléter le dispositif de sécurité d’approvisionnement dans des territoires ne disposant pas ou peu de
                        matières premières énergétiques. Ces capacités sont aujourd’hui étudiées pour des usages futurs comme le stockage de CO2 pour réduire les émissions de GES dans l’atmosphère ou pour le
                        stockage d’énergie en association avec les énergies alternatives."
          imgSrc={stockages}
          imgAlt="Station de contrôle"
        />{' '}
        <AboutCard
          isSvg={false}
          title="Géothermie profonde"
          description="Provenant des sources de chaleur interne de la Terre, cette énergie abondante mais de faible intensité est en train de trouver sa place dans le mix énergétique du 21ème siècle."
          imgSrc={geothermie}
          imgAlt="Centrale géothermique"
        />{' '}
        <AboutCard
          isSvg={false}
          title="Travaux miniers"
          description="Les travaux de recherche ou d’exploitation de substances minières sont encadrés par la police des mines, mission confiée à l’État, qui a pour objet de prévenir et faire cesser les
                                  dommages et nuisances liées aux activités minières et de faire respecter les obligations de l’exploitant minier."
          imgSrc={travaux}
        />{' '}
        <AboutCard
          isSvg={false}
          title="Après mines"
          description="L’arrêt de l’activité minière n’induit pas pour autant la disparition des phénomènes susceptibles d’affecter les terrains de surface situés dans l’emprise de l’ancienne exploitation.
                                       Ainsi, durant la période qui suit l’exploitation, traditionnellement appelée «&nbsp;après-mine&nbsp;», des désordres peuvent se développer, parfois dès l’arrêt des travaux mais également beaucoup
                                       plus tardivement."
          imgSrc={apresmine}
        />
      </div>
    </div>
  )
}

const AboutCard: FunctionalComponent<{ title: string; description: string; imgSrc: string; imgAlt?: string; isSvg: boolean }> = props => {
  return (
    <div class="fr-col-12 fr-col-md-6 fr-col-lg-4">
      <div class="fr-card">
        <div class="fr-card__body">
          <div class="fr-card__content">
            <h3 class="fr-card__title">{props.title}</h3>
            <p class="fr-card__desc">{props.description}</p>
          </div>
        </div>
        <div class={{ 'fr-card__header': true, 'fr-pt-4w': props.isSvg }} style={props.isSvg ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}>
          <div class="fr-card__img">
            <img class="fr-responsive-img" src={props.imgSrc} alt={props.imgAlt ?? props.title} style={props.isSvg ? { width: 'auto', height: '100%' } : {}} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Demandé par le router car utilisé dans un import asynchrone /shrug
About.displayName = 'About'
