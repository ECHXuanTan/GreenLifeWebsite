import mailchimp from '@mailchimp/mailchimp_marketing'
import express from 'express';
import expressAsyncHandler from 'express-async-handler';

const apiKey = "609bcc33c4f1474b27dfd3f451f2cf82-us21"

const mailchimpRoute = express.Router();

mailchimp.setConfig({
    apiKey: apiKey,
    server: 'us21'
})

const run = async () => {
    try {
        const response = await mailchimp.lists.getList("bc25cfd2b5");
        console.log(response);
    } catch (error) {
        console.error("Error listing account exports:", error);
    }
};

// mailchimpRoute.get('/', expressAsyncHandler(async (req, res) => {
//     await run(); // Call the run function to list account exports
//     res.status(200).send("Account exports listed in console");
// }));

mailchimpRoute.get('/subscribe', expressAsyncHandler(async (req, res) => {
    const { email } = req.query;
  
    try {
      const response = await mailchimp.lists.addListMember("bc25cfd2b5", {
        email_address: email, // Use the email from the query parameter
        status: "subscribed",
      });
      console.log(response);
      res.status(200).json({ message: "Subscriber added successfully" });
    } catch (error) {
      console.error("Error adding subscriber:", error);
      res.status(500).json({ message: "An error occurred while adding the subscriber" });
    }
  }));

mailchimpRoute.get ('/audiance',
expressAsyncHandler(async (req, res) => {
    try {
        const response = await mailchimp.lists.getListMembersInfo("bc25cfd2b5");
        console.log(response);
        res.send({response});
    } catch (error) {
        console.error("Error get audiances", error);
        res.status(500).json({ message: "An error occurred while getting audiances" });
    }
  }
) );

  export default mailchimpRoute;