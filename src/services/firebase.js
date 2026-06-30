import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAwUYfEI3JfUT02jlXLiFQfSrsimXpFD-U',
  authDomain: 'siagart-131d3.firebaseapp.com',
  databaseURL: 'https://siagart-131d3-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'siagart-131d3',
  storageBucket: 'siagart-131d3.firebasestorage.app',
  messagingSenderId: '254236266372',
  appId: '1:254236266372:web:55bb56d7d0b159831497d1',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
