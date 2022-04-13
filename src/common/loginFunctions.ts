import { firestore } from "@/main";
import firebase from "firebase";
import store from "@/store";
import router from "@/router";
import { UserConverter } from "../models/User";

export async function logUserIn(
  uid: string,
  displayName: string,
  url: string
): Promise<void> {
  const user = await firestore
    .collection("Users")
    .withConverter(UserConverter)
    .doc(uid)
    .get();

  const userData = user.data();

  if (!user.exists || userData === undefined) {
    firebase.auth().signOut();
    throw new Error("Exception: No User record exists. Contact Administrator.");
  }

  if (!userData.enabled) {
    firebase.auth().signOut();
    throw new Error("User not approved yet - please contact coordinator.");
  }

  const role = userData.access;

  const loginTime = new Date();

  await firestore
    .collection("Users")
    .withConverter(UserConverter)
    .doc(uid)
    .update({
      LastLogin: loginTime,
    })
    .catch(function (e) {
      console.log(e);
    });

  // console.log("admin -", admin);
  await Promise.all([
    // store.dispatch("setAdmin", admin),
    store.dispatch("fetchUser", userData),
    store.dispatch("setRole", role),
  ]);

  if (url !== "") {
    router.push({ name: url });
  }
}

export async function logUserOut(loggedIn: boolean): Promise<void> {
  if (loggedIn) {
    await firebase
      .auth()
      .signOut()
      .then(async () => {
        router.push({ name: "Login" }).catch((e) => {
          console.log(e);
        });
        await store.dispatch("fetchUser", null);
      })
      .catch(function (e) {
        console.log(e.message);
      });
  } 
}
