// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import {VueComponentParent} from "../../Vue/Components/VueComponentParent";
import * as Menu3D from "../Menu3D/Menu3D";
import {store} from "../../../Vars/VueX/VueXStore";
import * as UrlVars from "../../../Vars/UrlVars";
declare var Vue;

// @ts-ignore
import {templateHtml} from "./Menu2DDisplayComponent.template.htm.ts";

let oldMenuItem = {}  // So you can monitor changes. Should not be reactive.

export class Menu2DDisplayComponent extends VueComponentParent {
    public tag = "menu-2d-display";
    public methods = {
        /**
         * Get a color from the color wheel.
         * @param  {number} idx  The color index.
         * @returns string  A string describing the color.
         */
        getPastel(idx: number): string {
            // Inspired by https://krazydad.com/tutorials/makecolors.php
            var r = Math.sin(idx) * 10 + 245;
            var g = Math.sin(idx + 2) * 10 + 245;
            var b = Math.sin(idx + 4) * 10 + 245;
            return `rgb(${r}, ${g}, ${b})`;
        },

        /**
         * Slugify a string.
         * @param  {string} txt  The string to slugify.
         * @returns string  The slugified string.
         */
        slugify(txt: string): string {
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
        },

        /**
         * Gets the ID of the component.
         * @param  {string} [titleTxt=""]  The title of this part.
         * @returns string  The id.
         */
        "id"(titleTxt: string = ""): string {
            return this["accordionId"] + (
                    this["accordionId"] === "" ? "" : "-"
                ) +
                this.slugify(titleTxt);
        },

        /**
         * The id of the button.
         * @param  {string} [titleTxt=""]  The title of this part.
         * @returns string  The id of the button.
         */
        "btnId"(titleTxt: string = ""): string {
            return "btn-" + this["id"](titleTxt);
        },

        /**
         * The id of the collapse div.
         * @param  {string} [titleTxt=""]  The title of this part.
         * @returns string  The id.
         */
        "collapseId"(titleTxt: string = ""): string {
            return "collapse-" + this["id"](titleTxt);
        },

        /**
         * Runs when a part is clicked.
         * @param  {string[]} breadcrumbs  The breadcrumbs corresponding to this part.
         * @param  {*}        menuItem     The submenu data.
         * @param  {string}   title        The title of this part.
         * @param  {number}   itemIndex    The index of this part.
         * @returns void
         */
        "menuItemClick"(breadcrumbs: string[], menuItem: any, title: string, itemIndex: number): void {
            // Data you'll need regardless of whether it's a submenu or
            // function. Get the menu information from the Menu3D.menuInf at
            // the level specified by breadcrumbs.
            let menuInfByRef = Menu3D.menuInf;
            let breadcrumbsLen = breadcrumbs.length;
            let breadcrumb;
            for (let i = 0; i < breadcrumbsLen; i++) {
                breadcrumb = breadcrumbs[i];
                menuInfByRef = menuInfByRef[breadcrumb];
            }

            if ((menuItem === "object" || typeof menuItem === "object")) {
                // You need to either load in more menu data or remove some
                // that's there. First, get a references to the level of the
                // partial menu data where the update should be placed.
                let partialMenuData = this.$store.state["menu2dDisplay"]["partialMenuData"];
                let partialMenuDataByRef = partialMenuData;
                for (let i = 0; i < breadcrumbsLen; i++) {
                    breadcrumb = breadcrumbs[i];
                    if (Object.keys(partialMenuDataByRef).indexOf(title) !== -1) {
                        // You've arrived at the title. Move on from this
                        // loop.
                        break;
                    }
                    partialMenuDataByRef = partialMenuDataByRef[breadcrumb];
                }

                // Prepare to add data to partialMenuData from menuInf.
                // Also remove data from partialMenuData that is no longer
                // relevant, to keep memory use down.
                let partialMenuDataByRefKeys = Object.keys(partialMenuDataByRef);
                const partialMenuDataByRefKeysLen = partialMenuDataByRefKeys.length;
                for (let i = 0; i < partialMenuDataByRefKeysLen; i++) {
                    const partialMenuDataByRefKey = partialMenuDataByRefKeys[i];
                    const val = partialMenuDataByRef[partialMenuDataByRefKey];
                    if (partialMenuDataByRefKey === title) {
                        // This is where you need to change the menu data.
                        partialMenuDataByRef[title] = menuItem === "object" ? {} : "object";
                    } else if (typeof val === "object") {
                        // Remove the submenu data and replace it with
                        // "object". Serves to remove irrelevant submenu
                        // data to keep memory use low.
                        partialMenuDataByRef[partialMenuDataByRefKey] = "object";
                    }
                }

                if (menuItem === "object") {
                    // Now go through and add in submenu information. Note
                    // that values are "object" or "function" here, not the
                    // actual data. So only loading submenus when they are
                    // first needed.

                    // Remove menu items that shouldn't appear in 2D version
                    // of the menu.
                    let menuInfByRefKeys = filterProhibitedMenuItems(
                        Object.keys(menuInfByRef)
                    ).sort();

                    // Move data from menuInf to partialMenuData (the latter
                    // being rendered per Vuejs).
                    const menuInfByRefKeysLen = menuInfByRefKeys.length;
                    for (let i = 0; i < menuInfByRefKeysLen; i++) {
                        const mInf = menuInfByRefKeys[i];
                        const val = menuInfByRef[mInf];
                        partialMenuDataByRef[title][mInf] = typeof val;
                    }
                }

                // Now save new partialMenuData to the Vuex store.
                this.updatePartialMenuDataToVueX(partialMenuData);
            } else if (menuItem === "function")  {
                // Keep track of index of last item clicked too.
                this["funcItemIndexClicked"] = itemIndex;
                setTimeout(() => {
                    this["funcItemIndexClicked"] = undefined;
                }, 750);

                // It's a function, so run it (after a delay to give
                // Working... a chance to display).
                Vue.nextTick(() => {
                    setTimeout(() => {
                        menuInfByRef();

                        // In some circumstances, you need to remove the item.
                        if (breadcrumbs.indexOf("Remove Existing") !== -1) {
                            this.removeSubMenuFromPartialMenuData(breadcrumbs);
                        }
                    }, 250)
                });
            }
        },

        /**
         * Removes submenu from the partially loaded menu data. Useful if you
         * remove a selection, for example.
         * @param  {string[]} breadcrumbs  The bread crumbs corresponding to
         *                                 the submenu to be removed.
         * @returns void
         */
        removeSubMenuFromPartialMenuData(breadcrumbs: string[]): void {
            let partialMenuData = this.$store.state["menu2dDisplay"]["partialMenuData"];
            let partialMenuDataByRef = partialMenuData;
            const breadcrumbsLen = breadcrumbs.length;
            for (let i = 0; i < breadcrumbsLen - 1; i++) {
                const breadcrumb = breadcrumbs[i];
                partialMenuDataByRef = partialMenuDataByRef[breadcrumb];
            }
            let lastKey = breadcrumbs[breadcrumbs.length - 1];
            delete partialMenuDataByRef[lastKey];
            this.updatePartialMenuDataToVueX(partialMenuData);
        },

        /**
         * Updates the partial menu data. Copies it to the VueX store.
         * @param  {*} partialMenuData  The partially loaded menu data.
         * @returns void
         */
        updatePartialMenuDataToVueX(partialMenuData: any): void {
            // Now save new partialMenuData to the Vuex store. First
            // set to empty to make sure it's reactive.
            store.commit("setVar", {  // To make sure reactive.
                moduleName: "menu2dDisplay",
                varName: "partialMenuData",
                val: {}
            });
            store.commit("setVar", {
                moduleName: "menu2dDisplay",
                varName: "partialMenuData",
                val: partialMenuData
            });
        },

        /**
         * Gets the menudata associated with this component.
         * @returns *  The menu data.
         */
        "menuData"(): any {
            let partialDataByRef = this.$store.state["menu2dDisplay"]["partialMenuData"];
            let breadcrumbs = this["breadcrumbs"];
            const breadcrumbsLen = breadcrumbs.length;
            for (let i = 0; i < breadcrumbsLen; i++) {
                const breadcrumb = breadcrumbs[i];
                partialDataByRef = partialDataByRef[breadcrumb];
                if (breadcrumb === this["title"]) {
                    break;
                }
            }

            return partialDataByRef;
        },

        /**
         * Determines the height of the collapsable part. Gradually reduces
         * the height (to collapse). Note that expanding is handled with css,
         * not javascript.
         * @param  {*}      menuItem  The menu data.
         * @param  {string} title     The title.
         * @returns string  The height css.
         */
        "heightStyle"(menuItem: any, title: string): string {
            let id = this["collapseId"](title) + '-accordion-panel';
            if ((menuItem === "object") && (typeof oldMenuItem[id] === "object")) {
                // Just switched from having menu data to not having menu data
                // (start of collapse).
                let refs = this.$refs[id];
                if (refs !== undefined && this.height === undefined) {  // this.height to make sure collapse not in progress
                    let ref = refs[0];
                    let startHeight = ref.clientHeight;
                    if (startHeight > 0) {  // Make sure needs to collapse
                        // Turns out its very hard to use css transitions for
                        // both expanding and contracting heights. So for
                        // contracting, let's use javascript. CSS used for
                        // expanding only.
                        let startTime = new Date().getTime();
                        let updateHeight = () => {
                            let ratio = 1 - ((new Date().getTime() - startTime) / 250);  // 250 == miliseconds
                            if (ratio > 0) {
                                this.height = startHeight * ratio;
                                setTimeout(updateHeight, 0.1);
                            } else {
                                this.height = undefined;
                            }
                        }
                        updateHeight();
                    }
                }
                return this.height === undefined ? "" : this["bgColor"] + "height:" + (this.height === undefined ? 0 : this.height).toString() + "px";
            }
            oldMenuItem[id] = menuItem;
            return "";
        },
    };

    public computed = {
        /**
         * Gets the id of the accordion.
         * @returns string  The id.
         */
        "accordionId"(): string {
            // return this["id"](titleTxt);
            return this["breadcrumbs"].slice(0, this["depth"]).map(s => this.slugify(s)).join("-");
        },

        /**
         * Gets the font size of this part.
         * @returns number  The font size.
         */
        fontsize(): number {
            return 150 - this["depth"] * 10;
        },

        /**
         * Gets css style string setting the appropriate background color.
         * @returns string  The css style.
         */
        "bgColor"(): string {
            // let bgColor = `background-color: rgb(${color}, ${color}, ${color});`;
            // let fgColor = `color: rgb(${255 - color}, ${255 - color}, ${255 - color});`;
            return `background-color: ${this.getPastel(this["depth"])};`;
        },

        /**
         * Gets the css style string of this part.
         * @returns string  The css style string.
         */
        "css"(): string {
            return 'cursor: pointer; font-size:' + this.fontsize + '%; ' + this["bgColor"] + ';'
        },

        /**
         * Gets the parial memu data. Like Menu3D.menuInf, but only has the
         * data that will be displayed via Vue. Saves on memory this way.
         * @returns * The partial data.
         */
        "partialMenuData"(): any {
            return this.$store.state["menu2dDisplay"]["partialMenuData"];
        }
    };

    public props = {
        "breadcrumbs": {"required": false, "default": () => {return []}},
        "depth": {"required": false, "default": 0},
        "title": {"required": true},
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        "state": {
            "partialMenuData": {}
        },
        "mutations": {}
    };

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {
            height: undefined,
            "funcItemIndexClicked": undefined
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {}
}

/**
 * Filters the menu item names to remove ones that shouldn't appear in the 2D
 * menu.
 * @param  {string[]} menuItemNames  The original menu item names.
 * @returns string[]  The menu item names, but with certain ones removed.
 */
function filterProhibitedMenuItems(menuItemNames: string[]): string[] {
    let prohibitedWords = ["Back ⇦", "Close Menu ×"];
    const prohibitedWordsLen = prohibitedWords.length;
    for (let i = 0; i < prohibitedWordsLen; i++) {
        const prohibitedWord = prohibitedWords[i];
        let j = menuItemNames.indexOf(prohibitedWord);
        if (j !== -1) {
            menuItemNames.splice(j, 1);
        }
    }
    return menuItemNames;
}

/**
 * Loads the top-level menu data into partialMenuData VueX variable. The
 * remainiong sub-menu data is lazy-loaded as needed.
 * @returns void
 */
export function loadInitialPartialMenuData(): void {
    // Not necessary if in follower mode.
    if (UrlVars.checkIfWebRTCInUrl()) {
        return;
    }

    // Need to setup top menu stuff.
    const topMenuNames = filterProhibitedMenuItems(
        Object.keys(Menu3D.menuInf)
    ).sort();

    const topMenuNamesLen = topMenuNames.length;
    let partialMenuData = {};
    for (let i = 0; i < topMenuNamesLen; i++) {
        const topMenuName = topMenuNames[i];
        const val = Menu3D.menuInf[topMenuName];
        partialMenuData[topMenuName] = typeof val;
    }

    store.commit("setVar", {
        moduleName: "menu2dDisplay",
        varName: "partialMenuData",
        val: partialMenuData
    });
}
