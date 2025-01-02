import { NetworkingAPIContext } from "./networking";
import { RenderingAPIContext } from "./renderer";

namespace ModdingAPI {
    declare const require: (id: string) => any;
    export function getAPI(id: string) {
        if (id === "core:renderer") {
            return RenderingAPIContext;
        } else if (id === "core:networking") {
            return NetworkingAPIContext;
        }
    }
}
setTimeout(() => {
    (window as any).require("core:functions").exportObject(ModdingAPI,"modapi", "core");
}, 1);


