const constantMock = window.fetch;
window.fetch = function () {
  return new Promise((resolve, reject) => {
    constantMock
      .apply(this, arguments)
      .then((response) => {
        if (response) {
          response
            .clone()
            .json() //the response body is a readable stream, which can only be read once. That's why we make a clone here and work with the clone
            .then((json) => {
              let request = [];
              if (response.url.indexOf("getPublicPageData") > 0) {
                request = {
                  type: "getPublicPageData",
                  dataUrl: response.url,
                  response: json,
                };
                let broadcastChannel = new BroadcastChannel(
                  "notion-monkey-channel"
                );
                broadcastChannel.postMessage(request);
              }
              if (response.url.indexOf("getUserAnalyticsSettings") > 0) {
                request = {
                  type: "getUserAnalyticsSettings",
                  dataUrl: response.url,
                  response: json,
                };
              }
              if (response.url.indexOf("getActivityLog") > 0) {
                request = {
                  type: "getActivityLog",
                  dataUrl: response.url,
                  response: json,
                };
              }
              if (response.url.indexOf("getNotificationLog") > 0) {
                request = {
                  type: "getActivityLog",
                  dataUrl: response.url,
                  response: json,
                };
              }
              if (request) {
                let broadcastChannel = new BroadcastChannel(
                  "notion-monkey-channel"
                );
                broadcastChannel.postMessage(request);
              }
              resolve(response);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          reject(arguments);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
