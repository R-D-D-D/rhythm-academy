<template lang="pug">
  //- div.register
    //- h1 Register an account with us!
    //- input(v-model="email" name="email" type="text" placeholder="email")
    //- br
    //- input(v-model="password" name="password" type="text" placeholder="password")
    //- br
    //- button(@click="register") register
    //- br
    //- .error(v-html="error") {{ error }}

  #login
    panel(title="Log In")
      //- v-tooltip(bottom)
      //-   template(v-slot:activator='{ on, attrs }')
      //-     v-toolbar-title(dark v-bind='attrs' v-on='on') Login form
      //-   span Log in
      v-card-text
        v-form.text-center(ref="form" v-on:submit.prevent="login")
          v-text-field(
            label='Email' 
            name='email' 
            prepend-icon='mdi-account' 
            type='text' 
            v-model='email' 
            :rules="emailRules")
          v-text-field#password(
            label='Password' 
            name='password' 
            prepend-icon='mdi-lock' 
            type='password' 
            v-model='password' 
            :rules="passwordRules")
          v-spacer
          v-btn.mt-5(:loading='loading' :disabled="loading" type="submit") Log In
          v-spacer
      v-card-text
        .error.text-center(v-html="error") {{ error }}
</template>

<script>
import AuthenticationService from '@/services/AuthenticationService'
import SubscriptionService from '@/services/SubscriptionService'
import CourseService from '@/services/CourseService'

export default {
  name: 'LogIn',
  data () {
    return {
      email: '',
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ],
      password: '',
      passwordRules: [
        v => !!v || 'Password is required',
      ],
      error: null,
      loading: false
    }
  },
  methods: {
    async login () {
      if (!this.$refs.form.validate())
        return
      this.error = ''
      this.loading = true
      try {
        const response = await AuthenticationService.login({
          email: this.email,
          password: this.password
        })

        this.loading = false
        this.$store.dispatch('setToken', response.data.token)
        this.$store.dispatch('setUser', response.data.user)

        if (response.data.user.isStudent) {
          const studentResponse = await SubscriptionService.getSubscriptionInfoOfStudent(response.data.user.id)
          const userSubscribedCourses = studentResponse.data.courses
          let totalUnread = 0
          userSubscribedCourses.forEach(course => totalUnread += course.unreadTutorPost)
          this.$store.dispatch('setNotifications', totalUnread)
        } else {
          const tutorResponse = await CourseService.list(response.data.user.id);
          const userOwnedCourses = tutorResponse.data.courses
          let totalUnread = 0
          userOwnedCourses.forEach(course => totalUnread += course.unreadStudentPost)
          this.$store.dispatch('setNotifications', totalUnread)
        }
        
        this.$router.push({
          name: 'home'
        })
      } catch (err) {
        // console.log(err)
        this.error = err.response.data.error
        this.loading = false
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
