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
            ScrollViewInterop.SetScrollHandleHeight(scrollContainer);
            ScrollViewInterop.InitializeGlobalHandlers();
        };
        ScrollViewInterop.UnInitializeScrollView = function (scrollContainer) {
            scrollContainer.removeEventListener("wheel", ScrollViewInterop.HandleWheel);
        };
        ScrollViewInterop.InitializeGlobalHandlers = function () {
            if (!ScrollViewInterop.IsGlobalHandlersInitialized) {
                ScrollViewInterop.IsGlobalHandlersInitialized = true;
                document.addEventListener("mousedown", ScrollViewInterop.HandleMouseDown);
                document.addEventListener("mousemove", ScrollViewInterop.HandleMouseMove);
                document.addEventListener("mouseup", ScrollViewInterop.HandleMouseUp);
            }
        };
        ScrollViewInterop.HandleMouseDown = function (e) {
            var target = e.target;
            if (target.classList.contains("handle")) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                ScrollViewInterop.CurrentHandleElement = target;
                ScrollViewInterop.CurrentHandleY = e.clientY;
            }
        };
        ScrollViewInterop.HandleMouseMove = function (e) {
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
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
            newHandleY = newHandleY <= 0 ? 0 : newHandleY;
            newHandleY = newHandleY >= vars[0] - handleH ? vars[0] - handleH : newHandleY;
            handleContainer.style.top = scrollContainer.scrollTop + "px";
            handle.style.top = newHandleY + "px";
        };
        ScrollViewInterop.HandleMouseUp = function (e) {
            if (ScrollViewInterop.CurrentHandleElement) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                ScrollViewInterop.CurrentHandleElement = null;
            }
        };
        ScrollViewInterop.HandleWheel = function (e) {
            var scrollContainer = e.currentTarget;
            ScrollViewInterop.CurrentHandleElement = scrollContainer.querySelector(".handle");
            var delta = Math.max(-3, Math.min(3, e.deltaY || -e.detail));
            console.log(delta);
            ScrollViewInterop.DoScroll(delta);
            ScrollViewInterop.CurrentHandleElement = null;
            return false;
        };
        ScrollViewInterop.SetScrollHandleHeight = function (scrollContainer) {
            var vars = ScrollViewInterop.ExtractVariables(scrollContainer);
            var hv = vars[0];
            var ht = vars[1];
            var hh = ScrollViewInterop.GetScrollHandleHeight(hv, hv, ht);
            var handle = scrollContainer.querySelector(".handle");
            handle.style.height = hh + "px";
        };
        ScrollViewInterop.GetScrollHandleHeight = function (hv, hs, ht) {
            return hv * hs / ht;
        };
        ScrollViewInterop.ExtractVariables = function (scrollContainer) {
            var hv = parseFloat(window.getComputedStyle(scrollContainer, null).height);
            var ht = scrollContainer.scrollHeight;
            return [hv, ht];
        };
        ScrollViewInterop.IsGlobalHandlersInitialized = false;
        return ScrollViewInterop;
    }());
    BlazorScrollView.ScrollViewInterop = ScrollViewInterop;
})(BlazorScrollView || (BlazorScrollView = {}));
