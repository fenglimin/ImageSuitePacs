using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using Castle.Windsor;
using Csh.ImageSuite.MiniPacs.Interface;

namespace Csh.ImageSuite.MiniPacs.Installer
{
    public class MiniPacsDicomHelperInstaller : IWindsorInstaller
    {
        public void Install(IWindsorContainer container, IConfigurationStore store)
        {
            container.Register(Component.For<IMiniPacsDicomHelper>()
                .ImplementedBy<MiniPacsDicomHelper>()
                .LifeStyle.Singleton);
        }
    }
}