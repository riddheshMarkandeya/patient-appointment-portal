import firebase_app from "../config";
import { getFirestore, collection, doc, getDoc, addDoc, setDoc, getDocs, query, orderBy, startAfter, startAt, endBefore, limit, Timestamp, QuerySnapshot, DocumentData, deleteDoc, where, getAggregateFromServer, average, } from "firebase/firestore";

// Get the Firestore instance
const db = getFirestore(firebase_app);

export type Appointment = {
  PatientId: string,
  AppointmentID: string,
  Gender: string,
  ScheduledDay: Timestamp,
  AppointmentDay: Timestamp,
  Age: number,
  Neighbourhood: string,
  Scholarship: boolean,
  Hipertension: boolean,
  Diabetes: boolean,
  Alcoholism: boolean,
  Handicap: boolean,
  SMSReceived: boolean,
  NoShow: boolean
};

// Get the authentication instance using the Firebase app
// const auth = getAuth(firebase_app);

let lastQuerySnapshot: QuerySnapshot<DocumentData, DocumentData>;

// Function to sign up a user with email and password
export async function getAppointmentsBatch(isFirst: boolean, isNext: boolean) {
  let result: Appointment[] = [], // Variable to store the sign-up result
    error = null; // Variable to store any error that occurs

  try {
    const appointmentsRef = collection(db, "appointments-real");
    console.log("aayoo in appt");

    if (isFirst) {
      const appointmentsSliceQuery = query(appointmentsRef, orderBy("AppointmentDay", "desc"), limit(15));
  
      const querySnapshot = await getDocs(appointmentsSliceQuery);
      result = [];
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        result.push(doc.data() as Appointment);
      });
      lastQuerySnapshot = querySnapshot;
      console.log(result);
    } else {
      let appointmentsSliceQuery;
      if (isNext) {
        appointmentsSliceQuery = query(appointmentsRef, orderBy("AppointmentDay", "desc"), startAfter(lastQuerySnapshot.docs[lastQuerySnapshot.docs.length-1]), limit(15));
      } else {
        appointmentsSliceQuery = query(appointmentsRef, orderBy("AppointmentDay", "desc"), endBefore(lastQuerySnapshot.docs[0]), limit(15));
      } 
  
      const querySnapshot = await getDocs(appointmentsSliceQuery);
      result = [];
      querySnapshot.forEach((doc) => {  
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        result.push(doc.data() as Appointment);
      });
      lastQuerySnapshot = querySnapshot;
      console.log(result);
      
    }
  } catch (e) {
    error = e; // Catch and store any error that occurs during sign-up
  }

  return { result, error }; // Return the sign-up result and error (if any)
}

export async function update(id:string, data:any) {
  let result = null;
  // Variable to store any error that occurs during the operation
  let error = null;

  try {
    // Set the document with the provided data in the specified collection and ID
    result = await setDoc(doc(db, "appointments-real", id), data, {
      merge: true, // Merge the new data with existing document data
    });
  } catch (e) {
    // Catch and store any error that occurs during the operation
    error = e;
  }

  // Return the result and error as an object
  return { result, error };
}

export async function create(data:any) {
  let result = null;
  // Variable to store any error that occurs during the operation
  let error = null;

  try {
    // Set the document with the provided data in the specified collection and ID
    result = await addDoc(collection(db, "appointments-real"), data);
  } catch (e) {
    // Catch and store any error that occurs during the operation
    error = e;
  }

  // Return the result and error as an object
  return { result, error };
}

export async function deleteApp(id:string) {
  let result = null;
  // Variable to store any error that occurs during the operation
  let error = null;

  try {
    // Set the document with the provided data in the specified collection and ID
    result = await deleteDoc(doc(db, "appointments-real", id));
  } catch (e) {
    // Catch and store any error that occurs during the operation
    error = e;
  }

  // Return the result and error as an object
  return { result, error };
}

export async function getStat(Neighbourhood:string, Gender: string) {
  let result = null;
  // Variable to store any error that occurs during the operation
  let error = null;

  try {
    // Set the document with the provided data in the specified collection and ID
    // result = await deleteDoc(doc(db, "appointments-real", id));

    const coll = collection(db, 'appointments-real');
    let snapshot;
    let q;
    if (Neighbourhood || Gender) {
      if (Neighbourhood && Gender) {
        q = query(coll, where('Neighbourhood', '==', Neighbourhood), where('Gender', '==', Gender));
      } else if(Neighbourhood) {
        q = query(coll, where('Neighbourhood', '==', Neighbourhood));
      } else {
        q = query(coll, where('Gender', '==', Gender));
      }
      snapshot = await getAggregateFromServer(q, {
        averagePatientAge: average('Age')
      });
    } else {
      snapshot = await getAggregateFromServer(coll, {
        averagePatientAge: average('Age')
      });
    }

    console.log('totalPopulation: ', snapshot.data().averagePatientAge);
    result = snapshot;

  } catch (e) {
    // Catch and store any error that occurs during the operation
    error = e;
  }

  // Return the result and error as an object
  return { result, error };
}
