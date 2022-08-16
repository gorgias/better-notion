"use strict";

var extensionId = JSON.stringify(chrome.runtime.id);
console.log("chrome.runtime.id", chrome.runtime.id);

var divExtensionId = document.createElement("div");
divExtensionId.setAttribute("id", "notion_chromeruntimeid");
divExtensionId.setAttribute("data-id", chrome.runtime.id);
(document.head || document.documentElement).appendChild(divExtensionId);
window.notion_chromeruntimeid = chrome.runtime.id;

var s = document.createElement("script");
console.log("DBUG - injecting notion_chromeruntimeid");
s.type = "module";
s.src = chrome.runtime.getURL("contentScript/contentScriptStart.js");
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
