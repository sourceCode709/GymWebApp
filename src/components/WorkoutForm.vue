<template>
  <v-container>
    <br />
    <br />
    <v-card max-width="600" class="mx-auto">
      <v-card-title class="justify-center" primary-title>
        <v-btn v-if="!editWorkout" icon small fab absolute left>
          <v-icon color="primary" fab absolute dense @click="goBack()">
            mdi-arrow-left
          </v-icon>
        </v-btn>
        <v-col class="ml-12" v-if="!showExistWorkout">
          <h2>New Workout</h2>
        </v-col>

        <v-col v-else>
          <h2>Edit Workout</h2>
        </v-col>

        <v-btn
          v-if="editWorkout"
          dark
          small
          color="primary"
          @click="addExercise()"
        >
          New Exercise
        </v-btn>

        <v-btn v-else icon small class="mx-2" fab absolute right>
          <v-icon
            color="primary"
            fab
            absolute
            dense
            v-if="showExistWorkout && !editWorkout"
            @click="onDelete()"
          >
            mdi-trash-can-outline
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-form @submit.prevent="submit">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              id="Name"
              label="Workout Name"
              v-model="newWorkout.Title"
              type="string"
              required
              :disabled="showExistWorkout && !editWorkout"
              @change="formChange()"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <v-divider />
        <v-card-title>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="exercises"
          :search="search"
          @click:row="(item) => editExercise(item)"
          show-select
          v-model="selected"
          item-key="Name"
          selectable-key="IsSelectable"
        />

        <!-- <v-btn @click="onDelete()" v-if="showExistWorkout && !editWorkout"
          >Delete</v-btn
        > -->

        <v-btn
          right
          @click="editWorkout = true"
          v-if="showExistWorkout && !editWorkout"
          >Edit</v-btn
        >

        <v-btn @click="onCancel()" v-if="showExistWorkout && editWorkout"
          >Cancel</v-btn
        >

        <v-btn
          variant="primary"
          right
          @click="updateWorkout()"
          v-if="showExistWorkout && editWorkout"
          >Update</v-btn
        >

        <v-btn
          :disabled="!dirty"
          variant="primary"
          type="submit"
          v-if="!showExistWorkout"
          >Create
        </v-btn>
      </v-form>
    </v-card>

    <v-snackbar v-model="updateSnackbar" :timeout="timeout">
      {{ updateMessage }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="updateSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <div class="text-center">
      <v-dialog v-model="cancelDialog" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Action Required!
          </v-card-title>

          <v-card-text>
            You have unsaved changes, are you sure you want to cancel?
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="cancelDialog = false">
              Cancel
            </v-btn>

            <v-btn color="primary" text @click="confirmCancel()"> OK </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div class="text-center">
      <v-dialog v-model="leaveDialog" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Action Required!
          </v-card-title>

          <v-card-text>
            You have unsaved changes, are you sure you want to leave?
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="leaveDialog = false">
              Cancel
            </v-btn>

            <v-btn color="primary" text @click="leavePage()"> OK </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div class="text-center">
      <v-dialog v-model="deleteDialog" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Action Required!
          </v-card-title>

          <v-card-text>
            Are you sure you want to delete your
            {{ newWorkout.Title }} workout?
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="cancelDelete()"> Cancel </v-btn>

            <v-btn color="primary" text @click="deleteWorkout()"> OK </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Exercise } from "@/models/Exercise";
import { Getter } from "vuex-class";
import { dbRef } from "@/common/Database";
import store from "@/store";
import { getExercises, getWorkouts } from "@/common/QueryClient";
import { query } from "@/models/QueryRef";
import { Workout } from "@/models/Workout";
import _ from "lodash";

@Component({
  components: {},
})
export default class WorkoutForm extends Vue {
  private exercises: Array<Exercise> = [];

  private exerciseIDs: Array<string> = [];

  private newWorkout = new Workout();

  private dirty = false;

  private origForm = new Workout();

  private query = query;

  private selected: Array<Exercise> = [];

  private exercisesPicked: Array<Exercise> = [];

  private search = "";

  private editWorkout = false;

  private cancelDialog = false;

  private leaveDialog = false;

  private deleteDialog = false;

  private showExistWorkout = false;

  private timeout = 2000;

  private headers = [
    {
      text: "Exercise",
      align: "center",
      value: "Name",
    },
    {
      text: "Sets",
      align: "center",
      value: "NumberOfSets",
    },
  ];

  private loading = true;

  private updateSnackbar = false;

  private updateMessage = "";

  @Getter
  public user;

  @Getter
  public access;

  @Getter
  public formsData;

  @Getter
  public addedNewExer;

  @Getter
  public workoutForm;

  @Watch("selected")
  exercisesSelected(): void {
    if (this.selected !== this.origForm.Exercises && !this.loading) {
      this.dirty = true;
    }
    this.newWorkout.Exercises = this.selected;
  }

  @Watch("editWorkout")
  selectableExercises(): void {
    if (this.editWorkout) {
      this.exercises.forEach((exer) => {
        exer.IsSelectable = true;
      });
    } else {
      this.exercises.forEach((exer) => {
        exer.IsSelectable = false;
      });
    }
  }

  async created(): Promise<void> {
    this.query.Filters = [];
    this.query.Filters.push({
      filter: query.UserID,
      condition: "==",
      value: this.user.data.Email,
    });
    if (this.$route.params.WorkoutTitle) {
      this.showExistWorkout = true;
      this.query.Filters.push({
        filter: query.Workout,
        condition: "==",
        value: this.$route.params.WorkoutTitle,
      });

      const workouts = await getWorkouts(this.query, this.user, this.access);
      this.newWorkout = workouts[0];
      this.selected = this.newWorkout.Exercises;

      this.query.Filters.pop();
      // load workout if new exercise added
    } else if (this.addedNewExer) {
      this.showExistWorkout = true;
      this.newWorkout = this.workoutForm;
      this.selected = this.newWorkout.Exercises;

      // reset vuex
      await Promise.all([
        store.dispatch("setAddedExer", false),
        store.dispatch("setNextRoute", ""),
      ]);
    }

    this.exercises = await getExercises(this.query, this.user, this.access);

    //  make item unselectable if viewing workout
    if (this.showExistWorkout && !this.editWorkout) {
      this.exercises.forEach((exer) => {
        exer.IsSelectable = false;
      });
    }

    this.query.Filters = undefined;
    this.origForm = _.cloneDeep(this.newWorkout);
    this.loading = false;
  }

  async addExercise(): Promise<void> {
    // store workout when adding exercise during edit
    await Promise.all([
      store.dispatch("setWorkoutForm", this.newWorkout),
      store.dispatch("setNextRoute", "WorkoutForm"),
    ]);

    this.$router
      .push({
        name: "ExerciseForm",
        params: {
          WorkoutTitle: this.newWorkout.Title,
          BackName: "WorkoutForm",
        },
      })
      .catch((err) => {
        console.log(err);
      });
  }

  editExercise(item): void {
    this.$router
      .push({
        name: "ExerciseForm",
        params: {
          UserID: this.user.data.Email,
          ExerciseName: item.Name,
          WorkoutTitle: this.newWorkout.Title,
          BackName: "WorkoutForm",
        },
      })
      .catch((err) => {
        console.log(err);
      });
  }

  formChange(): void {
    this.dirty = !_.isEqual(this.origForm, this.newWorkout);
  }

  onCancel(): void {
    if (this.dirty) {
      this.cancelDialog = true;
    } else {
      this.editWorkout = false;
    }
  }

  confirmCancel(): void {
    this.newWorkout = _.cloneDeep(this.origForm);
    this.selected = this.newWorkout.Exercises;
    this.cancelDialog = false;
    this.editWorkout = false;
    this.dirty = false;
  }

  leavePage(): void {
    this.dirty = false;
    this.goBack();
  }

  goBack(): void {
    this.$router.push({ name: this.$route.params.BackName }).catch((err) => {
      console.log(err);
    });
  }

  cancelDelete(): void {
    this.deleteDialog = false;
  }

  onDelete(): void {
    this.deleteDialog = true;
  }

  async deleteWorkout(): Promise<void> {
    await dbRef.workouts
      .doc(this.newWorkout.id)
      .delete()
      .then(() => {
        this.$router.push({ name: "Workouts" }).catch((err) => {
          this.editWorkout = false;
          console.log(err);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async updateWorkout(): Promise<void> {
    await dbRef.workouts
      .doc(this.newWorkout.id)
      .set(
        {
          Exercises: this.newWorkout.Exercises,
          Title: this.newWorkout.Title,
        },
        { merge: true }
      )
      .then(() => {
        this.updateMessage = "Workout succesfully updated!";
        this.editWorkout = false;
        this.dirty = false;
      })
      .catch((err) => {
        this.updateMessage = "Update failed, please try again.";
        console.log(err);
      });
    this.updateSnackbar = true;
  }

  async submit(): Promise<void> {
    this.newWorkout.UserID = this.user.data.Email;
    this.newWorkout.NumExercises = this.newWorkout.Exercises.length;
    await dbRef.workouts
      .add({ ...this.newWorkout })
      .then(() => {
        this.dirty = false;
        this.$router.push({ name: "Workouts" }).catch((err) => {
          console.log(err);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async beforeRouteLeave(to, from, next): Promise<void> {
    if (this.dirty) {
      this.leaveDialog = true;
    } else {
      next();
    }
  }
}
</script>
