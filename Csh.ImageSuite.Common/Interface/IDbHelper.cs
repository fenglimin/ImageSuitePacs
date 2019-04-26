using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Model.Dicom;
using System.Data;
using Csh.ImageSuite.Model.Enum;

namespace Csh.ImageSuite.Common.Interface
{
    public interface IDbHelper
    {
        IList<QueryShortcut> LoadQueryShortcuts();

        void SaveShortcut(QueryShortcut shortcut);

        void DeleteShortcut(string shortcutName);

        List<Study> GetStudies(QueryShortcut query, string sortPara, int pageNumber, out int pageCount);

        Study GetStudy(int serialNo);

        Image GetImage(int serialNo);

        string GetImageRootDir(int serialNo);

        List<WorklistColumn> GetWorklistColumnConfig(string UserId, string UILanguage);

        List<OverlayItemConfig> LoadOverlays();

        List<OverlayItemConfig> LoadOverlayConfig(string moduleName, string language);

        int UpdateStudyScanStatus(string StudyInstanceUID, ScanStatus NewStatus);

        void SetReserved(string studyInstanceUID, ReservedStatus reserved);

        void DeletedStudy(string studyGUID, string deleteReason);

    }
}
