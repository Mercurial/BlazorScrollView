"use strict";
var BlazorScrollView;
(function (BlazorScrollView) {
    var ScrollViewInterop = /** @class */ (function () {
        function ScrollViewInterop() {
        }
        ScrollViewInterop.InitializeScrollView = function (scrollContainer) {
            var scrollHandleElement = document.createElement("div");
            scrollHandleElement.classList.add("handle");
            scrollContainer.appendChild(scrollHandleElement);
            ScrollViewInterop.SetScrollHandleHeight(scrollContainer);
        };
        ScrollViewInterop.SetScrollHandleHeight = function (scrollContainer) {
            var hv = parseFloat(window.getComputedStyle(scrollContainer, null).height);
            var ht = scrollContainer.scrollHeight;
            var hh = ScrollViewInterop.GetScrolLHandleHeight(hv, hv, ht);
            var handle = scrollContainer.querySelector(".handle");
            handle.style.height = hh + "px";
        };
        ScrollViewInterop.GetScrolLHandleHeight = function (hv, hs, ht) {
            return hv * hs / ht;
        };
        return ScrollViewInterop;
    }());
    BlazorScrollView.ScrollViewInterop = ScrollViewInterop;
})(BlazorScrollView || (BlazorScrollView = {}));
