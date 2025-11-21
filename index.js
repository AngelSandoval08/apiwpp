const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const app = express();
const PORT = 3000;

app.use(express.json()); // Para leer JSON en los requests
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'cedemi_auth' })
});


client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Escanea el código QR para conectar.');
});

client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp listo.');
});

app.post('/message', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ error: 'Faltan parámetros: number y message son requeridos.' });
    }

    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;

    try {
        await client.sendMessage(chatId, message);
        return res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        return res.status(500).json({ error: 'No se pudo enviar el mensaje.' });
    }
});

// Inicializar el cliente de WhatsApp
client.initialize();

// Iniciar el servidor Express
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});
