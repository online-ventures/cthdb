import Vue from 'vue'
import Router from 'vue-router'
import ShowList from './views/ShowList.vue'
import Home from './views/Home.vue'
import NotFound from './views/NotFound.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/shows',
      name: 'show-list',
      component: ShowList
    },
    {
      path: '*',
      component: NotFound
    }
  ]
})
