<template>
  <v-container class="col-md-6">
    <v-card>
      <v-card-title class="justify-center">
        <h2>Login</h2>
      </v-card-title>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <v-form @submit.prevent="submit">
        <v-row justify="center">
          <v-col cols="12" sm="6">
            <v-text-field
              id="Email"
              label="Email address"
              v-model="user.Email"
              type="email"
              required
              :rules="emailRule"
              @change="formChange"
            >
            </v-text-field>
          </v-col>
        </v-row>

        <v-row justify="center">
          <v-col cols="12" sm="6">
            <v-text-field
              id="Password"
              label="Password:"
              v-model="password"
              type="password"
              placeholder="Password"
              required
              @change="formChange"
            >
            </v-text-field>
          </v-col>
        </v-row>

        <v-row justify="center">
          <v-btn color="primary" text x-small link absolute left class="mt-4" to="/register">
            Register
          </v-btn>
          <v-btn :disabled="!dirty" variant="primary" type="submit">
            Login
          </v-btn>
          <v-btn
            color="primary"
            text
            x-small
            link
            absolute
            right
            class="mt-4 ml-12"
            to="/register"
          >
            Forgot password?
          </v-btn>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { firestore, fb } from "@/main";
import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import store from "@/store";
import _ from "lodash";
import { logUserIn, logUserOut } from "@/common/loginFunctions";
import { User } from "../models/User";

@Component
export default class Login extends Vue {
  private user: User = new User();

  private error = "";

  private success = false;

  private dirty = false;

  private origUser: User = new User();

  private pwdStrength = 0;

  private password = "";

  private emailRule: Array<unknown> = [];

  @Getter
  public loggedIn!: false;

  created(): void {
    this.origUser = _.cloneDeep(this.user);
  }

  async submit(): Promise<void> {
    await fb
      .auth()
      .signInWithEmailAndPassword(this.user.Email, this.password)
      .then(async (data) => {
        if (data.user?.emailVerified) {
          this.user.LoginAttempts = 0;
          await firestore
            .collection("Users")
            .doc(this.user.Email)
            .update({
              LoginAttempts: this.user.LoginAttempts,
            })
            .catch(async (e) => {
              console.log(e);
            });

          logUserIn(
            data.user.email as string,
            data.user.displayName as string,
            "Home"
          );
        } else {
          // email not verified - give em a msg and log em out
          this.error =
            "Email address is not verified - please check your email.";
        }
      })
      .catch(async (err: string) => {
        this.user.LoginAttempts += 1;
        await firestore
          .collection("Users")
          .doc(this.user.Email)
          .update({
            LoginAttempts: this.user.LoginAttempts,
          })
          .catch(async (e: string) => {
            console.log(e);
          });
        this.error = err;
      });
    this.dirty = !this.dirty;
  }

  private register(): void {
    this.$router
      .push({
        name: "Register",
      })
      .catch((e) => {
        console.log(e);
      });
  }

  private formChange() {
    this.dirty = !_.isEqual(this.origUser, this.user);
    this.emailRule = this.emailRules();
  }

  passwordChange(): void {
    fb.auth()
      .sendPasswordResetEmail(this.user.Email)
      .then(() => {
        this.success = true;
        // console.log(`${this.user.Email} - Sending pasword reset email..`);
      })
      .catch((error) => {
        this.error = error.message;
      });
  }

  emailRules(): Array<unknown> {
    if (!/.+@.+\..+/.test(this.user.Email)) {
      this.error = "Invalid Email";
    } else {
      this.error = "";
    }
    return [(v: any) => /.+@.+\..+/.test(v) || this.error];
  }
}
</script>
