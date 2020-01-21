namespace BlazorScrollView {
    export class ScrollViewInterop {
        public static CurrentHandleElement: HTMLDivElement | null;
        public static CurrentHandleY: number;
        public static IsGlobalHandlersInitialized = false;
        public static CurrentScrollAccelerationMultiplier = 0;
        public static CurrentScrollAcceleration = 0.02;
        public static CurrentScrollAccelerationTimeoutId = 0;

        public static InitializeScrollView(scrollContainer: HTMLDivElement): void {
            let scrollHandleElement = document.createElement("div");
            scrollHandleElement.classList.add("handle");

            let scrollHandleContainerElement = document.createElement("div");
            scrollHandleContainerElement.classList.add("handle-container");

            scrollHandleContainerElement.appendChild(scrollHandleElement);
            scrollContainer.appendChild(scrollHandleContainerElement);
            scrollContainer.addEventListener("wheel", ScrollViewInterop.HandleWheel);
            scrollContainer.addEventListener("mouseenter", ScrollViewInterop.OnScrollContainerMouseEnter);
            scrollContainer.addEventListener("mouseleave", ScrollViewInterop.OnScrollContainerMouseLeave);

            ScrollViewInterop.SetScrollHandleHeight(scrollContainer);
            ScrollViewInterop.InitializeGlobalHandlers();
        }

        public static UnInitializeScrollView(scrollContainer: HTMLDivElement): void {
            scrollContainer.removeEventListener("wheel", ScrollViewInterop.HandleWheel);
            scrollContainer.removeEventListener("mouseenter", ScrollViewInterop.OnScrollContainerMouseEnter);
            scrollContainer.removeEventListener("mouseleave", ScrollViewInterop.OnScrollContainerMouseLeave);
        }

        private static InitializeGlobalHandlers() {
            if (!ScrollViewInterop.IsGlobalHandlersInitialized) {
                ScrollViewInterop.IsGlobalHandlersInitialized = true;
                document.addEventListener("mousedown", ScrollViewInterop.HandleMouseDown);
                document.addEventListener("mousemove", ScrollViewInterop.HandleMouseMove);
                document.addEventListener("mouseup", ScrollViewInterop.HandleMouseUp);
            }
        }

        private static OnScrollContainerMouseEnter(e: MouseEvent) {
            var target = e.currentTarget as HTMLDivElement;
            target.classList.add("active");
            ScrollViewInterop.SetScrollHandleHeight(target);
        }
        private static OnScrollContainerMouseLeave(e: MouseEvent) {
            var target = e.currentTarget as HTMLDivElement;
            target.classList.remove("active");
        }

        private static HandleMouseDown(e: MouseEvent) {
            let target = e.target as HTMLDivElement;

            if (target.classList.contains("handle")) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();

                var scrollContainer = target.parentElement?.parentElement as HTMLDivElement;
                if (!scrollContainer?.classList.contains("active"))
                    scrollContainer?.classList.add("active");

                ScrollViewInterop.CurrentHandleElement = target;
                ScrollViewInterop.CurrentHandleY = e.clientY;
            }
        }

        private static HandleMouseMove(e: MouseEvent) {
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();

                var scrollContainer = ScrollViewInterop.CurrentHandleElement.parentElement?.parentElement as HTMLDivElement;
                if (!scrollContainer?.classList.contains("active"))
                    scrollContainer?.classList.add("active");

                let startY = ScrollViewInterop.CurrentHandleY;
                let displacement = e.clientY - startY;
                ScrollViewInterop.DoScroll(displacement);
                ScrollViewInterop.CurrentHandleY = e.clientY;
            }
        }

        private static DoScroll(displacement: number) {
            console.log(displacement);
            let handle = ScrollViewInterop.CurrentHandleElement as HTMLDivElement;
            let handleContainer = handle.parentElement as HTMLDivElement;
            let scrollContainer = handleContainer.parentElement as HTMLDivElement;
            let vars = ScrollViewInterop.ExtractVariables(scrollContainer);

            scrollContainer.scrollTop += displacement * (vars[1] / vars[0]);
            console.log(displacement * (vars[1] / vars[0]));
            let handleY = parseFloat(window.getComputedStyle(handle, null).top);
            let handleH = parseFloat(window.getComputedStyle(handle, null).height);
            let newHandleY = handleY + displacement;

            if (newHandleY <= 0) {
                newHandleY = 0;
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }

            if (newHandleY >= vars[0] - handleH) {
                newHandleY = vars[0] - handleH;
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }

            handleContainer.style.top = `${scrollContainer.scrollTop}px`;
            handle.style.top = `${newHandleY}px`;
        }

        private static HandleMouseUp(e: MouseEvent) {
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();

                var scrollContainer = ScrollViewInterop.CurrentHandleElement.parentElement?.parentElement;
                if (scrollContainer?.classList.contains("active"))
                    scrollContainer?.classList.remove("active");

                ScrollViewInterop.CurrentHandleElement = null;
            }
        }

        private static HandleWheel(e: WheelEvent) {
            clearTimeout(ScrollViewInterop.CurrentScrollAccelerationTimeoutId);
            var scrollContainer = e.currentTarget as HTMLDivElement;

            if (!scrollContainer?.classList.contains("active"))
                scrollContainer?.classList.add("active");

            ScrollViewInterop.CurrentHandleElement = scrollContainer.querySelector(".handle");
            var delta = Math.max(-0.5, Math.min(0.5, e.deltaY || -e.detail));
            var dMultiplier = delta / Math.abs(delta);

            if (ScrollViewInterop.CurrentScrollAccelerationMultiplier * dMultiplier < 0)
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;

            ScrollViewInterop.DoScroll(
                delta + ScrollViewInterop.CurrentScrollAccelerationMultiplier * ScrollViewInterop.CurrentScrollAcceleration);
            ScrollViewInterop.CurrentScrollAccelerationMultiplier += dMultiplier;
            ScrollViewInterop.CurrentHandleElement = null;

            ScrollViewInterop.CurrentScrollAccelerationTimeoutId = setTimeout(() => {
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }, 500);
            return false;
        }

        private static SetScrollHandleHeight(scrollContainer: HTMLDivElement) {
            let vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            let hv = vars[0];
            let ht = vars[1];
            let hs = vars[2];
            let hh = ScrollViewInterop.GetScrollHandleHeight(hv, hs, ht);
            let handle = scrollContainer.querySelector(".handle") as HTMLDivElement;
            handle.style.height = `${hh}px`;
        }

        private static GetScrollHandleHeight(hv: number, hs: number, ht: number) {
            return hv * hs / ht;
        }

        private static ExtractVariables(scrollContainer: HTMLDivElement) {
            let hv = parseFloat(window.getComputedStyle(scrollContainer, null).height);
            let hs = parseFloat(window.getComputedStyle(scrollContainer.querySelector(".handle-container") as HTMLDivElement, null).height);
            let ht = scrollContainer.scrollHeight;
            return [hv, ht, hs];
        }
    }
}