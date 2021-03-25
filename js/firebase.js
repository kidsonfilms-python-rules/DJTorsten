var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");
require("firebase/analytics");

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyAVbMdmYayQf8VKDW3j7s-993e4cVzgcHE",
    authDomain: "project-djtorsten.firebaseapp.com",
    databaseURL: "https://project-djtorsten.firebaseio.com",
    projectId: "project-djtorsten",
    storageBucket: "project-djtorsten.appspot.com",
    messagingSenderId: "125871844285",
    appId: "1:125871844285:web:a3009613a9e018449980d4",
    measurementId: "G-CPTEQHPWMT"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();