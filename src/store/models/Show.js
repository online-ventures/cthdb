import { Model } from '@vuex-orm/core'

export default class Show extends Model {
  // This is the name used as module name of the Vuex Store.
  static entity = 'shows'

  // List of all fields (schema) of the show model. `this.attr` is used
  // for the generic field type. The argument is the default value.
  static fields () {
    return {
      id: this.attr(null),
      name: this.attr(null),
      occurred_at: this.attr(null)
    }
  }

  static methodConf = {
    http: {
      url: '/shows'
    },
    methods: {
      $fetch: {
        name: 'fetch',
        http: {
          url: '',
          method: 'get'
        }
      },
      $get: {
        name: 'get',
        http: {
          url: '/:id',
          method: 'get'
        }
      },
      $create: {
        name: 'create',
        http: {
          url: '',
          method: 'post'
        }
      },
      $update: {
        name: 'update',
        http: {
          url: '/:id',
          method: 'put'
        }
      },
      $delete: {
        name: 'delete',
        http: {
          url: '/:id',
          method: 'delete'
        }
      }
    }
  }
}
