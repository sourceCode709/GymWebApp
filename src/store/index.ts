import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import firebase from "firebase/app";
import { User } from "@/models/User";
import { Access } from "@/models/Access";
import { Exercise } from "@/models/Exercise";
import { Workout } from "@/models/Workout";

Vue.use(Vuex);

interface UserState {
  data: User;
  isAdmin: boolean;
  loggedIn: boolean;
  access: number;
}

interface FormState {
  exerciseForm: Exercise;
  workoutForm: Workout;
  plannedWorkouts: Array<Workout>;
  addedNewExer: boolean;
}

interface WorkoutsState {
  calWorkouts: Array<Workout>;
}

interface AppState {
  user: UserState;
  formsData: FormState;
  workoutsData: FormState;
  nextRoute: string;
  backRoutes: Array<string>;
}

export default new Vuex.Store({
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
    }),
  ],
  state: {
    user: {
      data: new User(),
      isAdmin: false,
      loggedIn: false,
      access: 1,
    },
    formsData: {
      exerciseForm: new Exercise(),
      workoutForm: new Workout(),
      plannedWorkouts: [],
      addedNewExer: false,
    },
    workoutsData: {
      calWorkouts: [],
    },
    nextRoute: "",
    backRoutes: [],
  },
  getters: {
    user: (state) => state.user,
    data: (state) => state.user.data,
    isAuthenticated: (state) => !!state.user.loggedIn,
    isAdmin: (state) => !!state.user.isAdmin,
    access: (state) => state.user.access,
    loggedIn: (state) => state.user.loggedIn,
    formsData: (state) => state.formsData,
    exerciseForm: (state) => state.formsData.exerciseForm,
    workoutForm: (state) => state.formsData.workoutForm,
    plannedWorkouts: (state) => state.formsData.plannedWorkouts,
    addedNewExer: (state) => state.formsData.addedNewExer,
    nextRoute: (state) => state.nextRoute,
    backRoutes: (state) => state.backRoutes,
    workoutsData: (state) => state.workoutsData,
    calWorkouts: (state) => state.workoutsData.calWorkouts,
  },
  mutations: {
    SET_LOGGED_IN(state, value) {
      state.user.loggedIn = value;
    },
    SET_USER(state, data) {
      state.user.data = data;
    },
    SET_ADMIN(state, data) {
      state.user.isAdmin = data;
    },
    SET_ROLE(state, data) {
      state.user.access = data;
    },
    SET_FORMS_DATA(state, data) {
      state.formsData = data;
    },
    SET_EXER_FORM(state, data) {
      state.formsData.exerciseForm = data;
    },
    SET_WORKOUT_FORM(state, data) {
      state.formsData.workoutForm = data;
    },
    SET_WORKOUTS(state, data) {
      state.formsData.plannedWorkouts = data;
    },
    SET_NEXT_ROUTE(state, data) {
      state.nextRoute = data;
    },
    SET_BACK_ROUTES(state, data) {
      state.backRoutes = data;
    },
    SET_ADDED_EXER(state, data) {
      state.formsData.addedNewExer = data;
    },
    SET_CAL_WORKOUTS(state, value) {
      state.workoutsData.calWorkouts = value;
    },
  },
  actions: {
    async fetchUser({ commit }, user) {
      commit("SET_LOGGED_IN", user !== "");
      if (user) {
        commit("SET_USER", user);
      } else {
        commit("SET_USER", undefined);
        commit("SET_ADMIN", false);
        commit("SET_ROLE", Access.NO_ROLE);
        commit("SET_LOGGED_IN", false);
        window.sessionStorage.clear();
      }
    },
    async setAddedExer({ commit }, data) {
      commit("SET_ADDED_EXER", data);
    },
    async setWorkoutForm({ commit }, workout) {
      commit("SET_WORKOUT_FORM", workout);
    },
    async setExerciseForm({ commit }, exercise) {
      commit("SET_EXER_FORM", exercise);
    },
    async setCalWorkouts({ commit }, calWorkouts) {
      commit("SET_CAL_WORKOUTS", calWorkouts);
    },
    async setWorkouts({ commit }, workouts) {
      commit("SET_WORKOUTS", workouts);
    },
    async setNextRoute({ commit }, nextRoute) {
      commit("SET_NEXT_ROUTE", nextRoute);
    },
    async setBackRoutes({ commit }, backRoutes) {
      commit("SET_NEXT_ROUTE", backRoutes);
    },
    async setAdmin({ commit }, admin) {
      commit("SET_ADMIN", admin);
    },
    async setRole({ commit }, role) {
      if (role > 254) {
        commit("SET_ROLE", role);
        commit("SET_ADMIN", true);
      } else {
        commit("SET_ROLE", role);
      }
    },
  },
  modules: {},
});
