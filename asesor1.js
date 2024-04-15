
const axios = require('axios');
require('dotenv').config();
//const url = process.env.url;

const url = 'https://api.openai.com/v1/chat/completions'

function asesor1(EtapasMSG, apiKey, WHATSAPP_API_TOKEN) {
  
  let idToUpdate = null;
  let message = '';

  if (EtapasMSG.length > 0) {
    const elementoModificadoRecientemente = EtapasMSG.reduce((prev, current) => (prev.timestamp > current.timestamp) ? prev : current);

    const { from, body, id, etapa } = elementoModificadoRecientemente;
    let content, messageExtra;

    if (body.toLowerCase().includes('HTTTXC')) {
      content = 'Eres un asistente virtual, y me vas a dar recomendación de restaurantes, en Fusagasugá, respóndame solo con una introducción y finalice con :';
      messageExtra = 'texto por anexar 1';
    } else if (body.toLowerCase().includes('cxxxv')) {
      content = 'Eres un asistente virtual, y me vas a dar una introducción para recomendación de sitios para conocer en Fusagasugá, respóndame solo con una introducción de máximos 50 palabras y finalice con :';
      messageExtra = 'texto por anexar 2';
    } else {
      content = body;
      content = 'Toma la postura de un Vendedor de Chat bots para empresas, lo puedes dar respuesta de maximos 20 palabras'
      messageExtra = '' 
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    const data = {
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "system",
          "content": content
        },
      ]
    };

    axios.post(url, data, { headers })
      .then(response => {
        message = response.data.choices[0].message.content;
        const messageFull = message + ' ' + messageExtra;
  
        if (body.length > 1   && etapa === 0 ) {
          idToUpdate = id;

          const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: from,
            type: 'interactive',
            interactive: {
              type: 'button',
              body: {
                text: `${messageFull}`,
              },
              action: {
                buttons: [
                  {
                    type: 'reply',
                    reply: {
                      id: 'QuieroUNO',
                      title: 'Quiero un BOT'
                    },
                  },
                  {
                    type: 'reply',
                    reply: {
                      id: 'pagina',
                      title: 'Quiero pagína web'
                    },
                  },
                ],
              },
            },
          };

          axios
            .post(`https://graph.facebook.com/v16.0/194001337131905/messages`, payload, {
              headers: {
                Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
            })
            .then((response) => {
              console.log('Respuesta enviada:', response.data);

              if (idToUpdate !== null) {
                const indexToUpdate = EtapasMSG.findIndex((item) => item.id === idToUpdate);
                if (indexToUpdate !== -1) {
                  EtapasMSG[indexToUpdate].etapa = 1;
                  console.log(`Valor de 'etapa' actualizado para el ID: ${idToUpdate}`);
                  idToUpdate = null; // Restablecer el ID a null después de la actualización
                }
              }

            })
            .catch((error) => {
              console.error('Error al enviar la respuesta:', error.response.data);
            });
        } else {
          console.log("La condición para 'body' y 'etapa' no coincide.");
        }
      })
      .catch(error => {
        console.error(error);
      });
  } else {
    console.log("El array EtapasMSG está vacío.");
  }

}

module.exports = { asesor1 };