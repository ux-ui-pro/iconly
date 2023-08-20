function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $4fa36e821943b400$export$2e2bcd8739ae039);
class $4fa36e821943b400$export$2e2bcd8739ae039 {
    constructor(options){
        this.options = {
            ...options
        };
        this.isLocalStorage = !!window["localStorage"];
        this.body = document.body;
        this.init().then();
    }
    async init() {
        const { file: file } = this.options;
        if (document.querySelector("#iconset")) return;
        if (this.isLocalStorage) {
            const storedSize = localStorage.getItem("inlineSVGsize");
            try {
                const response = await fetch(file);
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.text();
                if (storedSize && storedSize === data.length.toString()) this.insert(localStorage.getItem("inlineSVGdata"));
                else {
                    this.insert(data);
                    localStorage.setItem("inlineSVGdata", data);
                    localStorage.setItem("inlineSVGsize", data.length.toString());
                }
            } catch (error) {
                console.error("There was a problem with the network fetch operation:", error);
            }
        } else try {
            const response = await fetch(file);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.text();
            this.insert(data);
        } catch (error) {
            console.error("There was a problem with the network fetch operation:", error);
        }
    }
    insert(data) {
        if (this.body) this.body.insertAdjacentHTML("beforeend", data);
        else document.addEventListener("DOMContentLoaded", ()=>{
            this.body.insertAdjacentHTML("beforeend", data);
        });
    }
}


//# sourceMappingURL=index.js.map
