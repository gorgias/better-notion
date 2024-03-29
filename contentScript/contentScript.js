// Const define
const NOTION_DIV_SCROLL = ".notion-updates-menu .notion-scroller.vertical";
const NOTION_NOTIFICATION_DIV = "a .notranslate:not(.notion-record-icon)";
const NOTION_MAIN_DIV = ".notion-updates-menu";

const body = document.querySelector("body");
const config = {
  attributes: false,
  characterData: false,
  childList: true,
  subtree: true,
};
let IS_INBOX_TAB = 1;

let notionUser = [];
let spaceID = 0;
let spaceName = "";
let followNamesArray = [];
let followUp = [];

// Handle notification row click event
function showNotification(event) {
  const targetClass = event.target.classList ?? [];
  if (targetClass.contains("follow-btn") || targetClass.contains("archive")) {
    return;
  }

  let pageId = $(this).attr("data-id") ?? "";
  let svgColor = $("body").hasClass("dark")
    ? "rgba(255, 255, 255, 0.443)"
    : "rgba(55, 53, 47, 0.45)";
  if (pageId) {
    let pageDataDiv = $('[data-page-type="' + pageId + '"]');
    if (!pageDataDiv.is(":visible")) {
      pageDataDiv.css("display", "block");
      $(this).find(".custom-svg").html(`
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
      $(this).find(".custom-svg").html(`<svg
                  viewBox="0 0 100 100"
                  class="triangle"
                  style="width: 0.6875em; height: 0.6875em; display: block; fill: ${svgColor}; flex-shrink: 0; backface-visibility: hidden; transition: transform 200ms ease-out 0s; transform: rotateZ(90deg); opacity: 1;"
              >
                  <polygon points="5.9,88.2 50,11.8 94.1,88.2 "></polygon>
              </svg>
              `);
    }
  }
}

// Handle notion change tab event
function notionFocusable() {
  let appendDiv = false;
  if (
    document.querySelector(NOTION_MAIN_DIV) &&
    !document.querySelector("#note_id")
  ) {
    appendDiv = true;
  }
  injectScript(appendDiv);
}

// Handle notion notification div click event
function openLinkAndButtonTrigger(event) {
  event.preventDefault();
  var href = $(event.target).parents("a").attr("href");
  // console.log(href)
  if (href && event.ctrlKey) {
    window.open(href, "_blank");
    return
  }
  // Find trigger element click event
  $(NOTION_DIV_SCROLL)
    .find('a[href="' + href + '"] div[role="button"]')
    .not('.notion-notifications-record div[role="button"]')
    .click();

  return false;
}

// MouseEnter event
function notificationMouseEnter(event) {
  if (event.target.querySelector(".closeSmall")) {
    event.target.querySelector(".closeSmall").parentNode.style.opacity = 1;
  }
}

// Mouseleave event
function notificationMouseLeave(event) {
  if (event.target.querySelector(".closeSmall")) {
    event.target.querySelector(".closeSmall").parentNode.style.opacity = 0;
  }
}

// Archive event
function notificationArchive(event) {
  let indexId = $(event.target).parents("div[data-index]").attr("data-index");
  $(NOTION_DIV_SCROLL)
    .find('div[data-index="' + indexId + '"] .closeSmall')
    .parent()
    .click();
  let notificationId = $(event.target)
    .parents("div[data-index]")
    .parent()
    .attr("data-page-type");
  let notificationIdCount = parseInt(
    $('[data-id="' + notificationId + '"]')
      .find(".total-count")
      .text()
  );
  $('[data-id="' + notificationId + '"]')
    .find(".total-count")
    .text(notificationIdCount - 1);
  $('.notion-notifications-record[data-index="' + indexId + '"]').remove();
  if (notificationIdCount - 1 == 0) {
    $('[data-id="' + notificationId + '"]').remove();
  }
}

// Archive all notification event
function archiveAllNotification(event) {
  let indexId = $(event.target).parents("div[data-id]").attr("data-id");

  Array.from(
    document.querySelectorAll(
      'div[data-page-type="' +
        indexId +
        '"] .notion-notifications-record .closeSmall'
    )
  ).map(function (element) {
    element.dispatchEvent(new Event("click"));
  });

  return false;
}
// Notification follow and unFollow event
function notificationFollowUnFollow(event) {
  let element = $(this);
  let followUnFollowObject = JSON.parse(
    decodeURIComponent(escape(window.atob(element.attr("data-scam"))))
  );
  let idFollow = element.attr("data-follow");
  let spaceId = followUnFollowObject.space_id;
  let navigableBlockId = followUnFollowObject.navigable_block_id;
  let userId = followUnFollowObject.user_id;
  let recordId = followUnFollowObject.id;
  let following = idFollow == "true" ? false : true;

  var settings = {
    url: "https://www.notion.so/api/v3/saveTransactions",
    method: "POST",
    timeout: 0,
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "content-type": "application/json",
    },
    data: JSON.stringify({
      requestId: "000000-0000-000-000-00000",
      transactions: [
        {
          id: "000000-0000-000-000-00000",
          spaceId: spaceId,
          debug: {
            userAction: "UpdateSidebarFollowControl.setFollowing",
          },
          operations: [
            {
              pointer: {
                table: "follow",
                id: recordId,
                spaceId: spaceId,
              },
              path: [],
              command: "set",
              args: {
                id: recordId,
                user_id: userId,
                navigable_block_id: navigableBlockId,
                following: following,
                created_time: Date.now(),
                space_id: spaceId,
                version: 22,
              },
            },
          ],
        },
      ],
    }),
  };
  $.ajax(settings).done(function (response) {
    element.attr("data-follow", following);
    element.html(following ? "U" : "F");
  });
  return false;
}

/**
 * Handle MutationObserver
 */
new MutationObserver(function (mutations) {
  if (
    document.querySelector(NOTION_MAIN_DIV) &&
    !document.querySelector("#note_id")
  ) {
    injectScript();
  }
  // Handling menu tab event
  if (document.querySelector(NOTION_MAIN_DIV)) {
    IS_INBOX_TAB = $(".hide-scrollbar .notion-updates-button-mentions")
      .parent()
      .parent()
      .children().length;
    let noteIdElement = document.querySelector("#note_id");
    let scrollElement = document.querySelector(NOTION_DIV_SCROLL);

    if (!noteIdElement || !scrollElement) {
      return false;
    }
  }

  // Hide show notification addEventListener
  Array.from(document.querySelectorAll(".custom-tag-added")).map(function (
    element
  ) {
    element.addEventListener("click", showNotification);
  });

  // Hide show notification icon addEventListener
  Array.from(
    document.querySelectorAll(".hide-scrollbar .notion-focusable")
  ).map(function (element) {
    element.addEventListener("click", notionFocusable);
  });

  // Notification content click addEventListener
  Array.from(
    document.querySelectorAll('.notion-notifications-record div[role="button"]')
  ).map(function (element) {
    element.addEventListener("click", openLinkAndButtonTrigger);
  });

  // Notification close click addEventListener
  Array.from(document.querySelectorAll(".closeSmall")).map(function (element) {
    element.addEventListener("click", notificationArchive);
  });

  // Notification archive click addEventListener
  Array.from(
    document.querySelectorAll(".archive-all-notification .archive")
  ).map(function (element) {
    element.addEventListener("click", archiveAllNotification);
  });

  // Notification follow & unFollow click addEventListener
  Array.from(document.querySelectorAll(".follow-btn")).map(function (element) {
    element.addEventListener("click", notificationFollowUnFollow);
  });

  // Notification hide show close icon addEventListener
  Array.from(document.querySelectorAll(".notion-notifications-record")).map(
    function (element) {
      element.addEventListener("mouseenter", notificationMouseEnter);
      element.addEventListener("mouseleave", notificationMouseLeave);
    }
  );
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

    followUp = [];
    followNamesArray = [];
    // Create custom clone element.
    let targetElementMain = document.querySelector(NOTION_MAIN_DIV);
    let scrollElement = document.querySelector(NOTION_DIV_SCROLL);
    let clone = document.querySelector("#note_id");

    if (appendDiv && clone === null) {
      // Create a clone of element with id note_id.
      clone = scrollElement.cloneNode(true);
      // Change the id attribute of the newly created element.
      clone.setAttribute("id", "note_id");
      clone.setAttribute("class", "notion_extension");
      //clone.innerHTML = getNotionLoadingHTML();
      targetElementMain.insertBefore(clone, null);
      scrollElement.style.height = "0px";
      clone.style.removeProperty("height");
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
    let targetElement =
      document.querySelector(NOTION_DIV_SCROLL).childNodes[0].childNodes[0]
        .childNodes[0];
    let notificationsTypes = await getNotionNotificationTypes();
    if (
      targetElement.length === 0 ||
      (targetElement.childNodes.length == 1 &&
        targetElement.childNodes[0].tagName == "svg")
    ) {
      clone.innerHTML = document.querySelector(NOTION_DIV_SCROLL).innerHTML;
      return false;
    }

    targetElement = document
      .querySelector(NOTION_DIV_SCROLL)
      .querySelector(".notranslate").childNodes;
    if (
      targetElement.length &&
      targetElement[0].childNodes[0].attributes.length === 0
    ) {
      targetElement = targetElement[0].childNodes;
    }
    // Set notion notification HTML into new clone element.
    let notificationsHtml = "";
    notificationsTypes.map(function (item) {
      let elementInnerHtml = "";
      let notionEmoji = "";
      Array.from(targetElement)
        .map(function (element, index) {
          // Check notification div
          if (element.querySelector(NOTION_NOTIFICATION_DIV)) {
            let notificationType = element
              .querySelector(NOTION_NOTIFICATION_DIV)
              .innerText.replace(/^\s+|\s+$/gm, "");
            if (item == notificationType) {
              // Set index
              if (element.querySelector(".closeSmall")) {
                element.setAttribute("data-index", index);
              }
              elementInnerHtml +=
                '<div class="notion-notifications-record" data-index="' +
                index +
                '">' +
                element.innerHTML +
                "</div>";
              if (element.querySelector(".notion-record-icon img")) {
                notionEmoji = element.querySelector(".notion-record-icon img")
                  .parentNode.innerHTML;
              }
              if (
                element.querySelector('.notion-record-icon span[role="image"]')
              ) {
                notionEmoji = element.querySelector(
                  '.notion-record-icon span[role="image"]'
                ).innerText;
              }
            }
          }
        })
        .filter(function (item) {
          return item != undefined;
        });

      let encodePageID = window.btoa(unescape(encodeURIComponent(item)));
      encodePageID = encodePageID.replace(new RegExp("=", "g"), "");

      let followBtnHtml = getFollowPageDetails(item);

      let addClass = $("body").hasClass("dark") ? "dark-color" : "";
      let svgColor = $("body").hasClass("dark")
        ? "rgba(255, 255, 255, 0.443)"
        : "rgba(55, 53, 47, 0.45)";
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
                    <span class="text-title">${item}</span>
                    ${
                      IS_INBOX_TAB > 1
                        ? `<div class="archive-all-notification"> ${archiveSvg(
                            svgColor
                          )} </div>`
                        : ""
                    }
                    <div class="total-count"> 0 </div>
                    ${followBtnHtml}
                </div>
                <div style="display:none;" 
                data-page-type = "${encodePageID}"
                class="custom-tag-added-${encodePageID}"> ${elementInnerHtml} </div>`;
    });
    clone.innerHTML = notificationsHtml;

    // Handle the notion scroll data event.
    $(clone).scroll(function () {
      let scrollElement = document.querySelector(NOTION_DIV_SCROLL);
      // Check the clone element height
      consoleMe({ str: "Call notion data scroll...!!" });
      if (
        $(this).scrollTop() + $(this).innerHeight() + 2 >=
        $(this)[0].scrollHeight
      ) {
        $(scrollElement).scrollTop($(scrollElement)[0].scrollHeight);
        // Get the next page data
        getNextPageData();
      }
    });
    // Update record count()
    recordCount();
  } catch (error) {
    consoleMe({ error: error, str: "Page Not found...!!" });
  }
}

/**
 * Check if {NOTION_MAIN_DIV, NOTION_DIV_SCROLL, NOTION_NOTIFICATION_DIV} element exists or not
 *
 * @returns
 */
function checkNotionElementExistsOrNot() {
  return new Promise((resolve) => {
    try {
      let targetElementMain = document.querySelector(NOTION_MAIN_DIV);
      let scrollElement = document.querySelector(NOTION_DIV_SCROLL);
      if (scrollElement && targetElementMain) {
        resolve(true);
      }

      resolve(false);
    } catch (error) {
      consoleMe({ error: error, str: "Page Not found...!!" });

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
  let targetElement = document
    .querySelector(NOTION_DIV_SCROLL)
    .querySelector(".notranslate").childNodes;
  if (
    targetElement.length &&
    targetElement[0].childNodes[0].attributes.length === 0
  ) {
    targetElement = targetElement[0].childNodes;
  }
  // Set notion notification HTML into new clone element.
  let notificationsTypes = await getNotionNotificationTypes();
  notificationsTypes.map(function (item) {
    let encodePageID = window.btoa(unescape(encodeURIComponent(item)));
    encodePageID = encodePageID.replace(new RegExp("=", "g"), "");
    let existElement = $('[data-id="' + encodePageID + '"]') ?? "";

    let notificationsHtml = "";
    let notionEmoji = "";

    Array.from(targetElement)
      .map(function (element, index) {
        if (element.querySelector(NOTION_NOTIFICATION_DIV)) {
          let notificationsType = element
            .querySelector(NOTION_NOTIFICATION_DIV)
            .innerText.replace(/^\s+|\s+$/gm, "");
          if (item == notificationsType) {
            // Set index
            if (element.querySelector(".closeSmall")) {
              element.setAttribute("data-index", index);
            }
            if (
              $('div[data-page-type="' + encodePageID + '"]').find(
                '[data-index="' + index + '"]'
              ).length === 0
            ) {
              notificationsHtml +=
                '<div class="notion-notifications-record" data-index="' +
                index +
                '">' +
                element.innerHTML +
                "</div>";
            }
            if (element.querySelector(".notion-record-icon img")) {
              notionEmoji = element.querySelector(".notion-record-icon img")
                .parentNode.innerHTML;
            }
            if (
              element.querySelector('.notion-record-icon span[role="image"]')
            ) {
              notionEmoji = element.querySelector(
                '.notion-record-icon span[role="image"]'
              ).innerText;
            }
          }
        }
      })
      .filter(function (item) {
        return item != undefined;
      });

    // Check if notification group element already exist or not.
    if (existElement.length > 0) {
      $('[data-page-type="' + encodePageID + '"]').append(notificationsHtml);
      $('[data-id="' + encodePageID + '"]')
        .find(".custom-notion-emoji")
        .html(notionEmoji);
    } else {
      let followBtnHtml = getFollowPageDetails(item);

      let clone = $("#note_id");
      let addClass = $("body").hasClass("dark") ? "dark-color" : "";
      let svgColor = $("body").hasClass("dark")
        ? "rgba(255, 255, 255, 0.443)"
        : "rgba(55, 53, 47, 0.45)";
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
                                <span class="text-title">${item}</span>
                                ${
                                  IS_INBOX_TAB > 1
                                    ? `<div class="archive-all-notification"> ${archiveSvg(
                                        svgColor
                                      )} </div>`
                                    : ""
                                }
                                <div class="total-count"> 0 </div>
                                ${followBtnHtml} 
                        </div>
                        <div style="display:none;"  data-page-type = "${encodePageID}"
                            class="custom-tag-added-${encodePageID}"> 
                            ${notificationsHtml}
                        </div>`);
    }
  });
  recordCount();
}

/**
 * Hold one second for get data process
 *
 * @param {number} seconds for passed number
 *
 * @returns {boolean} true
 */
function waitFor(seconds) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve(true);
    }, seconds);
  });
}

/**
 * Get Notion notification Types
 */
function getNotionNotificationTypes() {
  return new Promise((resolve) => {
    let targetElement = document
      .querySelector(NOTION_DIV_SCROLL)
      .querySelector(".notranslate").childNodes;
    let notificationsTypes = [];
    if (
      targetElement.length &&
      targetElement[0].childNodes[0].attributes.length === 0
    ) {
      targetElement = targetElement[0].childNodes;
    }
    // Get notification types
    Array.from(targetElement).map(function (element) {
      if (element.querySelector(NOTION_NOTIFICATION_DIV)) {
        let type = element
          .querySelector(NOTION_NOTIFICATION_DIV)
          .innerText.replace(/^\s+|\s+$/gm, "");
        notificationsTypes.push(type);
      }
    });
    // get uniq notification types
    notificationsTypes = notificationsTypes.filter(function (
      value,
      index,
      self
    ) {
      return self.indexOf(value) === index;
    });
    // return notification types list
    resolve(notificationsTypes);
  });
}
/**
 * Set number of count record
 */
function recordCount() {
  $("div[data-page-type]").each(function () {
    let pageId = $(this).attr("data-page-type");
    let length = $(this).find(".notion-notifications-record").length;
    $('.custom-tag-added[data-id="' + pageId + '"] .total-count').html(length);
  });
  // Hide Unarchive div
  $(".notion-notifications-record div:contains('Unarchive')")
    .filter(function () {
      return $(this).children().length === 0;
    })
    .parent()
    .hide();
  setFollowAndUnFollowBtn();
}
/**
 * Get Archive SVG icon
 *
 * @returns {String} for svg icon string
 */
function archiveSvg(svgColor) {
  return `<svg viewBox="0 0 16 16" class="archive" style="width: 15px; height: 15px; display: block; fill: ${svgColor}; flex-shrink: 0; backface-visibility: hidden; margin-left: 0px; margin-right: 6px;">
    <path d="M4.083 14.585h7.499c1.347 0 2.064-.697 2.064-2.037V5.739c.664-.11 1.019-.608 1.019-1.34V3.36c0-.834-.458-1.36-1.299-1.36H2.3C1.499 2 1 2.526 1 3.36V4.4c0 .73.355 1.23 1.019 1.34v6.808c0 1.347.717 2.037 2.064 2.037zM2.579 4.728c-.342 0-.478-.144-.478-.486v-.724c0-.342.136-.486.478-.486h10.514c.342 0 .472.144.472.486v.724c0 .342-.13.486-.472.486H2.579zm1.49 8.825c-.615 0-.95-.335-.95-.95V5.76h9.427v6.842c0 .616-.342.95-.95.95H4.069zM5.58 8.515h4.512c.287 0 .492-.199.492-.5v-.218c0-.3-.205-.492-.492-.492H5.58c-.287 0-.485.191-.485.492v.219c0 .3.198.499.485.499z"></path></svg>`;
}

/**
 * Return follow and unFollow html
 *
 * @param {String} title for notion record page title
 *
 * @returns {String} return HTML for follow and unFollow
 */
function getFollowPageDetails(title) {
  let pageDetails =
    followUp
      .map(function (item) {
        if (formateString(item.name) == formateString(title)) {
          return item;
        }
      })
      .filter(function (item) {
        return item != undefined;
      })[0] ?? [];
  let pageId = formateString(title);
  pageId = window.btoa(unescape(encodeURIComponent(pageId)));
  pageId = pageId.replace(new RegExp("=", "g"), "");
  let followBtnHtml = `<div class="follow-btn" data-follow-page-id="${pageId}" data-follow='' data-scam=""></div>`;
  if (pageDetails.following != undefined) {
    let encodePageDetail = window.btoa(
      unescape(encodeURIComponent(JSON.stringify(pageDetails)))
    );
    let isFollow = pageDetails.following;
    let followBtn = isFollow ? "U" : "F";
    followBtnHtml = `<div class="follow-btn" data-follow-page-id="${pageId}" data-follow='${isFollow}' data-scam="${encodePageDetail}" > ${followBtn} </div>`;
  }

  return followBtnHtml;
}
/**
 * Return Formatting string
 *
 * @param {String} pageTitleName
 *
 * @returns {String} formate string
 */
function formateString(pageTitleName) {
  let pageTitle = pageTitleName.toLowerCase();
  pageTitle = pageTitle.replaceAll(/\n/g, "");
  pageTitle = pageTitle.replaceAll(/\s/g, "");

  return pageTitle;
}
/**
 * Return following record
 *
 * @param {String} spaceID for notion space id
 *
 * @returns {Object} return record object
 */
function getPageActivity(spaceID, navigableBlockId, collectionId) {
  return new Promise((resolve) => {
    var settings = {
      url: "https://www.notion.so/api/v3/getActivityLog",
      method: "POST",
      timeout: 0,
      headers: {
        accept: "*/*",
        "content-type": "application/json",
      },
      data: JSON.stringify({
        spaceId: spaceID,
        navigableBlock: {
          id: navigableBlockId,
        },
        limit: 20,
        activityTypes: [],
      }),
    };

    $.ajax(settings).done(function (response) {
      resolve(response);
    });
  });
}
/**
 * Monkey pach event listier
 */
let channel = new BroadcastChannel("notion-monkey-channel");
channel.addEventListener("message", (event) => {
  if (
    event.data != undefined &&
    event.data.type == "getPublicPageData" &&
    event.data.type != undefined
  ) {
    if (
      event.data.response != undefined &&
      Object.keys(event.data.response).length
    ) {
      followNamesArray = [];
      followUp = [];
      spaceID = event.data.response.spaceId;
      spaceName = event.data.response.spaceName;
    }
  }
  if (
    event.data != undefined &&
    event.data.type == "getUserAnalyticsSettings" &&
    event.data.type != undefined
  ) {
    if (
      event.data.response != undefined &&
      Object.keys(event.data.response).length
    ) {
      notionUser = event.data.response;
    }
  }
  if (
    event.data != undefined &&
    event.data.type == "getActivityLog" &&
    event.data.type != undefined
  ) {
    if (
      event.data.response != undefined &&
      Object.keys(event.data.response).length
    ) {
      loadActivityPages(event);
    }
  }
  if (
    event.data != undefined &&
    event.data.type == "getNotificationLog" &&
    event.data.type != undefined
  ) {
    if (
      event.data.response != undefined &&
      Object.keys(event.data.response).length
    ) {
      loadActivityPages(event);
    }
  }
});

/**
 * Set Follow and unFollow button
 *
 * @param {Object} event request event
 */
async function loadActivityPages(event) {
  let notionNotification = event.data.response.recordMap;
  let activities = notionNotification.activity ?? [];
  let allBlock = notionNotification.block ?? [];
  let spaces = notionNotification.space ?? [];
  let collection = notionNotification.collection ?? [];
  let spacesPages = Object.values(spaces).length
    ? Object.values(spaces)[0].value.value
    : [];
  let firstPageId =
    spacesPages.pages != undefined && spacesPages.pages.length
      ? spacesPages.pages[0]
      : "";
  // Get Collection Details
  for (var i = 0; i < Object.values(collection).length; i++) {
    var item = Object.values(collection)[i].value ?? [];
    if (item.value === undefined) {
      continue;
    }
    if (item.value.name === undefined) {
      continue;
    }
    if (item.value.parent_table === "block") {
      var followName = item.value.name ?? [];
      followName = followName.join("");
      if (followNamesArray.indexOf(followName) > 0) {
        continue;
      }
      followNamesArray.push(followName);
      let notification = await getPageActivity(
        spaceID,
        item.value.parent_id,
        []
      );
      let followRecordDetails = notification.recordMap.follow ?? [];
      let followRecord = Object.values(followRecordDetails)[0].value ?? [];
      if (!Object.values(followRecord).length) {
        followRecord = {
          following: false,
          id: Object.keys(followRecordDetails)[0] ?? "",
          navigable_block_id: item.value.parent_id,
          space_id: spaceID,
          user_id: notionUser.user_id,
          version: 1,
          name: followName,
        };
      }
      followRecord.name = followName;
      followUp.push(followRecord);
    }
  }
  // Get activities details
  for (var i = 0; i < Object.values(activities).length; i++) {
    var item = Object.values(activities)[i].value ?? [];

    if (item.value === undefined) {
      continue;
    }
    if (item.value.parent_table === undefined) {
      continue;
    }
    var followName = "";
    // Get Block page details
    if (item.value.parent_table === "block") {
      let blockId = item.value.parent_id;
      let block = allBlock[blockId].value ?? [];
      if (block.value.properties === undefined) {
        continue;
      }
      var followName = block.value.properties.title ?? [];
      let followRecordName = followName
        .map(function (name) {
          return name[0] ?? null;
        })
        .filter(function (name) {
          return name != undefined;
        });
      followName = followRecordName.join("");
      if (followNamesArray.indexOf(followName) > 0) {
        continue;
      }
      followNamesArray.push(followName);

      let notification = await getPageActivity(spaceID, block.value.id, []);
      let followRecordDetails = notification.recordMap.follow ?? [];
      let followRecord = Object.values(followRecordDetails)[0].value ?? [];
      if (!Object.values(followRecord).length) {
        followRecord = {
          following: false,
          id: Object.keys(followRecordDetails)[0] ?? "",
          navigable_block_id: block.value.id,
          space_id: spaceID,
          user_id: notionUser.user_id,
          version: 1,
          name: followName,
        };
      }
      followRecord.name = followName;
      followUp.push(followRecord);
      // First Page notes
      // Space Follow and unFollow record
      if (firstPageId && block.value.id == firstPageId) {
        let spaceFollowRecord = {
          following: followRecord.following ?? true,
          id: followRecord.id ?? "",
          navigable_block_id: followRecord.navigable_block_id,
          space_id: spaceID,
          user_id: notionUser.user_id,
          version: 1,
          name: spaceName,
        };
        followUp.push(spaceFollowRecord);
      }
    }
    // Get Space
    if (item.value.parent_table === "space") {
      let blockId = item.value.parent_id;
      let block = spaces[blockId].value ?? [];
      followName = block.value.name ?? "";
    }
  }
  // set follow and unFollow button
  setFollowAndUnFollowBtn();
}
/**
 * Set Follow and unFollow text in page
 */
function setFollowAndUnFollowBtn() {
  for (var i = 0; i < followUp.length; i++) {
    var followRecord = followUp[i] ?? [];
    // set follow and unFollow text
    let encodePageID = window.btoa(
      unescape(encodeURIComponent(formateString(followRecord.name)))
    );
    encodePageID = encodePageID.replace(new RegExp("=", "g"), "");
    let encodePageDetail = window.btoa(
      unescape(encodeURIComponent(JSON.stringify(followRecord)))
    );
    let isFollow = followRecord.following;
    let followBtn = isFollow ? "U" : "F";
    if (!$('[data-follow-page-id="' + encodePageID + '"]').html()) {
      $('[data-follow-page-id="' + encodePageID + '"]').attr(
        "data-follow",
        isFollow
      );
      $('[data-follow-page-id="' + encodePageID + '"]').attr(
        "data-scam",
        encodePageDetail
      );
      $('[data-follow-page-id="' + encodePageID + '"]').html(followBtn);
    }
  }
}
