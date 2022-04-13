import QueryRef from "@/models/QueryRef";
import firebase, { firestore } from "firebase/app";
import { fs, dbRef } from "@/common/Database";
import { Exercise } from "@/models/Exercise";
import { Workout } from "@/models/Workout";

export async function getExercises(
  query: QueryRef,
  user: any,
  access: number
): Promise<Array<Exercise>> {
  const ref = dbRef.exercises;
  let queryRef: firestore.Query<Exercise> | undefined;

  if (query.Filters) {
    query.Filters.forEach((filt) => {
      queryRef = (queryRef || ref).where(
        filt.filter,
        filt.condition,
        filt.value
      );
    });
  }

  const mapSnap = await (queryRef || ref).get();
  return mapSnap.docs
    .map((doc) => doc.data())
    .filter((data) => data !== undefined);
}

export async function getWorkouts(
  query: QueryRef,
  user: any,
  access: number
): Promise<Array<Workout>> {
  const ref = dbRef.workouts;
  let queryRef: firestore.Query<Workout> | undefined;

  if (query.Filters) {
    query.Filters.forEach((filt) => {
      queryRef = (queryRef || ref).where(
        filt.filter,
        filt.condition,
        filt.value
      );
    });
  }

  const mapSnap = await (queryRef || ref).get();
  return mapSnap.docs
    .map((doc) => doc.data())
    .filter((data) => data !== undefined);
}

export async function getPlannedWorkouts(
  query: QueryRef,
  user: any,
  access: number
): Promise<Array<Workout>> {
  const ref = dbRef.plannedWorkouts;
  let queryRef: firestore.Query<Workout> | undefined;

  if (query.Filters) {
    query.Filters.forEach((filt) => {
      queryRef = (queryRef || ref).where(
        filt.filter,
        filt.condition,
        filt.value
      );
    });
  }

  const mapSnap = await (queryRef || ref).get();
  return mapSnap.docs
    .map((doc) => doc.data())
    .filter((data) => data !== undefined);
}

export async function getPastWorkouts(
  query: QueryRef,
  user: any,
  access: number
): Promise<Array<Workout>> {
  const ref = dbRef.pastWorkouts;
  let queryRef: firestore.Query<Workout> | undefined;

  if (query.Filters) {
    query.Filters.forEach((filt) => {
      queryRef = (queryRef || ref).where(
        filt.filter,
        filt.condition,
        filt.value
      );
    });
  }

  const mapSnap = await (queryRef || ref).get();
  return mapSnap.docs
    .map((doc) => doc.data())
    .filter((data) => data !== undefined);
}
