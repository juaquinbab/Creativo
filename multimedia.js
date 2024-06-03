const axios = require('axios');

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

async function sendMessage(phoneNumber) {
  const url = 'https://graph.facebook.com/v16.0/301766666358432/messages';
  const accessToken = 'EAATNbTfXSB4BOZCT4vHExjthl0IpTvsJDRAaBUXCwAzltirL5hFHbBX2SSm7A0QpsIeIH2OCbQkIQJrnsvGaEard3tM0MZAXh5WPl3jgo0BzvGib3ZAyYi0hKo7mCsKUtlOETpUclbonYosCHezkrq6lCxYAFjs8XjlHdudyODE5aakeK39SM1qO3kYZCVea';

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
      "name": "envios2",
      "language": {
        "code": "en_US"
      },
      "components": [
        {
          "type": "header",
          "parameters": [

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

const phoneNumbers = [
  
  
  
  "573196693304"



]; // Agrega aquí los números de teléfono

async function sendMessages() {
  for (const number of phoneNumbers) {
    await sendMessage(number);
    await sleep(1000); // Espera 1 segundo antes de enviar el siguiente mensaje
  }
}

sendMessages();
