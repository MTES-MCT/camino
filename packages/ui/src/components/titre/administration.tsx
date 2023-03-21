import { caminoDefineComponent } from '@/utils/vue-tsx-utils'
import { AdministrationId, Administrations } from 'camino-common/src/static/administrations'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Accordion from '../_ui/accordion.vue'

interface Props {
  administrationId: AdministrationId
  onEventTrack: (event: { categorie: string; action: string }) => void
}

export const Administration = caminoDefineComponent<Props>(['administrationId', 'onEventTrack'], props => {
  const opened = ref(false)
  const administration = Administrations[props.administrationId]
  const close = () => {
    opened.value = false
  }

  const toggle = () => {
    opened.value = !opened.value
    if (opened.value) {
      props.onEventTrack({
        categorie: 'titre-sections',
        action: 'titre-administration_consulter',
      })
    }
  }

  return () => (
    <Accordion class="mb" opened={opened.value} slotDefault={true} onClose={close} onToggle={toggle}>
      {{
        title: () => <span>{administration.nom}</span>,
        default: () => (
          <div class="px-m pt-m">
            {administration.service ? (
              <div class="large-blobs">
                <div class="large-blob-1-6">
                  <h5>Service</h5>
                </div>
                <div class="large-blob-5-6">
                  <p>{administration.service}</p>
                </div>
              </div>
            ) : null}

            {administration.adresse1 || administration.adresse2 ? (
              <div class="large-blobs">
                <div class="large-blob-1-6">
                  <h5>Adresse</h5>
                </div>
                <div class="large-blob-5-6">
                  <p>
                    {administration.adresse1}
                    {administration.adresse2 ? (
                      <span>
                        <br />
                        {administration.adresse2}
                      </span>
                    ) : null}
                    <br />
                    {administration.codePostal}
                    {administration.commune}
                  </p>
                </div>
              </div>
            ) : null}

            {administration.telephone ? (
              <div class="large-blobs">
                <div class="large-blob-1-6">
                  <h5>Téléphone</h5>
                </div>
                <div class="large-blob-5-6">
                  <p class="word-break">{administration.telephone}</p>
                </div>
              </div>
            ) : null}

            {administration.email ? (
              <div class="large-blobs">
                <div class="large-blob-1-6">
                  <h5>Email</h5>
                </div>
                <div class="large-blob-5-6">
                  <p class="word-break">
                    <a href={`mailto:${administration.email}`} class="btn small bold py-xs px-s rnd">
                      {administration.email}
                    </a>
                  </p>
                </div>
              </div>
            ) : null}

            {administration.url ? (
              <div class="large-blobs">
                <div class="large-blob-1-6">
                  <h5>Site</h5>
                </div>
                <div class="large-blob-5-6">
                  <p class="word-break">
                    <a href={administration.url} class="btn small bold py-xs px-s rnd" target="_blank" rel="noopener noreferrer">
                      {administration.url}
                    </a>
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ),
      }}
    </Accordion>
  )
})
