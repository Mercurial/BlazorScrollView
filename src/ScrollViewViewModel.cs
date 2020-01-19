using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace BlazorScrollView
{
    public class ScrollViewViewModel : ComponentBase
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

    }
}