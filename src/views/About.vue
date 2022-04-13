<template>
  <v-container>
    <br />
    <br />
    <v-card max-width="800" class="mx-auto">
      <v-card-title class="justify-center" primary-title>
        <h2>About Gainz</h2>
      </v-card-title>
      <v-carousel v-model="model">
        <v-carousel-item
          v-for="(color, i) in colors"
          :key="color"
          transition="fade-transition"
          reverse-transition="fade-transition"
        >
          <v-sheet :color="color" height="110%" tile>
            <v-row class="fill-height" align="center" justify="center">
              <div class="text-h2">Slide {{ i + 1 }}</div>
            </v-row>
          </v-sheet>
        </v-carousel-item>
      </v-carousel>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {},
})
export default class About extends Vue {
  private model = true;
  private colors = ["primary", "lime", "yellow darken-2", "red", "orange"];
}
</script>
