import { defineComponent, FunctionalComponent, onMounted, ref } from 'vue'
import { User } from 'camino-common/src/roles'
import { QuickAccessTitre } from '@/components/page/quick-access-titre'
import { DsfrButtonIcon } from '../_ui/dsfr-button'
import { isNotNullNorUndefinedNorEmpty } from 'camino-common/src/typescript-tools'
import { MenuSection } from '../../router'
import { fr } from '@codegouvfr/react-dsfr'
import { PAGE_IDS } from '@/utils/page-ids'
import { LinkList, Link, isDirectLink, linksByRole } from './menu'

interface Props {
  user: User
  currentMenuSection: MenuSection | null
  routePath: string
}

const HeaderLinks: FunctionalComponent<Pick<Props, 'user' | 'routePath'> & { userLinkClicked: () => void }> = props => {
  const loginUrl = '/oauth2/sign_in?rd=' + encodeURIComponent(`${window.location.origin}${props.routePath}`)
  const logoutUrl = '/apiUrl/deconnecter'

  return (
    <div class={[fr.cx('fr-btns-group')]}>
      {props.user ? (
        <>
          <router-link class={[fr.cx('fr-btns-group--inline'), fr.cx('fr-btn'), fr.cx('fr-icon-account-fill')]} to={`/utilisateurs/${props.user.id}`} onClick={props.userLinkClicked}>
            {`${props.user.nom} ${props.user.prenom}`}
          </router-link>
          <a class={[fr.cx('fr-btns-group--inline'), fr.cx('fr-btn'), fr.cx('fr-icon-lock-line')]} href={logoutUrl}>
            Se déconnecter
          </a>
        </>
      ) : (
        <div>
          <a class={[fr.cx('fr-btn'), fr.cx('fr-icon-lock-fill')]} href={loginUrl}>
            Se connecter / S'enregistrer
          </a>
        </div>
      )}
    </div>
  )
}

export const Header = defineComponent<Props>(props => {
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

  const linkClick = () => {
    // On ferme la modale
    modalMenuOpened.value = false
  }

  const sublinkClick = () => {
    // On ferme le menu déroulant d’annuaire
    const navigationElement = document.getElementById(PAGE_IDS.menu.id)
    if (navigationElement) {
      const members = dsfr(navigationElement).navigation.members
      if (isNotNullNorUndefinedNorEmpty(members)) {
        members[0].conceal()
      }
    }
    linkClick()
  }

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
    <header role="banner" class={[fr.cx('fr-header'), 'noprint']} id="header">
      <div class="fr-header__body">
        <div class={fr.cx('fr-container')}>
          <div class={fr.cx('fr-header__body-row')}>
            <div class="fr-header__brand fr-enlarge-link">
              <div class={fr.cx('fr-header__brand-top')}>
                <div class={fr.cx('fr-header__logo')}>
                  <p class={fr.cx('fr-logo')}>
                    République
                    <br />
                    française
                  </p>
                </div>
                <nav class={fr.cx('fr-header__navbar')} role="navigation">
                  <button
                    class={[fr.cx('fr-btn--search'), fr.cx('fr-btn')]}
                    data-fr-opened="false"
                    onClick={openModalSearch}
                    aria-controls={searchModalId}
                    aria-haspopup="dialog"
                    id="button-search"
                    title="Rechercher"
                  >
                    Rechercher
                  </button>
                  <button
                    class={[fr.cx('fr-btn--menu'), fr.cx('fr-btn')]}
                    data-fr-opened="false"
                    onClick={openModalMenu}
                    aria-controls={navigationModalId}
                    aria-haspopup="dialog"
                    id="button-menu"
                    title="Menu"
                  >
                    Menu
                  </button>
                </nav>
              </div>
              <div class={fr.cx('fr-header__service')}>
                <router-link to={{ name: 'homepage' }} title="Accueil - Camino - République Française">
                  <p class={fr.cx('fr-header__service-title')}>Camino</p>
                </router-link>
                <p class={fr.cx('fr-header__service-tagline')}>Le cadastre minier numérique</p>
              </div>
            </div>
            <div class={fr.cx('fr-header__tools')}>
              <div class={fr.cx('fr-header__tools-links')}>
                <HeaderLinks user={props.user} routePath={props.routePath} userLinkClicked={closeModals} />
              </div>
              <div
                class={[fr.cx('fr-header__search'), fr.cx('fr-modal'), modalSearchOpened.value ? fr.cx('fr-modal--opened') : null]}
                id={searchModalId}
                aria-labelledby="button-search"
                aria-label="Recherche dans le site"
              >
                <div class={fr.cx('fr-container')}>
                  <DsfrButtonIcon
                    icon="fr-icon-close-line"
                    buttonType="tertiary-no-outline"
                    onClick={closeModals}
                    aria-controls={searchModalId}
                    title="Fermer la fenêtre de dialogue"
                    label="Fermer"
                    class={fr.cx('fr-btn--close')}
                  />
                  <QuickAccessTitre id={PAGE_IDS.search.id} onSelectTitre={closeModals} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class={[fr.cx('fr-header__menu'), fr.cx('fr-modal'), modalMenuOpened.value ? fr.cx('fr-modal--opened') : null]}
        id={navigationModalId}
        aria-labelledby="button-menu"
        aria-label="Connexion et menu de navigation"
      >
        <div class={fr.cx('fr-container')}>
          <DsfrButtonIcon
            icon="fr-icon-close-line"
            buttonType="tertiary-no-outline"
            onClick={closeModals}
            aria-controls={searchModalId}
            title="Fermer la fenêtre de dialogue"
            label="Fermer"
            class={fr.cx('fr-btn--close')}
          />
          <div class={fr.cx('fr-header__menu-links')}>
            <HeaderLinks user={props.user} routePath={props.routePath} userLinkClicked={closeModals} />
          </div>
          <nav class={fr.cx('fr-nav')} id={PAGE_IDS.menu.id} role="navigation" aria-label="Menu principal">
            <ul class={fr.cx('fr-nav__list')}>
              {linksByRole(props.user)[props.user?.role ?? 'defaut'].map((link, index) => (
                <li key={link.label} class={fr.cx('fr-nav__item')}>
                  {isDirectLink(link) ? (
                    <router-link class={fr.cx('fr-nav__link')} to={{ name: link.path }} target="_self" onClick={linkClick} {...getAriaPage(link)}>
                      {link.label}
                    </router-link>
                  ) : (
                    <>
                      <button class={fr.cx('fr-nav__btn')} aria-expanded="false" aria-controls={`collapse-${index}`} {...getAriaCurrent(link)}>
                        {link.label}
                      </button>
                      <div class={[fr.cx('fr-collapse'), fr.cx('fr-menu')]} id={`collapse-${index}`}>
                        <ul class={fr.cx('fr-menu__list')}>
                          {link.sublinks.map((sublink, subIndex) => (
                            <li key={sublink.label}>
                              <router-link onClick={sublinkClick} class={fr.cx('fr-nav__link')} to={{ name: sublink.path }} target="_self" id={`nav-${index}-${subIndex}`}>
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
  )
})

// @ts-ignore waiting for https://github.com/vuejs/core/issues/7833
Header.props = ['user', 'currentMenuSection', 'routePath']
