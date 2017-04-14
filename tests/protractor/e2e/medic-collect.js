const assert = require('chai').assert,
    net = require('net'),
    host = 'localhost',
    port = '5988',
    dbName = 'medic';

describe('medic-collect', () => {

  describe('without User-Agent header', () => {

    it('is prompted for auth details', () => {

      // when
      return rawHttpRequest(

`HEAD /${dbName}/_design/medic/_rewrite/add?deviceID=imei%3A357578064823168 HTTP/1.1
X-OpenRosa-Version: 1.0
Date: Tue, 11 Apr 2017 06:34:21 CEST
Host: ${host}:${port}
Connection: close

`).then((res) => {

        // then
        assert.equals(res.statusCode, 401);
        assert.equals(res.headers['WWW-Authenticate'], 'Basic realm="Medic Mobile Web Services"');

      });

    });

    it('can request a list of forms', (done) => {
      done('TODO');
    });

    it('can request a specific form', (done) => {
      done('TODO');
    });

    it('can submit a form response', (done) => {
      done('TODO');
    });

  });

  // TODO repeat the tests _with_ a ua, such as:
  // User-Agent: Dalvik/1.6.0 (Linux; U; Android 4.4.2; TECNO-Y4 Build/KOT49H) org.medicmobile.collect.android/SNAPSHOT

});

function rawHttpRequest(rawRequest) {
  return new Promise((resolve, reject) => {

    const api = net.connect(port, host);
    var rawResponse = '';

    api.on('connect', () => api.write(rawRequest));
    api.on('data', (data) => rawResponse += data.toString());
    api.on('error', reject);

    api.on('close', () => {
      const response = { headers:{} };
      var lines = rawResponse.split('\r\n');

      response.statusCode = parseInt(lines.shift().split(' ')[1]);
      while(next = lines.shift()) {
        var colon = next.indexOf(':');
        response.headers[next.substring(0, colon)] =
            next.substring(colon+1);
      }
      response.body = lines.join('\r\n');
        
      resolve(response);
    });
  });
}
