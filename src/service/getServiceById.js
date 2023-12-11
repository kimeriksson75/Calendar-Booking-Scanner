import {API_BASE_URL, API_VERSION, API_SERVICES_ENDPOINT} from '@env';

const getServiceById = async (id, token) => {
  var url = `${API_BASE_URL}/${API_VERSION}/${API_SERVICES_ENDPOINT}/${id}`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
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

export default getServiceById;
