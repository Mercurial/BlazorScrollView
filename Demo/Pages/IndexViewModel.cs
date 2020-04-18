using Microsoft.AspNetCore.Components;
using System.Threading.Tasks;
using BlazorScrollView;
using System;

namespace BlazorScrollView.Demo
{
    public class IndexViewModel : ComponentBase
    {
        protected ScrollView ScrollView1 { get; set; }
        protected ScrollView ScrollView2 { get; set; }
        protected int NoOfItems { get; set; }

        protected async override Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {

            }
            await base.OnAfterRenderAsync(firstRender);
        }

        protected void ScrollToBottom(ScrollView scrollView)
        {
            scrollView.ScrollToBottom();
        }

        protected void ScrollToTop(ScrollView scrollView)
        {
            scrollView.ScrollToTop();
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

        protected void AddItems()
        {
            NoOfItems++;
            ScrollView2.ScrollToBottom();
        }
    }
}
