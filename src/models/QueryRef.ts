import firebase, { firestore } from "firebase/app";
import WhereFilterOp = firebase.firestore.WhereFilterOp;

export default interface QueryRef {
  UserID: string;
  Exercise: string;
  Workout: string;
  Day: string;
  Filters?: Array<{
    filter: string | firestore.FieldPath;
    condition: WhereFilterOp;
    value: string | Date | Array<string>;
  }>;
}

export const query: QueryRef = {
  UserID: "UserID",
  Exercise: "Name",
  Workout: "Title",
  Day: "Day",
  Filters: undefined,
};
