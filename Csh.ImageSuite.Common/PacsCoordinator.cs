using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Enum;


namespace Csh.ImageSuite.Common
{
    public class PacsCoordinator : IPacsCoordinator
    {
        private PacsType _pacsType;
        private readonly IDatabaseFactoryComponentSelector _databaseFactoryComponentSelector;

        public PacsCoordinator(IDatabaseFactoryComponentSelector databaseFactoryComponentSelector)
        {
            _databaseFactoryComponentSelector = databaseFactoryComponentSelector;
            _pacsType = PacsType.MiniPacs;
        }

        public void SetPacsType(PacsType pacsType)
        {
            _pacsType = pacsType;
        }

        public IDbHelper GetCurrentDbHelper()
        {
            return _databaseFactoryComponentSelector.Create(_pacsType);
        }

        public IDbHelper GetDbHelper(PacsType pacsType)
        {
            return _databaseFactoryComponentSelector.Create(pacsType);
        }
    }
}