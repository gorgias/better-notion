// Number of Pages to load notification from initially 
const INITIAL_PAGES_TO_LOAD = 2;

/**
 * logging data in console
 * 
 * @param {Object} request 
 */
function consoleMe(request) {
    if (conf.is_log_enabled);
    console.log(request);
}
/**
 * Get loading icon html
 * 
 * @returns {string} for html
 */
function getNotionLoadingHTML() {
    return `<div>
                <div style="display: flex; width: 100%; margin: 20px; flex-direction: row;">
                    <div class="notion-sidebar-loading-skeleton-shimmer" style="display: flex; width: 28px; height: 28px; margin-right: 8px; background-color: rgba(55, 53, 47, 0.06); border-radius: 20px;"></div>
                    <div style="width: 80%;">
                        <div class="notion-sidebar-loading-skeleton-shimmer" style="width: 80%; height: 8px; border-radius: 3px; margin: 0px 10px 10px; background-color: rgba(55, 53, 47, 0.06);"></div>
                        <div class="notion-sidebar-loading-skeleton-shimmer" style="width: 50%; height: 8px; border-radius: 3px; margin: 10px; background-color: rgba(55, 53, 47, 0.06);"></div>
                        <div class="notion-sidebar-loading-skeleton-shimmer" style="width: 60%; height: 8px; border-radius: 3px; margin: 10px; background-color: rgba(55, 53, 47, 0.06);"></div>
                        <div class="notion-sidebar-loading-skeleton-shimmer" style="width: 50%; height: 8px; border-radius: 3px; margin: 10px; background-color: rgba(55, 53, 47, 0.06);"></div>
                    </div>
                </div>
                <div style="display: flex; width: 100%; margin: 20px; flex-direction: row;">
                    <div class="notion-sidebar-loading-skeleton-shimmer" style="display: flex; width: 28px; height: 28px; margin-right: 8px; background-color: rgba(55, 53, 47, 0.06); border-radius: 20px;"></div>
                    <div style="width: 80%;">
                        <div class="notion-sidebar-loading-skeleton-shimmer" style="width: 80%; height: 8px; border-radius: 3px; margin: 0px 10px 10px; background-color: rgba(55, 53, 47, 0.06);"></div>
                        <div class="notion-sidebar-loading-skeleton-shimmer" style="width: 50%; height: 8px; border-radius: 3px; margin: 10px; background-color: rgba(55, 53, 47, 0.06);"></div>
                        <div class="notion-sidebar-loading-skeleton-shimmer" style="width: 60%; height: 8px; border-radius: 3px; margin: 10px; background-color: rgba(55, 53, 47, 0.06);"></div>
                        <div class="notion-sidebar-loading-skeleton-shimmer" style="width: 50%; height: 8px; border-radius: 3px; margin: 10px; background-color: rgba(55, 53, 47, 0.06);"></div>
                    </div>
                </div>
            </div>`;
}