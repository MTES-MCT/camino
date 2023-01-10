import { FunctionalComponent } from 'vue'
import dsfr from './dsfr.module.css'

export interface Props {
  version: string
}

export const PureFooter: FunctionalComponent<Props> = (props: Props) => (
  <footer class={dsfr['fr-footer']} role="contentinfo" id="footer">
    <div class={dsfr['fr-footer__top']}>
      <div class={dsfr['fr-container']}>
        <div
          class={`${dsfr['fr-grid-row']} ${dsfr['fr-grid-row--start']} ${dsfr['fr-grid-row--gutters']}`}
        >
          <div
            class={`${dsfr['fr-col-12']} ${dsfr['fr-col-sm-6']}  ${dsfr['fr-col-md-3']} `}
          >
            <h3 class={dsfr['fr-footer__top-cat']}>Nous contacter</h3>
            <ul class={dsfr['fr-footer__top-list']}>
              <li>
                <a
                  class={dsfr['fr-footer__top-link']}
                  href="https://camino.gitbook.io/guide-dutilisation/a-propos/contact"
                >
                  Contact
                </a>
              </li>
              <li>
                <router-link class={dsfr['fr-footer__top-link']} to="/a-propos">
                  À propos
                </router-link>
              </li>
            </ul>
          </div>
          <div
            class={`${dsfr['fr-col-12']} ${dsfr['fr-col-sm-6']}  ${dsfr['fr-col-md-3']} `}
          >
            <h3 class={dsfr['fr-footer__top-cat']}>Utiliser Camino</h3>
            <ul class={dsfr['fr-footer__top-list']}>
              <li>
                <a
                  class={dsfr['fr-footer__top-link']}
                  href="https://camino.gitbook.io/guide-dutilisation/camino/glossaire"
                >
                  Glossaire
                </a>
              </li>
              <li>
                <a
                  class={dsfr['fr-footer__top-link']}
                  href="https://camino.gitbook.io/guide-dutilisation/camino/guide-dutilisation"
                >
                  Tutoriel
                </a>
              </li>
              <li>
                <a
                  class={dsfr['fr-footer__top-link']}
                  href="https://docs.camino.beta.gouv.fr/"
                >
                  API
                </a>
              </li>
            </ul>
          </div>
          <div
            class={`${dsfr['fr-col-12']} ${dsfr['fr-col-sm-6']}  ${dsfr['fr-col-md-3']} `}
          >
            <h3 class={dsfr['fr-footer__top-cat']}>Indicateurs</h3>
            <ul class={dsfr['fr-footer__top-list']}>
              <li>
                <router-link
                  className={dsfr['fr-footer__top-link']}
                  to="/statistiques"
                >
                  Statistiques
                </router-link>
              </li>
            </ul>
          </div>
          <div
            class={`${dsfr['fr-col-12']} ${dsfr['fr-col-sm-6']}  ${dsfr['fr-col-md-3']} `}
          >
            <h3 class={dsfr['fr-footer__top-cat']}>Lien externes</h3>
            <ul class={dsfr['fr-footer__top-list']}>
              <li>
                <a
                  class={dsfr['fr-footer__top-link']}
                  href="http://www.minergies.fr/"
                >
                  Minergies
                </a>
              </li>
              <li>
                <a
                  class={dsfr['fr-footer__top-link']}
                  href="https://www.mineralinfo.fr/"
                >
                  MinéralInfos
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class={dsfr['fr-container']}>
      <div class={dsfr['fr-footer__body3']}>
        <div class={`${dsfr['fr-footer__brand']} ${dsfr['fr-enlarge-link']}`}>
          <a
            href="/"
            title="Retour à l’accueil du site - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)"
          >
            <p class={dsfr['fr-logo']}>
              {' '}
              Intitulé <br />
              officiel
            </p>
          </a>
        </div>
        <div class={dsfr['fr-footer__content']}>
          <p class={dsfr['fr-footer__content-desc']}>Lorem [...] elit ut.</p>
          <ul class={dsfr['fr-footer__content-list']}>
            <li class={dsfr['fr-footer__content-item']}>
              <a
                class={dsfr['fr-footer__content-link']}
                target="_blank"
                href="https://legifrance.gouv.fr"
              >
                legifrance.gouv.fr
              </a>
            </li>
            <li class={dsfr['fr-footer__content-item']}>
              <a
                class={dsfr['fr-footer__content-link']}
                target="_blank"
                href="https://gouvernement.fr"
              >
                gouvernement.fr
              </a>
            </li>
            <li class={dsfr['fr-footer__content-item']}>
              <a
                class={dsfr['fr-footer__content-link']}
                target="_blank"
                href="https://service-public.fr"
              >
                service-public.fr
              </a>
            </li>
            <li class={dsfr['fr-footer__content-item']}>
              <a
                class={dsfr['fr-footer__content-link']}
                target="_blank"
                href="https://data.gouv.fr"
              >
                data.gouv.fr
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class={dsfr['fr-footer__bottom']}>
        <ul class={dsfr['fr-footer__bottom-list']}>
          <li class={dsfr['fr-footer__bottom-item']}>
            <a class={dsfr['fr-footer__bottom-link']} href="#">
              Plan du site
            </a>
          </li>
          <li class={dsfr['fr-footer__bottom-item']}>
            <a class={dsfr['fr-footer__bottom-link']} href="#">
              Accessibilité : non/partiellement/totalement conforme
            </a>
          </li>
          <li class={dsfr['fr-footer__bottom-item']}>
            <a class={dsfr['fr-footer__bottom-link']} href="#">
              Mentions légales
            </a>
          </li>
          <li class={dsfr['fr-footer__bottom-item']}>
            <a class={dsfr['fr-footer__bottom-link']} href="#">
              Données personnelles
            </a>
          </li>
          <li class={dsfr['fr-footer__bottom-item']}>
            <a class={dsfr['fr-footer__bottom-link']} href="#">
              Gestion des cookies
            </a>
          </li>
        </ul>
        <div class={dsfr['fr-footer__bottom-copy']}>
          <p>
            Sauf mention contraire, tous les contenus de ce site sont sous{' '}
            <a
              href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
              target="_blank"
            >
              licence etalab-2.0
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
)
