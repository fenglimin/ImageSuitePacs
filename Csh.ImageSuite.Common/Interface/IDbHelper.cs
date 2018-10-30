using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Model.Dicom;

namespace Csh.ImageSuite.Common.Interface
{
    public interface IDbHelper
    {
        IList<QueryShortcut> LoadQueryShortcuts();
    }
}
