import { firestore } from "firebase/app";
import { Exercise } from "@/models/Exercise";

export type DataConverter<T> = firestore.FirestoreDataConverter<T>;
export type DocumentData = firestore.DocumentData;
export type QueryDocumentSnapshot<T> = firestore.QueryDocumentSnapshot<T>;

export class Workout {
  id?: string;
  Title: string;
  Exercises: Array<Exercise>;
  UserID: string;
  NumExercises: number;
  WorkoutDuration?: number;
  Planned?: boolean;
  Day?: string;
  Complete?: boolean;
  StartTime?: Date;
  EndTime?: Date;

  constructor(
    Exercises = [],
    Title = "",
    UserID = "",
    NumExercises = 0,
    Complete = false
  ) {
    this.Exercises = Exercises;
    this.Title = Title;
    this.UserID = UserID;
    this.NumExercises = NumExercises;
    this.Complete = Complete;
  }
}
