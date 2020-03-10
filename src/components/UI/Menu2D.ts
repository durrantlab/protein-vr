import * as OpenPopup from "./OpenPopup/OpenPopup";
import * as Menu3D from "./Menu3D/Menu3D";

// After the 3D menu has been created, also make a 2D menu system.

let funcs = {};

/**
 * Opens the 2D menu.
 * @returns void
 */
export function open(): void {
    OpenPopup.openModal({
        title: "Menu",
        content: `<div class="accrd" id="accordion-menu2d"></div>`,
        isUrl: false,
        hasCloseBtn: true,
        isUnClosable: false,
        showBackdrop: false,
        isSkinny: true
    }).then(() => {
        populate2DSubMenu("#accordion-menu2d", Menu3D.menuInf, [], 0);
    });
}

/**
 * Populate a submenu with its various opens/items.
 * @param  {string}   parentSelectr  The DOM selector of the parent menu.
 * @param  {*}        subMenu        The data itself describing the submenu.
 * @param  {string[]} breadcrumbs    A list of the keys to get to this point
 *                                   in the menu.
 * @param  {number=0} depth          The depth of this submenu.
 */
function populate2DSubMenu(parentSelectr: string, subMenu: any, breadcrumbs: string[], depth: number = 0) {
    let parentDOM = jQuery(parentSelectr);
    let html = "";
    let accordionId = breadcrumbs.map(s => slugify(s)).join("-");
    html += `<div class="accrd" id="accordion-${accordionId}">`;

    const keys = Object.keys(subMenu);
    const keysLen = keys.length;
    for (let i = 0; i < keysLen; i++) {
        const title = keys[i];

        // Certain titles are prohibited in 2D menu.
        if (["Close Menu ×", "Back ⇦", "Last", "Exit VR ×"].indexOf(title) !== -1) {
            continue;
        }

        const subMenuItems = subMenu[title];
        let id = accordionId + (accordionId === "" ? "" : "-") + slugify(title);
        let btnId = "btn-" + id;
        let collapseId = "collapse-" + id;
        let fontsize = 150 - depth * 10;
        // let bgColor = `background-color: rgb(${color}, ${color}, ${color});`;
        // let fgColor = `color: rgb(${255 - color}, ${255 - color}, ${255 - color});`;
        let bgColor = `background-color: ${getPastel(depth)};`
        let newBreadCrumbs = breadcrumbs.concat([title]);
        html += `
            <div class="card">
                <div id="${btnId}"
                  class="btn btn-sm menu2d-btn"
                  data-toggle="collapse"
                  data-target="#${collapseId}"
                  aria-expanded="false"
                  aria-controls="${collapseId}"
                  style="font-size:${fontsize}%; ${bgColor};"
                  data-clickpath='${JSON.stringify(newBreadCrumbs)}'
                  data-depth='${depth + 1}'
                  title="${title}">
                    ${title}
                </div>`;
        switch (typeof subMenuItems) {
            case "object":
                // If you're here, subMenuItems contains actual submenu
                // items. It should be it's own accordion.
                html += `
                    <div id="${collapseId}" class="collapse" aria-labelledby="${id}" data-parent="#accordion-${accordionId}">
                        <div class="card-body pad10" style="${bgColor}">
                        </div> <!-- card body -->
                    </div>`; // card collapse
                break;
            default:
                // If you get here, subMenuItems is a function that should be
                // run on click.
                funcs[btnId] = subMenuItems;
                break;
        }
        html += `</div>`; // card
    }
    html += `</div>`; // accordion

    parentDOM.html(html);

    parentDOM.find(".menu2d-btn").click(function (e) {
        let This = jQuery(this);
        let id = This.attr("id");

        if (funcs[id] !== undefined) {
            if (funcs[id] !== undefined) {
                funcs[id]();

                // Check if it's a remove selection button. If so, the
                // selection has been removed, so hide the button.
                if (id.indexOf("-RemoveExisting-") !== -1) {
                    This.hide();
                }
            } else {
                console.warn("Function not defined: " + id);
            }
        } else {
            let path: string[] = This.data("clickpath");  // JSON
            let slugPath = path.map(s => slugify(s));
            let depth = This.data("depth");
            let curSubMenu = Menu3D.menuInf;
            for (let i = 0; i < path.length; i++) {
                curSubMenu = curSubMenu[path[i]];
            }

            let collapseID = "#collapse-" + slugPath.join("-");
            populate2DSubMenu(collapseID + " .card-body", curSubMenu, path, depth);

            // Also go and highlght the parent menus.
            jQuery(".inpath").removeClass("inpath");

            let len = slugPath.length;
            for (let i = 0; i < len; i++) {
                let id = "btn-" + slugPath.slice(0, slugPath.length - i).join("-");
                jQuery("#" + id).addClass("inpath");
            }
        }
    });
}

/**
 * Slugify a string.
 * @param  {string} txt  The string to slugify.
 * @returns string  The slugified string.
 */
function slugify(txt: string): string {
    txt = txt.replace(/'/g, "PRIME").replace(/\//g, "");
    let charsOk = [
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n",
        "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
    ];

    charsOk = charsOk.concat(charsOk.map(l => l.toUpperCase())).concat([
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    ]);

    let newTxt = "";
    for (let i = 0; i < txt.length; i++) {
        let c = txt.substring(i, i+1);
        if (charsOk.indexOf(c) !== -1) {
            newTxt += c;
        }
    }

    return newTxt;
}

/**
 * Get a color from the color wheel.
 * @param  {number} idx  The color index.
 * @returns string  A string describing the color.
 */
function getPastel(idx: number): string {
    // Inspired by https://krazydad.com/tutorials/makecolors.php
    var r = Math.sin(idx) * 10 + 245;
    var g = Math.sin(idx + 2) * 10 + 245;
    var b = Math.sin(idx + 4) * 10 + 245;
    return `rgb(${r}, ${g}, ${b})`;
}
