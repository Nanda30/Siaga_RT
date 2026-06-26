// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAwUYfEI3JfUT02jlXLiFQfSrsimXpFD-U",
//   authDomain: "siagart-131d3.firebaseapp.com",
//   projectId: "siagart-131d3",
//   storageBucket: "siagart-131d3.firebasestorage.app",
//   messagingSenderId: "254236266372",
//   appId: "1:254236266372:web:55bb56d7d0b159831497d1",
//   measurementId: "G-KY0BK3KNK3"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyAwUYfEI3JfUT02jlXLiFQfSrsimXpFD-U",
    authDomain: "siagart-131d3.firebaseapp.com",
    databaseURL: "https://siagart-131d3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "siagart-131d3",
    storageBucket: "siagart-131d3.firebasestorage.app",
    messagingSenderId: "254236266372",
    appId: "1:254236266372:web:55bb56d7d0b159831497d1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };