using System;
using Microsoft.AspNetCore.Components;

namespace BlazorScrollView
{
    public class ScrollViewViewModel : ComponentBase
    {
        [Parameter]
        public RenderFragment ChildContent { get; set; }
        public ScrollViewViewModel() { }

    }
}