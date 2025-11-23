type RouteParamsMap = {
  landing: Record<string, never>
  login: Record<string, never>
  dashboard: Record<string, never>
  history: Record<string, never>
  blueprintsIndex: Record<string, never>
  profile: Record<string, never>
  plans: Record<string, never>
  blueprintDetail: { id: string }
  notFound: Record<string, never>
}

export type RouteName = keyof RouteParamsMap

export type RouteParams<Name extends RouteName> = RouteParamsMap[Name]

export type RouteArgs<Name extends RouteName> = RouteParams<Name> extends Record<string, never>
  ? []
  : [RouteParams<Name>]

export interface RouteRecord<Name extends RouteName> {
  name: Name
  path: string
  requiresAuth: boolean
  match: (path: string) => RouteParams<Name> | null
  buildPath: (...args: RouteArgs<Name>) => string
}

type RouteDictionary = {
  [Name in RouteName]: RouteRecord<Name>
}

const ROUTES: RouteDictionary = {
  landing: {
    name: 'landing',
    path: '/',
    requiresAuth: false,
    match: (path) => (path === '/' ? {} : null),
    buildPath: () => '/',
  },
  login: {
    name: 'login',
    path: '/login',
    requiresAuth: false,
    match: (path) => (path === '/login' ? {} : null),
    buildPath: () => '/login',
  },
  dashboard: {
    name: 'dashboard',
    path: '/dashboard',
    requiresAuth: true,
    match: (path) => (path === '/dashboard' ? {} : null),
    buildPath: () => '/dashboard',
  },
  history: {
    name: 'history',
    path: '/history',
    requiresAuth: true,
    match: (path) => (path === '/history' ? {} : null),
    buildPath: () => '/history',
  },
  blueprintsIndex: {
    name: 'blueprintsIndex',
    path: '/blueprints',
    requiresAuth: true,
    match: (path) => (path === '/blueprints' ? {} : null),
    buildPath: () => '/blueprints',
  },
  profile: {
    name: 'profile',
    path: '/profile',
    requiresAuth: true,
    match: (path) => (path === '/profile' ? {} : null),
    buildPath: () => '/profile',
  },
  plans: {
    name: 'plans',
    path: '/plans',
    requiresAuth: true,
    match: (path) => (path === '/plans' ? {} : null),
    buildPath: () => '/plans',
  },
  blueprintDetail: {
    name: 'blueprintDetail',
    path: '/blueprints/:id',
    requiresAuth: true,
    match: (path) => {
      const match = path.match(/^\/blueprints\/([^/]+)$/)
      if (!match) return null
      return { id: decodeURIComponent(match[1]) }
    },
    buildPath: ({ id }) => `/blueprints/${encodeURIComponent(id)}`,
  },
  notFound: {
    name: 'notFound',
    path: '/404',
    requiresAuth: false,
    match: () => null,
    buildPath: () => '/404',
  },
}

const MATCHABLE_ROUTES: RouteRecord<RouteName>[] = [
  ROUTES.landing,
  ROUTES.login,
  ROUTES.dashboard,
  ROUTES.history,
  ROUTES.blueprintsIndex,
  ROUTES.profile,
  ROUTES.plans,
  ROUTES.blueprintDetail,
]

export interface RouteMatch<Name extends RouteName = RouteName> {
  name: Name
  params: RouteParams<Name>
  path: string
  record: RouteRecord<Name>
}

export const buildRoute = <Name extends RouteName>(
  name: Name,
  ...args: RouteArgs<Name>
): string => {
  const record = ROUTES[name]
  return record.buildPath(...(args as RouteArgs<Name>))
}

export const matchRoute = (path: string): RouteMatch | null => {
  for (const record of MATCHABLE_ROUTES) {
    const params = record.match(path)
    if (params !== null) {
      return {
        name: record.name,
        params: params as RouteParams<typeof record.name>,
        path,
        record: record as RouteRecord<typeof record.name>,
      }
    }
  }
  return null
}

export const resolveRoute = (path: string): RouteMatch =>
  matchRoute(path) ?? {
    name: 'notFound',
    params: {} as RouteParams<'notFound'>,
    path,
    record: ROUTES.notFound,
  }

export const isProtectedRoute = (name: RouteName): boolean => ROUTES[name].requiresAuth

export type NavigateFn = <Name extends RouteName>(
  name: Name,
  ...args: RouteArgs<Name>
) => void

export { ROUTES as routeDictionary }
