<template>
  <v-container>
    <br />
    <br />
    <v-card max-width="600" class="mx-auto">
      <v-form @submit.prevent="submit">
        <v-row justify="center">
          <v-btn v-if="!editExercise" icon small class="mt-5" fab absolute left>
            <v-icon color="primary" fab absolute dense @click="goBack()">
              mdi-arrow-left
            </v-icon>
          </v-btn>
          <v-col cols="12" sm="6">
            <v-text-field
              id="Name"
              label="Exercise Name"
              v-model="exercise.Name"
              type="string"
              required
              :disabled="showExistingExer && !editExercise"
            >
            </v-text-field>
          </v-col>

          <v-btn icon small class="mt-5" fab absolute right>
            <v-icon
              color="primary"
              fab
              absolute
              dense
              v-if="!editExercise && showExistingExer"
              @click="onDelete()"
            >
              mdi-trash-can-outline
            </v-icon>
          </v-btn>
        </v-row>

        <v-row justify="center">
          <v-col cols="12" sm="4">
            <v-combobox
              id="Sets"
              label="Sets"
              v-model="exercise.NumberOfSets"
              :items="setOptions"
              required
              :disabled="showExistingExer && !editExercise"
              outlined
              dense
            />
          </v-col>
        </v-row>

        <v-row
          justify="center"
          v-for="theSet in exercise.NumberOfSets"
          :key="theSet"
        >
          <v-col cols="6" sm="4">
            <v-combobox
              id="Reps"
              label="Reps"
              v-model="tempReps[theSet]"
              required
              :items="repOptions"
              :disabled="showExistingExer && !editExercise"
              @change="addRepsToset(tempReps[theSet], theSet)"
              outlined
              dense
            />
            <v-divider />
          </v-col>

          <v-col cols="6" sm="4">
            <v-combobox
              id="Weight"
              label="Weight (Lbs)"
              v-model="tempWeights[theSet]"
              required
              :items="weightOptions"
              :disabled="showExistingExer && !editExercise"
              @change="addWeightsToset(tempWeights[theSet], theSet)"
              outlined
              dense
            />
            <v-divider />
          </v-col>
        </v-row>

        <v-btn
          v-if="showExistingExer && editExercise"
          variant="primary"
          @click="onCancel()"
          >Cancel
        </v-btn>

        <v-btn
          v-if="showExistingExer && !editExercise"
          variant="primary"
          @click="editExercise = true"
          >Edit
        </v-btn>

        <v-btn
          v-if="editExercise"
          :disabled="!dirty"
          variant="primary"
          @click="updateExercise()"
          >Update
        </v-btn>

        <v-btn
          :disabled="!dirty"
          v-if="!showExistingExer"
          variant="primary"
          type="submit"
          >Add
        </v-btn>
      </v-form>
    </v-card>
    <br />

    <v-snackbar v-model="updateSnackbar" :timeout="timeout">
      {{ updateMessage }}

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="updateSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

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
      <v-dialog v-model="deleteDialog" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Action Required!
          </v-card-title>

          <v-card-text>
            Are you sure you want to delete this exercise?
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="deleteDialog = false">
              Cancel
            </v-btn>

            <v-btn color="primary" text @click="deleteExercise()"> OK </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Getter } from "vuex-class";
import { Exercise } from "@/models/Exercise";
import _ from "lodash";
import { dbRef } from "@/common/Database";
import store from "@/store";
import { getExercises } from "@/common/QueryClient";
import { query } from "@/models/QueryRef";
import { Set } from "@/models/Set";

@Component
export default class Exercises extends Vue {
  private exercise = new Exercise();

  private exercises: Array<Exercise> = [];

  private dirty = false;

  private origForm = new Exercise();

  private showExistingExer = false;

  private query = query;

  private editExercise = false;

  private exerciseID = "";

  private leaveDialog = false;

  private cancelDialog = false;

  private deleteDialog = false;

  private set = new Set();

  private setOptions: Array<number> = [];

  private repOptions = [1];

  private weightOptions: Array<number> = [];

  private setsReps: Array<number> = [];

  private maxSets = 10;

  private maxReps = 30;

  private repCount = 1;

  private weightCount = 0;

  private tempReps: Array<number> = [];

  private tempWeights: Array<number> = [];

  private updateMessage = "";

  private updateSnackbar = false;

  private timeout = 2000;

  @Getter
  public user;

  @Getter
  public access;

  @Getter
  public nextRoute;

  @Watch("exercise.NumberOfSets")
  numSetChange(): void {
    this.formChange();
  }

  @Watch("exercise.Sets")
  repChange(): void {
    this.formChange();
  }

  async created(): Promise<void> {
    // check if sent from WorkoutForm
    if (this.nextRoute) {
      await store.dispatch("setAddedExer", true);
    }

    for (let i = 1; i <= this.maxSets; i++) {
      this.setOptions.push(i);
      this.repOptions.push(this.repCount, this.repCount + 1, this.repCount + 2);
      this.repCount = this.repCount + 3;
    }

    for (let j = 0; j <= 200; j++) {
      this.weightOptions.push(this.weightCount);
      this.weightCount += 5;
    }

    if (!this.$route.params.UserID) {
      this.showExistingExer = false;
    } else {
      this.showExistingExer = true;

      this.query.Filters = [];
      this.query.Filters.push(
        {
          filter: query.UserID,
          condition: "==",
          value: this.$route.params.UserID,
        },
        {
          filter: query.Exercise,
          condition: "==",
          value: this.$route.params.ExerciseName,
        }
      );
      this.exercises = await getExercises(this.query, this.user, this.access);
      this.exercise = this.exercises[0];
      this.exerciseID = this.exercise.id as string;
      this.query.Filters = undefined;

      this.resetWeightReps();
    }
    this.origForm = _.cloneDeep(this.exercise);
  }

  private formChange() {
    this.dirty = !_.isEqual(this.origForm, this.exercise);
  }

  addWeightsToset(weightSelected, theSet): void {
    this.exercise.Sets[theSet - 1].Weight = weightSelected;
    this.formChange();
  }

  addRepsToset(repsSelected, theSet): void {
    this.exercise.Sets[theSet - 1] = new Set();
    this.exercise.Sets[theSet - 1].Reps = repsSelected;
    this.formChange();
  }

  async submit(): Promise<void> {
    this.exercise.UserID = this.user.data.Email;
    await dbRef.exercises
      .add({ ...this.exercise })
      .then(() => {
        this.dirty = false;
        let next = this.nextRoute;
        next ? this.nextRoute : "Exercises";

        this.$router.push({ name: next }).catch((e) => {
          console.log(e);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async updateExercise(): Promise<void> {
    await dbRef.exercises
      .doc(this.exerciseID)
      .set(this.exercise, { merge: true })
      .then(() => {
        this.dirty = false;
        this.editExercise = false;
        this.updateSnackbar = true;
        this.updateMessage = "Exercise successfully updated!";
      })
      .catch((err) => {
        this.updateMessage = "Update failed, please try again.";
        console.log(err);
      });
  }

  goBack(): void {
    this.$route.params.WorkoutTitle ? this.$route.params.WorkoutTitle : "";
    this.$router
      .push({
        name: this.$route.params.BackName,
        params: { WorkoutTitle: this.$route.params.WorkoutTitle },
      })
      .catch((err) => {
        console.log(err);
      });
  }

  onCancel(): void {
    if (this.dirty) {
      this.cancelDialog = true;
    } else {
      this.editExercise = false;
    }
  }

  leavePage(): void {
    this.dirty = false;
    this.goBack();
  }

  confirmCancel(): void {
    this.exercise = _.cloneDeep(this.origForm);
    this.resetWeightReps();
    this.cancelDialog = false;
    this.editExercise = false;
    this.dirty = false;
  }

  // reset weights and reps displayed
  resetWeightReps(): void {
    this.tempReps = [];
    this.tempWeights = [];
    this.tempReps.push(0);
    this.tempWeights.push(0);
    this.exercise.Sets.forEach((set) => {
      this.tempReps.push(set.Reps);
      this.tempWeights.push(set.Weight);
    });
  }

  onDelete(): void {
    this.deleteDialog = true;
  }

  async deleteExercise(): Promise<void> {
    await dbRef.exercises
      .doc(this.exerciseID)
      .delete()
      .then(() => {
        this.deleteDialog = false;
        this.$router.push({ name: "Exercises" }).catch((err) => {
          console.log(err);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // confirm before leaving page if editted form not saved to db
  async beforeRouteLeave(to, from, next): Promise<void> {
    if (this.dirty) {
      this.leaveDialog = true;
    } else {
      next();
    }
  }
}
</script>
