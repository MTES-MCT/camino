import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { dateFormat } from '@/utils'
import Accordion from '../_ui/accordion.vue'
import { Tag } from '../_ui/tag'
import { Icon } from '@/components/_ui/icon'
import { computed, ref } from 'vue'
import { Entreprise as CaminoEntreprise, EntrepriseEtablissement } from 'camino-common/src/entreprise'

interface TitreEntreprise extends CaminoEntreprise {
  legalForme?: string
  adresse?: string
  codePostal?: string
  commune?: string
  telephone?: string
  email?: string
  url?: string
  operateur?: boolean
}

interface Props {
  entreprise: TitreEntreprise
  onEventTrack: (event: { categorie: string; action: string }) => void
}

export const Entreprise = caminoDefineComponent<Props>(['entreprise', 'onEventTrack'], props => {
  const opened = ref(false)

  const toggle = () => {
    opened.value = !opened.value
    if (opened.value) {
      props.onEventTrack({
        categorie: 'titre-sections',
        action: 'titre-entreprise_consulter',
      })
    }
  }

  const content = computed<boolean>(() => {
    return !!(
      props.entreprise.legalSiren ||
      props.entreprise.legalForme ||
      props.entreprise.etablissements.length ||
      props.entreprise.adresse ||
      props.entreprise.codePostal ||
      props.entreprise.commune ||
      props.entreprise.telephone ||
      props.entreprise.email ||
      props.entreprise.url
    )
  })
  const entrepriseNameFind = (entreprise: TitreEntreprise) => {
    return (
      entreprise.nom ||
      // trouve l'établissement le plus récent
      entreprise.etablissements.reduce<EntrepriseEtablissement | null>((res, e) => (res && res.dateDebut > e.dateDebut ? res : e), null)?.nom
    )
  }

  return () => (
    <Accordion class="mb" opened={opened.value} slotDefault={content.value} slotButtons={true} onToggle={toggle}>
      {{
        title: () => (
          <>
            {' '}
            <h4 class="mb-0">{entrepriseNameFind(props.entreprise)}</h4>
            {props.entreprise.operateur ? <Tag color="bg-info" mini={true} text="Opérateur" /> : null}
          </>
        ),
        buttons: () => (
          <router-link to={{ name: 'entreprise', params: { id: props.entreprise.id } }} class="btn-alt py-s px-m">
            <Icon
              name="external-link"
              size="M"
              onClick={() =>
                props.onEventTrack({
                  categorie: 'titre-sections',
                  action: 'titre-entreprise_acceder',
                })
              }
              aria-label={`Naviguer vers l'entreprise ${props.entreprise.nom}`}
              role="img"
            />
          </router-link>
        ),
        default: () => (
          <>
            {content.value ? (
              <div class="px-m pt-m">
                {props.entreprise.legalSiren ? (
                  <div class="large-blobs">
                    <div class="large-blob-1-4">
                      <h5>Siren</h5>
                    </div>
                    <div class="large-blob-3-4">
                      <p>{props.entreprise.legalSiren}</p>
                    </div>
                  </div>
                ) : null}

                {props.entreprise.legalForme ? (
                  <div class="large-blobs">
                    <div class="large-blob-1-4">
                      <h5>Forme juridique</h5>
                    </div>
                    <div class="large-blob-3-4">
                      <p>{props.entreprise.legalForme}</p>
                    </div>
                  </div>
                ) : null}

                {props.entreprise.etablissements && props.entreprise.etablissements.length ? (
                  <div class="large-blobs">
                    <div class="large-blob-1-4">
                      <h5>Établissement{props.entreprise.etablissements.length > 1 ? 's' : ''}</h5>
                    </div>
                    <div class="large-blob-3-4">
                      <ul class="list-sans">
                        {props.entreprise.etablissements.map(e => (
                          <li key={e.id}>
                            <h6 class="inline-block">{dateFormat(e.dateDebut)}</h6>: {e.nom}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}

                {props.entreprise.adresse ? (
                  <div class="large-blobs">
                    <div class="large-blob-1-4">
                      <h5>Adresse</h5>
                    </div>
                    <div class="large-blob-3-4">
                      <p>
                        {props.entreprise.adresse}
                        <br />
                        {props.entreprise.codePostal}
                        {props.entreprise.commune}
                      </p>
                    </div>
                  </div>
                ) : null}

                {props.entreprise.telephone ? (
                  <div class="large-blobs">
                    <div class="large-blob-1-4">
                      <h5>Téléphone</h5>
                    </div>
                    <div class="large-blob-3-4">
                      <p class="word-break">{props.entreprise.telephone}</p>
                    </div>
                  </div>
                ) : null}

                {props.entreprise.email ? (
                  <div class="large-blobs">
                    <div class="large-blob-1-4">
                      <h5>Email</h5>
                    </div>
                    <div class="large-blob-3-4">
                      <p class="word-break">
                        <a href={`mailto:${props.entreprise.email}`} class="btn small bold py-xs px-s rnd">
                          {props.entreprise.email}
                        </a>
                      </p>
                    </div>
                  </div>
                ) : null}

                {props.entreprise.url ? (
                  <div class="large-blobs">
                    <div class="large-blob-1-4">
                      <h5>Site</h5>
                    </div>
                    <div class="large-blob-3-4">
                      <p class="word-break">
                        <a href={props.entreprise.url} class="btn small bold py-xs px-s rnd">
                          {props.entreprise.url}
                        </a>
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ),
      }}
    </Accordion>
  )
})
