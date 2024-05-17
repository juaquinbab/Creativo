const axios = require('axios');

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

async function sendMessage(phoneNumber) {
  const url = 'https://graph.facebook.com/v16.0/301766666358432/messages';
  const accessToken = 'EAATNbTfXSB4BO7KhsM7aqufZCSGpRQt7z6bb7gEMW1av2kmetM4xalD7X50AQQa3VYZBpZAkNbRhzbJMGdtOIlRpc0Uuqqsfgh2NOTMPG2CBTFZC1atdoPa0RkQXOzwXvqPgbLFK7FbIKZCkG8iwyZBKDZCDY4oewuSPncpa6dZCBu2NQDg8jkXS6mMZAm7NSjG5ZB7RvT5EiL3doVZCfgZD';

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  const data = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": phoneNumber,
    "type": "template",
    "template": {
      "name": "reanudar",
      "language": {
        "code": "en_US"
      },
      "components": [
        {
          "type": "header",
          "parameters": [
            {
                "type": "image",
                "image": {
                    "link": "https://i.ibb.co/89XPX7m/Mesa-de-trabajo-1-4x-100.jpg"
                }
            }

            
          ]
        },
      ]
    }
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log(`Mensaje enviado a ${phoneNumber}. Estado: ${response.status}`);
  } catch (error) {
    console.error(`Error al enviar el mensaje a ${phoneNumber}:`, error.response ? error.response.data : error.message);
  }
}

const phoneNumbers = ["573204037757"]; // Agrega aquí los números de teléfono

async function sendMessages() {
  for (const number of phoneNumbers) {
    await sendMessage(number);
    await sleep(1000); // Espera 1 segundo antes de enviar el siguiente mensaje
  }
}

sendMessages();
