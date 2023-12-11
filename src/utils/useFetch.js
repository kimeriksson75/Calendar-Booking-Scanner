import React, {useEffect} from 'react';
const useFetch = (url, options) => {
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [abort, setAbort] = React.useState(() => {});

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const abortController = new AbortController();
        const signal = abortController.signal;
        setAbort(abortController.abort);
        setLoading(true);
        const res = await fetch(url, {...options, signal});
        const json = await res.json();
        setResponse(json);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      abort();
    };
  }, []);

  return {loading, response, error, abort};
};

export default useFetch;
