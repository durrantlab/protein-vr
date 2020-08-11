import {VueComponentParent} from "../Vue/VueComponentParent";
import * as Menu3D from "../Menu3D/Menu3D";
import {getSubMenuItemsFromMenu} from "./Utils";

// @ts-ignore
import templateHtml from "./Menu2DItemComponent.template.htm";
import { debug } from "../../PromiseStore";

export class Menu2DItemComponent extends VueComponentParent {
    public tag = "menu-2d-item";
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

        "addSubMenuData"(): void {
            // Get menu data from Vue store.
            // console.log(this["newBreadCrumbs"]);
            let menuFromStore = this.$store.state["menu2d"]["menuInf"];
            // let tmpMenuFromStore = menuFromStore;
            let menuFromMenu3D = Menu3D.menuInf;
            let breadcrumbs = this["breadcrumbs"];
            let title = this["title"];

            for (let i = 0; i < breadcrumbs.length; i++) {
                let breadcrumb = breadcrumbs[i];
                // tmpMenuFromStore = tmpMenuFromStore[breadcrumb];
                menuFromMenu3D = menuFromMenu3D[breadcrumb];
            }
            // let lastBreadCrumb = this["newBreadCrumbs"][this["newBreadCrumbs"].length - 1];
            let tmpMenuFromStore = getSubMenuItemsFromMenu(breadcrumbs, menuFromStore);
            tmpMenuFromStore[title] = {}
            for (var key in menuFromMenu3D[title]) {
                if (menuFromMenu3D[title].hasOwnProperty(key)) {
                    tmpMenuFromStore[title][key] = {};
                }
            }

            console.log(menuFromStore);

            this.$store.commit("setVar", {
                moduleName: "menu2d",
                varName: "menuInf",
                val: menuFromStore
            });

            console.log("DDDD", window["store"].state.menu2d.menuInf);
        }
    };

    public computed = {
        "id"(): string {
            return this["accordionId"] + (
                    this["accordionId"] === "" ? "" : "-"
                ) +
                this.slugify(this["title"]);
        },
        "btnId"(): string {
            return "btn-" + this["id"];
        },
        "collapseId"(): string {
            return "collapse-" + this["id"];
        },
        "accordionId"(): string {
            return this["breadcrumbs"].map(s => this.slugify(s)).join("-");
        },
        fontsize(): number {
            return 150 - this["depth"] * 10;
        },
        "bgColor"(): string {
            // let bgColor = `background-color: rgb(${color}, ${color}, ${color});`;
            // let fgColor = `color: rgb(${255 - color}, ${255 - color}, ${255 - color});`;
            return `background-color: ${this.getPastel(this["depth"])};`;
        },
        "css"(): string {
            return 'font-size:' + this.fontsize + '; ' + this["bgColor"] + ';'
        },
        "newBreadCrumbs"(): string[] {
            return this["breadcrumbs"].concat([this["title"]]);
        },
        "subMenuItems"(): any {
            let menuFromStore = this.$store.state["menu2d"]["menuInf"];
            let breadcrumbs = this["breadcrumbs"];
            return getSubMenuItemsFromMenu(breadcrumbs, menuFromStore);
        },
    };

    public props = {
        "breadcrumbs": {"required": true},  // , "default": () => {return []}},
        "depth": {"required": false, "default": 0},
        "title": {"required": true},
        // "subMenuItems": {"required": true}
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        "state": {},
        "mutations": {}
    };

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {}
}
