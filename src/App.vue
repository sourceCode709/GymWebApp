<template>
  <v-app>
    <v-app-bar
      app
      class="d-flex justify-center"
      color="primary"
      clipped-left
      dark
    >
      <v-toolbar-title>Gainz</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer
      class="mt-15"
      clipped
      fixed
      v-model="drawer"
      permanent
      expand-on-hover
    >
      <v-list nav dense>
        <v-list-item-group
          v-model="group"
          active-class="blue--text text--accent-4"
        >
          <v-list-item v-if="loggedIn" to="/" key="Home">
            <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="!loggedIn" to="/guestHome" key="GuestHome">
            <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>

          <v-list-item to="/about" key="About">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>About</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="!loggedIn" to="/register" key="Register">
            <v-list-item-icon>
              <v-icon>mdi-pencil-box-outline</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Register</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="loggedIn" to="/exercises" key="Exercises">
            <v-list-item-icon>
              <v-icon>mdi-dumbbell</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Exercises</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="loggedIn" to="/workouts" key="Workouts">
            <v-list-item-icon>
              <v-icon>mdi-format-list-bulleted-square</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Workouts</v-list-item-title>
          </v-list-item>

          <v-list-item v-if="!loggedIn" to="/login" key="Login">
            <v-list-item-icon>
              <v-icon>mdi-login</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item>

          <v-list-item v-else @click="signOut()">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <v-layout>
          <router-view />
        </v-layout>
      </v-container>
    </v-main>
  </v-app>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { routes } from "@/router/index";
import { Getter } from "vuex-class";
import { logUserOut } from "./common/loginFunctions";

@Component
export default class App extends Vue {
  private drawer = false;

  private group = null;

  @Getter
  public loggedIn!: false;

  @Getter
  public isAdmin!: false;

  @Getter
  public isAuthenticated!: false;

  @Getter
  public access!: number;

  @Getter
  public user: any;

  get viewableroutes(): any {
    return routes.filter((item: any) => {
      if (item.meta && item.meta!.hidden === true) {
        return false;
      }

      if (item.meta?.roleReqd > this.access) {
        return false;
      }
      return (
        !item.meta ||
        (item.meta.requiresAuth && this.isAuthenticated) ||
        (!item.meta.requiresAuth && !this.isAuthenticated) ||
        (!item.meta.requiresAuth && item.meta.default)
      );
    });
  }

  async signOut(): Promise<void> {
    await logUserOut(this.loggedIn);
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
