<template>
  <v-container>
    <br />
    <br />
    <v-card max-width="600" class="mx-auto">
      <v-card-title class="justify-center" primary-title>
        <v-btn
          v-if="$route.params.BackName"
          icon
          x-small
          class="mx-2"
          fab
          absolute
          left
        >
          <v-icon color="primary" fab absolute dense @click="goBack()">
            mdi-arrow-left
          </v-icon>
        </v-btn>
        <v-col>
          <h2>Workouts</h2>
        </v-col>
        <v-btn fab dark small color="primary" @click="createWorkout()">
          New
        </v-btn>
      </v-card-title>

      <v-overlay :value="showOverlay">
        <v-progress-circular indeterminate color="primary" />
      </v-overlay>

      <v-card-subtitle v-if="noWorkouts">
        You have no workouts create one!
      </v-card-subtitle>

      <v-btn
        small
        class="mb-2"
        v-if="noWorkouts"
        dark
        color="primary"
        @click="createWorkout()"
      >
        Create New Workout
      </v-btn>

      <v-row v-for="workout in workouts" :key="workout.Title">
        <v-col>
          <v-item-group>
            <v-item>
              <v-card
                max-width="500"
                class="mx-auto"
                @click="selectWorkout(workout.Title)"
              >
                <v-card-title class="justify-center">
                  {{ workout.Title }}
                  <v-btn
                    v-if="$route.params.Day"
                    color="primary"
                    x-small
                    class="mx-2"
                    fab
                    absolute
                    right
                    @click="addWorkoutToSchedule(workout)"
                  >
                    <v-icon dark> mdi-plus </v-icon>
                  </v-btn>

                  <v-btn v-else icon x-small class="mx-2" fab absolute right>
                    <v-icon
                      color="primary"
                      fab
                      absolute
                      dense
                      @click="onDelete(workout)"
                    >
                      mdi-trash-can-outline
                    </v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  {{ workout.NumExercises }} exercises | Created
                  {{ workout.CreatedAt.toDateString() }}
                </v-card-text>
                <v-chip
                  class="ma-2"
                  v-for="exercise in workout.Exercises"
                  :key="exercise.Name"
                >
                  {{ exercise.Name }}
                </v-chip>
              </v-card>
            </v-item>
          </v-item-group>
        </v-col>
      </v-row>
    </v-card>

    <div class="text-center">
      <v-dialog v-model="deleteDialog" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Action Required!
          </v-card-title>

          <v-card-text>
            Are you sure you want to delete your
            {{ workoutToDelete.Title }} workout?
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
import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import { dbRef } from "@/common/Database";
import { getWorkouts } from "@/common/QueryClient";
import { query } from "@/models/QueryRef";
import { Workout } from "@/models/Workout";

@Component({
  components: {},
})
export default class Workouts extends Vue {
  private workouts: Array<Workout> = [];

  private search = "";

  private showOverlay = false;

  private query = query;

  private delete = false;

  private deleteDialog = false;

  private workoutToDelete = new Workout();

  private noWorkouts = false;

  @Getter
  public user;

  @Getter
  public access;

  async created(): Promise<void> {
    await this.retrieveWorkouts();
  }

  createWorkout(): void {
    this.$router
      .push({ name: "WorkoutForm", params: { BackName: "Workouts" } })
      .catch((e) => {
        console.log(e);
      });
  }

  goBack(): void {
    this.$router.push({ name: this.$route.params.BackName }).catch((err) => {
      console.log(err);
    });
  }

  async retrieveWorkouts(): Promise<void> {
    this.showOverlay = true;
    this.query.Filters = [];
    this.query.Filters.push({
      filter: query.UserID,
      condition: "==",
      value: this.user.data.Email,
    });

    this.workouts = await getWorkouts(this.query, this.user, this.access);
    this.query.Filters = undefined;
    this.showOverlay = false;

    if (this.workouts.length <= 0) {
      this.noWorkouts = true;
    } else {
      this.noWorkouts = false;
    }
  }

  // show modal when deleting
  onDelete(workout: Workout): void {
    this.delete = true;
    this.workoutToDelete = workout;
    this.deleteDialog = true;
  }

  cancelDelete(): void {
    this.deleteDialog = false;
    this.delete = false;
  }

  async deleteWorkout(): Promise<void> {
    await dbRef.workouts
      .doc(this.workoutToDelete.id)
      .delete()
      .then(async () => {
        this.showOverlay = true;
        await this.retrieveWorkouts();
        this.deleteDialog = false;
        this.delete = false;
      })
      .catch((err) => {
        this.delete = false;
        console.log(err);
      });
  }

  async selectWorkout(workoutTitle: string): Promise<void> {
    // view workout if not adding to day or deleting
    if (!this.$route.params.Day && !this.delete) {
      this.$router
        .push({
          name: "WorkoutForm",
          params: {
            UserID: this.user.data.Email,
            WorkoutTitle: workoutTitle,
            BackName: "Workouts",
          },
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  async addWorkoutToSchedule(workout: Workout): Promise<void> {
    this.query.Filters = [];
    this.query.Filters.push(
      {
        filter: query.UserID,
        condition: "==",
        value: this.user.data.Email,
      },
      {
        filter: query.Workout,
        condition: "==",
        value: workout.Title,
      }
    );

    this.workouts = await getWorkouts(this.query, this.user, this.access);
    this.query.Filters = undefined;
    const plannedWorkout = this.workouts[0];

    // add day and plan fields to workout
    plannedWorkout.Day = this.$route.params.Day;
    plannedWorkout.Planned = true;
    console.log(plannedWorkout);

    // store in planned workout collection
    await dbRef.plannedWorkouts
      .add({ ...plannedWorkout })
      .then(() => {
        this.$router.push({
          name: "Home",
          params: {
            WorkoutTitle: workout.Title,
            Day: this.$route.params.Day,
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // testing maintenance delete all docs in collection
  async clearWorkouts(): Promise<void> {
    await dbRef.plannedWorkouts.get().then((snap) => {
      snap.docs.forEach((doc) => {
        doc.ref.delete();
      });
    });
  }
}
</script>
