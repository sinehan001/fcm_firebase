const express = require('express');
const app = express();
const fs = require('firebase-admin');
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const cors = require("cors");
require("dotenv").config();
const { type } = JSON.parse(process.env.type);
const { project_id } = JSON.parse(process.env.project_id);
const { private_key_id } = JSON.parse(process.env.private_key_id);
const { private_key } = JSON.parse(process.env.private_key);
const { client_email } = JSON.parse(process.env.client_email);
const { client_id } = JSON.parse(process.env.client_id);
const { auth_uri } = JSON.parse(process.env.auth_uri);
const { token_uri } = JSON.parse(process.env.token_uri);
const { auth_provider } = JSON.parse(process.env.auth_provider);
const { client_url } = JSON.parse(process.env.client_url);
const serviceAccount = {
    "type": type,
    "project_id": project_id,
    "private_key_id": private_key_id,
    "private_key": private_key,
    "client_email": client_email,
    "client_id": client_id,
    "auth_uri": auth_uri,
    "token_uri": token_uri,
    "auth_provider_x509_cert_url": auth_provider,
    "client_x509_cert_url": client_url
}
fs.initializeApp({
    credential: fs.credential.cert(serviceAccount)
});
const db = fs.firestore();

app.post("/sendAll", cors(), function(req, res) {
    const message_title = req.body.title;
    const message_body = req.body.body;
    var fcm_users = [];
    const getUsers = async () => {
        const snapshot = await db.collection('users').get();
        snapshot.forEach((doc) => {
            fcm_users.push(doc.data().token);
        });
        const messaging = fs.messaging();
        var payload = {
            tokens: fcm_users,
            notification: {
                title: message_title,
                body: message_body
            }
        };
        messaging.sendMulticast(payload)
        .then((result) => {
            res.send(result);
        });
    }
    getUsers();
});

app.listen(process.env.PORT || 5000, function() {
    console.log("Server running on Port "+process.env.PORT||5000);
});
