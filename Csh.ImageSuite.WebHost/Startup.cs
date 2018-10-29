using System.Web.Http;
using System.Web.Routing;
using Csh.ImageSuite.WebHost;
using Microsoft.Owin;
using Microsoft.Owin.Extensions;
using Microsoft.Owin.FileSystems;
using Microsoft.Owin.StaticFiles;
using Owin;

[assembly: OwinStartup(typeof(Startup))]
namespace Csh.ImageSuite.WebHost
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            var httpConfiguration = new HttpConfiguration();
            WebApiConfig.Register(httpConfiguration);

            RouteConfig.RegisterRoutes(RouteTable.Routes);

            app.UseWebApi(httpConfiguration);

            //Make .App folder as the default root for the static files
            app.UseFileServer(new FileServerOptions
            {
                RequestPath = new Microsoft.Owin.PathString(string.Empty),
                FileSystem = new PhysicalFileSystem("./AngularDist"),
                EnableDirectoryBrowsing = true
            });

            app.UseStageMarker(PipelineStage.MapHandler);
        }
    }
}