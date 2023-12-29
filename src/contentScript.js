const server = 'https://app.linkboost.co';

console.log('Linkboost: loading');

const func = async function () {
  console.log('Linkboost: loaded');
  function findParentByClass(el, className) {
    while ((el = el.parentElement)) {
      if (el.classList.contains(className)) {
        return el;
      }
    }
    return null;
  }
  // load settings from api call /api/getAiCommentsSettings
  const loadSettings = async () => {
    const settings = await browser.runtime.sendMessage({ type: "getSettings" });
    return settings;
  };
  // store settings on local storage
  const storeSettings = (settings) => {
    localStorage.setItem('linkboostSettings', JSON.stringify(settings));
  };
  // get settings from local storage
  const getSettings = () => {
    const settings = localStorage.getItem('linkboostSettings');
    if (settings) {
      return JSON.parse(settings);
    }
    return null;
  };

  let targetNode = document.getElementsByClassName('scaffold-finite-scroll--infinite')[0];

  // Options for the observer (which mutations to observe)
  let config = { attributes: true, childList: true, subtree: true };

  const addAiButton = (div, settings) => {
    if (div) {
      // check if the div with class name 'commentWithLinkboost' does not exists
      if (div.getElementsByClassName('commentWithLinkboost').length === 0) {
        const { prompts } = settings;
        const commentOptions = prompts.map(prompt => `<div class="option text-gray-700 block px-4 py-2 text-md cursor-pointer hover:bg-gray-200" role="menuitem" tabindex="-1" id="${prompt._id}">${prompt.label}</div>`).join('');
        const linkboostDiv = `
              <div class="commentWithLinkboost relative inline-block text-left">
                <div>
                  <button type="button" class="flex items-center rounded-full hover:bg-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 p-3" id="menu-button" aria-expanded="true" aria-haspopup="true">
                    <span class="sr-only">Open options</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                    </svg>
                  </button>
                </div>
                <div class="commentOption absolute right-0 top-12 z-10 mt-2 w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
                transition ease-out duration-100 transform opacity-0 scale-95" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1" id="commentOption">
                  <div class="py-1" role="none">
                  ${commentOptions}
                  <div class="px-4 py-2 flex flex-row items-center">
                  <div class="text-gray-600 flex-1" style="font-size: 12px">powered by Linkboost</div>
                  <a href="https://app.linkboost.co/profile?aiCommentsSettings=true" target="_blank">
                  <div class="p-2 rounded-full cursor-pointer bg-gray-100 hover:bg-gray-300 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div></a>
                  </div>
                  </div>
                </div>
              </div>
              `;
        // use insertAdjacentHTML and insert the linkboostDiv after the div with class name 'mlA' in the start position
        div.insertAdjacentHTML('afterbegin', linkboostDiv);
        // get the div with class name 'commentWithLinkboost'
        const lbDiv = div.getElementsByClassName('commentWithLinkboost')[0];
        // add event listener to the div with class name 'commentWithLinkboost' hover
        lbDiv.addEventListener('mouseover', function (event) {
          // find the div with class name 'commentOption' that is the child of the div with class name 'commentWithLinkboost' use this
          const commentOption = lbDiv.querySelector('.commentOption');
          commentOption.classList.remove('hidden');
          commentOption.classList.add('opacity-100');
          commentOption.classList.add('scale-100');
          commentOption.classList.remove('opacity-0');
          commentOption.classList.remove('scale-95');
        });
        // detect when the mouse leaves the div with class name 'commentWithLinkboost'
        lbDiv.addEventListener('mouseleave', function (event) {
          const commentOption = lbDiv.querySelector('.commentOption');
          commentOption.classList.add('opacity-0');
          commentOption.classList.add('scale-95');
          commentOption.classList.remove('opacity-100');
          commentOption.classList.remove('scale-100');
          commentOption.classList.add('hidden');
        });
        // find all elements with class name 'option' inside lbDiv
        const commentOptionDiv = lbDiv.querySelector('.commentOption');
        const options = commentOptionDiv.querySelectorAll('.option');
        // add click event listener to each element with class name 'option'
        // find lbDiv parent element
        const parent = lbDiv.parentElement;
        // find element with class name 'ql-editor' inside the parent element recursively
        const superParent = parent.parentElement;
        const qlEditor = superParent.getElementsByClassName('ql-editor')[0];
        // find nearest element from superParent that has class name 'update-components-text'
        let nearestDiv = findParentByClass(div, 'update-v2-social-activity');
        // get parent
        let parentDiv = nearestDiv.parentElement;
        // get child div with class 'feed-shared-update-v2__description-wrapper'
        let childDiv = parentDiv.getElementsByClassName('update-components-update-v2__commentary')[0];
        // find child element that is <span dir="ltr">...</span>
        let childElement = childDiv.querySelector('span[dir="ltr"]');
        // get the text content of the child element
        let content = childElement.textContent;
        options.forEach(option => {
          option.addEventListener('click', async function (event) {
            qlEditor.innerHTML = `<p>Generating comment...</p>`;
            const type = event.target.id;
            // get cookie from background.js
            const comment = await browser.runtime.sendMessage({ type: "getAiComment", content, contentType: type });
            qlEditor.innerHTML = `<p>${comment}</p>`;
          });
        });
      }
    }
  };

  // Callback function to execute when mutations are observed
  // add settings to callback function
  let callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if (mutation.target &&
          mutation.target.className &&
          // check if className is string
          typeof mutation.target.className === 'string' &&
          // check if the class name contains the string 
          mutation.target.className.indexOf('mlA') > -1) {
          // find div with class name 'mlA' inside the target
          let div = mutation.target;
          // addAiButton to the div
          const settings = getSettings();
          if (settings.displayAiComments) {
            // wait for 100ms before adding the button
            setTimeout(() => addAiButton(div, settings), 100);
          }
        }
      }
    }
  };

  function checkForCommentsContainer(settings) {
    // Get all elements with have both mlA and display-flex classes
    if (settings.displayAiComments) {
      const mlAdivs = document.querySelectorAll('.mlA.display-flex');
      if (mlAdivs && mlAdivs.length > 0) {
        // Loop through all elements with class 'comments-container'
        for (let i = 0; i < mlAdivs.length; i++) {
          // check if the div with class name 'commentWithLinkboost' does not exists
          addAiButton(mlAdivs[i], settings);
        }
      }
    }
  }

  // Call checkForCommentsContainer every 5 seconds
  const settings = await loadSettings();
  storeSettings(settings);
  console.log('Loaded Linkboost settings', settings);
  // Create an observer instance linked to the callback function
  let observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  if (targetNode) {
    observer.observe(targetNode, config);
  }
  setInterval(() => checkForCommentsContainer(settings), 1000);
}

func();