
const axios = require('axios');
require('dotenv').config();
const url = process.env.url;


function cotizacion(EtapasMSG, WHATSAPP_API_TOKEN) {

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
  
      if (interactiveId === 'Iniciar' && etapa === 2) {
  
        idToUpdate51 = id;
  
        const payload = {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: from,
                    type: 'interactive',
                    interactive: {
                      type: 'button',
                      body: {
                        text: 'En nuestra empresa somos especialistas en optimizar el flujo de clientes y usuarios a través de bots diseñados a medida.\nNos adaptamos y configuramos todo según las necesidades específicas de cada empresa. Contamos con servidores que operan las 24 horas del día, ofrecemos dominios exclusivos y somos expertos en el desarrollo de bots de WhatsApp para clínicas de salud y odontológicas. \n\n*¡Confía en nosotros para mejorar la experiencia de tus clientes y optimizar tus procesos!*'
                      },
                      action: {
                        buttons: [
                          {
                            type: 'reply',
                            reply: {
                              id: 'Muestra',
                              title: 'Muestra Gratis',
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
                EtapasMSG[indexToUpdate].etapa = 3;
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

module.exports = { cotizacion };