<template>
  <v-container>
    <br />
    <br />
    <v-card max-width="600" class="mx-auto">
      <v-card-title class="justify-center" primary-title>
        <v-col>
          <h2>Exercises</h2>
        </v-col>
        <v-btn fab dark small color="primary" @click="addExercise()">
          New
        </v-btn>
      </v-card-title>
      <v-card-title>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-overlay :value="showOverlay">
        <v-progress-circular indeterminate color="primary" />
      </v-overlay>
      <v-data-table
        :headers="headers"
        :items="exercisesData"
        :search="search"
        @click:row="(item) => editExercise(item)"
      ></v-data-table>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Exercise } from "@/models/Exercise";
import { Getter } from "vuex-class";
import { getExercises } from "@/common/QueryClient";
import { query } from "@/models/QueryRef";

@Component({
  components: {},
})
export default class Exercises extends Vue {
  private exercises: Array<Exercise> = [];

  private showOverlay = false;

  private exercisesData: Array<{
    name: string;
    sets: number;
  }> = [];

  private query = query;

  private search = "";

  private headers = [
    {
      text: "Exercise",
      align: "start",
      value: "name",
    },
    {
      text: "Sets",
      value: "sets",
    },
  ];

  @Getter
  public user;

  @Getter
  public access;

  async created(): Promise<void> {
    this.showOverlay = true;
    this.query.Filters = [];
    this.query.Filters.push({
      filter: query.UserID,
      condition: "==",
      value: this.user.data.Email,
    });

    this.exercises = await getExercises(this.query, this.user, this.access);
    this.query.Filters = undefined;

    this.exercises.forEach((exer) => {
      this.exercisesData.push({
        name: exer.Name,
        sets: exer.NumberOfSets,
      });
    });
    this.showOverlay = false;
  }

  addExercise(): void {
    this.$router
      .push({
        name: "ExerciseForm",
        params: { BackName: "Exercises" },
      })
      .catch((e) => {
        console.log(e);
      });
  }

  editExercise(item): void {
    this.$router
      .push({
        name: "ExerciseForm",
        params: {
          UserID: this.user.data.Email,
          ExerciseName: item.name,
          BackName: "Exercises",
        },
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
</script>
