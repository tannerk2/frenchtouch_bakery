// CloudFront viewer-request function (cloudfront-js-2.0) for the static Next.js export.
// - www.<domain> permanently redirects to the bare domain.
// - Page URLs without an extension map to the exported HTML files: / -> /index.html, /about and /about/ -> /about.html.
function handler(event) {
  var request = event.request
  var host = request.headers.host ? request.headers.host.value : ''

  if (host.indexOf('www.') === 0) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: 'https://' + host.substring(4) + request.uri } },
    }
  }

  var uri = request.uri
  if (uri.length > 1 && uri.charAt(uri.length - 1) === '/') uri = uri.substring(0, uri.length - 1)

  if (uri === '/') {
    request.uri = '/index.html'
  } else if (uri.substring(uri.lastIndexOf('/') + 1).indexOf('.') === -1) {
    request.uri = uri + '.html'
  }
  return request
}
