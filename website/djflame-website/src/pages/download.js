import React from 'react'
import { Header, Footer } from '../components'
import '../css/style.css'
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

class DownloadPage extends React.Component {
    constructor(props) {
        super(props)
        this.emailElement = React.createRef(null);
        this.passElement = React.createRef(null);
        this.confirmPassElement = React.createRef(null)
        this.tosCheckbox = React.createRef(null)
        this.tosCheckboxUI = React.createRef(null)
        this.signUpScreen = React.createRef(null);
        this.footer = React.createRef(null);
        this.errorScreen = React.createRef(null);
    }

    componentDidMount() {
        const firebaseConfig = {
            apiKey: "AIzaSyAVbMdmYayQf8VKDW3j7s-993e4cVzgcHE",
            authDomain: "project-djtorsten.firebaseapp.com",
            databaseURL: "https://project-djtorsten.firebaseio.com",
            projectId: "project-djtorsten",
            storageBucket: "project-djtorsten.appspot.com",
            messagingSenderId: "125871844285",
            appId: "1:125871844285:web:40fb2c963859097f9980d4",
            measurementId: "G-LSWSN0Y5Y1"
        };

        // Initialize Firebase
        const firebase = initializeApp(firebaseConfig);
        const analytics = getAnalytics(firebase);
        const urlParams = new URLSearchParams(window.location.search);
        var os = urlParams.get('os')
        const db = firebase.firestore()

        // var form = document.getElementById("signUpForm");
        // function handleForm(event) { event.preventDefault(); }
        // form.addEventListener('submit', handleForm);
        const emailElement = this.emailElement.current
        const passElement = this.passElement.current
        const confirmPassElement = this.confirmPassElement.current
        const tosCheckbox = this.tosCheckbox.current
        const tosCheckboxUI = this.tosCheckboxUI.current
        const footer = this.footer.current
        const errorScreen = this.errorScreen.current

        function signUp() {


            emailElement.addEventListener('keyup', () => emailElement.classList.remove('invalid'))
            passElement.addEventListener('keyup', () => passElement.classList.remove('invalid'))
            confirmPassElement.addEventListener('keyup', () => confirmPassElement.classList.remove('invalid'))

            if (emailElement.value === null || emailElement.value.replace(' ', '') == '') {
                emailElement.classList.add('invalid')
                return false
            }
            if (!emailElement.value.includes('@')) {
                emailElement.classList.add('invalid')
                return false
            }
            if (passElement.value === null || passElement.value.replace(' ', '') == '') {
                passElement.classList.add('invalid')
                return false
            }
            if (confirmPassElement.value === null || confirmPassElement.value.replace(' ', '') == '') {
                confirmPassElement.classList.add('invalid')
                return false
            }
            if (passElement.value != confirmPassElement.value) {
                passElement.classList.add('invalid')
                confirmPassElement.classList.add('invalid')
                return false
            }
            if (tosCheckbox.checked != true) {
                tosCheckboxUI.classList.add('invalid')
                return false
            }

            firebase.auth().createUserWithEmailAndPassword(emailElement.value, passElement.value)
                .then((userCredential) => {
                    // Signed in 
                    var user = userCredential.user;
                    this.signUpScreen.current.style.display = 'none'
                    this.signUpScreen.current.style.visibility = 'hidden'
                    this.signUpScreen.current.style.opacity = '0'
                    console.log('Signed In!')

                    user.sendEmailVerification()

                    console.log('Created Doc!')
                    if (!os) {
                        console.log('No URL Params, getting OS')
                        var OSName = "Unknown";
                        if (window.navigator.userAgent.indexOf("Windows NT 10.0") != -1) OSName = "Windows";
                        if (window.navigator.userAgent.indexOf("Windows NT 6.3") != -1) OSName = "Windows";
                        if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) OSName = "Windows";
                        if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) OSName = "Windows";
                        if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) OSName = "Windows";
                        if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) OSName = "Windows";
                        if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) OSName = "Windows";
                        if (window.navigator.userAgent.indexOf("Mac") != -1) OSName = "Mac";
                        if (window.navigator.userAgent.indexOf("X11") != -1) OSName = "UNIX";
                        if (window.navigator.userAgent.indexOf("Linux") != -1) OSName = "Linux";
                        if (OSName != 'Unknown') {
                            if (OSName == 'Windows') {
                                os = 'windows'
                            } else if (OSName == 'Mac') {
                                os = 'macos'
                            } else if (OSName == 'Linux') {
                                os = 'linux'
                            }
                        }

                        if (os) {
                            console.log(`Found OS! Downloading DJFlame for ${os}`)
                            if (os == 'windows') {
                                window.open('https://github.com/kidsonfilms-python-rules/DJFlame-Releases/releases/latest/download/DJFlame.2021.7.2.Setup.exe', '_blank');
                            } else if (os == 'macos') {
                                // window.location.href = 'https://github.com/kidsonfilms-python-rules/DJFlame-Releases/releases/latest/download/DJFlame.dmg'
                                window.open('https://github.com/kidsonfilms-python-rules/DJFlame-Releases/releases/latest/download/DJFlame-2021.7.2.dmg', '_blank')
                            } else if (os == 'linux') {
                                // window.location.href = 'https://github.com/kidsonfilms-python-rules/DJFlame-Releases/releases/latest/download/DJFlame.AppImage'
                                window.open('https://github.com/kidsonfilms-python-rules/DJFlame-Releases/releases/latest/download/DJFlame.AppImage', '_blank')
                            } else {
                                errorScreen.style.display = 'block'
                                errorScreen.style.visibility = 'visible'
                                errorScreen.style.opacity = '1'
                                document.body.style.overflowY = 'hidden'
                                footer.style.display = 'none'
                            }
                        } else {
                            var errorScreen = document.getElementById('errorScreen')
                            errorScreen.style.display = 'block'
                            errorScreen.style.visibility = 'visible'
                            errorScreen.style.opacity = '1'
                            document.body.style.overflowY = 'hidden'
                            footer.style.display = 'none'
                        }
                    } else {
                        console.log(`Downloading DJFlame for ${os}`)
                        if (os == 'windows') {
                            window.open('https://github.com/kidsonfilms-python-rules/DJFlame-Releases/releases/latest/download/DJFlame.Setup.exe', '_blank');
                        } else if (os == 'macos') {
                            window.open('https://github.com/kidsonfilms-python-rules/DJFlame-Releases/releases/latest/download/DJFlame.dmg', '_blank')
                        } else if (os == 'linux') {
                            window.open('https://github.com/kidsonfilms-python-rules/DJFlame-Releases/releases/latest/download/DJFlame.AppImage', '_blank')
                        } else {
                            var errorScreen = document.getElementById('errorScreen')
                            errorScreen.style.display = 'block'
                            errorScreen.style.visibility = 'visible'
                            errorScreen.style.opacity = '1'
                            document.body.style.overflowY = 'hidden'
                            footer.style.display = 'none'
                        }
                    }




                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.error(`${errorCode}: ${errorMessage}`)
                });
        }

        // if (urlParams.get('number-code-0') != null) {
        //     const downloadCode = urlParams.get('number-code-0') + urlParams.get('number-code-1') + urlParams.get('number-code-2') + urlParams.get('number-code-3') + urlParams.get('number-code-4') + urlParams.get('number-code-5') + urlParams.get('number-code-6') + urlParams.get('number-code-7')
        //     console.log(downloadCode)

        //     db.collection('downloadCodes').doc(downloadCode).get()
        //         .then((docSnapshot) => {
        //             if (docSnapshot.exists) {
        //                 var codeDocRef = db.collection("downloadCodes").doc(downloadCode);
        //                 db.collection('downloadCodes').doc(downloadCode)
        //                     .onSnapshot((doc) => {
        //                         if (doc.data().used == false) {
        //                             console.log(doc)

        //                             document.getElementById('codeRequest').style.display = 'none'
        //                             document.getElementById('codeRequest').style.visibility = 'hidden'
        //                             document.getElementById('signUpScreen').style.display = 'block'
        //                             document.getElementById('signUpScreen').style.visibility = 'visible'
        //                             document.getElementById('signUpScreen').style.opacity = '1'

        //                             return db.runTransaction((transaction) => {
        //                                 // This code may get re-run multiple times if there are conflicts.
        //                                 return transaction.get(codeDocRef).then((codeDoc) => {
        //                                     if (!codeDoc.exists) {
        //                                         throw "Document does not exist!";
        //                                     }

        //                                     // Add one person to the city population.
        //                                     // Note: this could be done without a transaction
        //                                     //       by updating the population using FieldValue.increment()
        //                                     transaction.update(codeDocRef, { used: true });
        //                                 });
        //                             }).then(() => {
        //                                 console.log("Transaction successfully committed!");


        //                             }).catch((error) => {
        //                                 console.log("Transaction failed: ", error);
        //                             });

        //                         } else {
        //                             console.log('Code already Used!')
        //                         }

        //                     });
        //             } else {
        //                 console.log('Doc does not exist')
        //             }
        //         });
        // }
        // const numberCodeForm = document.querySelector('[data-number-code-form]');
        // const numberCodeInputs = [...numberCodeForm.querySelectorAll('[data-number-code-input]')];

        // // Event callbacks
        // const handleInput = ({ target }) => {
        //     if (!target.value.length) { return target.value = null; }

        //     const inputLength = target.value.length;
        //     let currentIndex = Number(target.dataset.numberCodeInput);

        //     if (inputLength > 1) {
        //         const inputValues = target.value.split('');

        //         inputValues.forEach((value, valueIndex) => {
        //             const nextValueIndex = currentIndex + valueIndex;

        //             if (nextValueIndex >= numberCodeInputs.length) { return; }

        //             numberCodeInputs[nextValueIndex].value = value;
        //         });

        //         currentIndex += inputValues.length - 2;
        //     }

        //     const nextIndex = currentIndex + 1;

        //     if (nextIndex < numberCodeInputs.length) {
        //         numberCodeInputs[nextIndex].focus();
        //     }
        // }

        // const handleKeyDown = e => {
        //     const { code, target } = e;

        //     const currentIndex = Number(target.dataset.numberCodeInput);
        //     const previousIndex = currentIndex - 1;
        //     const nextIndex = currentIndex + 1;

        //     const hasPreviousIndex = previousIndex >= 0;
        //     const hasNextIndex = nextIndex <= numberCodeInputs.length - 1

        //     switch (code) {
        //         case 'ArrowLeft':
        //         case 'ArrowUp':
        //             if (hasPreviousIndex) {
        //                 numberCodeInputs[previousIndex].focus();
        //             }
        //             e.preventDefault();
        //             break;

        //         case 'ArrowRight':
        //         case 'ArrowDown':
        //             if (hasNextIndex) {
        //                 numberCodeInputs[nextIndex].focus();
        //             }
        //             e.preventDefault();
        //             break;
        //         case 'Backspace':
        //             if (!e.target.value.length && hasPreviousIndex) {
        //                 numberCodeInputs[previousIndex].value = null;
        //                 numberCodeInputs[previousIndex].focus();
        //             }
        //             break;
        //         default:
        //             break;
        //     }
        // }

        // // Event listeners
        // numberCodeForm.addEventListener('input', handleInput);
        // numberCodeForm.addEventListener('keydown', handleKeyDown);
    }

    render() {
        return (
            <>
                <meta charSet="UTF-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Download DJFlame</title>
                <link rel="stylesheet" href="./css/style.css" />
                <link rel="icon" href="./assets/favicon.png" />
                <style
                    dangerouslySetInnerHTML={{
                        __html:
                            '\n        body {\n            margin: 0px;\n        }\n\n        .installSteps li {\n            display: flex;\n            list-style: none;\n            flex-direction: column;\n            text-align: left;\n            /* background-color: rosybrown; */\n            justify-content: center;\n        }\n\n        .installSteps li p {\n            margin: 12px 38px;\n        }\n\n        .installSteps {\n            display: block;\n            counter-increment: myCounter 0;\n            list-style-type: decimal;\n            margin-block-start: 1em;\n            margin-block-end: 1em;\n            margin-inline-start: 0px;\n            margin-inline-end: 0px;\n            padding-inline-start: 40px;\n            width: 100vw;\n        }\n\n        a {\n            color: #df49a6;\n            text-decoration: none;\n            font-weight: 700;\n        }\n\n        a:hover {\n            text-decoration: underline;\n        }\n\n        .installSteps li:before {\n            content: counter(myCounter);\n            counter-increment: myCounter;\n            line-height: 1;\n            text-align: center;\n            width: 16px;\n            height: 16px;\n            padding: 5px;\n            margin-right: 12px;\n            font-weight: 700;\n            position: absolute;\n            display: inline-block;\n            border-radius: 50rem;\n            background: linear-gradient(210deg, rgba(255, 126, 238, 1) 0%, rgba(223, 73, 166, 1) 100%);\n        }\n\n        .downloadMain {\n            margin-top: 10vh;\n            padding-left: 20px;\n            margin-bottom: 20px;\n        }\n\n        .downloadMain p {\n            width: 80vw;\n        }\n\n        .errorScreen {\n            display: none;\n            visibility: hidden;\n            opacity: 0;\n            position: absolute;\n            top: 0;\n            left: 0;\n            z-index: 1000;\n            transition: visibility 0.25s ease-in-out, opacity 0.25s ease-in-out;\n            background-color: #212121;\n            height: 100vh;\n            width: 100vw;\n        }\n\n        form {\n            /* margin: 3rem 0;\n  border-radius: 0.5rem;\n  background: #1b1b1b;\n  box-shadow: 28px 28px 56px #383838, -28px -28px 56px #000000; */\n            color: white;\n        }\n\n        fieldset {\n            border: none;\n        }\n\n        legend {\n            font-size: 0;\n        }\n\n        input {\n            width: 2rem;\n            height: 2rem;\n            font-size: 1rem;\n            text-align: center;\n            border: none;\n            border-radius: 0.5rem;\n            background: linear-gradient(145deg, #333333, #000000);\n            /* box-shadow:  28px 28px 56px #2b2b2b, -28px -28px 56px #000000; */\n            color: white;\n        }\n\n        *:focus {\n            outline: none;\n        }\n\n        @media only screen and (min-width: 600px) {\n            form {\n                padding: 4rem 3rem;\n            }\n\n            input {\n                width: 4rem;\n                height: 4rem;\n                font-size: 3rem;\n            }\n\n            input+input {\n                margin-left: 1rem;\n            }\n        }\n\n        /* Chrome, Safari, Edge, Opera */\n        input::-webkit-outer-spin-button,\n        input::-webkit-inner-spin-button {\n            -webkit-appearance: none;\n            margin: 0;\n        }\n\n        /* Firefox */\n        input[type=number] {\n            -moz-appearance: textfield;\n        }\n\n        .form-signup {\n            width: 430px;\n            height: 375px;\n            font-size: 16px;\n            font-weight: 300;\n            text-align: left;\n            opacity: 1;\n            transition: all .5s ease;\n        }\n\n        .form-signup-left {\n            transform: translateX(-399px);\n            opacity: 1;\n        }\n\n        .form-signup-down {\n            top: 0px;\n            opacity: 0;\n        }\n\n        .success {\n            width: 80%;\n            height: 150px;\n            text-align: center;\n            position: relative;\n            top: -890px;\n            left: 450px;\n            opacity: .0;\n            transition: all .8s .4s ease;\n        }\n\n        .success-left {\n            transform: translateX(-406px);\n            opacity: 1;\n        }\n\n        .successtext {\n            color: #ffffff;\n            font-size: 16px;\n            font-weight: 300;\n            margin-top: -35px;\n            padding-left: 37px;\n            padding-right: 37px;\n        }\n\n        #check path {\n            stroke: #ffffff;\n            stroke-linecap: round;\n            stroke-linejoin: round;\n            stroke-width: .85px;\n            stroke-dasharray: 60px 300px;\n            stroke-dashoffset: -166px;\n            fill: rgba(255, 255, 255, .0);\n            transition: stroke-dashoffset 2s ease .5s, fill 1.5s ease 1.0s;\n        }\n\n        #check.checked path {\n            stroke-dashoffset: 33px;\n            fill: rgba(255, 255, 255, .03);\n        }\n\n        .form-signup input {\n            color: #ffffff;\n            font-size: 13px;\n            text-align: left;\n        }\n\n        .form-styling {\n            width: 100%;\n            height: 35px;\n            padding-left: 15px;\n            border: none;\n            border-radius: 20px;\n            margin-bottom: 20px;\n            background: rgba(255, 255, 255, .2);\n        }\n\n        label {\n            font-weight: 400;\n            text-transform: uppercase;\n            font-size: 13px;\n            padding-left: 15px;\n            padding-bottom: 10px;\n            color: rgba(255, 255, 255, .7);\n            display: block;\n        }\n\n        :focus {\n            outline: none;\n        }\n\n        .form-signin input:focus,\n        textarea:focus,\n        .form-signup input:focus,\n        textarea:focus {\n            border: none;\n            padding-right: 40px;\n        }\n\n        [type="checkbox"]:not(:checked),\n        [type="checkbox"]:checked {\n            position: absolute;\n            display: none;\n        }\n\n        [type="checkbox"]:not(:checked)+label,\n        [type="checkbox"]:checked+label {\n            position: relative;\n            padding-left: 85px;\n            padding-top: 2px;\n            cursor: pointer;\n            margin-top: 8px;\n        }\n\n        [type="checkbox"]:not(:checked)+label:before,\n        [type="checkbox"]:checked+label:before,\n        [type="checkbox"]:not(:checked)+label:after,\n        [type="checkbox"]:checked+label:after {\n            content: \'\';\n            position: absolute;\n        }\n\n        [type="checkbox"]:not(:checked)+label:before,\n        [type="checkbox"]:checked+label:before {\n            width: 65px;\n            height: 30px;\n            background: rgba(255, 255, 255, .2);\n            border-radius: 15px;\n            left: 0;\n            top: -3px;\n            transition: all .2s ease;\n        }\n\n        [type="checkbox"]:not(:checked)+label:after,\n        [type="checkbox"]:checked+label:after {\n            width: 10px;\n            height: 10px;\n            background: rgba(255, 255, 255, .7);\n            border-radius: 50%;\n            top: 7px;\n            left: 10px;\n            transition: all .2s ease;\n        }\n\n        /* on checked */\n        [type="checkbox"]:checked+label:before {\n            background: var(--brand-gradient);\n        }\n\n        [type="checkbox"]:checked+label:after {\n            background: #ffffff;\n            top: 7px;\n            left: 45px;\n        }\n\n        [type="checkbox"]:checked+label .ui,\n        [type="checkbox"]:not(:checked)+label .ui:before,\n        [type="checkbox"]:checked+label .ui:after {\n            position: absolute;\n            left: 6px;\n            width: 65px;\n            border-radius: 15px;\n            font-size: 14px;\n            font-weight: bold;\n            line-height: 22px;\n            transition: all .2s ease;\n        }\n\n        [type="checkbox"]:not(:checked)+label .ui:before {\n            content: "no";\n            left: 32px;\n            color: rgba(255, 255, 255, .7);\n        }\n\n        [type="checkbox"]:checked+label .ui:after {\n            content: "yes";\n            color: #ffffff;\n        }\n\n        [type="checkbox"]:focus+label:before {\n            box-sizing: border-box;\n            margin-top: -1px;\n        }\n\n        .btn-signup {\n            float: left;\n            font-weight: 700;\n            text-transform: uppercase;\n            font-size: 13px;\n            text-align: center;\n            color: #ffffff;\n            padding-top: 8px;\n            width: 100%;\n            height: 35px;\n            border: none;\n            border-radius: 20px;\n            margin-top: 23px;\n            background-color: var(--primary-brand-color);\n        }\n\n        .form-signup .invalid:before,\n        input.invalid {\n            border-color: red;\n            border-style: solid;\n            border-width: 2px;\n        }\n    '
                    }}
                />
                <Header />
                <div className="downloadMain">
                    <h1>Download Has Started!</h1>
                    <p>
                        If the Download hasnt started, <a href>Click Here</a>
                    </p>
                    <ol className="installSteps">
                        <li>
                            <p>Download the Installer</p>
                        </li>
                        <li>
                            <p>Open the Downloaded Installer</p>
                        </li>
                        <li>
                            <p>Follow the Steps the Installer Gives</p>
                        </li>
                        <li>
                            <p>
                                Follow our <a href>Getting Started Guide</a> and Prosper!
                            </p>
                        </li>
                    </ol>
                    <h2>
                        More info about <span className="beta">beta</span>
                    </h2>
                    <p>
                        <span className="beta">beta</span> is the development proccess of an
                        applicatation. When you see the <span className="beta">beta</span> tag
                        next to a download, it means that the product is not bug-free. If you find
                        a bug, report it here and we will do our best to try and fix it.
                    </p>
                    <br />
                    <iframe id="downloadIframe" style={{ display: "none" }} download />
                    {/* <h3>View our Changelog <a href="">here</a>!</h3>
  <h4 style="margin-bottom: 5px;">What is a Changelog?</h4>
  <p>A Changelog show what fixes/feature additions we made to our versions of DJFlame</p> */}
                </div>
                <Footer ref={this.footer} />
                <div className="errorScreen" id="errorScreen">
                    <div className="page">
                        <div className="center">
                            <h1>Install Option not Found!</h1>
                            <p>
                                Go back <a href="./#install">here</a> and select your OS
                            </p>
                        </div>
                    </div>
                </div>
                {/* <div
                    className="errorScreen"
                    id="codeRequest"
                    style={{ display: "block", visibility: "visible", opacity: 1 }}
                >
                    <div className="page">
                        <div className="center">
                            <h1>Download of this Software Requires a Download Code</h1>
                            <p>Download codes are given by Employees of DJFlame</p>
                            <form onsubmit>
                                <fieldset name="number-code" data-number-code-form>
                                    <legend>Number Code</legend>
                                    <input
                                        type="number"
                                        min={0}
                                        max={9}
                                        name="number-code-0"
                                        data-number-code-input={0}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        max={9}
                                        name="number-code-1"
                                        data-number-code-input={1}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        max={9}
                                        name="number-code-2"
                                        data-number-code-input={2}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        max={9}
                                        name="number-code-3"
                                        data-number-code-input={3}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        max={9}
                                        name="number-code-4"
                                        data-number-code-input={4}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        max={9}
                                        name="number-code-5"
                                        data-number-code-input={5}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        max={9}
                                        name="number-code-6"
                                        data-number-code-input={6}
                                        required
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        max={9}
                                        name="number-code-7"
                                        data-number-code-input={7}
                                        required
                                    />
                                </fieldset>
                                <br />
                                <button className="installButton">Done</button>
                            </form>
                        </div>
                    </div>
                </div> */}
                <div className="errorScreen" ref={this.signUpScreen}>
                    <div className="page">
                        <div className="center">
                            <h1>Sign Up</h1>
                            <p>Signing Up is required to use the DJFlame Desktop App</p>
                            <div className="form-signup">
                                <label htmlFor="email">Email</label>
                                <input
                                    className="form-styling"
                                    type="email"
                                    name="email"
                                    placeholder="stonks@gmetothemoon.com"
                                    autoComplete="off"
                                    id="email"
                                    ref={this.emailElement}
                                />
                                <label htmlFor="password">Password</label>
                                <input
                                    className="form-styling"
                                    type="password"
                                    name="password"
                                    placeholder="supersecurepassword1234"
                                    autoComplete="off"
                                    id="pass"
                                    ref={this.passElement}
                                />
                                <label htmlFor="confirmpassword">Confirm password</label>
                                <input
                                    className="form-styling"
                                    type="password"
                                    name="confirmpassword"
                                    placeholder="supersecurepassword1234"
                                    autoComplete="off"
                                    id="confirmPass"
                                    ref={this.confirmPassElement}
                                />
                                <input
                                    type="checkbox"
                                    id="checkbox"
                                    required
                                    name="termsAndService"
                                    ref={this.tosCheckbox}
                                />
                                <label htmlFor="checkbox" id="ToSCheckbox" ref={this.tosCheckboxUI}>
                                    <span className="ui" />I accept DJFlame's{" "}
                                    <a href>Terms and Conditions</a> and <a href>Privacy Policy</a>
                                </label>
                                <p onclick="signUp()" className="btn-signup">
                                    Sign Up
                                </p>
                            </div>
                        </div>
                    </div>
                    <script src="/__/firebase/8.3.1/firebase-app.js"></script>

                    {/* <!-- TODO: Add SDKs for Firebase products that you want to use
     https://firebase.google.com/docs/web/setup#available-libraries --> */}
                    <script src="/__/firebase/8.3.1/firebase-analytics.js"></script>
                    <script src="/__/firebase/8.3.1/firebase-auth.js"></script>
                    <script src="/__/firebase/8.3.1/firebase-firestore.js"></script>

                    {/* <!-- Initialize Firebase --> */}
                    <script src="/__/firebase/init.js"></script>
                    {/* TODO: Add SDKs for Firebase products that you want to use
     https://firebase.google.com/docs/web/setup#available-libraries */}
                    {/* Initialize Firebase */}
                </div>
            </>
        )
    }
}
export default DownloadPage