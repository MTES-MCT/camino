import { computed, defineComponent, FunctionalComponent } from 'vue'
import { useStore } from 'vuex'
import { NewsletterForm } from './footer/newsletter-form'

export const Footer = defineComponent({
  setup() {
    const store = useStore()
    const version = computed(() => {
      /* global applicationVersion */
      // @ts-ignore
      return applicationVersion
    })
    const displayNewsletter = computed(() => {
      return !store.state.user.element
    })
    return () => <PureFooter version={version.value} displayNewsletter={displayNewsletter.value} />
  },
})

export interface Props {
  version: string
  displayNewsletter: boolean
}

export const PureFooter: FunctionalComponent<Props> = (props: Props) => (
  <footer class="dsfr" role="contentinfo" id="footer">
    <div class="fr-footer">
      <div class="fr-footer__top">
        <div class="fr-container">
          <div class="fr-grid-row fr-grid-row--start fr-grid-row--gutters">
            <div class="fr-col-12 fr-col-sm-6 fr-col-md-3">
              <h3 class="fr-footer__top-cat">Nous contacter</h3>
              <ul class="fr-footer__top-list">
                <li>
                  <a class="fr-footer__top-link" href="https://camino.gitbook.io/guide-dutilisation/a-propos/contact" target="_blank" rel="noopener noreferrer" title="Page contact - lien externe">
                    Contact
                  </a>
                </li>
                <li>
                  <router-link class="fr-footer__top-link" to="/a-propos">
                    À propos
                  </router-link>
                </li>
              </ul>
            </div>
            <div class="fr-col-12 fr-col-sm-6 fr-col-md-3">
              <h3 class="fr-footer__top-cat">Utiliser Camino</h3>
              <ul class="fr-footer__top-list">
                <li>
                  <a class="fr-footer__top-link" href="https://camino.gitbook.io/guide-dutilisation/camino/glossaire" target="_blank" rel="noopener noreferrer" title="Page glossaire - lien externe">
                    Glossaire
                  </a>
                </li>
                <li>
                  <a
                    class="fr-footer__top-link"
                    href="https://camino.gitbook.io/guide-dutilisation/camino/guide-dutilisation"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Page guide d’utilisation - lien externe"
                  >
                    Tutoriel
                  </a>
                </li>
                <li>
                  <a class="fr-footer__top-link" href="https://docs.camino.beta.gouv.fr/" target="_blank" rel="noopener noreferrer" title="Page de la documentation - lien externe">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div class="fr-col-12 fr-col-sm-6 fr-col-md-3">
              <h3 class="fr-footer__top-cat">Indicateurs</h3>
              <ul class="fr-footer__top-list">
                <li>
                  <router-link class="fr-footer__top-link" to="/statistiques">
                    Statistiques
                  </router-link>
                </li>
              </ul>
            </div>
            <div class="fr-col-12 fr-col-sm-6 fr-col-md-3">
              <h3 class="fr-footer__top-cat">Lien externes</h3>
              <ul class="fr-footer__top-list">
                <li>
                  <a class="fr-footer__top-link" href="http://www.minergies.fr/" target="_blank" rel="noopener noreferrer" title="Site MINergies - lien externe">
                    Minergies
                  </a>
                </li>
                <li>
                  <a class="fr-footer__top-link" href="https://www.mineralinfo.fr/" target="_blank" rel="noopener noreferrer" title="Site minéral info - lien externe">
                    MinéralInfos
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="fr-container">
        <div class="fr-footer__body" style="margin-bottom: 0;">
          <div class="fr-footer__brand fr-enlarge-link">
            <p class="fr-logo">
              Ministère <br />
              de la transition <br />
              écologique
            </p>
            <a class="fr-footer__brand-link" href="/" title="Retour à l’accueil du site - Camino - République Française">
              <img class="fr-footer__logo" style="width:9rem;" src="/img/logo-fabriquenumerique.svg" alt="La fabrique numérique" />
            </a>
          </div>
          <div class="fr-footer__content">
            {props.displayNewsletter ? (
              <p class="fr-footer__content-desc">
                <NewsletterForm />
              </p>
            ) : null}
            <ul class="fr-footer__content-list">
              <li class="fr-footer__content-item">
                <a class="fr-footer__content-link" target="_blank" href="https://economie.gouv.fr" rel="noopener noreferrer" title="Site du ministère de l’économie - lien externe">
                  economie.gouv.fr
                </a>
              </li>
              <li class="fr-footer__content-item">
                <a class="fr-footer__content-link" target="_blank" href="https://ecologie.gouv.fr" rel="noopener noreferrer" title="Site du ministère de l’écologie - lien externe">
                  ecologie.gouv.fr
                </a>
              </li>
              <li class="fr-footer__content-item">
                <a class="fr-footer__content-link" target="_blank" href="https://onf.fr" rel="noopener noreferrer" title="Site de l’office national des forêts - lien externe">
                  onf.fr
                </a>
              </li>
              <li class="fr-footer__content-item">
                <a class="fr-footer__content-link" target="_blank" href="https://legifrance.gouv.fr" rel="noopener noreferrer" title="Site légifrance - lien externe">
                  legifrance.gouv.fr
                </a>
              </li>
            </ul>
          </div>
          <div class="fr-footer__bottom" style="width: 100%;">
            <ul class="fr-footer__bottom-list">
              <li class="fr-footer__bottom-item">
                <a
                  class="fr-footer__bottom-link"
                  href="https://camino.gitbook.io/guide-dutilisation/a-propos/accessibilite"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Page de l’accessibilité - lien externe"
                >
                  Accessibilité : non conforme
                </a>
              </li>
              <li class="fr-footer__bottom-item">
                <a
                  class="fr-footer__bottom-link"
                  href="https://camino.gitbook.io/guide-dutilisation/a-propos/mentions-legales"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Page des mentions légales- lien externe"
                >
                  Mentions légales
                </a>
              </li>
              <li class="fr-footer__bottom-item">
                <a
                  class="fr-footer__bottom-link"
                  href="https://camino.gitbook.io/guide-dutilisation/a-propos/cgu"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Page des conditions générales des conditions d’utilisation - lien externe"
                >
                  CGU
                </a>
              </li>
              <li class="fr-footer__bottom-item">
                <a
                  class="fr-footer__bottom-link"
                  href={'https://github.com/MTES-MCT/camino/commit/' + props.version}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Page Github de la version de l’application - lien externe"
                >
                  Version {props.version.substring(0, 7)}
                </a>
              </li>
            </ul>
            <div class="fr-footer__bottom-copy">
              <p>
                Sauf mention contraire, tous les contenus de ce site sont sous{' '}
                <a href="https://github.com/MTES-MCT/camino/blob/master/license.md" target="_blank" rel="noopener noreferrer" title="Page de la licence utilisée par Camino - lien externe">
                  licence GNU AGPLv3
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
)
