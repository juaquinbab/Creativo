
const axios = require('axios');
require('dotenv').config();
const url = process.env.url;


function menu(EtapasMSG, WHATSAPP_API_TOKEN) {

    let idToUpdate51 = null;

    if (EtapasMSG.length > 0) {
      let elementoModificadoRecientemente = EtapasMSG[0]; // Asigna el primer elemento por defecto
  
      // Encuentra el elemento con la marca de tiempo más reciente
      EtapasMSG.forEach(elemento => {
        if (elemento.timestamp > elementoModificadoRecientemente.timestamp) {
          elementoModificadoRecientemente = elemento;
        }
      });
  
      // Accede a los datos del elemento más recientemente modificado
      const { from, body, id, imgID, interactiveId, etapa } = elementoModificadoRecientemente;
  
      if (interactiveId === 'QuieroUNO' && etapa === 1) {
  
        idToUpdate51 = id;
  
        const payload = {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: from,
                    type: 'interactive',
                    interactive: {
                      type: 'button',
                      body: {
                        text: ' 🚀 Optimiza tu Atención al Cliente con Chatbots de WhatsApp\n \n¿Buscas una solución eficiente para atender a tus clientes las 24 horas del día? Los chatbots de WhatsApp son la respuesta.\n\nAquí te explico por qué deberías considerarlos: \n\nPresencia donde los clientes están: WhatsApp es la aplicación de mensajería más popular del mundo, con más de dos mil millones de usuarios activos mensuales. En Latinoamérica, un 80% de la población utiliza WhatsApp. \n\nAtención 24/7: Los chatbots están disponibles todo el tiempo y responden más rápidamente que los agentes humanos. Esto se traduce en mayores tasas de satisfacción del cliente.'
                      },
                      action: {
                        buttons: [
                          {
                            type: 'reply',
                            reply: {
                              id: 'Iniciar',
                              title: 'Cotizar',
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
  
            if (idToUpdate51 !== null) {
              const indexToUpdate = EtapasMSG.findIndex((item) => item.id === idToUpdate51);
              if (indexToUpdate !== -1) {
                EtapasMSG[indexToUpdate].etapa = 2;
                console.log(`Valor de 'etapa' actualizado para el ID: ${idToUpdate51}`);
                idToUpdate51 = null; 
              }
            }
          })
          .catch((error) => {
            console.error('Error al enviar la respuesta:', error.response.data);
          });
      } else {
        console.log("La condición para 'body' y 'etapa' no coincide.");
      }
    } else {
      console.log("El array EtapasMSG está vacío.");
    }
  

}

module.exports = { menu };