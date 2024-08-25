// app.js en microservice-translation
const express = require('express');
const amqp = require('amqplib/callback_api');
const translationRoutes = require('./routes/translationRoutes');

const app = express();
app.use(express.json());

app.use('/api/translate', translationRoutes);

const PORT = process.env.PORT || 3001;

// Conectar a RabbitMQ
amqp.connect('amqp://rabbitmq', (error0, connection) => {
    if (error0) {
        throw error0;
    }
    connection.createChannel((error1, channel) => {
        if (error1) {
            throw error1;
        }

        const queue = 'translation_queue'; // Nombre de la cola

        // Asegúrate de que la cola se crea
        channel.assertQueue(queue, {
            durable: false
        });

        app.post('/api/translate', (req, res) => {
            const { text, targetLanguage } = req.body;
            const translatedText = `Translated text to ${targetLanguage}`;

            // Enviar el mensaje a RabbitMQ
            channel.sendToQueue(queue, Buffer.from(translatedText));

            res.json({ translatedText });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Translation service running on port ${PORT}`);
});
