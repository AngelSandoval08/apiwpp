require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Credenciales Twilio (colócalas en tu .env)
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER; // Ej: whatsapp:+14155238886
const client = twilio(accountSid, authToken);

// Ruta para enviar mensaje
app.post('/message', async (req, res) => {
    try {
        const { number, message } = req.body;

        if (!number || !message) {
            return res.status(400).json({ error: 'Faltan parámetros number o message' });
        }

        const msg = await client.messages.create({
            from: whatsappFrom,
            to: `whatsapp:${number}`,
            body: message
        });

        return res.json({ success: true, sid: msg.sid });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor WhatsApp corriendo en puerto ${PORT}`);
});
