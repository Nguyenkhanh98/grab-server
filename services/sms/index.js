const accountSid =
  process.env.TWILIO_ACCOUNT_SID || "SK697dff8d8a77c5d27214f8c9b92bad33";
const authToken =
  process.env.TWILIO_AUTH_TOKEN || "JEf9sMTNthcmJNXnBfb7ZZtTZmYZk7DR";
const client = require("twilio")(accountSid, authToken);

export const sendSMS = async ({ from = "+18643324366", to, body }) => {
  return await client.messages.create({
    body,
    from,
    to,
  });
};
