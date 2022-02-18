const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

//gmail to host smtp server
const gmailEmail = functions.config().gmail.login;
const gmailPassword = functions.config().gmail.pass;

admin.initializeApp();

//creating function for sending emails
async function sendEmail(contactForm) {

    //transporter is a way to send your emails
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailEmail,
            pass: gmailPassword
        }
    });

    const output = `
        <h3>You have a new contact request from: ${contactForm.email}</h3>
        <span style="white-space: pre-line">${contactForm.message}</span>
        ` 

    let info = await transporter.sendMail({
        from: `Contact <${contactForm.email}>`, // sender address
        to: 'kamil.moszczyc@gmail.com', // list of receivers
        subject: contactForm.subject, // Subject line
        html: output, // html body
    });
    
      console.log("Message sent: %s", info.messageId);
    
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

//.onDataAdded is watches for changes in database
exports.onDataAdded = functions.region('europe-west1')
    .database.ref('/messages/{newForm}').onCreate((snap, context) => {

    //here we catch a new data, added to firebase database, it stored in a snap variable
    const contactForm = snap.val();
    sendEmail(contactForm);
});
