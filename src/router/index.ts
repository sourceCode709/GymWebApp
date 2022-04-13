import Vue from "vue";
import VueRouter, { Route, RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import Exercises from "../views/Exercises.vue";
import ViewWorkout from "../views/ViewWorkout.vue";
import Workouts from "../views/Workouts.vue";
import GuestHome from "../views/GuestHome.vue";
import ExerciseForm from "../components/ExerciseForm.vue";
import WorkoutForm from "../components/WorkoutForm.vue";
import { Access } from "@/models/Access";
import store from "@/store";

Vue.use(VueRouter);

export const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      requiresAuth: true,
      roleReqd: Access.GENERAL,
      hidden: true,
    },
  },
  {
    path: "/about",
    name: "About",
    component: About,
    meta: {
      requiresAuth: false,
      roleReqd: Access.NO_ROLE,
      hidden: true,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: {
      requiresAuth: false,
      roleReqd: Access.NO_ROLE,
      hidden: false,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      requiresAuth: false,
      roleReqd: Access.NO_ROLE,
      hidden: false,
    },
  },
  {
    path: "/exercises",
    name: "Exercises",
    component: Exercises,
    meta: {
      requiresAuth: true,
      roleReqd: Access.ADMIN,
      hidden: true,
    },
  },
  {
    path: "/exerciseForm",
    name: "ExerciseForm",
    component: ExerciseForm,
    meta: {
      requiresAuth: true,
      roleReqd: Access.ADMIN,
      hidden: true,
    },
  },
  {
    path: "/workouts",
    name: "Workouts",
    component: Workouts,
    meta: {
      requiresAuth: true,
      roleReqd: Access.ADMIN,
      hidden: true,
    },
  },
  {
    path: "/workout",
    name: "ViewWorkout",
    component: ViewWorkout,
    meta: {
      requiresAuth: true,
      roleReqd: Access.ADMIN,
      hidden: true,
    },
  },
  {
    path: "/workoutForm",
    name: "WorkoutForm",
    component: WorkoutForm,
    meta: {
      requiresAuth: true,
      roleReqd: Access.ADMIN,
      hidden: true,
    },
  },
  {
    path: "/guestHome",
    name: "GuestHome",
    component: GuestHome,
    meta: {
      requiresAuth: false,
      roleReqd: Access.NO_ROLE,
      hidden: true,
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to: Route, from: Route, next) => {
  if (
    to.matched.some((record: any) => record.meta.requiresAuth) &&
    !store.getters.isAuthenticated
  ) {
    // You can use store variable here to access globalError or commit mutation
    // store the path the user was looking for
    sessionStorage.setItem("redirectPath", to.path);
    next("/login");
  } else if (!(to.meta?.roleReqd & store.getters.access)) {
    // You can use store variable here to access globalError or commit mutation
    next("/login");
  } else {
    next();
  }
});

export default router;
