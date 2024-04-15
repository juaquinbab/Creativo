const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { log, Console } = require('console');
const axios = require('axios');
const fs = require('fs');
const chokidar = require('chokidar');
const jsonfile = require('jsonfile');
const multer = require('multer');
const uuid = require('uuid');
const dataMap = new Map();
const batchSize = 5;
const app = express();
const { OpenAI } = require('openai');
const { asesor1 } = require('./asesor1');
const { menu } = require('./menu');
const { cotizacion } = require('./cotizacion');
const { datos } = require('./datos');
const { inicio } = require('./inicio');
const { fin } = require('./fin');
const { web } = require('./web');
require('dotenv').config();


const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN
const PORT = process.env.PORT;
const urlserver = process.env.urlserver;
const apiKey = process.env.apiKey;



const historialPath = path.join(__dirname, 'historial');

app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'Public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});



// Endpoint para la verificación de la suscripción de WhatsApp
app.get('/webhook', function (req, res) {
  if (
    req.query['hub.verify_token'] === 'Prueba') {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});


let MensajeIndex = [];
EtapasMSG = []
registro = []


// setInterval(() => {
//   console.log('Etapa:', EtapasMSG);
// }, 1000);



// //////////////////////////////////////////////////////////////////////////////
///// ESTE CODIGO SIRVE EL HISTORIAL AL CLIENTE 
///////////////////////////////////////////////////////////////////


app.get('/historial', (req, res) => {
  fs.readdir(historialPath, (err, files) => {
    if (err) {
      res.status(500).send('Error al leer la carpeta historial');
      return;
    }
    res.json(files.filter(file => path.extname(file) === '.json'));
  });
});

// Ruta para obtener el contenido de un archivo JSON específico
app.get('/historial/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(historialPath, fileName);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error al leer el archivo JSON');
      return;
    }
    MensajeIndex = JSON.parse(data);
    res.json(MensajeIndex);
  });
});



app.put('/mensajeIndex', (req, res) => {
  MensajeIndex = req.body;
  res.json({ message: 'MensajeIndex actualizado en el servidor' });
});





app.post("/webhook", function (request, response) {
  // console.log('Incoming webhook: ' + JSON.stringify(request.body));
  const entry = request.body.entry[0];
  const messageChange = entry.changes[0].value;
  const messages = messageChange.messages;
  const from = messages && messages.length > 0 && messages[0].from ? messages[0].from : 0;
  let body = messageChange.messages[0].text ? messageChange.messages[0].text.body : '';
  const name = messageChange.contacts[0].profile.name || '';
  let imgID = messageChange.messages[0].image ? messageChange.messages[0].image.id : '';
  const audioID = messageChange.messages[0].type === 'audio' ? messageChange.messages[0].audio.id : '';


  // Verificar si body es una cadena antes de convertirla a minúsculas
  if (typeof body === 'string') {
    body = body.toLowerCase();
  }


  let interactiveId = messageChange.messages[0].interactive && messageChange.messages[0].interactive.button_reply ? messageChange.messages[0].interactive.button_reply.id : '';

  // Crear un objeto para almacenar los mensajes que llegan
  const objetoMensaje = {
    from: from,
    body: body,
    name: name,
    imgID: imgID,
    audioID: audioID,
    etapa: 0,
    interactiveId: interactiveId,

  };

  function generarID() {
    return uuid.v4();
  }




  var objetoExistenteIndex = -1;

  for (var i = 0; i < EtapasMSG.length; i++) {
    if (EtapasMSG[i].from === objetoMensaje.from) {
      objetoExistenteIndex = i;
      break;
    }
  }

  if (objetoExistenteIndex !== -1) {

    EtapasMSG[objetoExistenteIndex].timestamp = Date.now();
    EtapasMSG[objetoExistenteIndex].body = objetoMensaje.body;
    EtapasMSG[objetoExistenteIndex].Idp = 1;
    EtapasMSG[objetoExistenteIndex].imgID = objetoMensaje.imgID;
    EtapasMSG[objetoExistenteIndex].interactiveId = objetoMensaje.interactiveId
    EtapasMSG[objetoExistenteIndex].audioID = objetoMensaje.audioID


  } else {
    const maxIDNAN = Math.max(...EtapasMSG.map(item => item.IDNAN), 0);
    const startingID = 1; // Valor inicial para IDNAN   
    const objetoConID = { ...objetoMensaje, id: generarID(), timestamp: Date.now(), IDNAN: maxIDNAN >= startingID ? maxIDNAN + 1 : startingID };
    EtapasMSG.push(objetoConID); // Agrega el objeto al arreglo EtapasMSG
  }


  for (const prop in objetoMensaje) {
    delete objetoMensaje[prop];
  }



  // //////////////////////////////////////////////////////
  // ESTE FRAGMENTO NOS RECIBE LOS USUARIOS Y LOS PASA A JASON.
  // /////////////////////////////////////////


  const folderPath15 = './historial'; // Carpeta donde se guardarán los archivos JSON


  function procesarMensajesBatch15(mensajes) {
    const mensajesBatch = mensajes.splice(0, batchSize); // Obtener el próximo lote de mensajes

    mensajesBatch.forEach((mensaje) => {
      // Supongamos que 'etapa' es una propiedad del objeto dentro de EtapasMSG
      if (mensaje.etapa >= 0 && mensaje.etapa <= 300) {
        const filePath = `${folderPath15}/${mensaje.from}.json`;

        if (fs.existsSync(filePath)) {
          const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const isDuplicateBody = existingData.some((existingMensaje) => existingMensaje.body === mensaje.body);

          if (!isDuplicateBody) {
            existingData.push(mensaje);
            fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
          }
        } else {
          fs.writeFileSync(filePath, JSON.stringify([mensaje], null, 2));
        }
      }
    });

    if (mensajes.length > 0) {
      setTimeout(() => {
        procesarMensajesBatch15(mensajes); // Procesar el siguiente lote después de un tiempo de espera
      }, 1000); // Esperar 1 segundo entre lotes
    }
  }

  // Iniciar el procesamiento por lotes
  procesarMensajesBatch15(EtapasMSG.slice());




  // ESTE ES EL ASESOR PRINCIPAL
  inicio(EtapasMSG, WHATSAPP_API_TOKEN);
  // asesor1(EtapasMSG, apiKey, WHATSAPP_API_TOKEN);
  menu(EtapasMSG, WHATSAPP_API_TOKEN);
  cotizacion(EtapasMSG, WHATSAPP_API_TOKEN);
  datos(EtapasMSG, WHATSAPP_API_TOKEN);
  fin(EtapasMSG, WHATSAPP_API_TOKEN);
  web(EtapasMSG, WHATSAPP_API_TOKEN);




  
  // if (!registro[from]) {
  //   registro[from] = { etapa: 0, body: body, timestamp: Date.now() };

  //   function enviarMensajeBienvenida(to) {
  //     if (registro[to] && registro[to].etapa === 0) {
  //       const payload = {
  //         messaging_product: 'whatsapp',
  //         recipient_type: 'individual',
  //         to: from,
  //         type: 'interactive',
  //         interactive: {
  //           type: 'button',
  //           body: {
  //             text: 'Bienvenido/a Sinergia! 🏥 Estamos aquí para cuidar de tu salud y bienestar. ¿Necesitas una consulta virtual sin costo? ¡Haz tu cita ahora! 💬 ',
  //           },
  //           action: {
  //             buttons: [
  //               {
  //                 type: 'reply',
  //                 reply: {
  //                   id: 'ACEPTO_MAS_INFORMACION',
  //                   title: 'SI'
  //                 },
  //               },
  //               {
  //                 type: 'reply',
  //                 reply: {
  //                   id: 'VER_ESTADO_DE_CUENTA',
  //                   title: 'NO',
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //       };

  //       axios.post(`https://graph.facebook.com/v16.0/194001337131905/messages`, payload, {
  //         headers: {
  //           Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
  //           'Content-Type': 'application/json',
  //         },
  //       })
  //         .then(response => {
  //           console.log('Respuesta enviada:', response.data);
  //           MSGbien = true;
  //           registro[to].etapa = 1;
  //         })
  //         .catch(error => {
  //           console.error('Error al enviar la respuesta:', error.response.data);
  //         });
  //     }
  //   }


  //   enviarMensajeBienvenida(from);

  // }



 

  



  // ///////////////////////////////////////////
  // // envia mensajes al numero de whatsapp que escribio a sala 1 //////////////////
  // ///////////////////////////////////////////

  let cambiosPendientes = true;


  function filtrarMensaje(mensajes) {
    let ultimoMensajeAsesor = null;

    for (let i = mensajes.length - 1; i >= 0; i--) {
      const mensaje = mensajes[i];
      if (mensaje.body.startsWith("Asesor:")) {
        ultimoMensajeAsesor = {
          body: mensaje.body,
          from: mensaje.from,
          name: mensaje.name,
          etapa: mensaje.etapa
        };
        break; // Detener el bucle al encontrar el último mensaje
      }
    }

    return ultimoMensajeAsesor;
  }

  function enviarMensaje(mensaje) {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: mensaje.from,
      type: 'text',
      text: {
        preview_url: false,
        body: mensaje.body
      }
    };

    axios.post(`https://graph.facebook.com/v16.0/194001337131905/messages`, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log('Respuesta enviada:', response.data);
      })
      .catch(error => {
        console.error('Error al enviar la respuesta:', error.response.data);
      });
  }

  let mensajesEnviados = {};

  app.post('/actualizar1', (req, res) => {
    // Enviar una respuesta al cliente (puedes personalizar la respuesta)
    res.json({ message: 'Actualización iniciada' });

    function actualizarFiltroPeriodicamente() {
      if (cambiosPendientes) {
        const mensajeFiltrado = filtrarMensaje(MensajeIndex);
        console.log("Mensaje filtrado:", mensajeFiltrado);
        if (mensajeFiltrado) {
          if (!mensajesEnviados[mensajeFiltrado.from] || mensajesEnviados[mensajeFiltrado.from] !== mensajeFiltrado.body) {
            mensajesEnviados[mensajeFiltrado.from] = mensajeFiltrado.body;
            console.log("from filtrado:", mensajeFiltrado.from, "body filtrado:", mensajeFiltrado.body);
            enviarMensaje(mensajeFiltrado);
          }
        }
      }
    }


    // Iniciar la actualización periódica
    actualizarFiltroPeriodicamente();
  });


  // //////////////////////////////////////////////////////////////////////







  // //////////////////////////////
  // ///////////////////



  app.get('/obtenerMensajes1', (req, res) => {
    const bodys = MensajeIndex.map(({ body }) => body);
    const bodyJSON = JSON.stringify(bodys);
    res.send(bodyJSON);
    console.log(` Mensajes sala 1 ${bodyJSON}`);
  });






  app.post('/responderMensaje1', (req, res) => {
    const response = req.body.response; // Obtener la respuesta del cuerpo de la solicitud
    const modifiedResponse = `Asesor: ${response}`; // Agregar "asesor: " al inicio de la respuesta

    const lastMessage = MensajeIndex[MensajeIndex.length - 1]; // Obtener el último mensaje guardado

    const mensaje = {
      from: lastMessage ? lastMessage.from : 'ValorPorDefectoFrom', // Usar valor del último mensaje o valor por defecto
      name: lastMessage ? lastMessage.name : 'ValorPorDefectoName', // Usar valor del último mensaje o valor por defecto
      body: modifiedResponse, // Guardar la respuesta modificada en el campo 'body'
      response: response // Guardar la respuesta original en el campo 'response'
    };

    MensajeIndex.push(mensaje); // Agregar el objeto mensaje al array
    // console.log(`Mensaje recibido desde el cliente1: "${response}"`);

    // Leer el archivo JSON correspondiente a 'from'
    const filePath = path.join(__dirname, 'historial', `${mensaje.from}.json`);
    fs.readFile(filePath, 'utf8', (err, data) => {
      let historial = [];
      if (!err) {
        try {
          historial = JSON.parse(data);
        } catch (parseError) {
          console.error('Error al parsear el archivo JSON:', parseError);
        }
      }

      // Agregar el objeto mensaje al historial
      historial.push(mensaje);

      // Escribir el historial actualizado de vuelta al archivo JSON
      fs.writeFile(filePath, JSON.stringify(historial, null, 2), (err) => {
        if (err) {
          console.error('Error al escribir en el archivo JSON:', err);
          return res.status(500).json({ message: 'Error al escribir en el archivo JSON' });
        }

        res.json({ message: 'Respuesta enviada exitosamente' });
      });
    });
  });








  ///////////////////


  // ///////////////////////////////////////////////
  // ESTE CODIGO COLOCA EL NOMBRE DE USUAIRO EN EL CLIENTE SALA 1////
  // //////////////////////////////////////////////////////////

  let Usuario1 = 'No hay usuarios'; // Valor predeterminado en caso de que no haya valores en mensajesIndex1

  // Función que se ejecuta cada 2 segundos para asignar 'from' a 'Usuario1'
  function asignarValorname() {
    if (MensajeIndex.length > 0 && MensajeIndex[0].name) {
      Usuario1 = MensajeIndex[0].name;
    } else {
      Usuario1 = 'no hay usuarios'; // Si no hay valores en mensajesIndex1, se asigna 'no hay usuarios'
    }
    // console.log('Valor de "Usuario1":', Usuario1);
  }

  setInterval(asignarValorname, 1000);



  app.get('/Usuarioget1', (req, res) => {
    // Supongamos que Usuario1 tiene un valor en el servidor
    Usuario1 = Usuario1;

    // Envía el valor de Usuario1 al cliente
    res.send(Usuario1);
  });


  let borrar1 = 'No hay usuario'; // Variable para almacenar el valor de 'from'

  // Función que se ejecuta cada 2 segundos para asignar 'from' a 'borrar1'
  function asignarValorFrom() {
    if (MensajeIndex.length > 0 && MensajeIndex[0].from) {
      borrar1 = MensajeIndex[0].from;
    } else {
      borrar1 = 'No hay usuario';
    }
    // console.log('Valor de "borrar1":', borrar1);
  }

  setInterval(asignarValorFrom, 1000);

  app.get('/BuscaOrden', (req, res) => {
    // Envía el valor de borrar1 al cliente
    res.send(borrar1);
  });



  // /////////////////////////////////
  ///////////
  ////////////////////



  // ////////////////////////////////////////////////////
  //////////ESTE CODIGO CARGA LAS IMAGENES AL HISTORIAL ////
  ////////////////////////////////////

  // Iterar a través de EtapasMSG
  let idToUpdate33 = null;

  if (EtapasMSG.length > 0) {
    let elementoModificadoRecientemente33 = null;

    EtapasMSG.forEach((elemento) => {
      if (
        elemento.Idp !== 0 &&
        (elementoModificadoRecientemente33 === null ||
          elemento.timestamp > elementoModificadoRecientemente33.timestamp)
      ) {
        elementoModificadoRecientemente33 = elemento;
      }
    });

    if (elementoModificadoRecientemente33 !== null) {
      const { from, body, etapa, id, imgID } = elementoModificadoRecientemente33;

      if (etapa >= 0 && etapa <= 300 && imgID) {

        const folderPathCLIENTE42 = './historial';

        function countJSONFileslaboratorio33(callback) {
          fs.readdir(folderPathCLIENTE42, (err, files) => {
            if (err) {
              console.error('Error al leer la carpeta:', err);
              return;
            }

            const jsonFiles42 = files.filter((file) => path.extname(file) === '.json');
            let fileCount33 = jsonFiles42.length;

            // Llama al callback con el nuevo valor de fileCount2
            callback(fileCount33);
          });
        }

        // Llamar a la función countJSONFilescirugia para obtener fileCount2
        countJSONFileslaboratorio33((fileCount33) => {

          idToUpdate33 = id;

          const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: from,
            type: 'text',
            text: {
              preview_url: false,
              body: `Imagen Recibida.`,
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
              // console.log('Respuesta enviada:', response.data);

              if (idToUpdate33 !== null) {
                const indexToUpdate = EtapasMSG.findIndex((item) => item.id === idToUpdate33);
                if (indexToUpdate !== -1) {
                  EtapasMSG[indexToUpdate].etapa = 32;
                  EtapasMSG[indexToUpdate].idp = 0;
                  // console.log(`Valor de 'etapa' actualizado para el ID: ${idToUpdate33}`);
                  idToUpdate33 = null; // Restablecer el ID a null después de la actualización
                }
              }
            })
            .catch((error) => {
              console.error('Error al enviar la respuesta:', error.response.data);
            });
        });


        // Envia la imagen al servidor.

        const url = 'https://graph.facebook.com/v17.0/' + imgID;

        const config = {
          headers: {
            Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
          },
        };

        axios.get(url, config)
          .then(response => {
            // console.log('Respuesta de Facebook API:', response.data);
            const urlFromResponse = response.data.url;

            const configp = {
              headers: {
                Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
              },
              responseType: 'stream',
            };

            axios.get(urlFromResponse, configp)
              .then(imageResponse => {
                const randomThreeDigitNumber = Math.floor(1 + Math.random() * 9000); // Número aleatorio entre 100 y 999
                const modifiedFileName = `${from}-${randomThreeDigitNumber}.jpg`;
                const imagePath = path.join(__dirname, '/public/historico', modifiedFileName);
                const writer = fs.createWriteStream(imagePath);

                imageResponse.data.pipe(writer);

                writer.on('finish', () => {
                  // console.log('¡Imagen guardada con éxito en el servidor!');
                });

                // Generar el URL de la imagen

                const imageURL = `${urlserver}/historico/${modifiedFileName}`; // Reemplaza la ruta según tu estructura

                // console.log('URL de la imagen guardada:', imageURL);


                const folderPath = './historial';

                // Nombre del archivo a buscar (asumiendo que es igual al valor de IDNAN)
                const fileName = `${from}.json`;

                // Información para agregar al JSON
                const newData = {
                  "from": from,
                  "body": imageURL,
                  "name": name,
                  "imgID": "",
                  "etapa": 32,
                  "id": "",
                  "timestamp": Date.now(),
                  "IDNAN": 4,
                  "Idp": 1,
                  "idp": 0
                };

                // Ruta completa del archivo
                const filePath = path.join(folderPath, fileName);

                // Verificar si el archivo existe
                if (fs.existsSync(filePath)) {
                  try {
                    // Leer el contenido del archivo JSON
                    const fileContent = fs.readFileSync(filePath, 'utf8');

                    // Parsear el contenido JSON a un array
                    const existingData = JSON.parse(fileContent);

                    // Agregar el nuevo objeto al array existente
                    existingData.push(newData);

                    // Escribir el array actualizado en el archivo JSON
                    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

                    // console.log('Nuevo dato agregado al archivo JSON correctamente.');
                  } catch (error) {
                    console.error('Error al procesar el archivo JSON:', error);
                  }
                } else {
                  console.error('El archivo no existe.');
                }





                writer.on('error', (err) => {
                  console.error('Error al guardar la imagen:', err);
                });
              })
              .catch(error => {
                console.error('Error al realizar la solicitud GET para la imagen:', error);
              });
          })
          .catch(error => {
            console.error('Error al realizar la solicitud a la API de Facebook:', error);
          });
        // ////

      } else {
        // console.log("La condición para 'body' y 'etapa' no coincide.");
      }
    } else {
      // console.log('No se encontró ningún elemento válido con idp distinto de 0');
    }
  } else {
    console.log("El array EtapasMSG está vacío.");
  }

  // /////////////////////
  /////////////////
  ///////////////////////////////////





  // ///////////////////////////////////////////////
  // ESTE CODIGO CARGA LOS AUDIOS AL HISTORIAL
  // //////////////////////////////////////////////////////////

  let Usuario1AU = 'No hay usuarios'; // Valor predeterminado en caso de que no haya valores en mensajesIndex1

  // Función que se ejecuta cada 2 segundos para asignar 'from' a 'Usuario1'
  function asignarValorname() {
    if (MensajeIndex.length > 0 && MensajeIndex[0].name) {
      Usuario1AU = MensajeIndex[0].name;
    } else {
      Usuario1AU = 'no hay usuarios'; // Si no hay valores en mensajesIndex1, se asigna 'no hay usuarios'
    }
    // console.log('Valor de "Usuario1":', Usuario1);
  }

  setInterval(asignarValorname, 1000);



  app.get('/Usuarioget1', (req, res) => {
    // Supongamos que Usuario1 tiene un valor en el servidor
    Usuario1AU = Usuario1AU;

    // Envía el valor de Usuario1 al cliente
    res.send(Usuario1AU);
  });


  let borrar1AU = 'No hay usuario'; // Variable para almacenar el valor de 'from'

  // Función que se ejecuta cada 2 segundos para asignar 'from' a 'borrar1'
  function asignarValorFrom() {
    if (MensajeIndex.length > 0 && MensajeIndex[0].from) {
      borrar1AU = MensajeIndex[0].from;
    } else {
      borrar1AU = 'No hay usuario';
    }
    // console.log('Valor de "borrar1":', borrar1);
  }

  setInterval(asignarValorFrom, 1000);

  app.get('/BuscaOrden', (req, res) => {
    // Envía el valor de borrar1 al cliente
    res.send(borrar1AU);
  });



  // /////////////////////////////////
  ///////////
  ////////////////////



  // ////////////////////////////////////////////////////
  //////////ENVIA IMAGENES A PARTICULARES ////
  ////////////////////////////////////

  // Iterar a través de EtapasMSG
  let idToUpdateAU = null;

  if (EtapasMSG.length > 0) {
    let elementoModificadoRecientemente33 = null;

    EtapasMSG.forEach((elemento) => {
      if (
        elemento.Idp !== 0 &&
        (elementoModificadoRecientemente33 === null ||
          elemento.timestamp > elementoModificadoRecientemente33.timestamp)
      ) {
        elementoModificadoRecientemente33 = elemento;
      }
    });

    if (elementoModificadoRecientemente33 !== null) {
      const { from, body, etapa, id, imgID, audioID } = elementoModificadoRecientemente33;

      if (etapa >= 0 && etapa <= 300 && audioID) {

        const folderPathCLIENTE42 = './historial';

        function countJSONFiles(callback) {
          fs.readdir(folderPathCLIENTE42, (err, files) => {
            if (err) {
              console.error('Error al leer la carpeta:', err);
              return;
            }

            const jsonFiles42 = files.filter((file) => path.extname(file) === '.json');
            let fileCount33 = jsonFiles42.length;

            // Llama al callback con el nuevo valor de fileCount2
            callback(fileCount33);
          });
        }

        // Llamar a la función countJSONFilescirugia para obtener fileCount2
        countJSONFiles((fileCount33) => {

          idToUpdateAU = id;

          const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: from,
            type: 'text',
            text: {
              preview_url: false,
              body: `Audio Recibido.`,
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
              // console.log('Respuesta enviada:', response.data);

              if (idToUpdateAU !== null) {
                const indexToUpdate = EtapasMSG.findIndex((item) => item.id === idToUpdateAU);
                if (indexToUpdate !== -1) {
                  EtapasMSG[indexToUpdate].etapa = 32;
                  EtapasMSG[indexToUpdate].idp = 0;
                  // console.log(`Valor de 'etapa' actualizado para el ID: ${idToUpdate33}`);
                  idToUpdateAU = null; // Restablecer el ID a null después de la actualización
                }
              }
            })
            .catch((error) => {
              console.error('Error al enviar la respuesta:', error.response.data);
            });
        });


        // Envia la imagen al servidor.

        const url = 'https://graph.facebook.com/v17.0/' + audioID;

        const config = {
          headers: {
            Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
          },
        };

        axios.get(url, config)
          .then(response => {
            // console.log('Respuesta de Facebook API:', response.data);
            const urlFromResponse = response.data.url;

            const configp = {
              headers: {
                Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
              },
              responseType: 'stream',
            };

            axios.get(urlFromResponse, configp)
              .then(imageResponse => {
                const randomThreeDigitNumber = Math.floor(1 + Math.random() * 9000); // Número aleatorio entre 100 y 999
                const modifiedFileName = `${from}-${randomThreeDigitNumber}.ogg`;
                const imagePath = path.join(__dirname, '/public/Audio', modifiedFileName);
                const writer = fs.createWriteStream(imagePath);

                imageResponse.data.pipe(writer);

                writer.on('finish', () => {
                  // console.log('¡Imagen guardada con éxito en el servidor!');
                });

                // Generar el URL de la imagen

                const imageURL = `${urlserver}/Audio/${modifiedFileName}`; // Reemplaza la ruta según tu estructura

                // console.log('URL de la imagen guardada:', imageURL);


                const folderPath = './historial';

                // Nombre del archivo a buscar (asumiendo que es igual al valor de IDNAN)
                const fileName = `${from}.json`;

                // Información para agregar al JSON
                const newData = {
                  "from": from,
                  "body": imageURL,
                  "name": name,
                  "imgID": "",
                  "etapa": 32,
                  "id": "",
                  "timestamp": Date.now(),
                  "IDNAN": 4,
                  "Idp": 1,
                  "idp": 0
                };

                // Ruta completa del archivo
                const filePath = path.join(folderPath, fileName);

                // Verificar si el archivo existe
                if (fs.existsSync(filePath)) {
                  try {
                    // Leer el contenido del archivo JSON
                    const fileContent = fs.readFileSync(filePath, 'utf8');

                    // Parsear el contenido JSON a un array
                    const existingData = JSON.parse(fileContent);

                    // Agregar el nuevo objeto al array existente
                    existingData.push(newData);

                    // Escribir el array actualizado en el archivo JSON
                    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

                    // console.log('Nuevo dato agregado al archivo JSON correctamente.');
                  } catch (error) {
                    console.error('Error al procesar el archivo JSON:', error);
                  }
                } else {
                  console.error('El archivo no existe.');
                }





                writer.on('error', (err) => {
                  console.error('Error al guardar la imagen:', err);
                });
              })
              .catch(error => {
                console.error('Error al realizar la solicitud GET para la imagen:', error);
              });
          })
          .catch(error => {
            console.error('Error al realizar la solicitud a la API de Facebook:', error);
          });
        // ////

      } else {
        // console.log("La condición para 'body' y 'etapa' no coincide.");
      }
    } else {
      // console.log('No se encontró ningún elemento válido con idp distinto de 0');
    }
  } else {
    console.log("El array EtapasMSG está vacío.");
  }

  // /////////////////////
  /////////////////
  ///////////////////////////////////









  response.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});