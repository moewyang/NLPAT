import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '',
      component: require('@/components/LandingPage').default,
      children: [
        {
          path: '',
          component: require('@/components/LandingPage/Home').default
        },
        {
          path: 'home',
          component: require('@/components/LandingPage/Home').default
        },
        {
          path: 'entity-tagging',
          component: require('@/components/LandingPage/EntityTagging').default
        },
        {
          path: 'entity-linking',
          component: require('@/components/LandingPage/EntityLinking').default
        },
        {
          path: 'entity-relationship',
          component: require('@/components/LandingPage/EntityRelationship').default
        },
        {
          path: 'ai-annotation',
          component: require('@/components/LandingPage/AIAnnotation').default
        },
        {
          path: 'toolkit',
          component: require('@/components/LandingPage/Toolkit').default
        },
        {
          path: 'setting',
          component: require('@/components/LandingPage/Setting').default
        },
        {
          path: 'about',
          component: require('@/components/LandingPage/About').default
        }
      ]
    },
    {
      path: '*',
      redirect: '/home'
    }
  ]
})
