// These are fake jQuery functions so I don't have to load jQuery.

export function jQuery(selector: any) {
    return new JQueryObj(selector);
}

class JQueryObj {
    private element = undefined;

    constructor(selector: any) {
        // I'm only going to support simple selectors here. This isn't full
        // jQuery.
        if (typeof(selector) === "string") {
            if (selector.substr(0, 1) === "#") {
                this.element = document.getElementById(selector.substr(1));
            } else if (selector.substr(0, 1) === ".") {
                this.element = document.getElementsByClassName(selector.substr(1));
            } else if (selector === "body") {
                this.element = document.body;
            } else {
                throw new Error("Selector not recognized: " + selector);
            }
        } else {
            this.element = selector;  // could be document
        }

        if (this.element === null) {
            console.warn("Selector not found/recognized: " + selector);
        }
    }

    public keypress(callBack) {
        // I assume below passes event.
        if (this.element) {
            this.element.addEventListener("keypress", callBack);
        }
    }

    public click(callBack) {
        if (this.element) {
            // I assume below passes event.
            this.element.addEventListener("click", callBack);
        }
    }

    public show() {
        if (this.element) {
            this.element.style.display = "";
        }
    }

    public hide() {
        if (this.element) {
            this.element.style.display = "none";
        }
    }

    public append(html: string) {
        if (this.element) {
            // let t = document.createTextNode(txt);
            // this.element.appendChild(t);

            // See
            // https://stackoverflow.com/questions/6304453/javascript-append-html-to-container-element-without-innerhtml
            this.element.insertAdjacentHTML("beforeend", html);
        }
    }

    public focus() {
        if (this.element) {
            this.element.focus();
        }
    }

    public ready(callBack) {
        if (this.element) {
            // See http://youmightnotneedjquery.com/#json
            if (this.element.attachEvent
                ? this.element.readyState === "complete"
                : this.element.readyState !== "loading") {
                callBack();
            } else {
                this.element.addEventListener("DOMContentLoaded", callBack);
            }
        }
    }
}

export function getJSON(url, callBack) {
    let request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            let data = JSON.parse(request.responseText);
            callBack(data);
        } else {
            // We reached our target server, but it returned an error.
            // Incomplete implementation here...
        }
    };

    request.onerror = () => {
        // There was a connection error of some sort. Incomplete
        // implementation here.
    };

    request.send();
};

export function getScript(source: string, callback) {
    // see
    // https://stackoverflow.com/questions/16839698/jquery-getscript-alternative-in-native-javascript/28002292#28002292

    let script = document.createElement("script");
    let prior = document.getElementsByTagName("script")[0];
    script.async = true;

    script.onload = script.onreadystatechange = ( _, isAbort ) => {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if (!isAbort) {
                if (callback) {
                    callback();
                }
            }
        }
    };

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
}
