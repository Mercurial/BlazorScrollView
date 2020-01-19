namespace BlazorScrollView {
    export class ScrollViewInterop {
        public static InitializeScrollView(scrollContainer: HTMLDivElement): void {
            let scrollHandleElement = document.createElement("div");
            scrollHandleElement.classList.add("handle");

            scrollContainer.appendChild(scrollHandleElement);

            ScrollViewInterop.SetScrollHandleHeight(scrollContainer);
        }

        private static SetScrollHandleHeight(scrollContainer: HTMLDivElement) {
            let hv = parseFloat(window.getComputedStyle(scrollContainer, null).height);
            let ht = scrollContainer.scrollHeight;
            let hh = ScrollViewInterop.GetScrolLHandleHeight(hv, hv, ht);
            var handle = scrollContainer.querySelector(".handle") as HTMLDivElement;
            handle.style.height = `${hh}px`;
        }

        private static GetScrolLHandleHeight(hv: number, hs: number, ht: number)
        {
            return hv * hs / ht;
        }
    }
}