import Brevo from "@getbrevo/brevo";

const client = new Brevo({
  apiKey: process.env.BREVO_API_KEY,
});

const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS;
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Elay Trading";


export const sendVerificationEmail = async (email, name, code) => {

  try {

    const response = await client.transactionalEmails.sendTransacEmail({
      sender: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },

      to: [
        {
          email,
          name,
        }
      ],

      subject: "Verify Your Email - Elay Trading",

      htmlContent: `
        <h2>Elay Trading</h2>

        <p>Hello ${name}</p>

        <p>Your verification code:</p>

        <h1>${code}</h1>

        <p>This code expires in 10 minutes.</p>
      `
    });


    console.log(
      "Verification email sent:",
      response
    );

    return response;


  } catch(error){

    console.error(
      "Brevo email error:",
      error.response?.body || error.message
    );

    throw error;
  }

};



export const sendWelcomeEmail = async(email,name)=>{

try{

const response =
await client.transactionalEmails.sendTransacEmail({

sender:{
email:FROM_EMAIL,
name:FROM_NAME
},

to:[
{
email,
name
}
],

subject:"Welcome to Elay Trading",

htmlContent:`
<h2>Welcome ${name}</h2>
<p>Your account is verified successfully.</p>
`

});


return response;


}catch(error){

console.error(
"Welcome email error:",
error.response?.body || error.message
);

throw error;

}

};