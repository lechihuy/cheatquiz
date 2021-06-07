<template>
  <div class="fixed top-0 w-full p-2 flex bg-gray-900">
    <div class="inline-block mx-auto">
      <button class="p-2 text-white mx-2 rounded-lg"
        :class="[{'bg-blue-400': filter === 'all'}]"
        @click="filterMessages('all')"
      >
        Tất cả
      </button>
      <button class="p-2 text-white mx-2 rounded-lg"
        :class="[{'bg-blue-400': filter === 'no-reply'}]"
        @click="filterMessages('no-reply')"
      >
        Chưa trả lời
      </button>
      <button class="p-2 text-white mx-2 rounded-lg"
        :class="[{'bg-blue-400': filter === 'your-reply'}]"
        @click="filterMessages('your-reply')"
      >
        Bạn trả lời
      </button>
      <button class="p-2 text-white mx-2 rounded-lg"
        :class="[{'bg-blue-400': filter === 'your-message'}]"
        @click="filterMessages('your-message')"
      >
        Bạn hỏi
      </button>
    </div>
  </div>
  <div class="my-14 px-2">
    <div v-for="msg, msgId in filterMessages(filter)" :key="msgId" class="my-4 border border-black">
      <div class="px-3 py-2 text-white bg-gray-800 flex items-center">
        <span>{{ msg.username }}</span>
        <div class="ml-auto flex">
          <button class="text-green-400 p-1 flex items-center"
            v-if="msg.username !== username"
            @click="replyOn(msg.username, msgId)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Trả lời
          </button>
          <button class="text-red-400 p-1 flex items-center ml-2"
            v-if="msg.username === username"
            @click="deleteMessage(msgId)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Xóa
          </button>
        </div>
      </div>
      <div class="p-3 overflow-auto text-white bg-gray-700"
      >
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-2 overflow-auto">
            <span v-html="msg.message"></span>
          </div>
          <div>
            <p v-show="msg.replies === undefined">Chưa có câu trả lời nào</p>
            <div v-show="msg.replies !== undefined" class="grid grid-cols-1 gap-2">
              <div v-for="reply, replyId in msg.replies" :key="replyId"
                class="bg-gray-800 flex overflow-auto items-stretch"
              >
                <button class="p-2 bg-gray-800"
                  v-if="reply.username === username"
                  @click="deleteReply(msgId, replyId)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <span class="p-2 bg-green-400">{{ reply.username }}</span>
                <span v-html="reply.message" class="p-2 flex-grow"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="fixed bottom-0 w-full p-2 flex bg-gray-900">
    <div contenteditable="true"
      class="outline-none bg-gray-700 flex-grow p-2 text-white"
      @input="updateMessage"
      ref="messageBox"
    ></div>
    <button class="text-white p-2 flex items-center"
      @click="sendMessage"
      :class="[replyOnMsgId ? 'bg-green-400' : 'bg-blue-400']"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      <span ref="replyOnUsername"></span>
    </button>
    <button class="text-white p-2 bg-gray-800"
      @click="cancelReply"
      v-show="replyOnMsgId"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/database'

export default {
  name: 'App',
  data() {
    return {
      message: null,
      messages: null,
      username: 'Huy',
      replyOnMsgId: null,
      filter: 'all'
    }
  },
  methods: {
    sendMessage() {
      if (this.message === null) return false
      
      let ref = this.replyOnMsgId ? this.replyOnMsgId + '/replies' : ''

      firebase.database().ref(`messages/${ref}`).push({
        message: this.message,
        username: this.username,
        createdAt: Date.now(),
      });
        
      this.message = null
      this.$refs.messageBox.innerHTML = ''
      this.cancelReply()
    },
    updateMessage(e) {
      this.message = e.target.innerHTML.trim();
    },
    deleteMessage(msgId) {
      firebase.database().ref(`messages/${msgId}`).remove()
    },
    deleteReply(msgId, replyId) {
      firebase.database().ref(`messages/${msgId}/replies/${replyId}`).remove()
    },
    replyOn(username, msgId) {
      this.replyOnMsgId = msgId
      this.$refs.replyOnUsername.innerHTML = username
    },
    cancelReply() {
      this.replyOnMsgId = null
      this.$refs.replyOnUsername.innerHTML = ''
    },
    filterMessages(filter) {
      this.filter = filter

      if (filter == 'all') return this.messages

      let filterdMessages = Object.assign({}, this.messages)

      if (filter == 'no-reply') {
        for (let msgId in filterdMessages) {
          if (filterdMessages[msgId].replies !== undefined) {
            delete filterdMessages[msgId]
          }
        }
      }

      if (filter == 'your-reply') {
        for (let msgId in filterdMessages) {
          if (filterdMessages[msgId].replies === undefined
            || Object.keys(filterdMessages[msgId].replies).find(key => {
              return filterdMessages[msgId].replies[key].username !== this.username
            })) {
            delete filterdMessages[msgId]
          }
        }
      }

      if (filter == 'your-message') {
        for (let msgId in filterdMessages) {
          if (filterdMessages[msgId].username !== this.username) {
            delete filterdMessages[msgId]
          }
        }
      }

      return filterdMessages
    }
  },
  mounted() {
    let app = this

    do {
      this.username = prompt('Tên của mày??').trim()
    } while (this.username === null || this.username == '')

    document.body.classList.add('bg-gray-900')
    var messages = firebase.database().ref('messages');
    messages.on('value', (snapshot) => {
      const data = snapshot.val();
      app.messages = data
    });
  }
}
</script>


