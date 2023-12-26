const linkBoostServerIpAddress = 'http://localhost:3000';
const linkBoostAppAddress = 'https://app.linkboost.co';

const postMessage = obj => {
  console.log('browser_action: send message', obj);
  document.getElementsByTagName('iframe')[0].contentWindow.postMessage(JSON.stringify(obj), '*');
};

// Listen to message from child window
window.addEventListener('message', (e) => {
  let data;
  try {
    data = JSON.parse(e.data);
  } catch (err) { return; }

  if (!data || !data.command) {
    console.error('browser_action: received a message without command', { origin: e.origin, data });
    return;
  }
  console.log('browser_action: received message', data);

  if (data.command === 'cookie') {
    browser.cookies.getAll({ url: 'https://www.linkedin.com/' }, cookieObjects => {
      const cookie = cookieObjects.map(c => `${c.name}=${c.value}`).join('; ');
      if (!cookie) return false;
      console.log('browser_action: get cookie', { cookie });
      postMessage({ command: 'cookie', cookie });
    });
  }
  if (data.command === 'rewardful') {
    browser.cookies.getAll({ domain: 'linkboost.co', name: "rewardful.referral" },
      (cookie) => {
        if (cookie && cookie.length > 0) {
          const object = JSON.parse(unescape(cookie[0].value));
          postMessage({ command: 'rewardful', object })
        } else {
          return false;
        }
      });
  }
}, false);

browser.management.getSelf(self => {
  const server = self.installType === 'development' ? linkBoostServerIpAddress : linkBoostAppAddress;
  const iframe = document.createElement('iframe');
  iframe.src = server;
  iframe.width = '100%';
  iframe.height = '100%';
  document.getElementById('main').appendChild(iframe);
});

localStorage.setItem('LinkBoost opened', (new Date()));
