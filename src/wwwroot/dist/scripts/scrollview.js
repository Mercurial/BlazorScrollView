"use strict";
var BlazorScrollView;
(function (BlazorScrollView) {
    var ScrollViewInterop = /** @class */ (function () {
        function ScrollViewInterop() {
        }
        ScrollViewInterop.InitializeScrollView = function (scrollContainer, componentRef) {
            var scrollHandleElement = document.createElement("div");
            scrollHandleElement.classList.add("handle");
            var scrollHandleContainerElement = document.createElement("div");
            scrollHandleContainerElement.classList.add("handle-container");
            scrollHandleContainerElement.appendChild(scrollHandleElement);
            scrollContainer.appendChild(scrollHandleContainerElement);
            scrollContainer.addEventListener("wheel", ScrollViewInterop.HandleWheel);
            scrollContainer.addEventListener("mouseenter", ScrollViewInterop.OnScrollContainerMouseEnter);
            scrollContainer.addEventListener("mouseleave", ScrollViewInterop.OnScrollContainerMouseLeave);
            scrollContainer.componentRef = componentRef;
            ScrollViewInterop.SetScrollHandleHeight(scrollContainer);
            ScrollViewInterop.InitializeGlobalHandlers();
        };
        ScrollViewInterop.UnInitializeScrollView = function (scrollContainer) {
            scrollContainer.removeEventListener("wheel", ScrollViewInterop.HandleWheel);
            scrollContainer.removeEventListener("mouseenter", ScrollViewInterop.OnScrollContainerMouseEnter);
            scrollContainer.removeEventListener("mouseleave", ScrollViewInterop.OnScrollContainerMouseLeave);
        };
        ScrollViewInterop.ScrollToBottom = function (scrollContainer) {
            var handle = scrollContainer.parentElement ? scrollContainer.parentElement.querySelector("#" + scrollContainer.id + " > div.handle-container > .handle") : null;
            if (handle) {
                var handleContainer = handle.parentElement;
                var yPosition = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                handleContainer.style.top = yPosition + "px";
                var newHandleY = scrollContainer.clientHeight - parseFloat(window.getComputedStyle(handle, null).height);
                handle.style.top = newHandleY + "px";
                scrollContainer.scrollTo({ top: yPosition, left: 0, behavior: 'smooth' });
                scrollContainer.componentRef.invokeMethodAsync("ScrolledToBottom");
            }
        };
        ScrollViewInterop.ScrollToTop = function (scrollContainer) {
            var handle = scrollContainer.parentElement ? scrollContainer.parentElement.querySelector("#" + scrollContainer.id + " > div.handle-container > .handle") : null;
            if (handle) {
                var handleContainer = handle.parentElement;
                var yPosition = 0;
                handleContainer.style.top = yPosition + "px";
                var newHandleY = 0;
                handle.style.top = newHandleY + "px";
                scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                scrollContainer.componentRef.invokeMethodAsync("ScrolledToTop");
            }
        };
        ScrollViewInterop.IsAtBottom = function (scrollContainer) {
            return scrollContainer.scrollTop === (scrollContainer.scrollHeight - scrollContainer.offsetHeight);
        };
        ScrollViewInterop.IsAtTop = function (scrollContainer) {
            return scrollContainer.scrollTop === 0;
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
            target.classList.add("active");
            ScrollViewInterop.SetScrollHandleHeight(target);
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
                ScrollViewInterop.DoScroll(displacement);
                ScrollViewInterop.CurrentHandleY = e.clientY;
            }
        };
        ScrollViewInterop.DoScroll = function (displacement) {
            var handle = ScrollViewInterop.CurrentHandleElement;
            var handleContainer = handle.parentElement;
            var scrollContainer = handleContainer.parentElement;
            var vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            scrollContainer.scrollTop += displacement * (vars[1] / vars[0]);
            var handleY = parseFloat(window.getComputedStyle(handle, null).top);
            var handleH = parseFloat(window.getComputedStyle(handle, null).height);
            var newHandleY = handleY + displacement;
            if (newHandleY <= 0) {
                newHandleY = 0;
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }
            if (newHandleY >= vars[0] - handleH) {
                newHandleY = vars[0] - handleH;
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }
            handleContainer.style.top = scrollContainer.scrollTop + "px";
            handle.style.top = newHandleY + "px";
            this.BroadcastScrollPosition(scrollContainer);
        };
        ScrollViewInterop.HandleMouseUp = function (e) {
            var _a;
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                var scrollContainer = (_a = ScrollViewInterop.CurrentHandleElement.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
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
            if (!(scrollContainer === null || scrollContainer === void 0 ? void 0 : scrollContainer.classList.contains("active")))
                scrollContainer === null || scrollContainer === void 0 ? void 0 : scrollContainer.classList.add("active");
            //ScrollViewInterop.CurrentHandleElement = scrollContainer.querySelector(".handle");
            ScrollViewInterop.CurrentHandleElement = scrollContainer.parentElement ? scrollContainer.parentElement.querySelector("#" + scrollContainer.id + " > div.handle-container > .handle") : null;
            var vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            var a = (vars[0] / 20) / (vars[1] / vars[0]);
            var delta = Math.max(-1, Math.min(1, e.deltaY || -e.detail));
            var dMultiplier = delta / Math.abs(delta);
            if (ScrollViewInterop.CurrentScrollAccelerationMultiplier * dMultiplier < 0)
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            ScrollViewInterop.DoScroll(a * dMultiplier + ScrollViewInterop.CurrentScrollAccelerationMultiplier * ScrollViewInterop.CurrentScrollAcceleration);
            ScrollViewInterop.CurrentScrollAccelerationMultiplier += dMultiplier;
            ScrollViewInterop.CurrentHandleElement = null;
            ScrollViewInterop.CurrentScrollAccelerationTimeoutId = setTimeout(function () {
                ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
            }, 100);
            return false;
        };
        ScrollViewInterop.SetScrollHandleHeight = function (scrollContainer) {
            var vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            var hv = vars[0];
            var ht = vars[1];
            var hs = vars[2];
            var hh = ScrollViewInterop.GetScrollHandleHeight(hv, hs, ht);
            var handle = scrollContainer.querySelector(".handle");
            handle.style.height = hh + "px";
        };
        ScrollViewInterop.GetScrollHandleHeight = function (hv, hs, ht) {
            return hv * hs / ht;
        };
        ScrollViewInterop.ExtractVariables = function (scrollContainer) {
            var hv = parseFloat(window.getComputedStyle(scrollContainer, null).height);
            var hs = parseFloat(window.getComputedStyle(scrollContainer.querySelector(".handle-container"), null).height);
            var ht = scrollContainer.scrollHeight;
            return [hv, ht, hs];
        };
        ScrollViewInterop.BroadcastScrollPosition = function (scrollContainer) {
            var IsAtBottom = this.IsAtBottom(scrollContainer);
            var IsAtTop = this.IsAtTop(scrollContainer);
            scrollContainer.componentRef.invokeMethodAsync("DidScroll");
            if (IsAtBottom) {
                scrollContainer.componentRef.invokeMethodAsync("ScrolledToBottom");
            }
            if (IsAtTop) {
                scrollContainer.componentRef.invokeMethodAsync("ScrolledToTop");
            }
        };
        ScrollViewInterop.IsGlobalHandlersInitialized = false;
        ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
        ScrollViewInterop.CurrentScrollAcceleration = 0.2;
        ScrollViewInterop.CurrentScrollAccelerationTimeoutId = 0;
        return ScrollViewInterop;
    }());
    BlazorScrollView.ScrollViewInterop = ScrollViewInterop;
})(BlazorScrollView || (BlazorScrollView = {}));
