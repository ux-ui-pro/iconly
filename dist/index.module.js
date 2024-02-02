class $cf838c15c8b009ba$var$Iconly {
    constructor(options){
        this.options = {
            file: "./icons.svg",
            ...options
        };
        this.isLocalStorage = typeof window.localStorage !== "undefined";
        this.body = document.body;
    }
    async init() {
        const { file: file } = this.options;
        if (this.isLocalStorage) {
            const storedSize = localStorage.getItem("inlineSVGsize");
            const storedData = localStorage.getItem("inlineSVGdata");
            const response = await fetch(file);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.text();
            if (storedSize && storedSize === data.length.toString()) this.insert(storedData);
            else {
                this.insert(data);
                localStorage.setItem("inlineSVGdata", data);
                localStorage.setItem("inlineSVGsize", data.length.toString());
            }
        } else {
            const response = await fetch(file);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.text();
            this.insert(data);
        }
    }
    insert(data) {
        if (!document.getElementById("iconset")) {
            if (this.body) this.body.insertAdjacentHTML("beforeend", data);
            else document.addEventListener("DOMContentLoaded", ()=>{
                this.body.insertAdjacentHTML("beforeend", data);
            });
        }
    }
}
var $cf838c15c8b009ba$export$2e2bcd8739ae039 = $cf838c15c8b009ba$var$Iconly;


export {$cf838c15c8b009ba$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.module.js.map
