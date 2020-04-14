"use strict";
var BlazorScrollView;
(function (BlazorScrollView) {
    var ScrollViewInterop = /** @class */ (function () {
        function ScrollViewInterop() {
        }
        ScrollViewInterop.InitializeScrollView = function (scrollContainer) {
            var scrollHandleElement = document.createElement("div");
            scrollHandleElement.classList.add("handle");
            var scrollHandleContainerElement = document.createElement("div");
            scrollHandleContainerElement.classList.add("handle-container");
            scrollHandleContainerElement.appendChild(scrollHandleElement);
            scrollContainer.appendChild(scrollHandleContainerElement);
            scrollContainer.addEventListener("wheel", ScrollViewInterop.HandleWheel);
            scrollContainer.addEventListener("mouseenter", ScrollViewInterop.OnScrollContainerMouseEnter);
            scrollContainer.addEventListener("mouseleave", ScrollViewInterop.OnScrollContainerMouseLeave);
            ScrollViewInterop.SetScrollHandleHeight(scrollContainer);
            ScrollViewInterop.InitializeGlobalHandlers();
        };
        ScrollViewInterop.UnInitializeScrollView = function (scrollContainer) {
            scrollContainer.removeEventListener("wheel", ScrollViewInterop.HandleWheel);
            scrollContainer.removeEventListener("mouseenter", ScrollViewInterop.OnScrollContainerMouseEnter);
            scrollContainer.removeEventListener("mouseleave", ScrollViewInterop.OnScrollContainerMouseLeave);
        };
        ScrollViewInterop.ScrollToBottom = function (scrollContainer) {
            var bototmOffset = scrollContainer.scrollHeight - scrollContainer.offsetHeight;
            ScrollViewInterop.CurrentHandleElement = scrollContainer.parentElement ? scrollContainer.parentElement.querySelector("#" + scrollContainer.id + " > div.handle-container > .handle") : null;
            ScrollViewInterop.DoScroll(bototmOffset);
            ScrollViewInterop.CurrentHandleElement = null;
        };
        ScrollViewInterop.IsAtBottom = function (scrollContainer) {
            return scrollContainer.scrollTop === (scrollContainer.scrollHeight - scrollContainer.offsetHeight);
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
            var _a, _b;
            var target = e.currentTarget;
            var parentScrollView = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.closest(".blazor-scrollview");
            if (parentScrollView != null) {
                (_b = parentScrollView) === null || _b === void 0 ? void 0 : _b.classList.remove("active");
            }
            target.classList.add("active");
            ScrollViewInterop.SetScrollHandleHeight(target);
        };
        ScrollViewInterop.OnScrollContainerMouseLeave = function (e) {
            var _a, _b;
            var target = e.currentTarget;
            target.classList.remove("active");
            var parentScrollView = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.closest(".blazor-scrollview");
            if (parentScrollView != null) {
                (_b = parentScrollView) === null || _b === void 0 ? void 0 : _b.classList.add("active");
            }
        };
        ScrollViewInterop.HandleMouseDown = function (e) {
            var _a, _b, _c;
            var target = e.target;
            if (target.classList.contains("handle")) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                var scrollContainer = (_a = target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
                if (!((_b = scrollContainer) === null || _b === void 0 ? void 0 : _b.classList.contains("active")))
                    (_c = scrollContainer) === null || _c === void 0 ? void 0 : _c.classList.add("active");
                ScrollViewInterop.CurrentHandleElement = target;
                ScrollViewInterop.CurrentHandleY = e.clientY;
            }
        };
        ScrollViewInterop.HandleMouseMove = function (e) {
            var _a, _b, _c;
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                var scrollContainer = (_a = ScrollViewInterop.CurrentHandleElement.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
                if (!((_b = scrollContainer) === null || _b === void 0 ? void 0 : _b.classList.contains("active")))
                    (_c = scrollContainer) === null || _c === void 0 ? void 0 : _c.classList.add("active");
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
        };
        ScrollViewInterop.HandleMouseUp = function (e) {
            var _a, _b, _c;
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                var scrollContainer = (_a = ScrollViewInterop.CurrentHandleElement.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
                if ((_b = scrollContainer) === null || _b === void 0 ? void 0 : _b.classList.contains("active"))
                    (_c = scrollContainer) === null || _c === void 0 ? void 0 : _c.classList.remove("active");
                ScrollViewInterop.CurrentHandleElement = null;
            }
        };
        ScrollViewInterop.HandleWheel = function (e) {
            var _a, _b;
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
            clearTimeout(ScrollViewInterop.CurrentScrollAccelerationTimeoutId);
            var scrollContainer = e.currentTarget;
            if (!((_a = scrollContainer) === null || _a === void 0 ? void 0 : _a.classList.contains("active")))
                (_b = scrollContainer) === null || _b === void 0 ? void 0 : _b.classList.add("active");
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
        ScrollViewInterop.IsGlobalHandlersInitialized = false;
        ScrollViewInterop.CurrentScrollAccelerationMultiplier = 0;
        ScrollViewInterop.CurrentScrollAcceleration = 0.2;
        ScrollViewInterop.CurrentScrollAccelerationTimeoutId = 0;
        return ScrollViewInterop;
    }());
    BlazorScrollView.ScrollViewInterop = ScrollViewInterop;
})(BlazorScrollView || (BlazorScrollView = {}));
