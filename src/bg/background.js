/* eslint-disable no-console */

const linkBoostServerIpAddress = 'http://localhost:3000';
const linkBoostAppAddress = 'https://app.linkboost.co';
let loginActionTimer;
let currentCookie = '';

browser.action.onClicked.addListener((tab) => {
  browser.tabs.create({ url: 'src/browser_action/browser_action.html' });
});

let server = '';
browser.management.getSelf(self => {
  server = self.installType === 'development' ? linkBoostServerIpAddress : linkBoostAppAddress;
});

browser.runtime.onMessage.addListener(async function (request, sender) {
  console.log('background.js: received message', request);
  if (request.type === "getCookie") {
    return new Promise((resolve, reject) => {
      browser.cookies.getAll({ url: 'https://www.linkedin.com/' }).then(cookieObjects => {
        const cookie = cookieObjects.map(c => `${c.name}=${c.value}`).join('; ');
        if (!cookie) reject('No cookie found');
        console.log('sending cookie', { cookie });
        resolve({ cookie });
      });
    });
  }
  if (request.type === "getSettings") {
    const cookieObjects = await browser.cookies.getAll({ url: 'https://www.linkedin.com/' });
    const cookie = cookieObjects.map(c => `${c.name}=${c.value}`).join('; ');
    const response = await fetch(`${server}/api/aiCommentsSettings`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cookie,
      }),
    });
    const settings = await response.json();
    console.log('sending settings', { settings });
    return settings;
  }
  if (request.type === "getAiComment") {
    const cookieObjects = await browser.cookies.getAll({ url: 'https://www.linkedin.com/' });
    const cookie = cookieObjects.map(c => `${c.name}=${c.value}`).join('; ');
    const response = await fetch(`${server}/api/aiComments2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cookie,
        content: request.content,
        commentId: request.contentType,
      }),
    });
    const comment = await response.text();
    return comment;
  }
});

const check = () => {
  console.log('check: start');
  browser.cookies.getAll({ url: 'https://www.linkedin.com/' }, cookieObjects => {
    if (!server) return;
    const liAtCookieObject = cookieObjects.find(c => c.name === 'li_at');
    if (!liAtCookieObject) {
      console.log('check: logged out');
      if (currentCookie) {
        currentCookie = '';
      }
      return;
    }

    const cookie = cookieObjects.map(c => `${c.name}=${c.value}`).join('; ');
    if (cookie === currentCookie) return;
    console.log({ cookie, currentCookie });
    console.log('check: logged', { currentCookie, cookie });
    currentCookie = cookie;
    browser.runtime.setUninstallURL(`${server}/api/uninstall/${liAtCookieObject.value}`);
    console.log('check: send cookie to server', JSON.stringify({ cookie, browser: 'firefox' }));
    fetch(`${server}/api/cookies`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cookie, browser: 'firefox' }),
    }).then(function (response) {
      console.log(response);
    }).catch(function (error) {
      console.log('Request failed', error);
    });
  });
};

browser.cookies.onChanged.addListener(({ removed, cookie, cause }) => {
  console.log('cookies onChanged', { removed, cookie, cause });
  if ((['explicit', 'expired_overwrite'].includes(cause)) && (cookie.name === 'li_at' || cookie.name === 'JSESSIONID' || cookie.name === 'liap' || cookie.name === 'bcookie' || cookie.name === 'bscookie')) {
    if (cookie.name === 'li_at') {
      console.log('li_at cookie changed', { cookie });
    }
    if (cookie.name === 'JSESSIONID') {
      console.log('JSESSIONID cookie changed', { cookie });
    }
    if (cookie.name === 'li_at') {
      console.log('li_at cookie changed', { cookie });
    }
    if (cookie.name === 'bcookie') {
      console.log('bcookie cookie changed', { cookie });
    }
    if (cookie.name === 'bscookie') {
      console.log('bscookie cookie changed', { cookie });
    }
    clearTimeout(loginActionTimer);
    loginActionTimer = setTimeout(check, loginActionIntervalSeconds * 1000);
  }
});

check();
setInterval(function () {
  check();
}, 60 * 1000);

// check if there is a linkedin tab openned every 1 minute, if not, open a new tab with linkedin
const linkedinUrl = 'https://www.linkedin.com/';
const checkLinkedinTab = () => {
  console.log('checkLinkedinTab: start');
  // check for any linkedin address https://www.linkedin.com/*
  browser.tabs.query({ url: `${linkedinUrl}*` }, function (tabs) {
    if (tabs.length === 0) {
      console.log('checkLinkedinTab: no linkedin tab found, openning a new one');
      // make it pinned and not active
      browser.tabs.create({ url: linkedinUrl, pinned: true, active: false });
    }
  });
};
setInterval(function () {
  checkLinkedinTab();
}, 60 * 1000);
