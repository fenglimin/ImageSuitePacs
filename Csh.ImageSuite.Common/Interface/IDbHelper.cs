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

        void SaveShortcut(QueryShortcut shortcut);

        void DeleteShortcut(string shortcutName);

        IList<Study> GetStudies(QueryShortcut query);

        Study GetStudy(int serialNo);

        Image GetImage(int serialNo);

        string GetImageRootDir(int serialNo);
    }
}
