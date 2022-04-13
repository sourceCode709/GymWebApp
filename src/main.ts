import "./router/componentHooks";
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import firebase, { auth } from "./common/Database";
import "firebase/firestore";
import { logUserIn } from "@/common/loginFunctions";
import { Access } from "@/models/Access";
import VueAlertify from "vue-alertify";

Vue.use(VueAlertify);

Vue.config.productionTip = false;

const app = new Vue({
  vuetify,
  router,
  store,
  render: (h) => h(App),
});

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("../public/service-worker.js")
//     .then(function (reg) {
//       console.log("Successfully registered service worker", reg);
//     })
//     .catch(function (err) {
//       console.warn("Error whilst registering service worker", err);
//     });
// }

export const firestore = firebase.firestore();
export const fb = firebase;
export const BuildDate = document.documentElement.dataset.buildTimestampUtc;

firebase.auth().onAuthStateChanged(async (user) => {
  try {
    if (user) {
      await logUserIn(user.email!, user.displayName!, "");
    } else {
      // clear user data
      await store.dispatch("setAdmin", false);
      await store.dispatch("fetchUser", null);
      await store.dispatch("setRole", Access.NO_ROLE);
    }
  } catch (error) {
    console.log(error);
  }
  // store.dispatch('fetchUser', user)
  app.$mount("#app");
});
