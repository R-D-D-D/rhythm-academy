// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import vuetify from '@/plugins/vuetify' // path to vuetify export

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  vuetify,
  el: '#app',
  router,
  components: { App },
  mounted: function() {
    var script = document.createElement('link')
    script.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css'
    script.rel = 'stylesheet'
    document.head.appendChild(script)
  },
  template: '<App/>'
})
