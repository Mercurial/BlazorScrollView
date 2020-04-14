using Microsoft.AspNetCore.Components;
using System.Threading.Tasks;
using BlazorScrollView;
namespace BlazorScrollView.Demo
{
    public class IndexViewModel : ComponentBase
    {
        protected ScrollView ScrollView4 { get; set; }
        protected ScrollView ScrollView5 { get; set; }

        protected async override Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {

            }
            await base.OnAfterRenderAsync(firstRender);

        }

        protected async void OnClick(ScrollView scrollView)
        {
            await scrollView.ScrollToBottom();
        }
    }
}
