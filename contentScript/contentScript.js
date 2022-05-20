$(document).ready(function () {
    // Handle page click event 
    $('body').on('click', '.custom-tag-added', function (event) {
        let pageId = $(this).attr('data-id') ?? '';
        if (pageId) {
            let pageDataDiv = $('.custom-tag-added-' + pageId);
            if (!pageDataDiv.is(':visible')) {
                pageDataDiv.css("display", "block");
            } else {
                pageDataDiv.css("display", "none");
            }
        }
    });
})
/**
 * Handle MutationObserver 
 */
const body = document.querySelector("body");
const config = {
    attributes: false,
    characterData: false,
    childList: true,
    subtree: true,
};
let callOneTime = true;
new MutationObserver(function (mutations) {
    if (document.querySelector('.notion-updates-menu')) {
        setTimeout(function () {
            injectScript();
        }, 5000);
    }

}).observe(body, config);
/**
 * Inject custom div before scrape data
 */
function injectScript() {

    var targetElementMain = document.querySelector('.notion-updates-menu')
    var scrollElement = document.querySelector('.notion-updates-menu .notion-scroller.vertical');

    // Create a clone of element with id ddl_1:
    let clone = scrollElement.cloneNode(true);

    // Change the id attribute of the newly created element:
    clone.setAttribute('id', 'note_id');
    clone.innerHTML = '<div>Call New IDS</div>';

    // Append the newly created element on element p 
    targetElementMain.insertBefore(clone, null);
    scrollElement.style.height = '0px';
    var targetElement = document.querySelector('.notion-updates-menu .notion-scroller.vertical').childNodes[0].childNodes[0].childNodes[0];
    var text = [];
    Array.from(targetElement.childNodes).map(function (element) {
        var type = element.querySelector('a .notranslate:not(.notion-record-icon)').innerText.replace(/^\s+|\s+$/gm, '');
        text.push(type)
    });

    text = text.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    let array = '';

    text.map(function (val) {

        var arrayElement = '';
        Array.from(targetElement.childNodes).map(function (element) {
            var type = element.querySelector('a .notranslate:not(.notion-record-icon)').innerText.replace(/^\s+|\s+$/gm, '');
            if (val == type) {
                arrayElement += element.innerHTML;
            }
        }).filter(function (item) { return item != undefined });
        let encodePageID = btoa(val);
        encodePageID = encodePageID.replace(new RegExp('=', 'g'), '');

        array += `<div class="custom-tag-added page_title"
            data-id="${encodePageID}">${val}</div>
            <div style="display:none;" class="custom-tag-added-${encodePageID}"> ${arrayElement} </div>`;
    });
    clone.innerHTML = array

    $(clone).on('scroll', function () {
        console.log('call...Scroll')
        var scrollElement = document.querySelector('.notion-updates-menu .notion-scroller.vertical');

        if ($(this).scrollTop() + $(this).innerHeight() + 2 >= $(this)[0].scrollHeight) {
            $(scrollElement).scrollTop($(scrollElement)[0].scrollHeight);

            setTimeout(function () {
                getScrollData();
            }, 5000);
        }
    });
}
/**
 * Get Pages data when user scroll to all record
 */
function getScrollData() {
    // Create a clone of element with id ddl_1:
    var targetElement = document.querySelector('.notion-updates-menu .notion-scroller.vertical').childNodes[0].childNodes[0].childNodes[0];
    var text = [];
    Array.from(targetElement.childNodes).map(function (element) {
        var type = element.querySelector('a .notranslate:not(.notion-record-icon)').innerText.replace(/^\s+|\s+$/gm, '');
        text.push(type)
    });

    text = text.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });

    text.map(function (val) {

        var arrayElement = '';
        Array.from(targetElement.childNodes).map(function (element) {
            var type = element.querySelector('a .notranslate:not(.notion-record-icon)').innerText.replace(/^\s+|\s+$/gm, '');
            if (val == type) {
                arrayElement += element.innerHTML;
            }
        }).filter(function (item) { return item != undefined });
        let encodePageID = btoa(val);
        encodePageID = encodePageID.replace(new RegExp('=', 'g'), '');
        let existElement = $('[data-id="' + encodePageID + '"]') ?? '';

        if (existElement.length > 0) {
            $('custom-tag-added-' + encodePageID).append(arrayElement)
        } else {
            let clone = $('#note_id');
            clone.append(`<div class="custom-tag-added page_title"
            data-id="${encodePageID}">${val}</div>
            <div style="display:none;" class="custom-tag-added-${encodePageID}"> ${arrayElement} </div>`);
        }
    });
}