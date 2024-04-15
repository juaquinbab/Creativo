
const axios = require('axios');
require('dotenv').config();
const url = process.env.url;


function menu(registro, WHATSAPP_API_TOKEN) {

    if (!registro[from]) {
        registro[from] = { etapa: 0, body: body, timestamp: Date.now() };

        function enviarMensajeBienvenida(to) {
            if (registro[to] && registro[to].etapa === 0) {
                const payload = {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: from,
                    type: 'interactive',
                    interactive: {
                        type: 'button',
                        body: {
                            text: 'Bienvenido/a Sinergia! 🏥 Estamos aquí para cuidar de tu salud y bienestar. ¿Necesitas una consulta virtual sin costo? ¡Haz tu cita ahora! 💬 ',
                        },
                        action: {
                            buttons: [
                                {
                                    type: 'reply',
                                    reply: {
                                        id: 'ACEPTO_MAS_INFORMACION',
                                        title: 'Menu'
                                    },
                                },
                                
                            ],
                        },
                    },
                };

                axios.post(`https://graph.facebook.com/v16.0/194001337131905/messages`, payload, {
                    headers: {
                        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                })
                    .then(response => {
                        console.log('Respuesta enviada:', response.data);
                        MSGbien = true;
                        registro[to].etapa = 1;
                    })
                    .catch(error => {
                        console.error('Error al enviar la respuesta:', error.response.data);
                    });
            }
        }


        enviarMensajeBienvenida(from);

    }
}


module.exports = { menu };