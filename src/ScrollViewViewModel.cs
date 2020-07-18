using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;

namespace BlazorScrollView
{
    public class ScrollViewViewModel : ComponentBase, IDisposable
    {
        #region Dependency Injection
        [Inject]
        protected IJSRuntime JSRuntime { get; set; }
        #endregion

        #region Parameters
        [Parameter]
        public string Id { get; set; }

        [Parameter]
        public string Class { get; set; }

        [Parameter]
        public RenderFragment ChildContent { get; set; }

        [Parameter]
        public EventCallback OnScrollToBottom { get; set; }

        [Parameter]
        public EventCallback OnScrollToTop { get; set; }

        [Parameter]
        public EventCallback OnScroll { get; set; }

        [Parameter]
        public int ScrollPadding { get; set; } = 0;
        #endregion

        #region Public Properties
        public ElementReference ScrollViewContainerRef { get; set; }
		#endregion

		#region Protected Properties
		protected bool IsInitialized { get; set; } = false;
		protected bool ShouldScrollToBottomOnRerender { get; set; }
        protected bool ShouldScrollToTopOnRerender { get; set; }
        #endregion

        public ScrollViewViewModel() { }

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {

            if (firstRender)
            {
                await JSRuntime.InvokeVoidAsync("BlazorScrollView.ScrollViewInterop.InitializeScrollView", ScrollViewContainerRef, ScrollPadding, DotNetObjectReference.Create(this));
				IsInitialized = true;
			}
            await base.OnAfterRenderAsync(firstRender);
        }

        public async void ScrollToBottom()
        {
            await JSRuntime.InvokeVoidAsync("BlazorScrollView.ScrollViewInterop.ScrollToBottom", ScrollViewContainerRef);
        }

        public async void ScrollToTop()
        {
            await JSRuntime.InvokeVoidAsync("BlazorScrollView.ScrollViewInterop.ScrollToTop", ScrollViewContainerRef);
        }


        [JSInvokable]
        public async void ScrolledToBottomAsync()
        {
            if (OnScrollToBottom.HasDelegate)
                await OnScrollToBottom.InvokeAsync(new EventArgs());
        }

        [JSInvokable]
        public async void ScrolledToTopAsync()
        {
            if (OnScrollToTop.HasDelegate)
                await OnScrollToTop.InvokeAsync(new EventArgs());
        }

        [JSInvokable]
        public async void DidScrollAsync()
        {
            if (OnScroll.HasDelegate)
                await OnScroll.InvokeAsync(new EventArgs());
        }


        public void Dispose()
        {
			JSRuntime.InvokeVoidAsync("BlazorScrollView.ScrollViewInterop.UnInitializeScrollView", ScrollViewContainerRef);
        }
    }
}