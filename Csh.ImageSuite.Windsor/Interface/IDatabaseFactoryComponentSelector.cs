using Csh.ImageSuite.Model.Enum;
using Csh.ImageSuite.Common.Interface;


namespace Csh.ImageSuite.Windsor.Interface
{
    public interface IDatabaseFactoryComponentSelector
    {
        IDbHelper Create(PacsType type);
    }
}
