<template lang="pug">
  #student(v-if="course")
    v-container
      h1 {{ course.name }}
      v-row
        v-col
          v-expansion-panels.elevation-2(hover multiple v-model="currentThread")
            v-expansion-panel(v-for='(thread, i) in threads' :key='thread.id')
              v-expansion-panel-header.font-weight-bold(style="font-size: 18px;") {{ course.lessons[i].name }}
              v-expansion-panel-content.px-6
                v-list(v-if="thread.posts")
                  v-list-item(v-for='(post, idx) in thread.posts' :key='post.id')
                    v-list-item-content.pb-0
                      v-container.pt-0.pb-4.px-0(fluid)
                        v-row.py-0(v-if="idx == 0 || post.updatedAt.substring(0, 10) != thread.posts[idx - 1].updatedAt.substring(0, 10)")
                          v-col.py-0
                            v-chip(label color="indigo darken-3" dark style="font-size: 12px;") {{ new Date(post.updatedAt).toLocaleString([], { year: 'numeric', month: 'numeric', day:'numeric'}) }}
                        v-row.mt-5(v-if="post.videoUrl")
                          v-col.py-0.text-center(style="margin-bottom: -3px; background-color:black;")
                            video(controls style="max-width:100%; max-height:400px;")
                              source(:src="post.videoUrl" type="video/mp4")
                              | Your browser does not support HTML video.
                        v-row(v-else)
                          v-col.pb-0(style="border-bottom: 1px solid #BDBDBD;")

                        v-row.justify-end.bottom-border.mx-0.py-3(v-if="post.UserId != user.id")
                          v-col.py-0.text-left(cols="5" v-if="post.UserId == user.id")
                            v-btn(icon @click="deletePost($event, thread, i, post)" color="indigo")
                              v-icon mdi-trash-can-outline
                          v-col.pr-8.py-0(cols="6") 
                            .speech-bubble-other
                              v-row.ma-0(style="width: 100%;")
                                v-col.text-left
                                  div {{ post.message }}
                              .timestamp {{ new Date(post.updatedAt).toLocaleString([], { hour: '2-digit', minute:'2-digit'}) }}
                          v-col.text-center.pa-0(cols="1")
                            v-avatar(color='grey' size="40")
                              v-icon mdi-account
                        v-row.justify-start.bottom-border.mx-0.py-3(v-else)
                          v-col.text-center.pa-0(cols="1")
                            v-avatar(color='grey' size="40")
                              v-icon mdi-account
                          v-col.pl-8.py-0(cols="6") 
                            .speech-bubble-self
                              v-row.ma-0(style="width: 100%;")
                                v-col.text-left
                                  div {{ post.message }}
                              .timestamp {{ new Date(post.updatedAt).toLocaleString([], { hour: '2-digit', minute:'2-digit'}) }}
                          v-col.py-0.text-right(cols="5" v-if="post.UserId == user.id")
                            v-btn(icon @click="deletePost($event, thread, i, post)" color="indigo")
                              v-icon mdi-trash-can-outline

                v-row.justify-center
                  v-col(cols="10")
                    v-form(:ref="`form-${thread.id}`")
                      v-row
                        v-col(cols="12")
                          v-textarea(outlined name='input-7-4' label='Draft a reply' v-model="message")
                        v-col(cols="6")
                          v-file-input(
                            accept="video/mp4, video/ogg" 
                            placeholder="Upload" 
                            prepend-icon="mdi-video"
                            label="Reply Video"
                            v-model="file")
                        v-col(cols="6")
                          //- v-subheader.pl-0 Grade
                          //- v-slider(v-model="grade" min='0' max='100' thumb-label :thumb-size="24")
                v-row
                  v-col
                    v-btn(large color="#ec5252" dark @click="create_post($event, thread, i)") Reply your student
            //- v-expansion-panel-header {{ new Date(thread.updatedAt).toLocaleString() }}
            //- v-expansion-panel-content
            //-   | {{ post.message }}
</template>

<script>
import { mapState } from 'vuex'
import ThreadService from '@/services/ThreadService'
import CourseService from '@/services/CourseService'
import PostService from '@/services/PostService'

export default {
  name: 'ShowCourseThread',
  props: ['lesson_pos'],
  data () {
    return {
      avatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
      threads: [],
      course: null,
      message: '',
      file: null,
      grade: 0,
      requiredRules: [
        v => !!v || "This field is required"
      ],
      currentThread: []
    }
  },

  computed: {
    ...mapState(['user'])
  },

  methods: {
    adjustAspectRatioForFullScreen (width, height) {
      var aspectRatio = this.originalHeight / this.originalWidth;
      var desiredHeight = width * aspectRatio;
      if (desiredHeight > height) {
        this.videoHeight = height;
        this.videoWidth = height / aspectRatio;
      } else if (desiredHeight == height) {
        this.videoHeight = height;
        this.videoWidth = width;
      } else {
        this.videoHeight = desiredHeight;
        this.videoWidth = width;
      }
    },

    async create_post (event, thread, idx) {
      if (this.$refs[`form-${thread.id}`][0].validate()) {
        var formData = new FormData()
        formData.set('tid', thread.id)
        formData.set('message', this.message)
        formData.set('grade', this.grade)
        formData.append('video', this.file)
        const response = await PostService.create(formData)
        // threadResponse = await ThreadService.show(this.lesson.id, this.user.id)
        this.threads[idx].posts.splice(this.threads[idx].posts.length, 0, response.data.post)
        this.file = null
        this.message = null
      } else {
        return
      }
    },

    async deletePost (event, thread, idx, post) {
      if (confirm('Are you sure you want to delete?')) {
        await PostService.delete(post.id)
        this.threads[idx].posts.splice(this.threads[idx].posts.indexOf(post), 1)
      }
    },
  },

  mounted: async function () {
    const courseResponse = await CourseService.show(this.$route.params.course_id)
    this.course = courseResponse.data.course
    for (var i = 0; i < this.course.lessons.length; i++) {
      const response = await ThreadService.show(this.course.lessons[i].id, this.$route.params.student_id)
      this.threads.push(response.data.thread)
    }
    if (this.user.isStudent) {
      this.$store.dispatch('setNotifications', this.$store.state.notifications - this.course.unreadTutorPost)
    } else {
      this.$store.dispatch('setNotifications', this.$store.state.notifications - this.course.unreadStudentPost)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v-avartar {
  vertical-align: text-top !important;
  width: 64px !important;
  height: 64px !important;
}
</style>
