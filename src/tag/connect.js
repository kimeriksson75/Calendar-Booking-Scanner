import {API_BASE_URL, API_VERSION, API_TAGS_ENDPOINT} from '@env';

const connectTag = async body => {
  const url = `${API_BASE_URL}/${API_VERSION}/${API_TAGS_ENDPOINT}`;
  const {token} = body;

  console.log('connect tag url', url, token);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
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

export default connectTag;
