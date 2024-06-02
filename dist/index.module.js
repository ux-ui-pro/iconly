class $643fcf18b2d2e76f$var$Iconly {
    static dbInstance = null;
    options;
    constructor(options = {}){
        const defaultOptions = {
            file: "./icons.svg",
            version: "1.0",
            debug: false,
            container: document.body ?? document.documentElement
        };
        this.options = {
            ...defaultOptions,
            ...options,
            container: typeof options.container === "string" ? document.querySelector(options.container) ?? defaultOptions.container : options.container ?? defaultOptions.container
        };
        if (!this.options.container) throw new Error("Invalid container element");
        if (!$643fcf18b2d2e76f$var$Iconly.dbInstance) $643fcf18b2d2e76f$var$Iconly.dbInstance = this.openDB("iconlyDB", 1);
    }
    async openDB(name, version) {
        if (!("indexedDB" in window)) {
            this.logError("This browser doesn't support IndexedDB");
            throw new Error("IndexedDB not supported");
        }
        return new Promise((resolve, reject)=>{
            const request = indexedDB.open(name, version);
            request.onerror = ()=>reject(new Error(`IndexedDB error: ${request.error}`));
            request.onupgradeneeded = (event)=>{
                const db = event.target.result;
                if (!db.objectStoreNames.contains("icons")) db.createObjectStore("icons", {
                    keyPath: "version"
                });
            };
            request.onsuccess = ()=>resolve(request.result);
        });
    }
    static async fetchData(file) {
        const response = await fetch(file);
        if (!response.ok) throw new Error("Network response was not ok");
        return response.text();
    }
    insert(data) {
        let iconSetDiv = document.getElementById("iconset");
        if (!iconSetDiv) {
            iconSetDiv = document.createElement("div");
            iconSetDiv.id = "iconset";
            iconSetDiv.setAttribute("aria-hidden", "true");
            iconSetDiv.style.cssText = "width: 0; height: 0; position: absolute; left: -9999px;";
            this.options.container.appendChild(iconSetDiv);
        }
        iconSetDiv.innerHTML = data;
    }
    async init() {
        const { file: file, version: version } = this.options;
        try {
            let data = await $643fcf18b2d2e76f$var$Iconly.fetchData(file);
            const db = await $643fcf18b2d2e76f$var$Iconly.dbInstance;
            const store = db.transaction("icons", "readwrite").objectStore("icons");
            const dbVersion = await new Promise((resolve, reject)=>{
                const request = store.get(version);
                request.onsuccess = ()=>resolve(request.result);
                request.onerror = ()=>reject(request.error);
            });
            if (!dbVersion) await new Promise((resolve, reject)=>{
                const request = store.put({
                    version: version,
                    data: data
                });
                request.onsuccess = ()=>resolve();
                request.onerror = ()=>reject(request.error);
            });
            else data = dbVersion.data;
            await new Promise((resolve, reject)=>{
                const tx = store.transaction;
                tx.oncomplete = ()=>resolve();
                tx.onerror = ()=>reject(tx.error);
                tx.onabort = ()=>reject(tx.error);
            });
            this.insert(data);
        } catch (error) {
            this.logError("Error initializing Iconly:", error);
        }
    }
    logError(...messages) {
        if (this.options.debug) // eslint-disable-next-line no-console
        console.error(...messages);
    }
}
var $643fcf18b2d2e76f$export$2e2bcd8739ae039 = $643fcf18b2d2e76f$var$Iconly;


export {$643fcf18b2d2e76f$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.module.js.map
