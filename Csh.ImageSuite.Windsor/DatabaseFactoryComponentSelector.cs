using System.Reflection;
using Castle.Facilities.TypedFactory;
using Csh.ImageSuite.Model.Enum;

namespace Csh.ImageSuite.Windsor
{
    public class DatabaseFactoryComponentSelector : DefaultTypedFactoryComponentSelector
    {
        /// <summary>
        /// Get component by method name.
        /// </summary>
        protected override string GetComponentName(MethodInfo method, object[] arguments)
        {
            if (method.Name == "Create" && arguments.Length == 1 && arguments[0].GetType() == typeof(PacsType))
            {
                return arguments[0].ToString();
            }
            return base.GetComponentName(method, arguments);
        }
    }
}
