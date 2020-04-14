namespace BlazorScrollView {
    export class ScrollViewInterop {
        public static CurrentHandleElement: HTMLDivElement | null;
        public static CurrentHandleY: number;
        public static IsGlobalHandlersInitialized = false;
        public static CurrentScrollAccelerationMultiplier = 0;
        public static CurrentScrollAcceleration = 0.2;
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

        public static ScrollToBottom(scrollContainer: HTMLDivElement) {
            var displacement = scrollContainer.scrollHeight - scrollContainer.offsetHeight;
            ScrollViewInterop.CurrentHandleElement = scrollContainer.parentElement ? scrollContainer.parentElement.querySelector(`#${scrollContainer.id} > div.handle-container > .handle`) : null;


            ScrollViewInterop.DoScroll(displacement);
            ScrollViewInterop.CurrentHandleElement = null;
        }

        public static IsAtBottom(scrollContainer: HTMLDListElement): boolean {
            return scrollContainer.scrollTop === (scrollContainer.scrollHeight - scrollContainer.offsetHeight);
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
            let target = e.currentTarget as HTMLDivElement;

            let parentScrollView = target.parentElement?.closest(".blazor-scrollview");
            if (parentScrollView != null) {
                parentScrollView?.classList.remove("active");
            }

            target.classList.add("active");
            ScrollViewInterop.SetScrollHandleHeight(target);

        }
        private static OnScrollContainerMouseLeave(e: MouseEvent) {
            let target = e.currentTarget as HTMLDivElement;
            target.classList.remove("active");

            let parentScrollView = target.parentElement?.closest(".blazor-scrollview");
            if (parentScrollView != null) {
                parentScrollView?.classList.add("active");
            }
        }

        private static HandleMouseDown(e: MouseEvent) {
            let target = e.target as HTMLDivElement;

            if (target.classList.contains("handle")) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();

                let scrollContainer = target.parentElement?.parentElement as HTMLDivElement;
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

                let scrollContainer = ScrollViewInterop.CurrentHandleElement.parentElement?.parentElement as HTMLDivElement;
                if (!scrollContainer?.classList.contains("active"))
                    scrollContainer?.classList.add("active");

                let startY = ScrollViewInterop.CurrentHandleY;
                let displacement = e.clientY - startY;
                ScrollViewInterop.DoScroll(displacement);
                ScrollViewInterop.CurrentHandleY = e.clientY;
            }
        }

        private static DoScroll(displacement: number) {
            let handle = ScrollViewInterop.CurrentHandleElement as HTMLDivElement;
            let handleContainer = handle.parentElement as HTMLDivElement;
            let scrollContainer = handleContainer.parentElement as HTMLDivElement;
            let vars = ScrollViewInterop.ExtractVariables(scrollContainer);

            scrollContainer.scrollTop += displacement * (vars[1] / vars[0]);
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

                let scrollContainer = ScrollViewInterop.CurrentHandleElement.parentElement?.parentElement;
                if (scrollContainer?.classList.contains("active"))
                    scrollContainer?.classList.remove("active");

                ScrollViewInterop.CurrentHandleElement = null;
            }
        }

        private static HandleWheel(e: WheelEvent) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            clearTimeout(ScrollViewInterop.CurrentScrollAccelerationTimeoutId);
            let scrollContainer = e.currentTarget as HTMLDivElement;

            if (!scrollContainer?.classList.contains("active"))
                scrollContainer?.classList.add("active");

            //ScrollViewInterop.CurrentHandleElement = scrollContainer.querySelector(".handle");
            ScrollViewInterop.CurrentHandleElement = scrollContainer.parentElement ? scrollContainer.parentElement.querySelector(`#${scrollContainer.id} > div.handle-container > .handle`) : null;
            let vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            let a = (vars[0] / 20) / (vars[1] / vars[0]);
            let delta = Math.max(-1, Math.min(1, e.deltaY || -e.detail));
            let dMultiplier = delta / Math.abs(delta);

            if (ScrollViewInterop.CurrentScrollAccelerationMultiplier * dMultiplier < 0)
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;

            ScrollViewInterop.DoScroll(
                a * dMultiplier + ScrollViewInterop.CurrentScrollAccelerationMultiplier * ScrollViewInterop.CurrentScrollAcceleration);
            ScrollViewInterop.CurrentScrollAccelerationMultiplier += dMultiplier;
            ScrollViewInterop.CurrentHandleElement = null;

            ScrollViewInterop.CurrentScrollAccelerationTimeoutId = setTimeout(() => {
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }, 100);
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