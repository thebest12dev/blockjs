
    export namespace Output {
        let logs: string[] = []
        let onLogged: (message:string) => void = (message) => {}
        export function log(text: string,context:string) {
            logs.push("[INFO] ["+context+"]: "+text)
            onLogged("[INFO] ["+context+"]: "+text)
        }
        export function getLogs(): string[] {
            return logs
        }
        export function setOnLoggedListener(listener: (message:string) => void) {
            onLogged = listener
        }
    }