import firebase_app from "../config";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { createData } from "../firestore/addData"
import { omit } from 'lodash';

// Get the authentication instance using the Firebase app
const auth = getAuth(firebase_app);

// Function to sign up a user with email and password
export default async function signUp(patient: any) {
  let result = null, // Variable to store the sign-up result
    error = null; // Variable to store any error that occurs

  try {
    result = await createUserWithEmailAndPassword(auth, patient.email, patient.password); // Create a new user with email and password

    console.log("create user");
    console.log(result);
  } catch (e) {
    error = e; // Catch and store any error that occurs during sign-up
  }

  return { result, error }; // Return the sign-up result and error (if any)
}
