export const useLink = () => ({
  href: {
    value: 'hrefMocked'
  },
  navigate: () => ({})
})

export const useRoute = () => ({
  name: 'mocked-current-route',
  query: {},
})

export const onBeforeRouteLeave = () => ({})

export const useRouter = () => ({
  push: () => ({}),
  currentRoute: { value: { name: 'mocked-current-route', query: {} } },
})
