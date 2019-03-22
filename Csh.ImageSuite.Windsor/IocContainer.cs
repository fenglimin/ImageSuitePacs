using System;
using System.Reflection;
using System.Runtime.CompilerServices;
using Castle.Facilities.TypedFactory;
using Castle.MicroKernel.Resolvers.SpecializedResolvers;
using Castle.Windsor;
using Castle.Windsor.Installer;

namespace Csh.ImageSuite.Windsor
{
    /// <summary>
    /// the Castle Windsor IoC container, contain a singleton instance of <see cref="IWindsorContainer" />.
    /// </summary>
    public static class IoCContainer
    {
        /// <summary>
        /// the windsor container object.
        /// </summary>
        private static IWindsorContainer _container;

        /// <summary>
        /// the sync lock.
        /// </summary>
        private static readonly object SyncRoot = new object();

        /// <summary>
        /// the Windsor Container instance.
        /// </summary>
        public static IWindsorContainer Instance
        {
            // Uses the MethodImpl attribute to make sure this property is not inline so we gets the correct assembly instance
            [MethodImpl(MethodImplOptions.NoInlining)]
            get
            {
                if (_container == null)
                {
                    lock (SyncRoot)
                    {
                        if (_container == null)
                        {
                            //  Create the container
                            var windsorContainer = new WindsorContainer();

                            //  allow dependency injection of collections
                            //  http://stw.castleproject.org/Default.aspx?Page=Resolvers&NS=Windsor
                            windsorContainer.Kernel.Resolver.AddSubResolver(new CollectionResolver(windsorContainer.Kernel, true));

                            //  allow container to auto-implement interfaces as factory classes,
                            //  used for IJobFactory
                            //  http://stw.castleproject.org/Windsor.Typed-Factory-Facility.ashx
                            windsorContainer.AddFacility<TypedFactoryFacility>();

                            // install the Windsor installer in side this assembly
                            windsorContainer.Install(FromAssembly.This());

                            // install installer.
                            windsorContainer.Install(FromAssembly.Named("Csh.ImageSuite.Common"));
                            windsorContainer.Install(FromAssembly.Named("Csh.ImageSuite.MiniPacs"));
                            windsorContainer.Install(FromAssembly.Named("Csh.ImageSuite.WebHost"));

                            // install the entry assembly's installer.
                            var entryAssembly = Assembly.GetEntryAssembly();
                            if (entryAssembly != null)
                            {
                                windsorContainer.Install(FromAssembly.Instance(entryAssembly));
                            }

                            var callingAssembly = Assembly.GetCallingAssembly();
                            windsorContainer.Install(FromAssembly.Instance(callingAssembly));

                            _container = windsorContainer;
                        }
                    }
                }
                return _container;
            }
        }

        /// <summary>
        /// Reset the windsor container to default state.
        /// </summary>
        public static void Reset()
        {
            lock (SyncRoot)
            {
                _container = null;
            }
        }
    }
}