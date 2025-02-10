import { defineComponent, FunctionalComponent, inject } from 'vue'
import { User } from 'camino-common/src/roles'
import { isDirectLink, linksByRole } from './menu'
import { CaminoRouterLink } from '@/router/camino-router-link'
import { userKey } from '@/moi'

interface Props {
  user: User
}

export const PlanDuSite = defineComponent(() => {
  const user = inject(userKey)

  return () => <PurePlanDuSite user={user} />
})

export const PurePlanDuSite: FunctionalComponent<Props> = props => {
  return (
    <div>
      <h1>Plan du site</h1>
      <ul>
        {linksByRole(props.user)[props.user?.role ?? 'defaut'].map(link => (
          <li key={link.label}>
            {isDirectLink(link) ? (
              <CaminoRouterLink to={{ name: link.path, params: {} }} isDisabled={false} title={link.label}>
                {link.label}
              </CaminoRouterLink>
            ) : (
              <>
                {link.label}
                <ul>
                  {link.sublinks.map(sublink => (
                    <li key={sublink.label}>
                      <CaminoRouterLink to={{ name: sublink.path, params: {} }} isDisabled={false} title={sublink.label}>
                        {sublink.label}
                      </CaminoRouterLink>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
