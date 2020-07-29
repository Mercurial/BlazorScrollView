"use strict";
var WheelEventDeltaModes;
(function (WheelEventDeltaModes) {
    WheelEventDeltaModes[WheelEventDeltaModes["Pixel"] = 0] = "Pixel";
    WheelEventDeltaModes[WheelEventDeltaModes["Line"] = 1] = "Line";
    WheelEventDeltaModes[WheelEventDeltaModes["Page"] = 2] = "Page";
})(WheelEventDeltaModes || (WheelEventDeltaModes = {}));
var BlazorScrollView;
(function (BlazorScrollView) {
    var ScrollViewInterop = /** @class */ (function () {
        function ScrollViewInterop() {
        }
        ScrollViewInterop.InitializeScrollView = function (scrollContainer, scrollPadding, componentRef) {
            if (scrollPadding === void 0) { scrollPadding = 0; }
            var scrollHandleElement = document.createElement("div");
            scrollHandleElement.classList.add("handle");
            scrollHandleElement.style.top = scrollPadding + "px";
            var scrollHandleContainerElement = document.createElement("div");
            scrollHandleContainerElement.classList.add("handle-container");
            scrollHandleContainerElement.style.paddingTop = scrollPadding + "px";
            scrollHandleContainerElement.style.paddingBottom = scrollPadding + "px";
            var scrollHandleContainerShadowElement = document.createElement("div");
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
        };
        ScrollViewInterop.UnInitializeScrollView = function (scrollContainer) {
            scrollContainer.removeEventListener("wheel", ScrollViewInterop.HandleWheel);
            scrollContainer.removeEventListener("mouseenter", ScrollViewInterop.OnScrollContainerMouseEnter);
            scrollContainer.removeEventListener("mouseleave", ScrollViewInterop.OnScrollContainerMouseLeave);
        };
        ScrollViewInterop.ScrollToBottom = function (scrollContainer) {
            var handle = scrollContainer.querySelector(":scope > div.handle-container > .handle");
            var handleContainer = handle.parentElement;
            var yPosition = scrollContainer.scrollHeight - scrollContainer.clientHeight + scrollContainer.ScrollPadding;
            handleContainer.style.top = yPosition + "px";
            ScrollViewInterop.SetScrollHandleHeight(scrollContainer);
            var newHandleY = scrollContainer.clientHeight - parseFloat(window.getComputedStyle(handle, null).height) - scrollContainer.ScrollPadding;
            handle.style.top = newHandleY + "px";
            scrollContainer.scrollTo({ top: yPosition + scrollContainer.ScrollPadding, left: 0, behavior: 'smooth' });
            scrollContainer.componentRef.invokeMethodAsync("ScrolledToBottomAsync");
        };
        ScrollViewInterop.ScrollToTop = function (scrollContainer) {
            var handle = scrollContainer.querySelector(":scope > div.handle-container > .handle");
            var handleContainer = handle.parentElement;
            handleContainer.style.top = "0px";
            ScrollViewInterop.SetScrollHandleHeight(scrollContainer);
            var newHandleY = scrollContainer.ScrollPadding;
            handle.style.top = newHandleY + "px";
            scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            scrollContainer.componentRef.invokeMethodAsync("ScrolledToTopAsync");
        };
        ScrollViewInterop.IsAtBottom = function (scrollContainer) {
            return scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight;
        };
        ScrollViewInterop.IsAtTop = function (scrollContainer) {
            return scrollContainer.scrollTop <= 0;
        };
        ScrollViewInterop.InitializeGlobalHandlers = function () {
            if (!ScrollViewInterop.IsGlobalHandlersInitialized) {
                ScrollViewInterop.IsGlobalHandlersInitialized = true;
                document.addEventListener("mousedown", ScrollViewInterop.HandleMouseDown);
                document.addEventListener("mousemove", ScrollViewInterop.HandleMouseMove);
                document.addEventListener("mouseup", ScrollViewInterop.HandleMouseUp);
            }
        };
        ScrollViewInterop.OnScrollContainerMouseEnter = function (e) {
            var _a;
            var target = e.currentTarget;
            var parentScrollView = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.closest(".blazor-scrollview");
            if (parentScrollView != null) {
                parentScrollView === null || parentScrollView === void 0 ? void 0 : parentScrollView.classList.remove("active");
            }
            ScrollViewInterop.SetScrollHandleHeight(target);
            if (target.scrollHeight > target.getBoundingClientRect().height + ScrollViewInterop.ScrollHeightOffset) {
                target.classList.add("active");
            }
        };
        ScrollViewInterop.OnScrollContainerMouseLeave = function (e) {
            var _a;
            var target = e.currentTarget;
            target.classList.remove("active");
            var parentScrollView = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.closest(".blazor-scrollview");
            if (parentScrollView != null) {
                parentScrollView === null || parentScrollView === void 0 ? void 0 : parentScrollView.classList.add("active");
            }
        };
        ScrollViewInterop.HandleMouseDown = function (e) {
            var _a;
            var target = e.target;
            if (target.classList.contains("handle")) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                if (target.classList.contains("small") && !target.classList.contains("expanded"))
                    target === null || target === void 0 ? void 0 : target.classList.add("expanded");
                var scrollHandleContainer = target.parentElement;
                if (!(scrollHandleContainer === null || scrollHandleContainer === void 0 ? void 0 : scrollHandleContainer.classList.contains("expanded")))
                    scrollHandleContainer === null || scrollHandleContainer === void 0 ? void 0 : scrollHandleContainer.classList.add("expanded");
                var scrollContainer = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
                if (!(scrollContainer === null || scrollContainer === void 0 ? void 0 : scrollContainer.classList.contains("active")))
                    scrollContainer === null || scrollContainer === void 0 ? void 0 : scrollContainer.classList.add("active");
                ScrollViewInterop.CurrentHandleElement = target;
                ScrollViewInterop.CurrentHandleY = e.clientY;
            }
        };
        ScrollViewInterop.HandleMouseMove = function (e) {
            var _a;
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                var scrollContainer = (_a = ScrollViewInterop.CurrentHandleElement.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
                if (!(scrollContainer === null || scrollContainer === void 0 ? void 0 : scrollContainer.classList.contains("active")))
                    scrollContainer === null || scrollContainer === void 0 ? void 0 : scrollContainer.classList.add("active");
                var startY = ScrollViewInterop.CurrentHandleY;
                var displacement = e.clientY - startY;
                var decimalCorrection = (0.5 * displacement / Math.abs(displacement));
                if ((!ScrollViewInterop.IsAtTop(scrollContainer) && displacement < 0) ||
                    (!ScrollViewInterop.IsAtBottom(scrollContainer) && displacement > 0)) {
                    ScrollViewInterop.DoScroll(displacement, decimalCorrection);
                    ScrollViewInterop.CurrentHandleY = e.clientY + decimalCorrection;
                }
            }
        };
        ScrollViewInterop.DoScroll = function (displacement, decimalCorrection) {
            if (decimalCorrection === void 0) { decimalCorrection = 0; }
            var handle = ScrollViewInterop.CurrentHandleElement;
            var handleContainer = handle.parentElement;
            var scrollContainer = handleContainer.parentElement;
            var vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            scrollContainer.scrollTop += displacement * (vars[1] / vars[2]);
            var handleY = parseFloat(window.getComputedStyle(handle, null).top);
            var handleH = parseFloat(window.getComputedStyle(handle, null).height);
            var newHandleY = handleY + displacement + decimalCorrection;
            if (newHandleY <= scrollContainer.ScrollPadding) {
                newHandleY = scrollContainer.ScrollPadding;
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }
            if (newHandleY >= vars[0] - handleH - scrollContainer.ScrollPadding) {
                newHandleY = vars[0] - handleH - scrollContainer.ScrollPadding;
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }
            handleContainer.style.top = scrollContainer.scrollTop + "px";
            handle.style.top = newHandleY + "px";
            this.BroadcastScrollPosition(scrollContainer);
        };
        ScrollViewInterop.HandleMouseUp = function (e) {
            var _a, _b;
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                if (ScrollViewInterop.CurrentHandleElement.classList.contains("expanded"))
                    (_a = ScrollViewInterop.CurrentHandleElement) === null || _a === void 0 ? void 0 : _a.classList.remove("expanded");
                var scrollHandleContainer = ScrollViewInterop.CurrentHandleElement.parentElement;
                if (scrollHandleContainer === null || scrollHandleContainer === void 0 ? void 0 : scrollHandleContainer.classList.contains("expanded"))
                    scrollHandleContainer === null || scrollHandleContainer === void 0 ? void 0 : scrollHandleContainer.classList.remove("expanded");
                var scrollContainer = (_b = ScrollViewInterop.CurrentHandleElement.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement;
                if (scrollContainer === null || scrollContainer === void 0 ? void 0 : scrollContainer.classList.contains("active"))
                    scrollContainer === null || scrollContainer === void 0 ? void 0 : scrollContainer.classList.remove("active");
                ScrollViewInterop.CurrentHandleElement = null;
            }
        };
        ScrollViewInterop.HandleWheel = function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            clearTimeout(ScrollViewInterop.CurrentScrollAccelerationTimeoutId);
            var scrollContainer = e.currentTarget;
            if (!(scrollContainer === null || scrollContainer === void 0 ? void 0 : scrollContainer.classList.contains("active")) && scrollContainer.scrollHeight > scrollContainer.getBoundingClientRect().height + ScrollViewInterop.ScrollHeightOffset)
                scrollContainer === null || scrollContainer === void 0 ? void 0 : scrollContainer.classList.add("active");
            ScrollViewInterop.CurrentHandleElement = scrollContainer.querySelector(":scope > .handle-container > .handle");
            var vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            var a = (vars[0] / 20) / (vars[1] / vars[0]);
            var delta = Math.max(-1, Math.min(1, e.deltaY || -e.detail));
            if (delta != 0) {
                var dMultiplier = delta / Math.abs(delta);
                if (ScrollViewInterop.CurrentScrollAccelerationMultiplier * dMultiplier < 0)
                    ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
                ScrollViewInterop.DoScroll(a * dMultiplier + ScrollViewInterop.CurrentScrollAccelerationMultiplier * ScrollViewInterop.CurrentScrollAcceleration);
                ScrollViewInterop.CurrentScrollAccelerationMultiplier += dMultiplier;
                ScrollViewInterop.CurrentHandleElement = null;
                ScrollViewInterop.CurrentScrollAccelerationTimeoutId = setTimeout(function () {
                    ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
                }, 100);
            }
            return false;
        };
        ScrollViewInterop.SetScrollHandleHeight = function (scrollContainer) {
            var vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            var hv = vars[0];
            var ht = vars[1];
            var hs = vars[2];
            var hh = ScrollViewInterop.GetScrollHandleHeight(hv, hs, ht);
            var handle = scrollContainer.querySelector(":scope > .handle-container > .handle");
            handle.style.height = hh + "px";
            if (ScrollViewInterop.SmallHandleHeightCriterion >= hh && !handle.classList.contains("small"))
                handle.classList.add("small");
            if (ScrollViewInterop.SmallHandleHeightCriterion < hh && handle.classList.contains("small"))
                handle.classList.remove("small");
        };
        ScrollViewInterop.GetScrollHandleHeight = function (hv, hs, ht) {
            return hv * hs / ht;
        };
        ScrollViewInterop.ExtractVariables = function (scrollContainer) {
            var hv = parseFloat(window.getComputedStyle(scrollContainer, null).height);
            var hs = parseFloat(window.getComputedStyle(scrollContainer.querySelector(":scope > .handle-container"), null).height) - 2 * scrollContainer.ScrollPadding;
            var ht = scrollContainer.scrollHeight;
            return [hv, ht, hs];
        };
        ScrollViewInterop.BroadcastScrollPosition = function (scrollContainer) {
            var IsAtBottom = this.IsAtBottom(scrollContainer);
            var IsAtTop = this.IsAtTop(scrollContainer);
            scrollContainer.componentRef.invokeMethodAsync("DidScrollAsync");
            if (IsAtBottom) {
                scrollContainer.componentRef.invokeMethodAsync("ScrolledToBottomAsync");
            }
            if (IsAtTop) {
                scrollContainer.componentRef.invokeMethodAsync("ScrolledToTopAsync");
            }
        };
        ScrollViewInterop.GetScrollLineHeight = function () {
            var el = document.createElement('div');
            el.style.fontSize = 'initial';
            el.style.display = 'none';
            document.body.appendChild(el);
            var fontSize = window.getComputedStyle(el).fontSize;
            document.body.removeChild(el);
            return fontSize ? window.parseInt(fontSize) : this.ScrollLineHeight;
        };
        ScrollViewInterop.IsGlobalHandlersInitialized = false;
        ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
        ScrollViewInterop.CurrentScrollAcceleration = 0.2;
        ScrollViewInterop.CurrentScrollAccelerationTimeoutId = 0;
        ScrollViewInterop.ScrollLineHeight = 10;
        ScrollViewInterop.SmallHandleHeightCriterion = 10;
        ScrollViewInterop.ScrollHeightOffset = 5;
        ScrollViewInterop.ScrollPadding = 0;
        return ScrollViewInterop;
    }());
    BlazorScrollView.ScrollViewInterop = ScrollViewInterop;
})(BlazorScrollView || (BlazorScrollView = {}));
