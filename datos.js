
const axios = require('axios');
require('dotenv').config();
const url = process.env.url;


function datos(EtapasMSG, WHATSAPP_API_TOKEN) {

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
  
      if (interactiveId === 'Muestra' && etapa === 3) {
  
        idToUpdate51 = id;
  
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: from,
            type: 'text',
            text: {
              preview_url: false,
              body:
                'Nuestro equipo de asesores se pondrá en contacto contigo lo antes posible. Por favor, déjano en un solo mensaje tus datos a continuación: \n\n*¿Cómo te gustaría que nuestro bot ayudara en tu empresa?*\n\n*Email:* \n\n*Nombre:* \n\n*Número de Teléfono:*',
    
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
                EtapasMSG[indexToUpdate].etapa = 4;
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

module.exports = { datos };