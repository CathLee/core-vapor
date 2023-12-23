import { hasOwn } from '@vue/shared'
import { type ComponentInternalInstance } from './component'

export interface ComponentRenderContext {
  [key: string]: any
  _: ComponentInternalInstance
}

export const PublicInstanceProxyHandlers: ProxyHandler<any> = {
  get({ _: instance }: ComponentRenderContext, key: string) {
    let normalizedProps
    const { setupState, props } = instance
    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (
      (normalizedProps = instance.propsOptions[0]) &&
      hasOwn(normalizedProps, key)
    ) {
      return props![key]
    }
  },
}
// dev only
// In dev mode, the proxy target exposes the same properties as seen on `this`
// for easier console inspection. In prod mode it will be an empty object so
// these properties definitions can be skipped.

export const createDevRenderContext = (instance: ComponentInternalInstance) => {
  const target: Record<string, any> = {}
  // expose internal instance for proxy handlers
  Object.defineProperty(target, `_`, {
    configurable: true,
    enumerable: false,
    get: () => instance
  })

  // expose public properties
  Object.keys(publicPropertiesMap).forEach(key => {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: false,
      get: () => publicPropertiesMap[key](instance),
      // intercepted by the proxy so no need for implementation,
      // but needed to prevent set errors
      set: NOOP
    })
  })

  return target as ComponentRenderContext

}
