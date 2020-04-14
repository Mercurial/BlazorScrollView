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
        #endregion

        #region Public Properties
        public ElementReference ScrollViewContainerRef { get; set; }
        public bool IsAtBottom { get; set; }
        #endregion

        public ScrollViewViewModel() { }

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {

            if (firstRender)
            {
                await JSRuntime.InvokeVoidAsync("BlazorScrollView.ScrollViewInterop.InitializeScrollView", ScrollViewContainerRef);
            }

            await base.OnAfterRenderAsync(firstRender);
        }

        public async Task ScrollToBottom()
        {
            await JSRuntime.InvokeVoidAsync("BlazorScrollView.ScrollViewInterop.ScrollToBottom", ScrollViewContainerRef);
            IsAtBottom = true;
        }

        public async void OnMouseWheel(MouseEventArgs e)
        {
            // Check if at bottom
            IsAtBottom = await JSRuntime.InvokeAsync<bool>("BlazorScrollView.ScrollViewInterop.IsAtBottom", ScrollViewContainerRef);
        }

        public void Dispose()
        {
            JSRuntime.InvokeVoidAsync("BlazorScrollView.ScrollViewInterop.UnInitializeScrollView", ScrollViewContainerRef);
        }
    }
}