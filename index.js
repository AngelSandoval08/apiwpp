require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const SECRET = process.env.WHATSAPP_SECRET;

// Configuración de Whatsapp Web
const client = new Client({
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});


client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Escanea este QR con tu WhatsApp:');
});

client.on('ready', () => {
    console.log('WhatsApp Web listo para enviar mensajes!');
});

client.initialize();

// Ruta para enviar mensaje
app.post('/message', async (req, res) => {
    try {
        if (req.headers['x-app-secret'] !== SECRET) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { number, message } = req.body;

        if (!number || !message) {
            return res.status(400).json({ error: 'Faltan parámetros number o message' });
        }

        // Formatear número: debe terminar con "@c.us"
        let chatId = number.includes('@c.us') ? number : `${number}@c.us`;

        await client.sendMessage(chatId, message);
        return res.json({ success: true, msg: 'Mensaje enviado' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor WhatsApp corriendo en puerto ${PORT}`);
});
