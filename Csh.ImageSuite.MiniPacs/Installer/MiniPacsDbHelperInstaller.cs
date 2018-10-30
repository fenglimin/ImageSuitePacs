using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using Castle.Windsor;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Enum;

namespace Csh.ImageSuite.MiniPacs.Installer
{
    public class MiniPacsDbHelperInstaller : IWindsorInstaller
    {
        public void Install(IWindsorContainer container, IConfigurationStore store)
        {
            container.Register(Component.For<IDbHelper>()
                .ImplementedBy<MiniPacsDbHelper>()
                .Named(PacsType.MiniPacs.ToString())
                .LifeStyle.Singleton);
        }
    }
}
