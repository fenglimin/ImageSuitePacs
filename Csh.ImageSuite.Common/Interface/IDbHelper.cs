using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Model.Dicom;
using System.Data;
using Csh.ImageSuite.Model.Config;
using Csh.ImageSuite.Model.Enum;

namespace Csh.ImageSuite.Common.Interface
{
    public interface IDbHelper
    {
        IList<QueryShortcut> LoadQueryShortcuts();

        void SaveShortcut(QueryShortcut shortcut);

        void DeleteShortcut(string shortcutName);

        List<Study> GetStudies(QueryShortcut query, string sortPara, int pageNumber, out int pageCount);

        Study GetStudy(int serialNo, bool showKeyImage);

        Image GetImage(int serialNo);

        string GetImageRootDir(int serialNo);

        List<WorklistColumn> GetWorklistColumnConfig(string UserId, string UILanguage);

        List<OverlayItemConfig> LoadOverlays();

        List<OverlayItemConfig> LoadOverlayConfig(string moduleName, string language);

        int UpdateStudyScanStatus(string StudyInstanceUID, ScanStatus NewStatus);

        void SetReserved(string studyInstanceUID, ReservedStatus reserved);

        void DeletedStudy(string studyGUID, string deleteReason);

        List<Study> GetHasHistoryStudyUidArray(string studyUid, bool showKeyImage);

        void SetKeyImage(string sopInstanceUID, bool marked);

        List<string> GetKeyImageList(List<string> lstImageUidList);

        DataTable GetTableStudyOfflineRestoreMessage(string studyGUIDs, string strWhere);

        DataTable GetTableStudyOffline(string studyGUIDs, string strWhere);

        string GetStringStudyOffline(string studyGUIDs, string strWhere, out List<Study> studyInfoModelOfflineUIDList);


    }
}
