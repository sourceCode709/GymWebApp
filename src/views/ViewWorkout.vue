<template>
  <v-container>
    <br />
    <v-card max-width="550" class="mx-auto">
      <v-card-title class="justify-center" primary-title>
        <v-btn
          v-if="$route.params.BackName"
          icon
          small
          class="mb-16"
          fab
          absolute
          left
        >
          <v-icon color="primary" fab absolute dense @click="goBack()">
            mdi-arrow-left
          </v-icon>
        </v-btn>
        <v-col cols="12">
          <h2>{{ workout.Title }}</h2>
        </v-col>

        <v-card-text v-if="workout.Complete"
          >Workout Duration: {{ showWorkoutDur }}</v-card-text
        >

        <template>
          <div v-show="workoutStarted" class="base-timer">
            <svg
              class="base-timer__svg"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g class="base-timer__circle">
                <circle
                  class="base-timer__path-elapsed"
                  cx="50"
                  cy="50"
                  r="46.5"
                />
              </g>
            </svg>
            <v-card-text class="base-timer__label">
              {{ timerTenMinutes }}{{ timerMinutes }}:{{ timerTenSeconds
              }}{{ timerSeconds }}
            </v-card-text>
          </div>
        </template>
      </v-card-title>
      <v-row v-for="exercise in workout.Exercises" :key="exercise.name">
        <v-col>
          <v-item-group>
            <v-item>
              <v-card max-width="450" class="mx-auto">
                <v-card-text @click="exercise.Complete = !exercise.Complete">
                  <v-row>
                    <v-col>
                      <h3>{{ exercise.Name }}</h3>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-row v-if="!exercise.Complete">
                  <v-col
                    v-for="set in exercise.Sets"
                    :key="set.id"
                    align="center"
                  >
                    <v-btn
                      :disabled="!workoutStarted"
                      v-if="!set.Complete"
                      elevation="2"
                      fab
                      @click="setComplete(set)"
                    >
                      {{ set.Reps }}
                    </v-btn>

                    <v-btn
                      :disabled="!workoutStarted"
                      v-if="set.Complete"
                      color="success"
                      elevation="2"
                      fab
                      @click="setComplete(set)"
                    >
                      {{ set.Reps }}
                    </v-btn>
                    <v-col> {{ set.Weight }}lb </v-col>
                  </v-col>
                  <v-btn
                    v-if="!exercise.Complete && workoutStarted"
                    class="mb-2"
                    color="primary"
                    icon
                    x-small
                    fab
                    absolute
                    right
                    bottom
                    @click="exercise.Complete = true"
                  >
                    Done
                  </v-btn>
                </v-row>
              </v-card>
            </v-item>
          </v-item-group>
        </v-col>
      </v-row>
      <br />

      <v-btn
        v-show="!workoutStarted && !workout.Complete"
        @click="startWorkout()"
      >
        Start Workout
      </v-btn>

      <v-btn v-show="workoutStarted" @click="endWorkout()">
        Finish Workout
      </v-btn>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Getter } from "vuex-class";
import { getPlannedWorkouts } from "@/common/QueryClient";
import { query } from "@/models/QueryRef";
import { Workout } from "@/models/Workout";
import { Set } from "@/models/Set";
import { Exercise } from "@/models/Exercise";
import { dbRef } from "@/common/Database";

@Component({
  components: {},
})
export default class ViewWorkout extends Vue {
  private timerSeconds = 0;

  private timerTenSeconds = 0;

  private timerMinutes = 0;

  private timerTenMinutes = 0;

  private workoutStarted = false;

  private query = query;

  private workout = new Workout();

  private workouts: Array<Workout> = [];

  private numSets = 0;

  private color = "";

  private showWorkoutDur = "";

  private dispMins = "";

  private dispSecs = "";

  private dispHours = "";

  @Getter
  public user;

  @Getter
  public access;

  @Watch("timerSeconds")
  startTimer(): void {
    if (this.timerSeconds > 0 && this.workoutStarted) {
      setTimeout(() => {
        this.timerSeconds++;
      }, 1000);
      if (this.timerSeconds === 10) {
        this.timerTenSeconds++;
        this.timerSeconds = 0;
      }
      if (this.timerTenSeconds === 6) {
        this.timerMinutes++;
        this.timerTenSeconds = 0;
      }
      if (this.timerMinutes === 9) {
        this.timerTenMinutes++;
        this.timerMinutes = 0;
      }
    }
  }

  async created(): Promise<void> {
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
        value: this.$route.params.WorkoutTitle,
      },
      {
        filter: query.Day,
        condition: "==",
        value: this.$route.params.WorkoutDay,
      }
    );

    this.workouts = await getPlannedWorkouts(
      this.query,
      this.user,
      this.access
    );
    this.query.Filters = undefined;
    this.workout = this.workouts[0];
    console.log(this.workout);

    if (this.workout.Complete) {
      this.getWorkoutDuration();
    }
  }

  updateProgress(exercise: Exercise): void {
    exercise.Complete = !exercise.Complete;
  }

  startWorkout(): void {
    this.workoutStarted = true;
    this.timerSeconds++;
    this.workout.StartTime = new Date();
  }

  async endWorkout(): Promise<void> {
    this.workoutStarted = false;
    this.resetTimer();
    this.workout.EndTime = new Date();
    this.workout.Complete = true;
    this.getWorkoutDuration();

    await this.submitWorkout();
  }

  getWorkoutDuration(): void {
    this.workout.WorkoutDuration = 0;
    if (this.workout.StartTime && this.workout.EndTime) {
      this.workout.WorkoutDuration =
        this.workout.EndTime.getTime() - this.workout.StartTime.getTime();
    }

    const seconds = Math.floor(this.workout.WorkoutDuration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    this.dispSecs = `${seconds}`;
    this.dispMins = `${minutes}`;
    this.dispHours = `${hours}`;

    if (seconds < 10) {
      this.dispSecs = `0${seconds}`;
    }
    if (minutes < 10) {
      this.dispMins = `0${minutes}`;
    }
    if (hours < 10) {
      this.dispHours = `0${hours}`;
    }
    this.showWorkoutDur = `${this.dispHours}:${this.dispMins}:${this.dispSecs}`;
  }

  async submitWorkout(): Promise<void> {
    await dbRef.plannedWorkouts
      .doc(this.workout.id)
      .set({ ...this.workout }, { merge: true })
      .then(() => {
        this.$router.push({ name: "Home" }).catch((err) => {
          console.log(err);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  resetTimer(): void {
    this.timerSeconds = 0;
    this.timerTenSeconds = 0;
    this.timerMinutes = 0;
    this.timerTenMinutes = 0;
  }

  goBack(): void {
    this.$router.push({ name: this.$route.params.BackName }).catch((err) => {
      console.log(err);
    });
  }

  setComplete(set: Set): void {
    set.Complete = !set.Complete;
  }
}
</script>

<style scoped lang="scss">
/* Sets the containers height and width */
.base-timer {
  position: relative;
  width: 65px;
  height: 65px;
  /* Removes SVG styling that would hide the time label */
  &__circle {
    fill: none;
    stroke: none;
  }
  /* The SVG path that displays the timer's progress */
  &__path-elapsed {
    stroke-width: 7px;
    stroke: grey;
  }
  &__label {
    position: absolute;

    /* Size should match the parent container */
    width: 65px;
    height: 65px;
    /* Keep the label aligned to the top */
    top: 0;
    /* Create a flexible box that centers content vertically and horizontally */
    display: flex;
    align-items: center;
    justify-content: center;
    /* Sort of an arbitrary number; adjust to your liking */
    font-size: 20px;
    padding: 0px;
  }
}
</style>
