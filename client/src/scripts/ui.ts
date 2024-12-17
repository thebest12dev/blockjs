
    export enum Constants {
        PAUSE_SCREEN = 0,
        TITLE_SCREEN = 1,
    }
    export type BlockJSText = string
    
   
     export class Button {
         private button: HTMLButtonElement = null;
         private hasSet = false
         constructor(text: BlockJSText, location: Constants = null) {
             this.button = document.createElement("button")
             this.button.setAttribute("_1","")
             this.button.addEventListener("mousedown", (e) => {
                 this.onClickListener(e)
             })
             this.button.innerHTML = text
             if (location != null) {
                 this.attachTo(location)
             }
         }
         private onClickListener: (e: MouseEvent) => void;
         setText(text: BlockJSText) {
             this.button.innerHTML = text
         }
         setOnClickListener(listener: (e: MouseEvent) => void) {
             this.onClickListener = listener
         }
         attachTo(location: Constants) {
             if (!this.hasSet) {
                 switch (location) {
                     case Constants.TITLE_SCREEN:
                         document.getElementById("buttons1").append(this.button) 
                         break;
                 
                     default:
                         console.error("Unable to set location of button: Invalid enum")
                         break;
                 }
                 this.hasSet = true
             } else {
                 console.warn("Button has been already set");
                 
             }
           
 
            
         }
    }
