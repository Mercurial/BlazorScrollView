interface IScrollViewElement extends HTMLDivElement {
    componentRef: any;
    ScrollPadding: number;
}

enum WheelEventDeltaModes
{
	Pixel,
	Line,
	Page
}

namespace BlazorScrollView {
    export class ScrollViewInterop {
        public static CurrentHandleElement: HTMLDivElement | null;
        public static CurrentHandleY: number;
        public static IsGlobalHandlersInitialized = false;
        public static CurrentScrollAccelerationMultiplier = 0;
        public static CurrentScrollAcceleration = 0.2;
        public static CurrentScrollAccelerationTimeoutId = 0;
        public static ScrollLineHeight: number = 10;
        public static SmallHandleHeightCriterion: number = 10;
        public static ScrollHeightOffset: number = 5;
        public static ScrollPadding: number = 10;

        public static InitializeScrollView(scrollContainer: IScrollViewElement, scrollPadding: number = 0, componentRef: any): void {
            let scrollHandleElement = document.createElement("div");
            scrollHandleElement.classList.add("handle");
            scrollHandleElement.style.top = `${scrollPadding}px`;

            let scrollHandleContainerElement = document.createElement("div");
            scrollHandleContainerElement.classList.add("handle-container");
            scrollHandleContainerElement.style.paddingTop = `${scrollPadding}px`;
            scrollHandleContainerElement.style.paddingBottom = `${scrollPadding}px`;

            let scrollHandleContainerShadowElement = document.createElement("div");
            scrollHandleContainerShadowElement.classList.add("handle-container-shadow");

            scrollHandleContainerElement.appendChild(scrollHandleElement);
            scrollHandleContainerElement.appendChild(scrollHandleContainerShadowElement);
            scrollContainer.appendChild(scrollHandleContainerElement);

            scrollContainer.addEventListener("wheel", ScrollViewInterop.HandleWheel);
            scrollContainer.addEventListener("mouseenter", ScrollViewInterop.OnScrollContainerMouseEnter);
            scrollContainer.addEventListener("mouseleave", ScrollViewInterop.OnScrollContainerMouseLeave);

            scrollContainer.componentRef = componentRef;
            scrollContainer.ScrollPadding = scrollPadding;
            ScrollViewInterop.ScrollLineHeight = ScrollViewInterop.GetScrollLineHeight();
            ScrollViewInterop.SetScrollHandleHeight(scrollContainer);
            ScrollViewInterop.InitializeGlobalHandlers();
        }

        public static UnInitializeScrollView(scrollContainer: HTMLDivElement): void {
            scrollContainer.removeEventListener("wheel", ScrollViewInterop.HandleWheel);
            scrollContainer.removeEventListener("mouseenter", ScrollViewInterop.OnScrollContainerMouseEnter);
            scrollContainer.removeEventListener("mouseleave", ScrollViewInterop.OnScrollContainerMouseLeave);
        }

        public static ScrollToBottom(scrollContainer: IScrollViewElement) {
            let handle = scrollContainer.querySelector(":scope > div.handle-container > .handle") as HTMLDivElement;
            let handleContainer = handle.parentElement as HTMLDivElement;
            var yPosition = scrollContainer.scrollHeight - scrollContainer.clientHeight + scrollContainer.ScrollPadding;
            handleContainer.style.top = `${yPosition}px`;

            let newHandleY = scrollContainer.clientHeight - parseFloat(window.getComputedStyle(handle, null).height) - scrollContainer.ScrollPadding;
            handle.style.top = `${newHandleY}px`;

            scrollContainer.scrollTo({ top: yPosition + scrollContainer.ScrollPadding, left: 0, behavior: 'smooth' });
            scrollContainer.componentRef.invokeMethodAsync("ScrolledToBottomAsync");
        }

        public static ScrollToTop(scrollContainer: IScrollViewElement) {
            let handle = scrollContainer.querySelector(":scope > div.handle-container > .handle") as HTMLDivElement;
            let handleContainer = handle.parentElement as HTMLDivElement;
            var yPosition = scrollContainer.ScrollPadding;
            handleContainer.style.top = `${yPosition}px`;

            let newHandleY = scrollContainer.ScrollPadding;
            handle.style.top = `${newHandleY}px`;

            scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            scrollContainer.componentRef.invokeMethodAsync("ScrolledToTopAsync");
        }

        public static IsAtBottom(scrollContainer: IScrollViewElement): boolean {
            return scrollContainer.scrollTop + ScrollViewInterop.ScrollHeightOffset >= (scrollContainer.scrollHeight - scrollContainer.offsetHeight) - this.ScrollPadding;
        }

        public static IsAtTop(scrollContainer: IScrollViewElement): boolean {
            return scrollContainer.scrollTop === this.ScrollPadding;
        }

        private static InitializeGlobalHandlers() {
            if (!ScrollViewInterop.IsGlobalHandlersInitialized) {
                ScrollViewInterop.IsGlobalHandlersInitialized = true;
                document.addEventListener("mousedown", ScrollViewInterop.HandleMouseDown);
                document.addEventListener("mousemove", ScrollViewInterop.HandleMouseMove);
                document.addEventListener("mouseup", ScrollViewInterop.HandleMouseUp);
            }
        }

        private static UnInitializeGlobalHandlers() {
            if (ScrollViewInterop.IsGlobalHandlersInitialized) {
                ScrollViewInterop.IsGlobalHandlersInitialized = false;
                document.removeEventListener("mousedown", ScrollViewInterop.HandleMouseDown);
                document.removeEventListener("mousemove", ScrollViewInterop.HandleMouseMove);
                document.removeEventListener("mouseup", ScrollViewInterop.HandleMouseUp);
            }
        }

        private static OnScrollContainerMouseEnter(e: MouseEvent) {
            let target = e.currentTarget as HTMLDivElement;

            let parentScrollView = target.parentElement?.closest(".blazor-scrollview");
            if (parentScrollView != null) {
                parentScrollView?.classList.remove("active");
            }

            if(target.scrollHeight > target.getBoundingClientRect().height + + ScrollViewInterop.ScrollHeightOffset)
            {
                ScrollViewInterop.SetScrollHandleHeight(target);
                target.classList.add("active");
            }
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
                
                
                if (target.classList.contains("small") && !target.classList.contains("expanded"))
                    target?.classList.add("expanded");
                
                let scrollHandleContainer = target.parentElement;
                if (!scrollHandleContainer?.classList.contains("expanded"))
                    scrollHandleContainer?.classList.add("expanded");

                let scrollContainer = target.parentElement?.parentElement as IScrollViewElement;
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
                if((!ScrollViewInterop.IsAtTop(scrollContainer as IScrollViewElement) && displacement < 0) || 
                (!ScrollViewInterop.IsAtBottom(scrollContainer as IScrollViewElement) && displacement > 0))
                {
                    ScrollViewInterop.DoScroll(displacement);
                    ScrollViewInterop.CurrentHandleY = e.clientY;
                }
            }
        }

        private static DoScroll(displacement: number) {
            let handle = ScrollViewInterop.CurrentHandleElement as HTMLDivElement;
            let handleContainer = handle.parentElement as HTMLDivElement;
            let scrollContainer = handleContainer.parentElement as IScrollViewElement;
            let vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            scrollContainer.scrollTop += displacement * (vars[1] / vars[0]);
            let handleY = parseFloat(window.getComputedStyle(handle, null).top);
            let handleH = parseFloat(window.getComputedStyle(handle, null).height);
            let newHandleY = handleY + displacement;

            console.log(scrollContainer.ScrollPadding)
            if (newHandleY <= scrollContainer.ScrollPadding) {
                newHandleY = scrollContainer.ScrollPadding;
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }

            if (newHandleY >= vars[0] - handleH - scrollContainer.ScrollPadding ) {
                newHandleY = vars[0] - handleH - scrollContainer.ScrollPadding;
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }

            handleContainer.style.top = `${scrollContainer.scrollTop}px`;
            handle.style.top = `${newHandleY}px`;

            this.BroadcastScrollPosition(scrollContainer);
        }

        private static HandleMouseUp(e: MouseEvent) {
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();

                if (ScrollViewInterop.CurrentHandleElement.classList.contains("expanded"))
                    ScrollViewInterop.CurrentHandleElement?.classList.remove("expanded");

                let scrollHandleContainer = ScrollViewInterop.CurrentHandleElement.parentElement;
                if (scrollHandleContainer?.classList.contains("expanded"))
                    scrollHandleContainer?.classList.remove("expanded");

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
            if (!scrollContainer?.classList.contains("active") && scrollContainer.scrollHeight > scrollContainer.getBoundingClientRect().height + 1)
                scrollContainer?.classList.add("active");

            ScrollViewInterop.CurrentHandleElement = scrollContainer.querySelector(":scope > .handle-container > .handle");
            let vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            let a = (vars[0] / 20) / (vars[1] / vars[0]);
            let delta;
            if (e.deltaMode == WheelEventDeltaModes.Pixel) { 
                delta = e.deltaY; 
            }
            else if (e.deltaMode == WheelEventDeltaModes.Line) {
                delta = e.deltaY * ScrollViewInterop.ScrollLineHeight;
            }
            else {
                delta = e.deltaY * window.innerHeight;
            }
            
            if (delta != 0)
            { 
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
            }
            return false;
        }

        private static SetScrollHandleHeight(scrollContainer: HTMLDivElement) {
            let vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            let hv = vars[0];
            let ht = vars[1];
            let hs = vars[2];
            let hh = ScrollViewInterop.GetScrollHandleHeight(hv, hs, ht);
            let handle = scrollContainer.querySelector(":scope > .handle-container > .handle") as HTMLDivElement;
            handle.style.height = `${hh}px`;
            if(ScrollViewInterop.SmallHandleHeightCriterion >= hh && !handle.classList.contains("small"))
                handle.classList.add("small");
            if(ScrollViewInterop.SmallHandleHeightCriterion < hh && handle.classList.contains("small"))
                handle.classList.remove("small");
        }

        private static GetScrollHandleHeight(hv: number, hs: number, ht: number) {
            return hv * hs / ht;
        }

        private static ExtractVariables(scrollContainer: HTMLDivElement) {
            let hv = parseFloat(window.getComputedStyle(scrollContainer, null).height);
            let hs = parseFloat(window.getComputedStyle(scrollContainer.querySelector(":scope > .handle-container") as HTMLDivElement, null).height);
            let ht = scrollContainer.scrollHeight;
            return [hv, ht, hs];
        }

        private static BroadcastScrollPosition(scrollContainer: IScrollViewElement) {
            let IsAtBottom = this.IsAtBottom(scrollContainer);
            let IsAtTop = this.IsAtTop(scrollContainer);

            scrollContainer.componentRef.invokeMethodAsync("DidScrollAsync");

            if (IsAtBottom) {
                scrollContainer.componentRef.invokeMethodAsync("ScrolledToBottomAsync");
            }
            if (IsAtTop) {
                scrollContainer.componentRef.invokeMethodAsync("ScrolledToTopAsync");
            }
        }

        private static GetScrollLineHeight() : number { 
            const el = document.createElement('div');
            el.style.fontSize = 'initial';
            el.style.display = 'none';
            document.body.appendChild(el);
            const fontSize = window.getComputedStyle(el).fontSize;
            document.body.removeChild(el);
            return fontSize ? window.parseInt(fontSize) : this.ScrollLineHeight;
        }
    }
}