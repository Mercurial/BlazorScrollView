using Microsoft.AspNetCore.Components;
using System.Threading.Tasks;
using BlazorScrollView;
using System;

namespace BlazorScrollView.Demo
{
    public class IndexViewModel : ComponentBase
    {
        protected ScrollView ScrollView1 { get; set; }

        protected async override Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {

            }
            await base.OnAfterRenderAsync(firstRender);
        }

        protected async void ScrollToBottomAsync(ScrollView scrollView)
        {
            await scrollView.ScrollToBottomAsync();
        }

        protected async void ScrollToTopAsync(ScrollView scrollView)
        {
            await scrollView.ScrollToTopAsync();
        }

        protected void OnScrollToBottom1()
        {
            Console.WriteLine("Reached bottom in ScrollView1");
        }

        protected void OnScrollToTop1()
        {
            Console.WriteLine("Reached top in ScrollView1");
        }

        protected void OnScroll1()
        {
            Console.WriteLine("ScrollView1 did scroll");
        }
    }
}
