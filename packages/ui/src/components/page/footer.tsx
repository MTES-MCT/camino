import { FunctionalComponent } from 'vue'
import { CaminoRouterLink } from '@/router/camino-router-link'
import { PAGE_IDS } from '@/utils/page-ids'
import { fr } from '@codegouvfr/react-dsfr'

interface Props {
  version: string
}

export const Footer: FunctionalComponent<Props> = (props: Props) => (
  <footer role="contentinfo" id={PAGE_IDS.footer.id} class="noprint">
    <div class={fr.cx('fr-footer')}>
      <div class={fr.cx('fr-footer__top')}>
        <div class={fr.cx('fr-container')}>
          <div class={[fr.cx('fr-grid-row'), fr.cx('fr-grid-row--gutters')]}>
            <div class={[fr.cx('fr-col-12'), fr.cx('fr-col-sm-6'), fr.cx('fr-col-md-4')]}>
              <h1 class={fr.cx('fr-footer__top-cat')}>Nous contacter</h1>
              <ul class={fr.cx('fr-footer__top-list')}>
                <li>
                  <a
                    class={fr.cx('fr-footer__top-link')}
                    href="https://camino.gitbook.io/guide-dutilisation/a-propos/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Page contact - lien externe"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <CaminoRouterLink isDisabled={false} title="À propos" class={fr.cx('fr-footer__top-link')} to={{ name: 'aPropos', params: {} }}>
                    À propos
                  </CaminoRouterLink>
                </li>
              </ul>
            </div>
            <div class={[fr.cx('fr-col-12'), fr.cx('fr-col-sm-6'), fr.cx('fr-col-md-4')]}>
              <h1 class={fr.cx('fr-footer__top-cat')}>Utiliser Camino</h1>
              <ul class={fr.cx('fr-footer__top-list')}>
                <li>
                  <CaminoRouterLink isDisabled={false} title="Plan du site" class={fr.cx('fr-footer__top-link')} to={{ name: 'plan', params: {} }}>
                    Plan du site
                  </CaminoRouterLink>
                </li>
                <li>
                  <a
                    class={fr.cx('fr-footer__top-link')}
                    href="https://camino.gitbook.io/guide-dutilisation/camino/glossaire"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Page glossaire - lien externe"
                  >
                    Glossaire
                  </a>
                </li>
                <li>
                  <a
                    class={fr.cx('fr-footer__top-link')}
                    href="https://camino.gitbook.io/guide-dutilisation/camino/guide-dutilisation"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Page guide d’utilisation - lien externe"
                  >
                    Tutoriel
                  </a>
                </li>
                <li>
                  <a class={fr.cx('fr-footer__top-link')} href="https://docs.camino.beta.gouv.fr/" target="_blank" rel="noopener noreferrer" title="Page de la documentation - lien externe">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div class={[fr.cx('fr-col-12'), fr.cx('fr-col-sm-6'), fr.cx('fr-col-md-4')]}>
              <h1 class={fr.cx('fr-footer__top-cat')}>Lien externes</h1>
              <ul class={fr.cx('fr-footer__top-list')}>
                <li>
                  <a class={fr.cx('fr-footer__top-link')} href="http://www.minergies.fr/" target="_blank" rel="noopener noreferrer" title="Site MINergies - lien externe">
                    Minergies
                  </a>
                </li>
                <li>
                  <a class={fr.cx('fr-footer__top-link')} href="https://www.mineralinfo.fr/" target="_blank" rel="noopener noreferrer" title="Site minéral info - lien externe">
                    MinéralInfos
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class={fr.cx('fr-container')}>
        <div class={fr.cx('fr-footer__body')} style="margin-bottom: 0;">
          <div class={[fr.cx('fr-footer__brand'), fr.cx('fr-enlarge-link')]}>
            <p class={fr.cx('fr-logo')}>
              Ministère <br />
              de la transition <br />
              écologique
            </p>
            <a class={fr.cx('fr-footer__brand-link')} href="/" title="Retour à l'accueil du site - Camino - La fabrique numérque - République Française">
              <img class={fr.cx('fr-footer__logo')} style="width:9rem;" src="/img/logo-fabriquenumerique.svg" alt="La fabrique numérique" />
            </a>
          </div>
          <div class={fr.cx('fr-footer__content')}>
            <ul class={fr.cx('fr-footer__content-list')}>
              <li>
                <a class={fr.cx('fr-footer__content-link')} target="_blank" href="https://economie.gouv.fr" rel="noopener noreferrer" title="Site du ministère de l’économie - lien externe">
                  economie.gouv.fr
                </a>
              </li>
              <li>
                <a class={fr.cx('fr-footer__content-link')} target="_blank" href="https://ecologie.gouv.fr" rel="noopener noreferrer" title="Site du ministère de l’écologie - lien externe">
                  ecologie.gouv.fr
                </a>
              </li>
              <li>
                <a class={fr.cx('fr-footer__content-link')} target="_blank" href="https://onf.fr" rel="noopener noreferrer" title="Site de l’office national des forêts - lien externe">
                  onf.fr
                </a>
              </li>
              <li>
                <a class={fr.cx('fr-footer__content-link')} target="_blank" href="https://legifrance.gouv.fr" rel="noopener noreferrer" title="Site légifrance - lien externe">
                  legifrance.gouv.fr
                </a>
              </li>
            </ul>
          </div>
          <div class={fr.cx('fr-footer__bottom')} style="width: 100%;">
            <ul class={fr.cx('fr-footer__bottom-list')}>
              <li class={fr.cx('fr-footer__bottom-item')}>
                <a
                  class={fr.cx('fr-footer__bottom-link')}
                  href="https://camino.gitbook.io/guide-dutilisation/a-propos/accessibilite"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Page de l’accessibilité - lien externe"
                >
                  Accessibilité : non conforme
                </a>
              </li>
              <li class={fr.cx('fr-footer__bottom-item')}>
                <a
                  class={fr.cx('fr-footer__bottom-link')}
                  href="https://camino.gitbook.io/guide-dutilisation/a-propos/mentions-legales"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Page des mentions légales- lien externe"
                >
                  Mentions légales
                </a>
              </li>
              <li class={fr.cx('fr-footer__bottom-item')}>
                <a
                  class={fr.cx('fr-footer__bottom-link')}
                  href="https://camino.gitbook.io/guide-dutilisation/a-propos/cgu"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Page des conditions générales des conditions d’utilisation - lien externe"
                >
                  CGU
                </a>
              </li>
              <li class={fr.cx('fr-footer__bottom-item')}>
                <a
                  class={fr.cx('fr-footer__bottom-link')}
                  href={'https://gitlab-forge.din.developpement-durable.gouv.fr/pub/pnm-public/camino/-/commit/' + props.version}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Page Github de la version de l’application - lien externe"
                >
                  Version {props.version.substring(0, 7)}
                </a>
              </li>
            </ul>
            <div class={fr.cx('fr-footer__bottom-copy')}>
              <p>
                Sauf mention contraire, tous les contenus de ce site sont sous{' '}
                <a
                  href="https://gitlab-forge.din.developpement-durable.gouv.fr/pub/pnm-public/camino/blob/master/license.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Page de la licence utilisée par Camino - lien externe"
                >
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
