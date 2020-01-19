namespace BlazorScrollView {
    export class ScrollViewInterop {
        public static CurrentHandleElement: HTMLDivElement | null;
        public static CurrentHandleY: number;
        public static IsGlobalHandlersInitialized = false;

        public static InitializeScrollView(scrollContainer: HTMLDivElement): void {
            let scrollHandleElement = document.createElement("div");
            scrollHandleElement.classList.add("handle");

            let scrollHandleContainerElement = document.createElement("div");
            scrollHandleContainerElement.classList.add("handle-container");

            scrollHandleContainerElement.appendChild(scrollHandleElement);
            scrollContainer.appendChild(scrollHandleContainerElement);

            ScrollViewInterop.SetScrollHandleHeight(scrollContainer);
            ScrollViewInterop.InitializeGlobalHandlers();
        }

        private static InitializeGlobalHandlers() {
            if (!ScrollViewInterop.IsGlobalHandlersInitialized) {
                ScrollViewInterop.IsGlobalHandlersInitialized = true;
                document.addEventListener("mousedown", ScrollViewInterop.HandleMouseDown);
                document.addEventListener("mousemove", ScrollViewInterop.HandleMouseMove);
                document.addEventListener("mouseup", ScrollViewInterop.HandleMouseUp);
            }
        }

        private static HandleMouseDown(e: MouseEvent) {
            var target = e.target as HTMLDivElement;

            if (target.classList.contains("handle")) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();

                ScrollViewInterop.CurrentHandleElement = target;
                ScrollViewInterop.CurrentHandleY = e.clientY;
            }
        }

        private static HandleMouseMove(e: MouseEvent) {
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                var handle = ScrollViewInterop.CurrentHandleElement;
                var startY = ScrollViewInterop.CurrentHandleY;
                var displacement = e.clientY - startY;
                var scrollContainer = handle.parentElement?.parentElement as HTMLDivElement;
                var handleContainer = handle.parentElement as HTMLDivElement;
                let vars = ScrollViewInterop.ExtractVariables(scrollContainer);

                scrollContainer.scrollTop += displacement * (vars[1] / vars[0]);

                var handleY = parseFloat(window.getComputedStyle(handle, null).top);
                var handleH = parseFloat(window.getComputedStyle(handle, null).height);
                var newHandleY = handleY + displacement;

                newHandleY = newHandleY <= 0 ? 0 : newHandleY;
                newHandleY = newHandleY >= vars[0] - handleH ? vars[0] - handleH : newHandleY;

                handleContainer.style.top = `${scrollContainer.scrollTop}px`;
                handle.style.top = `${newHandleY}px`;
                ScrollViewInterop.CurrentHandleY = e.clientY;
            }
        }

        private static HandleMouseUp(e: MouseEvent) {
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                ScrollViewInterop.CurrentHandleElement = null;
            }
        }

        private static SetScrollHandleHeight(scrollContainer: HTMLDivElement) {
            let vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            let hv = vars[0];
            let ht = vars[1];
            let hh = ScrollViewInterop.GetScrollHandleHeight(hv, hv, ht);
            var handle = scrollContainer.querySelector(".handle") as HTMLDivElement;
            handle.style.height = `${hh}px`;
        }

        private static GetScrollHandleHeight(hv: number, hs: number, ht: number) {
            return hv * hs / ht;
        }

        private static ExtractVariables(scrollContainer: HTMLDivElement) {
            let hv = parseFloat(window.getComputedStyle(scrollContainer, null).height);
            let ht = scrollContainer.scrollHeight;
            return [hv, ht];
        }
    }
}