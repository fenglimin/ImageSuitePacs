using System.Web.Mvc;
using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using Castle.Windsor;

namespace Csh.ImageSuite.WebHost.Windsor
{
    public class ControllerInstaller : IWindsorInstaller
    {
        public void Install(IWindsorContainer container, IConfigurationStore store)
        {
            container.Register(Classes.FromThisAssembly() //在哪里找寻接口或类  
                .BasedOn<IController>() //实现IController接口  
                .Configure(c => c.LifestylePerWebRequest()));//每次请求创建一个Controller实例  
        }
    }
}