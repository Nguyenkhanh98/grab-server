const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const client = require("twilio")(accountSid, authToken);

export const sendSMS = async ({ from = "+18643324366", to, body }) => {
  return await client.messages.create({
    body,
    from,
    to,
  });
};
