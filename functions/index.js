const functions = require("firebase-functions");
const firebase = require("firebase-admin");
const nodemailer = require("nodemailer");

firebase.initializeApp();

const db = firebase.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

async function sendDeleteEmail(email) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "djflamedev@gmail.com",
            pass: "batman1146"
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'DJFlame Team <djflamedev@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Sorry to see you leave", // Subject line
        text: "We are sorry to see yoy leave DJFlame, we made sure to delete any information we had on you.", // plain text body
        html: `<table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#1b1b1b"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #1b1b1b; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                          <a href="https://djflame.tech/" title="Go to DJFlame's Homepage" target="_blank">
                            <img width="150" src="https://djflame.tech/assets/favicon.png" alt="Go to DJFlame's Homepage" style="object-fit:cover;border-radius:30%;">
                          </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#202020; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#d1d1e7; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Sorry to see you leave! ;(</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#b6c4cc; font-size:15px;line-height:24px; margin:0;">
                                            We made sure to close your account and delete all your information off our servers, if you still see personal information about you on of website or apps, contact us.
                                        </p>
                                        <a href="https://djflame.tech"
                                            style="background:#df49a6;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Go To Our Website</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong><a style="color: gray; text-decoration: none; " href="https://djflame.tech/"> djflame.tech</a></strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>`, // html body
    });

    console.log("Message sent: %s", info.messageId);
}

exports.onSignUp = functions.auth.user().onCreate((user) => {
    console.log("New User!");
    db.collection("users").doc(user.uid).set({
        name: "DJ",
        partiesLeft: 5,
        role: "NONE",
    });
});

exports.onUserDeletion = functions.auth.user().onDelete((user) => {
    console.log('User Deletion')
    db.collection('users').doc(user.uid).delete()

    sendDeleteEmail(user.email).catch(console.error);
})
