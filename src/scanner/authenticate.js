import {
  API_BASE_URL,
  API_VERSION,
  API_SCANNERS_ENDPOINT,
  API_AUTH_TOKEN,
} from '@env';

const authenticateScanner = async scannerId => {
  const url = `${API_BASE_URL}/${API_VERSION}/${API_SCANNERS_ENDPOINT}/authenticate/${scannerId}`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_AUTH_TOKEN}`,
    },
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

export default authenticateScanner;
