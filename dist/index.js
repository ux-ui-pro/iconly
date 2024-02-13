
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $4fa36e821943b400$export$2e2bcd8739ae039);
class $4fa36e821943b400$var$Iconly {
    static #dbInstance;
    #options;
    #container;
    constructor(options){
        this.#options = {
            file: "./icons.svg",
            version: "1.0",
            debug: false,
            container: document.body || document.documentElement,
            ...options
        };
        this.#container = typeof this.#options.container === "string" ? document.querySelector(this.#options.container) : this.#options.container;
        if (!$4fa36e821943b400$var$Iconly.#dbInstance) $4fa36e821943b400$var$Iconly.#dbInstance = this.#openDB("iconlyDB", 1);
    }
    async #openDB(name, version) {
        if (!("indexedDB" in window)) {
            this.#logError("This browser doesn't support IndexedDB");
            return;
        }
        let db;
        try {
            db = await new Promise((resolve, reject)=>{
                const request = indexedDB.open(name, version);
                request.onerror = ()=>reject(`IndexedDB error: ${request.error}`);
                request.onupgradeneeded = (event)=>{
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains("icons")) db.createObjectStore("icons", {
                        keyPath: "version"
                    });
                };
                request.onsuccess = ()=>resolve(request.result);
            });
        } catch (error) {
            this.#logError(error);
            throw error;
        }
        return db;
    }
    async #fetchData(file) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        } catch (error) {
            this.#logError(error);
            throw error;
        }
    }
    async #insert(data) {
        let iconSetDiv = document.getElementById("iconset");
        if (!iconSetDiv) {
            iconSetDiv = document.createElement("div");
            iconSetDiv.id = "iconset";
            iconSetDiv.setAttribute("aria-hidden", "true");
            iconSetDiv.style.cssText = "width: 0; height: 0; position: absolute;";
            this.#container.appendChild(iconSetDiv);
        }
        iconSetDiv.innerHTML = data;
    }
    async init() {
        const { file: file, version: version } = this.#options;
        try {
            let data = await this.#fetchData(file);
            const db = await $4fa36e821943b400$var$Iconly.#dbInstance;
            const tx = db.transaction("icons", "readwrite");
            const store = tx.objectStore("icons");
            const dbVersion = await new Promise((resolve, reject)=>{
                const request = store.get(version);
                request.onsuccess = ()=>resolve(request.result);
                request.onerror = ()=>reject(request.error);
            });
            if (!(dbVersion && dbVersion.data)) await new Promise((resolve, reject)=>{
                const request = store.put({
                    version: version,
                    data: data
                });
                request.onsuccess = ()=>resolve();
                request.onerror = ()=>reject(request.error);
            });
            else data = dbVersion.data;
            await tx.complete;
            await this.#insert(data);
        } catch (error) {
            this.#logError("Error initializing Iconly:", error);
        }
    }
    #logError(...messages) {
        if (this.#options.debug) console.error(...messages);
    }
}
var $4fa36e821943b400$export$2e2bcd8739ae039 = $4fa36e821943b400$var$Iconly;


//# sourceMappingURL=index.js.map
