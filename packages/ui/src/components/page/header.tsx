import { FunctionalComponent } from 'vue'
import './dsfr.module'
import { Role, User } from 'camino-common/src/roles'
import { QuickAccessTitre } from '@/components/page/quick-access-titre'

interface Props {
  loaded?: boolean
  user: User
  routeName: string
}

// FIXME
// @ts-ignore
// eslint-disable-next-line no-undef
dsfr.start()

type Link = { label: string; path: string }
type LinkList = { label: string; sublinks: Link[] }
const links = {
  TITRES_ET_AUTORISATIONS: { label: 'Titres et autorisations', path: 'titres' },
  DEMARCHES: { label: 'Démarches', path: 'demarches' },
  TRAVAUX: { label: 'Travaux', path: 'travaux' },
  ACTIVITES: { label: 'Activités', path: 'activites' },
  ENTREPRISES: { label: 'Entreprises', path: 'entreprises' },
  UTILISATEURS: { label: 'Utilisateurs', path: 'utilisateurs' },
  ADMINISTRATIONS: { label: 'Administrations', path: 'administrations' },
  METAS: { label: 'Métas', path: 'metas' },
  JOURNAUX: { label: 'Journaux', path: 'journaux' },
  TABLEAU_DE_BORD: { label: 'Tableau de bord', path: 'dashboard' },
} as const satisfies Record<string, Link>

const isDirectLink = (link: Link | LinkList): link is Link => Object.hasOwn(link, 'path')

const ANNUAIRE = { label: 'Annuaire', sublinks: [links.ENTREPRISES, links.ADMINISTRATIONS, links.UTILISATEURS] }
const linksByRole: Record<Role, (Link | LinkList)[]> = {
  super: [links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, links.ACTIVITES, ANNUAIRE, links.METAS, links.JOURNAUX],
  admin: [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, links.ACTIVITES, ANNUAIRE],
  editeur: [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, ANNUAIRE],
  lecteur: [links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, ANNUAIRE],
  entreprise: [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.ACTIVITES, ANNUAIRE],
  'bureau d’études': [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, ANNUAIRE],
  defaut: [links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, { label: 'Annuaire', sublinks: [links.ENTREPRISES, links.ADMINISTRATIONS] }],
}

const HeaderLinks: FunctionalComponent<Pick<Props, 'user'>> = props => {
  const loginUrl = '/oauth2/sign_in?rd=' + encodeURIComponent(window.location.href)
  const logoutUrl = '/apiUrl/deconnecter'

  return (
    <ul class="fr-btns-group">
      {props.user ? (
        <>
          <li>
            <router-link class="fr-btn fr-icon-account-fill" to={`/utilisateurs/${props.user.id}`}>
              {`${props.user.nom} ${props.user.prenom}`}
            </router-link>
          </li>
          <li>
            <a class="fr-btn fr-icon-lock-line" href={logoutUrl}>
              Se déconnecter
            </a>
          </li>
        </>
      ) : (
        <li>
          <a class="fr-btn fr-icon-lock-fill" href={loginUrl}>
            Se connecter / S’enregistrer
          </a>
        </li>
      )}
    </ul>
  )
}

export const Header: FunctionalComponent<Props> = props => {
  // FIXME
  // const logout = () => {
  //   if (matomo) {
  //     // @ts-ignore
  //     matomo.trackEvent('menu-utilisateur', 'menu-utilisateur', 'deconnexion')
  //   }
  // }

  const getAriaCurrent = (link: LinkList): { 'aria-current'?: true } => (link.sublinks.some(({ path }) => path === props.routeName) ? { 'aria-current': true } : {})

  return (
    <div class="dsfr" style={{ paddingBottom: '20px' }}>
      <header role="banner" class="fr-header">
        <div class="fr-header__body">
          <div class="fr-container">
            <div class="fr-header__body-row">
              <div class="fr-header__brand fr-enlarge-link">
                <div class="fr-header__brand-top">
                  <div class="fr-header__logo">
                    <p class="fr-logo">
                      République
                      <br />
                      française
                    </p>
                  </div>
                  <div class="fr-header__navbar">
                    <button class="fr-btn--search fr-btn" data-fr-opened="false" aria-controls="modal-474" id="button-475" title="Rechercher">
                      Rechercher
                    </button>
                    <button class="fr-btn--menu fr-btn" data-fr-opened="false" aria-controls="modal-476" aria-haspopup="menu" id="button-477" title="Menu">
                      Menu
                    </button>
                  </div>
                </div>
                <div class="fr-header__service">
                  <a href="/" title="Accueil - Camino - République Française">
                    <p class="fr-header__service-title">Camino</p>
                  </a>
                  <p class="fr-header__service-tagline">Le cadastre minier numérique</p>
                </div>
              </div>
              <div class="fr-header__tools">
                <div class="fr-header__tools-links">
                  <HeaderLinks user={props.user} />
                </div>
                <div class="fr-header__search fr-modal" id="modal-474">
                  <div class="fr-container">
                    <button class="fr-btn--close fr-btn" aria-controls="modal-474" title="Fermer">
                      Fermer
                    </button>
                    <div class="fr-search-bar" id="search-473" role="search">
                      <label class="fr-label" for="search-473-input">
                        Rechercher
                      </label>
                      <QuickAccessTitre id="search-473-input" />
                      <button class="fr-btn" title="Rechercher">
                        Rechercher
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="fr-header__menu fr-modal" id="modal-476" aria-labelledby="button-477">
          <div class="fr-container">
            <button class="fr-btn--close fr-btn" aria-controls="modal-476" title="Fermer">
              Fermer
            </button>
            <div class="fr-header__menu-links">
              <HeaderLinks user={props.user} />
            </div>
            <nav class="fr-nav" id="navigation-478" role="navigation" aria-label="Menu principal">
              <ul class="fr-nav__list">
                {linksByRole[props.user?.role ?? 'defaut'].map((link, index) => (
                  <li key={link.label} class="fr-nav__item">
                    {isDirectLink(link) ? (
                      <router-link class="fr-nav__link" to={link.path} target="_self">
                        {link.label}
                      </router-link>
                    ) : (
                      <>
                        <button class="fr-nav__btn" aria-expanded="false" aria-controls={`collapse-${index}`} {...getAriaCurrent(link)}>
                          {link.label}
                        </button>
                        <div class="fr-collapse fr-menu" id={`collapse-${index}`}>
                          <ul class="fr-menu__list">
                            {link.sublinks.map((sublink, subIndex) => (
                              <li key={sublink.label}>
                                <router-link class="fr-nav__link" to={sublink.path} target="_self" id={`nav-${index}-${subIndex}`}>
                                  {sublink.label}
                                </router-link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </div>
  )
}
