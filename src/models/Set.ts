import { firestore } from "firebase/app";

export type DataConverter<T> = firestore.FirestoreDataConverter<T>;
export type DocumentData = firestore.DocumentData;
export type QueryDocumentSnapshot<T> = firestore.QueryDocumentSnapshot<T>;

export class Set {
  id?: string;
  Weight: number;
  Reps: number;
  Complete: boolean;

  constructor(Reps = 0, Weight = 0, Complete = false) {
    this.Reps = Reps;
    this.Weight = Weight;
    this.Complete = Complete;
  }
}
