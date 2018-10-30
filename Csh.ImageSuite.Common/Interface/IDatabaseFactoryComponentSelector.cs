using Csh.ImageSuite.Model.Enum;

namespace Csh.ImageSuite.Common.Interface
{
    public interface IDatabaseFactoryComponentSelector
    {
        IDbHelper Create(PacsType type);
    }
}
