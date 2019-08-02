using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Csh.ImageSuite.Model.Enum
{
    class WorklistEnum
    {
    }

    public enum TransferJobCommandType
    {
        ID_COMMAND_CACHE = 1,
        ID_COMMAND_PUSHPATIENT = 2,
        ID_COMMAND_PULLPATIENT = 3,
        ID_COMMAND_PUSHIMAGES = 4,
        ID_COMMAND_PULLIMAGES = 5,
        ID_COMMAND_FTPUPPATIENT = 6,
        ID_COMMAND_FTPUPIMAGES = 7
    }


}
