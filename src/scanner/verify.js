import {
  API_BASE_URL,
  API_VERSION,
  API_SCANNERS_ENDPOINT,
  API_AUTH_TOKEN,
} from '@env';

const verifyScanner = async scanner => {
  var url = `${API_BASE_URL}/${API_VERSION}/${API_SCANNERS_ENDPOINT}/verify/${scanner.scannerId}`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_AUTH_TOKEN}`,
    },
    body: JSON.stringify(scanner),
  };
  try {
    const res = await fetch(url, options);
    const json = await res.json();
    return json;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export default verifyScanner;
