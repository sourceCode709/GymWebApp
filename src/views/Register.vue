<template>
  <v-container class="col-md-6">
    <v-card>
      <v-card-title class="justify-center">
        <h2>Register</h2>
      </v-card-title>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <v-form @submit.prevent="submit">
        <v-row justify="center">
          <v-col cols="12" sm="6">
            <v-text-field
              id="Name"
              type="text"
              v-model="user.Name"
              label="Name"
              required
              autofocus
              @change="formChange"
            >
            </v-text-field>
          </v-col>
        </v-row>

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

        <!-- <v-row justify="center">
          <v-col cols="12" sm="6">
            <div
              v-for="role in roles"
              :key="role"
              class="d-flex align-items-center flex-column bd-highlight"
            >
              <v-checkbox
                align="center"
                hide-details
                class="p-2 bd-highlight"
                id="role"
                :value="role.value"
                :label="role.name"
                v-model="usrAccess"
                @change="formChange"
              >
              </v-checkbox>
            </div>
          </v-col>
        </v-row> -->

        <v-row justify="center">
          <v-col cols="12" sm="6">
            <password
              id="password"
              label="Password:"
              v-model="password"
              placeholder="Enter password"
              :toggle="true"
              :rules="passRules"
              @score="showScore"
              @change="formChange"
              required
            />
          </v-col>
        </v-row>

        <v-row justify="center">
          <v-col cols="12" sm="6">
            <v-text-field
              id="ConfPassword"
              label="Confirm Password:"
              v-model="confPassword"
              type="password"
              placeholder="Confirm password"
              required
              @change="formChange"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <br />
        <v-btn
          :disabled="confPassword != password || !dirty"
          variant="primary"
          type="submit"
        >
          Register
        </v-btn>
      </v-form>
    </v-card>
    <v-card v-if="success" title="Success!">
      <v-card-text>
        You have successfully registered. Now check your email for a
        verification link. Once you've verified, click the link below to login.
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { User, UserConverter } from "../models/User";
import _ from "lodash";
import Password from "vue-password-strength-meter";
import { Access } from "../models/Access";
import { firestore, fb } from "@/main";

@Component({
  components: {
    Password,
  },
})
export default class Register extends Vue {
  private user = new User();

  private origUser: User = new User();

  private confPassword = "";

  private password = "";

  private error = "";

  private success = false;

  private dirty = false;

  private psswrdStr = 0;

  private roles: Array<{ value: number; name: string }> = [
    { value: Access.GENERAL, name: "General User" },
    { value: Access.ADMIN, name: "Admin" },
  ];

  private usrAccess: Array<number> = [];

  private emailRule: Array<unknown> = [];

  async created(): Promise<void> {
    this.origUser = _.cloneDeep(this.user);
  }

  async submit(): Promise<void> {
    await fb
      .auth()
      .createUserWithEmailAndPassword(this.user.Email, this.password)
      .then((data) => {
        // const dataUsr = data.user as firebase.User;
        // dataUsr
        if (data.user != null) {
          data.user
            .updateProfile({
              displayName: this.user.Name,
            })
            .then(async () => {
              // Here we need to create the user record for our permissions handling
              await this.createUser(this.user.Email);

              // send verification email and logout
              if (data.user != null) {
                data.user.sendEmailVerification();
              }

              await fb
                .auth()
                .signOut()
                .then(() => {
                  this.success = true;
                });
              this.$router.push({ name: "login" }).catch();
            });
        }
      })
      .catch((err) => {
        this.error = err.message;
      });
    this.dirty = !this.dirty;
  }

  async createUser(email: string): Promise<string> {
    // remove when roles are decided
    this.usrAccess = [255];
    const len = this.usrAccess.length;

    for (let i = 0; i < len; i++) {
      this.user.access |= this.usrAccess[i];
    }

    await firestore
      .collection("Users")
      .withConverter(UserConverter)
      .doc(email)
      .set({
        Name: this.user.Name,
        Email: this.user.Email,
        enabled: true,
        access: this.user.access,
        CreationDate: new Date(),
        LastLogin: new Date(),
        LoginAttempts: this.user.LoginAttempts,
        Exercises: [],
      })
      .then(async () => {
        console.log(`${email} - user created`);
      })
      .catch((e) => {
        console.log(e.message);
        this.error = e.message;
      });

    return this.error;
  }

  validatePassword(): void {
    if (this.confPassword !== this.password) {
      this.error = "Passwords do not match.";
    } else {
      this.error = "";
    }
  }

  showScore(score: number): void {
    this.psswrdStr = score;

    if (score < 3) {
      this.error = "Password is not strong enough.";
    } else {
      this.error = "";
    }
  }

  emailRules(): Array<unknown> {
    if (!/.+@.+\..+/.test(this.user.Email)) {
      this.error = "Invalid Email";
    }
    return [(v: any) => /.+@.+\..+/.test(v) || this.error];
  }

  passRules(): unknown {
    if (!/.+@.+\..+/.test(this.password)) {
      this.error = "common.fieldreq";
    }
    return [(v: any) => !!v || this.error];
  }

  formChange(): void {
    this.dirty = !_.isEqual(this.origUser, this.user);
    this.emailRule = this.emailRules();
  }
}
</script>
