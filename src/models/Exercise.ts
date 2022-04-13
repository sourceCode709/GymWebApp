import { firestore } from "firebase/app";
import { Set } from "@/models/Set";

export type DataConverter<T> = firestore.FirestoreDataConverter<T>;
export type DocumentData = firestore.DocumentData;
export type QueryDocumentSnapshot<T> = firestore.QueryDocumentSnapshot<T>;

export class Exercise {
  id?: string;
  Name: string;
  NumberOfSets: number;
  Sets: Array<Set>;
  UserID: string;
  IsSelectable: boolean;
  Complete: boolean;

  constructor(
    Name = "",
    Sets = [],
    UserID = "",
    NumberOfSets = 0,
    IsSelectable = true,
    Complete = false
  ) {
    this.Name = Name;
    this.Sets = Sets;
    this.UserID = UserID;
    this.NumberOfSets = NumberOfSets;
    this.IsSelectable = IsSelectable;
    this.Complete = Complete;
  }
}
