using Csh.ImageSuite.Model.Enum;

namespace Csh.ImageSuite.Common.Interface
{
    public interface IPacsCoordinator
    {
        void SetPacsType(PacsType pacsType);

        IDbHelper GetDbHelper();
    }
}