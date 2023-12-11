import {API_BASE_URL, API_VERSION, API_TAGS_ENDPOINT} from '@env';

const authenticateTag = async ({tag, token}) => {
  const url = `${API_BASE_URL}/${API_VERSION}/${API_TAGS_ENDPOINT}/authenticate/${tag}`;
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

export default authenticateTag;
