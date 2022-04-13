<template>
  <v-container>
    <br />
    <v-row>
      <v-col>
        <v-card max-width="600" class="mx-auto">
          <v-app-bar
            class="d-flex justify-center"
            style="border: solid #1976d2"
          >
            <v-btn x-small class="mx-2" fab text @click="getWeek('prev')">
              <v-icon dark> mdi-chevron-left </v-icon>
            </v-btn>
            <v-toolbar-title>{{ weekRange }}</v-toolbar-title>
            <v-btn x-small class="mx-2" fab text @click="getWeek('next')">
              <v-icon dark> mdi-chevron-right </v-icon>
            </v-btn>
          </v-app-bar>

          <v-overlay :value="showOverlay">
            <v-progress-circular indeterminate color="primary" />
          </v-overlay>

          <v-container>
            <v-row dense v-for="day in week" :key="day.dateString">
              <v-col cols="12">
                <v-card class="mx-auto">
                  <v-card-title class="justify-center">
                    {{ day.dateString }}
                    <v-btn
                      x-small
                      class="mx-2"
                      fab
                      absolute
                      right
                      @click="addWorkout(day.dateString)"
                      dark
                      color="primary"
                    >
                      <v-icon dark> mdi-plus </v-icon>
                    </v-btn>
                  </v-card-title>
                  <v-row
                    dense
                    v-for="workout in plannedWorkouts"
                    :key="workout.Title"
                  >
                    <v-card-text v-if="workout.Day == day.dateString">
                      <v-chip
                        color="primary"
                        outlined
                        :close="!workout.Complete"
                        @click="loadWorkout(workout)"
                        @click:close="onDelete(workout)"
                      >
                        <h4>{{ workout.Title }}</h4>
                        <v-card-text v-if="workout.Complete"
                          >Finished:
                          {{
                            workout.EndTime.toLocaleTimeString()
                          }}</v-card-text
                        >
                      </v-chip>
                    </v-card-text>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <div class="text-center">
      <v-dialog v-model="deleteDialog" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Action Required!
          </v-card-title>

          <v-card-text>
            Are you sure you want to remove your
            {{ workoutToDelete.Title }} workout from {{ workoutToDelete.Day }}?
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="cancelDelete()"> Cancel </v-btn>

            <v-btn color="primary" text @click="removeWorkout()"> OK </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import { Workout } from "@/models/Workout";
import { query } from "@/models/QueryRef";
import { getPlannedWorkouts } from "@/common/QueryClient";
import { dbRef } from "@/common/Database";
import store from "@/store";

@Component({
  components: {},
})
export default class Home extends Vue {
  private events: Array<Workout> = [];

  private week: Array<{ date: Date; dateString: string }> = [];

  private weekRange = "";

  private query = query;

  private plannedWorkouts: Array<Workout> = [];

  private curr = new Date();

  private weekStart = "";

  private weekEnd = "";

  private showOverlay = false;

  private deleteDialog = false;

  private workoutToDelete = new Workout();

  private dispWorkoutEndTime = "";

  @Getter
  public user;

  @Getter
  public access;

  @Getter
  public calWorkouts;

  async created(): Promise<void> {
    await this.getCalWorkouts();
    this.getWeek("current");
  }

  async getCalWorkouts(): Promise<void> {
    this.showOverlay = true;
    this.query.Filters = [];
    this.query.Filters.push({
      filter: query.UserID,
      condition: "==",
      value: this.user.data.Email,
    });

    const workouts = await getPlannedWorkouts(
      this.query,
      this.user,
      this.access
    );

    await store.dispatch("setCalWorkouts", workouts);

    this.query.Filters = undefined;
  }

  getWorkouts(): void {
    this.plannedWorkouts = [];
    // add date filter for each day this week
    for (const day of this.week) {
      const workout = this.calWorkouts.filter(
        (theWorkout: Workout) => theWorkout.Day == day.dateString
      );

      if (workout[0]) {
        this.plannedWorkouts.push(workout[0]);
      }
    }
    this.showOverlay = false;
  }

  async loadWorkout(workout: Workout): Promise<void> {
    console.log(workout);
    this.$router
      .push({
        name: "ViewWorkout",
        params: {
          UserID: this.user.data.Email,
          WorkoutTitle: workout.Title,
          WorkoutDay: workout.Day || "",
          BackName: "Home",
        },
      })
      .catch((e) => {
        console.log(e);
      });
  }

  getWeek(weekToGet: string): void {
    this.week = [];

    if (weekToGet === "current") {
      for (let i = 1; i <= 7; i++) {
        let first = this.curr.getDate() - (this.curr.getDay() + 1) + i;
        let theDate = new Date(this.curr.setDate(first));
        let day = theDate.toUTCString().slice(0, 16);
        this.week.push({
          date: theDate,
          dateString: day,
        });
      }
    } else if (weekToGet === "prev") {
      const lastSat = this.curr.getDate() - this.curr.getDay() - 1;
      this.curr = new Date(this.curr.setDate(lastSat));
      for (let i = 1; i <= 7; i++) {
        let first = this.curr.getDate() - (this.curr.getDay() + 1) + i;
        let theDate = new Date(this.curr.setDate(first));
        let day = theDate.toUTCString().slice(0, 16);
        this.week.push({
          date: theDate,
          dateString: day,
        });
      }
    } else if (weekToGet == "next") {
      const nextSat = this.curr.getDate() - this.curr.getDay() + 7;
      this.curr = new Date(this.curr.setDate(nextSat));
      for (let i = 1; i <= 7; i++) {
        let first = this.curr.getDate() - (this.curr.getDay() + 1) + i;
        let theDate = new Date(this.curr.setDate(first));
        let day = theDate.toUTCString().slice(0, 16);
        this.week.push({
          date: theDate,
          dateString: day,
        });
      }
    }

    this.weekStart = this.week[0].date.toDateString().slice(4, 10);
    this.weekEnd = this.week[6].date.toDateString().slice(4, 10);
    this.weekRange = this.weekStart + " - " + this.weekEnd;
    this.getWorkouts();
  }

  addWorkout(theDay: string): void {
    this.$router.push({
      name: "Workouts",
      params: {
        Day: theDay,
        BackName: "Home",
      },
    });
  }

  async removeWorkout(): Promise<void> {
    this.deleteDialog = false;
    await dbRef.plannedWorkouts
      .doc(this.workoutToDelete.id)
      .delete()
      .then(async () => {
        this.showOverlay = true;
        await this.getCalWorkouts();
        this.getWorkouts();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  cancelDelete(): void {
    this.deleteDialog = false;
  }

  // show modal when deleting
  onDelete(workout: Workout): void {
    this.workoutToDelete = workout;
    this.deleteDialog = true;
  }
}
</script>
