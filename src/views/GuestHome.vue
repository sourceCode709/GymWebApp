<template>
  <v-container>
    <v-img src="@/assets/sampleImage.jpg" />
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import { Workout } from "@/models/Workout";
import { query } from "@/models/QueryRef";
import { getWorkouts, getPlannedWorkouts } from "@/common/QueryClient";
import { dbRef } from "@/common/Database";

@Component({
  components: {},
})
export default class GuestHome extends Vue {
  register(): void {
    this.$router.push({ name: "Register" }).catch((e) => {
      console.log(e);
    });
  }
}
</script>
