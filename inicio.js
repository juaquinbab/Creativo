
const axios = require('axios');
require('dotenv').config();
const url = process.env.url;


function inicio(EtapasMSG, WHATSAPP_API_TOKEN) {

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

    if (body.length > 1 && etapa === 0) {

      idToUpdate51 = id;

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: from,
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          header: {
            type: 'text',
            text: 'JHON VENTAS 2'
          },
          body: {
            text: '😊 Para brindarte una atención más personalizada, te vamos a direccionar a nuestra línea de 📞 Ventas, donde uno de nuestros expertos 👨🏻‍💼 te ayudará con tu requerimiento. Haz clic aquí para recibir asistencia inmediata NUEVA LINEA :  📲 302-457-21-02'
          },
          footer: {
            text: 'Gracias por su preferencia'
          },

          action: {
            name: "cta_url",
            parameters: {
              "display_text": "VENTAS 2",
              "url": "https://wa.link/lcsftk"
            }
          },

        }
      };



      setTimeout(() => {
        axios
          .post(`https://graph.facebook.com/v16.0/301766666358432/messages`, payload, {
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
                EtapasMSG[indexToUpdate].etapa = 1;
                console.log(`Valor de 'etapa' actualizado para el ID: ${idToUpdate51}`);
                idToUpdate51 = null;
              }
            }
          })
          .catch((error) => {
            console.error('Error al enviar la respuesta:', error.response.data);
          });
      }, 1000);
      

    } else {
      console.log("La condición para 'body' y 'etapa' no coincide.");
    }
  } else {
    console.log("El array EtapasMSG está vacío.");
  }


}



module.exports = { inicio };