import { computed, FunctionalComponent, onMounted, ref } from 'vue'
import { Role, User } from 'camino-common/src/roles'
import { canReadActivites } from 'camino-common/src/permissions/activites'
import { QuickAccessTitre } from '@/components/page/quick-access-titre'
import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { MenuSection, TrackEventFunction } from '@/utils/matomo'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'

interface Props {
  user: User
  currentMenuSection: MenuSection | null
  trackEvent: TrackEventFunction
  routePath: string
}

type Link = { label: string; path: MenuSection }
type LinkList = { label: string; sublinks: Link[] }
const links = {
  TITRES_ET_AUTORISATIONS: { label: 'Titres et autorisations', path: 'titres' },
  DEMARCHES: { label: 'Démarches', path: 'demarches' },
  TRAVAUX: { label: 'Travaux', path: 'travaux' },
  ACTIVITES: { label: 'Activités', path: 'activites' },
  STATISTIQUES: { label: 'Statistiques', path: 'statistiques' },
  ENTREPRISES: { label: 'Entreprises', path: 'entreprises' },
  UTILISATEURS: { label: 'Utilisateurs', path: 'utilisateurs' },
  ADMINISTRATIONS: { label: 'Administrations', path: 'administrations' },
  METAS: { label: 'Métas', path: 'metas' },
  JOURNAUX: { label: 'Journaux', path: 'journaux' },
  TABLEAU_DE_BORD: { label: 'Tableau de bord', path: 'dashboard' },
} as const satisfies Record<string, Link>

const isDirectLink = (link: Link | LinkList): link is Link => Object.prototype.hasOwnProperty.call(link, 'path')

const ANNUAIRE = { label: 'Annuaire', sublinks: [links.ENTREPRISES, links.ADMINISTRATIONS, links.UTILISATEURS] }

const HeaderLinks: FunctionalComponent<Pick<Props, 'user' | 'trackEvent' | 'routePath'> & { userLinkClicked: () => void }> = props => {
  const loginUrl = '/oauth2/sign_in?rd=' + encodeURIComponent(`${window.location.origin}${props.routePath}`)
  const logoutUrl = '/apiUrl/deconnecter'

  const logout = () => {
    props.trackEvent('menu-utilisateur', 'menu-utilisateur', 'deconnexion')
  }

  const login = () => {
    props.trackEvent('menu', 'bouton', 'utilisateur')
  }

  return (
    <div class="fr-btns-group">
      {props.user ? (
        <>
          <div>
            <router-link class="fr-btn fr-icon-account-fill" to={`/utilisateurs/${props.user.id}`} onClick={props.userLinkClicked}>
              {`${props.user.nom} ${props.user.prenom}`}
            </router-link>
          </div>
          <div>
            <a class="fr-btn fr-icon-lock-line" href={logoutUrl} onClick={logout}>
              Se déconnecter
            </a>
          </div>
        </>
      ) : (
        <div>
          <a class="fr-btn fr-icon-lock-fill" href={loginUrl} onClick={login}>
            Se connecter / S’enregistrer
          </a>
        </div>
      )}
    </div>
  )
}

export const Header = caminoDefineComponent<Props>(['user', 'currentMenuSection', 'trackEvent', 'routePath'], props => {
  const getAriaCurrent = (link: LinkList): { 'aria-current'?: true } => (link.sublinks.some(({ path }) => path === props.currentMenuSection) ? { 'aria-current': true } : {})

  const getAriaPage = (link: Link): { 'aria-current'?: 'page' } => {
    return link.path === props.currentMenuSection ? { 'aria-current': 'page' } : {}
  }

  // Permet d'activer le menu déroulant sur annuaire
  onMounted(() => {
    setTimeout(() => {
      try {
        dsfr.start()
      } catch (e) {
        console.error('impossible de lancer le js du dsfr')
      }
    }, 1000)
  })

  const navigationModalId = 'headerNavigationModalId'
  const searchModalId = 'headerSearchModalId'
  const navigationId = 'headerNavigationId'

  const linkClick = (path: Link['path']) => {
    // On ferme la modale
    modalMenuOpened.value = false
    if (path !== 'journaux') {
      props.trackEvent('menu-sections', 'menu-section', path)
    }
  }

  const sublinkClick = (path: Link['path']) => {
    // On ferme le menu déroulant d’annuaire
    const navigationElement = document.getElementById(navigationId)
    if (navigationElement) {
      const members = dsfr(navigationElement).navigation.members
      if (isNotNullNorUndefinedNorEmpty(members)) {
        members[0].conceal()
      }
    }
    linkClick(path)
  }
  const linksByRole = computed<Record<Role, (Link | LinkList)[]>>(() => {
    const linkActivites = canReadActivites(props.user) ? [links.ACTIVITES] : []

    return {
      super: [links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, ...linkActivites, links.STATISTIQUES, ANNUAIRE, links.METAS, links.JOURNAUX],
      admin: [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, ...linkActivites, links.STATISTIQUES, ANNUAIRE],
      editeur: [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, ...linkActivites, links.STATISTIQUES, ANNUAIRE],
      lecteur: [links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.TRAVAUX, links.STATISTIQUES, ANNUAIRE],
      entreprise: [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, ...linkActivites, links.STATISTIQUES, ANNUAIRE],
      'bureau d’études': [links.TABLEAU_DE_BORD, links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.STATISTIQUES, ANNUAIRE],
      defaut: [links.TITRES_ET_AUTORISATIONS, links.DEMARCHES, links.STATISTIQUES, { label: 'Annuaire', sublinks: [links.ENTREPRISES, links.ADMINISTRATIONS] }],
    }
  })

  const modalMenuOpened = ref<boolean>(false)
  const modalSearchOpened = ref<boolean>(false)

  const closeModals = () => {
    modalMenuOpened.value = false
    modalSearchOpened.value = false
  }

  const openModalMenu = () => {
    modalMenuOpened.value = true
  }

  const openModalSearch = () => {
    modalSearchOpened.value = true
  }

  return () => (
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
                  <nav class="fr-header__navbar" role="navigation">
                    <button class="fr-btn--search fr-btn" data-fr-opened="false" onClick={openModalSearch} aria-controls={searchModalId} aria-haspopup="dialog" id="button-search" title="Rechercher">
                      Rechercher
                    </button>
                    <button class="fr-btn--menu fr-btn" data-fr-opened="false" onClick={openModalMenu} aria-controls={navigationModalId} aria-haspopup="dialog" id="button-menu" title="Menu">
                      Menu
                    </button>
                  </nav>
                </div>
                <div class="fr-header__service">
                  <router-link to={{ name: 'homepage' }} title="Accueil - Camino - République Française">
                    <p class="fr-header__service-title">Camino</p>
                  </router-link>
                  <p class="fr-header__service-tagline">Le cadastre minier numérique</p>
                </div>
              </div>
              <div class="fr-header__tools">
                <div class="fr-header__tools-links">
                  <HeaderLinks user={props.user} trackEvent={props.trackEvent} routePath={props.routePath} userLinkClicked={closeModals} />
                </div>
                <div class={`fr-header__search fr-modal ${modalSearchOpened.value ? 'fr-modal--opened' : ''}`} id={searchModalId} aria-labelledby="button-search" aria-label="Recherche dans le site">
                  <div class="fr-container">
                    <DsfrButtonIcon
                      icon="fr-icon-close-line"
                      buttonType="tertiary-no-outline"
                      onClick={closeModals}
                      aria-controls={searchModalId}
                      title="Fermer la fenêtre de dialogue"
                      label="Fermer"
                      class="fr-btn--close"
                    />
                    <QuickAccessTitre id="search-473-input" onSelectTitre={closeModals} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class={`fr-header__menu fr-modal ${modalMenuOpened.value ? 'fr-modal--opened' : ''}`} id={navigationModalId} aria-labelledby="button-menu" aria-label="Connexion et menu de navigation">
          <div class="fr-container">
            <DsfrButtonIcon
              icon="fr-icon-close-line"
              buttonType="tertiary-no-outline"
              onClick={closeModals}
              aria-controls={searchModalId}
              title="Fermer la fenêtre de dialogue"
              label="Fermer"
              class="fr-btn--close"
            />
            <div class="fr-header__menu-links">
              <HeaderLinks user={props.user} trackEvent={props.trackEvent} routePath={props.routePath} userLinkClicked={closeModals} />
            </div>
            <nav class="fr-nav" id={navigationId} role="navigation" aria-label="Menu principal">
              <ul class="fr-nav__list">
                {linksByRole.value[props.user?.role ?? 'defaut'].map((link, index) => (
                  <li key={link.label} class="fr-nav__item">
                    {isDirectLink(link) ? (
                      <router-link class="fr-nav__link" to={{ name: link.path }} target="_self" onClick={() => linkClick(link.path)} {...getAriaPage(link)}>
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
                                <router-link onClick={() => sublinkClick(sublink.path)} class="fr-nav__link" to={{ name: sublink.path }} target="_self" id={`nav-${index}-${subIndex}`}>
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
})
