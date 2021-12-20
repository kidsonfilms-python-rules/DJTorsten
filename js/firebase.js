var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");
require("firebase/analytics");

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "",
    authDomain: "project-djtorsten.firebaseapp.com",
    databaseURL: "https://project-djtorsten.firebaseio.com",
    projectId: "project-djtorsten",
    storageBucket: "project-djtorsten.appspot.com",
    messagingSenderId: "125871844285",
    appId: "",
    measurementId: ""
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();