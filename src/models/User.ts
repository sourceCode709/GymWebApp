import { firestore } from "firebase/app";
import { Exercise } from "@/models/Exercise";

export type DataConverter<T> = firestore.FirestoreDataConverter<T>;
export type DocumentData = firestore.DocumentData;
export type QueryDocumentSnapshot<T> = firestore.QueryDocumentSnapshot<T>;

// export class ConverterSerializationError extends Error {}
// export class ConverterDeserializationError extends Error {}

export class User {
  Name: string;

  Email: string;

  enabled: boolean;

  access: number;

  CreationDate: Date;

  LastLogin: Date;

  LoginAttempts: number;

  Exercises: Array<{
    Name: string;
    Sets: string;
    Reps: string;
    Weight: string;
  }>;

  constructor(
    Name = "",
    Email = "",
    enabled = false,
    access = 0,
    CreationDate = new Date(),
    LastLogin = new Date(),
    LoginAttempts = 0,
    Exercises = []
  ) {
    this.Name = Name;
    this.Email = Email;
    this.enabled = enabled;
    this.access = access;
    this.CreationDate = CreationDate;
    this.LastLogin = LastLogin;
    this.LoginAttempts = LoginAttempts;
    this.Exercises = Exercises;

    if (this.Name == null) {
      this.Name = "";
    }
    if (this.Email == null) {
      this.Email = "";
    }
  }
}

export const UserConverter = {
  toFirestore(user: User): firestore.DocumentData {
    // console.log("toFirestore");
    let timeStampDate;
    let loginTimeStamp;

    // convert Date obj to timestamps
    try {
      if (user.CreationDate) {
        // timeStampDate = new firestore.Timestamp(rep.CreationDate.getTime() / 1000, 0);
        timeStampDate = new firestore.Timestamp(
          user.CreationDate.getTime() / 1000,
          0
        );
      }
      if (user.LastLogin) {
        loginTimeStamp = new firestore.Timestamp(
          user.LastLogin.getTime() / 1000,
          0
        );
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }

    return {
      Name: user.Name,
      Email: user.Email,
      enabled: user.enabled,
      access: user.access,
      CreationDate: timeStampDate,
      LastLogin: loginTimeStamp,
      LoginAttempts: user.LoginAttempts,
      Exercises: user.Exercises,
    };
  },

  fromFirestore(
    snapshot: firestore.QueryDocumentSnapshot<firestore.DocumentData>
  ): User {
    // console.log("fromFirestore");
    const user = snapshot.data();

    if (user.CreationDate) {
      user.CreationDate = new Date(user.CreationDate.seconds * 1000);
    }
    if (user.LastLogin) {
      user.LastLogin = new Date(user.LastLogin.seconds * 1000);
    }

    return user as User;
  },
};
