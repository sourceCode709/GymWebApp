import { Exercise } from "@/models/Exercise";
import { User } from "@/models/User";
import { Workout } from "@/models/Workout";
import { Set } from "@/models/Set";
import firebase, { firestore } from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const config = {
  apiKey: process.env.VUE_APP_FB_APIKEY,
  authDomain: process.env.VUE_APP_FB_AUTHDOMAIN,
  databaseURL: process.env.VUE_APP_FB_DATABASEURL,
  projectId: process.env.VUE_APP_FB_PROJECTID,
  storageBucket: process.env.VUE_APP_FB_STORAGEBUCKET,
  messagingSenderId: process.env.VUE_APP_FB_MESSAGINGSENDERID,
  appId: process.env.VUE_APP_FB_APPID,
};

const firebaseApp = firebase.initializeApp(config);
export const auth = firebaseApp.auth();

if (config.databaseURL === "http://localhost:8080") {
  const db = firebase.firestore();
  db.settings({
    host: "localhost:8080",
    ssl: false,
  });
}

interface FsSet {
  Weight: number;
  Reps: number;
  Complete: boolean;
}

interface FsExer {
  Name: string;
  NumberOfSets: number;
  Sets: Array<Set>;
  IsSelectable: boolean;
  Complete: boolean;
}

// convert to firestore
export function setConverter(set: Set): FsSet {
  const fsSet = {
    Weight: set.Weight,
    Reps: set.Reps,
    Complete: set.Complete,
  };

  return fsSet;
}

export function exerConverter(exer: Exercise): FsExer {
  const fsExer = {
    Name: exer.Name,
    NumberOfSets: exer.NumberOfSets,
    Sets: exer.Sets,
    IsSelectable: exer.IsSelectable,
    Complete: exer.Complete,
  };

  return fsExer;
}

// convert from firestore
export function fsSetConverter(fsSet: FsSet): Set {
  const set = new Set();
  set.Reps = fsSet.Reps;
  set.Weight = fsSet.Weight;
  set.Complete = false;

  return set;
}

export function fsExerConverter(fsExer: FsExer): Exercise {
  const exercise = new Exercise();
  exercise.Complete = fsExer.Complete;
  exercise.IsSelectable = fsExer.IsSelectable;
  exercise.Name = fsExer.Name;
  exercise.NumberOfSets = fsExer.NumberOfSets;
  exercise.Sets = fsExer.Sets;

  return exercise;
}

function convertTo(value: any): any {
  let val = value;
  const objKeysArr = Object.keys(value); // An array of strings that represent all the enumerable properties of the given object.
  let isRecursive = false;
  if (objKeysArr.length) {
    isRecursive = true;
  }
  if (value instanceof Date) {
    val = firestore.Timestamp.fromDate(value);
  } else if (value instanceof Set) {
    val = setConverter(value);
  } else if (value instanceof Exercise) {
    val = exerConverter(value);
  } else if (
    isRecursive &&
    objKeysArr.length > 0 &&
    typeof value !== "string"
  ) {
    for (let index = 0; index < objKeysArr.length; index++) {
      val[objKeysArr[index]] = convertTo(value[objKeysArr[index]]);
    }
  }
  return val;
}

function convertFrom(value: any): any {
  let val = value;
  const objKeysArr = Object.keys(value);
  let isRecursive = false;
  if (objKeysArr.length) {
    isRecursive = true;
  }
  if (value instanceof firestore.Timestamp) {
    val = value.toDate();
  } else if (value.Weight || value.Reps) {
    val = fsSetConverter(value);
  } else if (value.NumberOfSets) {
    val = fsExerConverter(value);
  } else if (
    isRecursive &&
    objKeysArr.length > 0 &&
    typeof value !== "string"
  ) {
    for (let index = 0; index < objKeysArr.length; index++) {
      val[objKeysArr[index]] = convertFrom(value[objKeysArr[index]]);
    }
  }
  return val;
}

const converter = <
  T extends { id?: string; CreatedAt?: firestore.Timestamp }
>() => ({
  toFirestore(data: Partial<T>): firebase.firestore.DocumentData {
    let theData = data;
    if (Object.keys(data).includes("id")) {
      delete theData.id;
    }
    theData = {
      ...theData,
      CreatedAt: data.CreatedAt || firestore.Timestamp.now(),
      UpdatedAt: firestore.Timestamp.now(),
    };
    theData = convertTo(theData);
    return theData;
  },
  fromFirestore(snap: firebase.firestore.QueryDocumentSnapshot) {
    let fsData = snap.data();
    fsData = convertFrom(fsData);
    return { ...(fsData as T), id: snap.id };
  },
});

const dataPoint = <T>(collectionPath: string) =>
  firebase.firestore().collection(collectionPath).withConverter(converter<T>());

const dbRef = {
  users: dataPoint<User>("Users"),
  exercises: dataPoint<Exercise>("Exercises"),
  workouts: dataPoint<Workout>("Workouts"),
  plannedWorkouts: dataPoint<Workout>("PlannedWorkouts"),
  pastWorkouts: dataPoint<Workout>("PastWorkouts"),
};

export { dbRef };
export const fb = firebase;
export const fs = firebase.firestore();
export default firebaseApp;
