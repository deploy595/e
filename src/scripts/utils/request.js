/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  return response.json()
    .then((data) => ({ data, status: response.status }));
}

const STATUS_BAD_REQUEST   = 400
const STATUS_UNPROCESSABLE = 422

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
  if(response.status >= 200 && response.status < 300 || response.status === STATUS_BAD_REQUEST || response.status === STATUS_UNPROCESSABLE) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           An object containing either "data" or "err"
 */
function request(url, options) {
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
    .then(
      ({data, status}) => ({ ...data, status })
    )
    .catch(
      (err) => ({ errors: {message: err.message} })
    )
}

export function POST(requestURL, data, method = 'POST') {
  return request(requestURL, {
    method:                 method,
    credentials:            'same-origin',
    headers: {
      //'X-CSRF-Token':       document.getElementsByName("csrf-token")[0].getAttribute('content'),
      'X-Requested-With':   'XMLHttpRequest',
      'Accept':             'application/json',
      'Content-Type':       'application/json',
    },
    body: JSON.stringify(data)
  });
}
