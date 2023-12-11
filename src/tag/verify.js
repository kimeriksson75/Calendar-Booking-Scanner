import {API_BASE_URL, API_VERSION, API_TAGS_ENDPOINT} from '@env';

const verifyTag = async ({tag, userId, token}) => {
  const url = `${API_BASE_URL}/${API_VERSION}/${API_TAGS_ENDPOINT}/verify/${tag}`;
  const body = {
    tag,
    userId,
  };
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

export default verifyTag;
