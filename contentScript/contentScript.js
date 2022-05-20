// Const define 
const NOTION_DIV_SCROLL = '.notion-updates-menu .notion-scroller.vertical';
const NOTION_NOTIFICATION_DIV = 'a .notranslate:not(.notion-record-icon)';
const NOTION_MAIN_DIV = '.notion-updates-menu';

const body = document.querySelector("body");
const config = {
    attributes: false,
    characterData: false,
    childList: true,
    subtree: true,
};

// Document ready
$(document).ready(function () {
    // Handle page click event 
    $('body').on('click', '.custom-tag-added', function (event) {
        let pageId = $(this).attr('data-id') ?? '';
        let svgColor = $('body').hasClass('dark') ? 'rgba(255, 255, 255, 0.443)' : 'rgba(55, 53, 47, 0.45)';
        if (pageId) {
            let pageDataDiv = $('[data-page-type="' + pageId + '"]');
            if (!pageDataDiv.is(':visible')) {
                pageDataDiv.css("display", "block");
                $(this).find('.custom-svg').html(`
                    <svg
                    viewBox="0 0 100 100"
                    class="triangle"
                    style="width: 0.6875em; height: 0.6875em; display: block; fill: ${svgColor}; flex-shrink: 0; backface-visibility: hidden; transition: transform 200ms ease-out 0s; transform: rotateZ(180deg); opacity: 1;"
                >
                    <polygon points="5.9,88.2 50,11.8 94.1,88.2 "></polygon>
                </svg>
                `);
            } else {
                pageDataDiv.css("display", "none");
                $(this).find('.custom-svg').html(`<svg
                    viewBox="0 0 100 100"
                    class="triangle"
                    style="width: 0.6875em; height: 0.6875em; display: block; fill: ${svgColor}; flex-shrink: 0; backface-visibility: hidden; transition: transform 200ms ease-out 0s; transform: rotateZ(90deg); opacity: 1;"
                >
                    <polygon points="5.9,88.2 50,11.8 94.1,88.2 "></polygon>
                </svg>
                `);
            }
        }
    });

    // Handle notion notification div scroll event
    $('body').on('click', '.hide-scrollbar .notion-focusable', function () {
        let appendDiv = false;
        if (document.querySelector(NOTION_MAIN_DIV)
            && !document.querySelector('#note_id')) {
            appendDiv = true;
        }
        injectScript(appendDiv);
    });
});

/**
 * Handle MutationObserver 
 */
new MutationObserver(function (mutations) {
    if (document.querySelector(NOTION_MAIN_DIV)
        && !document.querySelector('#note_id')) {
        injectScript();
    }
    // Handling menu tab event
    if (document.querySelector(NOTION_MAIN_DIV)) {
        let focusElement = $('.hide-scrollbar .notion-updates-button-all-updates').parent().parent().find('div');
        let noteIdElement = document.querySelector('#note_id')
        let scrollElement = document.querySelector(NOTION_DIV_SCROLL);

        if (!noteIdElement || !scrollElement) {

            return false;
        }
    }

}).observe(body, config);

/**
 * Inject custom div before scrape data
 * 
 * @param {boolean} appendDiv if passed true then insert new div, otherwise not insert
 * 
 * @returns 
 */
async function injectScript(appendDiv = true) {
    try {
        // Check if element exists or not
        let elementExists = await checkNotionElementExistsOrNot();
        if (!elementExists) {

            return false;
        }

        // When custom div already exists then wait 300 milliseconds
        if (!appendDiv) {
            await waitFor(300);
        }

        // Create custom clone element.
        let targetElementMain = document.querySelector(NOTION_MAIN_DIV);
        let scrollElement = document.querySelector(NOTION_DIV_SCROLL);
        let clone = document.querySelector('#note_id');

        if (appendDiv && clone === null) {
            // Create a clone of element with id note_id.
            clone = scrollElement.cloneNode(true);
            // Change the id attribute of the newly created element.
            clone.setAttribute('id', 'note_id');
            clone.setAttribute('class', 'notion_extension');
            //clone.innerHTML = getNotionLoadingHTML();
            targetElementMain.insertBefore(clone, null);
            scrollElement.style.height = '0px';
            clone.style.removeProperty('height');
        }
        clone.innerHTML = getNotionLoadingHTML();

        // Get next number of page record
        for (var i = 0; i < INITIAL_PAGES_TO_LOAD; i++) {
            await waitFor(1000);
            $(scrollElement).scrollTop($(scrollElement)[0].scrollHeight);
        }

        // Waiting process for get data
        await waitFor(1000);

        // Get child node element
        let targetElement = document.querySelector(NOTION_DIV_SCROLL).childNodes[0].childNodes[0].childNodes[0];

        let notificationsTypes = await getNotionNotificationTypes();
        if (targetElement.length === 0 || (targetElement.childNodes.length == 1
            && targetElement.childNodes[0].tagName == 'svg'
        )) {
            clone.innerHTML = document.querySelector(NOTION_DIV_SCROLL).innerHTML;
            return false;
        }

        targetElement = document.querySelector(NOTION_DIV_SCROLL).querySelector('.notranslate').childNodes;
        if (targetElement.length && targetElement[0].childNodes[0].attributes.length === 0) {
            targetElement = targetElement[0].childNodes;
        }
        // Set notion notification HTML into new clone element.
        let notificationsHtml = '';
        notificationsTypes.map(function (item) {
            let elementInnerHtml = '';
            let notionEmoji = '';
            Array.from(targetElement).map(function (element, index) {
                // Check notification div
                if (element.querySelector(NOTION_NOTIFICATION_DIV)) {
                    let notificationType = element.querySelector(NOTION_NOTIFICATION_DIV).innerText.replace(/^\s+|\s+$/gm, '');
                    if (item == notificationType) {
                        elementInnerHtml += '<div class="notion-notifications-record" data-index="' + index + '">' + element.innerHTML + '</div>';
                        if (element.querySelector('.notion-record-icon img')) {
                            notionEmoji = element.querySelector('.notion-record-icon img').parentNode.innerHTML;
                        }
                    }
                }
            }).filter(function (item) { return item != undefined });

            let encodePageID = window.btoa(unescape(encodeURIComponent(item)));
            encodePageID = encodePageID.replace(new RegExp('=', 'g'), '');
            let addClass = $('body').hasClass('dark') ? 'dark-color' : '';
            let svgColor = $('body').hasClass('dark') ? 'rgba(255, 255, 255, 0.443)' : 'rgba(55, 53, 47, 0.45)';
            notificationsHtml += `<div class="custom-tag-added page_title ${addClass}"
                data-id="${encodePageID}">
                    <div class="collapse-arrow">
                        <div
                            class="notion-focusable custom-svg"
                            role="button"
                            style="user-select: none; transition: background 20ms ease-in 0s; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 3px;"
                        >
                            <svg
                                viewBox="0 0 100 100"
                                class="triangle"
                                style="width: 0.6875em; height: 0.6875em; display: block; fill: ${svgColor}; flex-shrink: 0; backface-visibility: hidden; transition: transform 200ms ease-out 0s; transform: rotateZ(90deg); opacity: 1;"
                            >
                                <polygon points="5.9,88.2 50,11.8 94.1,88.2 "></polygon>
                            </svg>
                        </div>
                    </div>
                    <div class="custom-notion-emoji">
                        ${notionEmoji}
                    </div>
                    ${item}
                </div>
                <div style="display:none;" 
                data-page-type = "${encodePageID}"
                class="custom-tag-added-${encodePageID}"> ${elementInnerHtml} </div>`;
        });
        clone.innerHTML = notificationsHtml;

        // Handle the notion scroll data event.
        $(clone).on('scroll', function () {
            consoleMe({ 'str': 'Call notion data scroll...!!' });
            let scrollElement = document.querySelector(NOTION_DIV_SCROLL);
            // Check the clone element height
            consoleMe({ 'str': 'Page was scroll..!!' });
            if ($(this).scrollTop() + $(this).innerHeight() + 2 >= $(this)[0].scrollHeight) {
                $(scrollElement).scrollTop($(scrollElement)[0].scrollHeight);
                // Get the next page data
                getNextPageData();
            }
        });
    } catch (error) {
        consoleMe({ 'error': error, 'str': 'Page Not found...!!' });
    }
}

/**
 * Check if {NOTION_MAIN_DIV, NOTION_DIV_SCROLL, NOTION_NOTIFICATION_DIV} element exists or not
 * 
 * @returns 
 */
function checkNotionElementExistsOrNot() {
    return new Promise(resolve => {
        try {
            let targetElementMain = document.querySelector(NOTION_MAIN_DIV);
            let scrollElement = document.querySelector(NOTION_DIV_SCROLL);
            if (scrollElement && targetElementMain) {

                resolve(true);
            };

            resolve(false);
        } catch (error) {

            consoleMe({ 'error': error, 'str': 'Page Not found...!!' });

            resolve(false);
        }
    });
}

/**
 * Get notion notification data, when user scroll to top to bottom
 */
async function getNextPageData() {
    // Waiting process for get data
    await waitFor(1000);

    if (!document.querySelector(NOTION_DIV_SCROLL)) {

        return false;
    }
    // Find notification element
    let targetElement = document.querySelector(NOTION_DIV_SCROLL).querySelector('.notranslate').childNodes;
    if (targetElement.length && targetElement[0].childNodes[0].attributes.length === 0) {
        targetElement = targetElement[0].childNodes;
    }
    // Set notion notification HTML into new clone element.
    let notificationsTypes = await getNotionNotificationTypes();
    notificationsTypes.map(function (item) {
        let encodePageID = window.btoa(unescape(encodeURIComponent(item)));
        encodePageID = encodePageID.replace(new RegExp('=', 'g'), '');
        let existElement = $('[data-id="' + encodePageID + '"]') ?? '';

        let notificationsHtml = '';
        let notionEmoji = '';

        Array.from(targetElement).map(function (element, index) {
            if (element.querySelector(NOTION_NOTIFICATION_DIV)) {
                let notificationsType = element.querySelector(NOTION_NOTIFICATION_DIV).innerText.replace(/^\s+|\s+$/gm, '');
                if (item == notificationsType) {
                    if ($('div[data-page-type="' + encodePageID + '"]').find('[data-index="' + index + '"]').length === 0) {
                        notificationsHtml += '<div class="notion-notifications-record" data-index="' + index + '">' + element.innerHTML + '</div>';
                    }
                    if (element.querySelector('.notion-record-icon img')) {
                        notionEmoji = element.querySelector('.notion-record-icon img').parentNode.innerHTML;
                    }
                }
            }
        }).filter(function (item) { return item != undefined });

        // Check if notification group element already exist or not.
        if (existElement.length > 0) {
            $('[data-page-type="' + encodePageID + '"]').append(notificationsHtml)
            $('[data-id="' + encodePageID + '"]').find('.custom-notion-emoji').html(notionEmoji)
        } else {
            let clone = $('#note_id');
            let addClass = $('body').hasClass('dark') ? 'dark-color' : '';
            let svgColor = $('body').hasClass('dark') ? 'rgba(255, 255, 255, 0.443)' : 'rgba(55, 53, 47, 0.45)';
            clone.append(`<div class="custom-tag-added page_title ${addClass}"
                                data-id="${encodePageID}">
                                <div class="collapse-arrow">
                                    <div
                                        class="notion-focusable custom-svg"
                                        role="button"
                                        style="user-select: none; transition: background 20ms ease-in 0s; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 3px;"
                                    >
                                        <svg
                                            viewBox="0 0 100 100"
                                            class="triangle"
                                            style="width: 0.6875em; height: 0.6875em; display: block; fill: ${svgColor}; flex-shrink: 0; backface-visibility: hidden; transition: transform 200ms ease-out 0s; transform: rotateZ(90deg); opacity: 1;"
                                        >
                                            <polygon points="5.9,88.2 50,11.8 94.1,88.2 "></polygon>
                                        </svg>
                                    </div>
                                </div>
                                <div class="custom-notion-emoji">
                                    ${notionEmoji}
                                </div>
                                ${item}
                        </div>
                        <div style="display:none;"  data-page-type = "${encodePageID}"
                            class="custom-tag-added-${encodePageID}"> 
                            ${notificationsHtml}
                        </div>`);
        }
    });
}

/**
 * Hold one second for get data process
 * 
 * @param {number} seconds for passed number
 * 
 * @returns {boolean} true
 */
function waitFor(seconds) {
    return new Promise(resolve => {
        setTimeout(function () {

            resolve(true);
        }, seconds);
    });
}

/**
 * Get Notion notification Types
 */
function getNotionNotificationTypes() {
    return new Promise(resolve => {
        let targetElement = document.querySelector(NOTION_DIV_SCROLL).querySelector('.notranslate').childNodes;
        let notificationsTypes = [];
        if (targetElement.length && targetElement[0].childNodes[0].attributes.length === 0) {
            targetElement = targetElement[0].childNodes;
        }
        // Get notification types
        Array.from(targetElement).map(function (element) {
            if (element.querySelector(NOTION_NOTIFICATION_DIV)) {
                let type = element.querySelector(NOTION_NOTIFICATION_DIV).innerText.replace(/^\s+|\s+$/gm, '');
                notificationsTypes.push(type)
            }
        });
        // get uniq notification types
        notificationsTypes = notificationsTypes.filter(function (value, index, self) {

            return self.indexOf(value) === index;
        });
        // return notification types list
        resolve(notificationsTypes);
    });
}