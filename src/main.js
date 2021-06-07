import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import firebase from 'firebase/app'
import 'firebase/database'

var config = {
  apiKey: "AIzaSyB-cI9y4d5uU077k72iMTkjQkNcbbD_85I",
  authDomain: "mydata-99e1b.firebaseapp.com",
  databaseURL: "https://mydata-99e1b.firebaseio.com/",
  storageBucket: "bucket.appspot.com",
  projectId: 'mydata-99e1b'
};
firebase.initializeApp(config)
firebase.database()

createApp(App)
  .mount('#app')
