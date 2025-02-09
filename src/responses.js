// send XML or JSON object
const respond = (request, response, status, content, type = 'json') => {
  let responseData;
  let contentType;

  if (type === 'xml') {
    responseData = `<response><message>${content.message}</message>`;
    if (content.id) responseData += `<id>${content.id}</id>`;
    responseData += '</response>';

    contentType = 'text/xml';
  } else {
    responseData = JSON.stringify(content);

    contentType = 'application/json';
  }

  response.writeHead(status, { 'Content-Type': contentType });

  // do not write body, just metadata
  if (request.method !== 'HEAD') {
    response.write(responseData);
  }

  response.end();
};

// parse header
const getResponseType = (request) => {
    const accept = request.headers.accept || '';  
    if (accept.includes('text/xml')) {
      return 'xml';
    }
    return 'json'; 
  };
  
// 200 success
const success = (request, response) => {
  const type = getResponseType(request);

  // message to send
  const statusResponse = {
    message: 'This is a successful response',
  };

  // send with a success status code
  respond(request, response, 200, statusResponse, type);
};

// 400, 200 badRequest
const badRequest = (request, response) => {
  const type = getResponseType(request);
  const url = new URL(request.url, `http://${request.headers.host}`);
  const valid = url.searchParams.get('valid');

  let statusResponse;

  if (valid === 'true') {
    statusResponse = {
      message: 'This request has the required parameters',
    };
    respond(request, response, 200, statusResponse, type);
  } else {
    statusResponse = {
      message: 'Missing valid query parameter set to true',
      id: 'badRequest',
    };
    respond(request, response, 400, statusResponse, type);
  }
};

// 401, 200 unauthorized
const unauthorized = (request, response) => {
  const type = getResponseType(request);
  const url = new URL(request.url, `http://${request.headers.host}`);
  const loggedIn = url.searchParams.get('loggedIn');
  let statusResponse;

  if (loggedIn === 'yes') {
    statusResponse = {
      message: 'You have successfully viewed the content.',
    };
    respond(request, response, 200, statusResponse, type);
  } else {
    statusResponse = {
      message: 'Missing loggedIn query parameter set to yes',
      id: 'unauthorized',
    };
    respond(request, response, 401, statusResponse, type);
  }
};

// 403 forbidden
const forbidden = (request, response) => {
  const type = getResponseType(request);

  const statusResponse = {
    message: 'You do not have access to this content.',
    id: 'forbidden',
  };
  respond(request, response, 403, statusResponse, type);
};

// 500 internal
const internal = (request, response) => {
  const type = getResponseType(request);

  const statusResponse = {
    message: 'Internal Server Error: Something went wrong.',
    id: 'internalError',
  };
  respond(request, response, 500, statusResponse, type);
};

// 501 notImplemented
const notImplemented = (request, response) => {
  const type = getResponseType(request);

  const statusResponse = {
    message: 'A request for this page has not been implemented yet. Check again later for updated content.',
    id: 'notImplemented',
  };
  respond(request, response, 501, statusResponse, type);
};

// 404 other pages
const notFound = (request, response) => {
  const type = getResponseType(request);

  const statusResponse = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  respond(request, response, 404, statusResponse, type);
};

module.exports = {
  success,
  badRequest,
  unauthorized,
  forbidden,
  internal,
  notImplemented,
  notFound,
};
