using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Model.Dicom;
using System.Data;
using Csh.ImageSuite.Model.Common;
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

        bool InsertCDJobList(List<string> studyUidList, ref List<string> logMsgList);

        DataTable GetTableStudyOnline(string studyGUIDs, string strWhere);

        void UpdateCDJobStatus(string studyUid);

        void AddCDJob(List<string> studyUidList);

        string GetDateFormat(out string strDateSeparator);

        int UpdatePatientEdit(Dictionary<string, string> dict);

        int SyncACQPatient(Dictionary<string, string> dict);

        int UpdateStudyEdit(Dictionary<string, string> dict);

        int UpdateSerieEdit(Dictionary<string, string> dict);

        bool SaveExportJob(string strLastExportFormat, string strLastExportIncludeCDViewer,
            string strLastExportJPGCompressRate, string strLastExportPatientInfoConfig, string strLastExportVerifyCDDVD,
            string userId, string roleID);

        DataTable GetTableNetAE();

        bool SaveTransferJob(List<OtherPacs> otherPacses, TransferJobCommandType commandType, TransferJobTableMdl model, bool m_bWholeStudy,
            bool m_bUpdateUID, int m_iCheckCompress, string ddlTransferCompressRateSelectIndex,
            string ddlTransferCompressRateSelectValue, string userId, string roleID);

        DataTable GetTableImage(string studyGUIDs, string serialGUIDs, string imageGUIDs);

        TransferJobTableMdl GetTransferJobTableMdl(List<string> netAEList, string studyGUIDs, string seriesGUIDs,
            string imageGUIDs);

        DataTable GetTableTransferCompress();

        DataSet GetAllTransferJobDS();

        DataSet GetAllTransferJobItemDS(string jobUID);

        bool SetJobStatus(string jobUID, string newStatus);

    }
}
