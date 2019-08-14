using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
using System.Xml;
//using System.Web.UI.WebControls;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.MiniPacs.CompressHelper;
using Csh.ImageSuite.Model.Common;
using Csh.ImageSuite.Model.Dicom;
using Csh.ImageSuite.Model.Enum;


namespace Csh.ImageSuite.WebHost.Controllers
{
    public class WorklistController : Controller
    {
        private readonly ICommonTool _commonTool;
        private readonly IDbHelper _dbHelper;


        public WorklistController(IPacsCoordinator pacsCoordinator, ICommonTool commonTool)
        {
            _dbHelper = pacsCoordinator.GetCurrentDbHelper();
            _commonTool = commonTool;
        }


        // GET: Worklist
        public ActionResult Index()
        {
            return View();
        }

        // GET: Worklist/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: Worklist/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Worklist/Create
        [HttpPost]
        public ActionResult Create(FormCollection collection)
        {
            try
            {
                // TODO: Add insert logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        // GET: Worklist/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: Worklist/Edit/5
        [HttpPost]
        public ActionResult Edit(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add update logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        // GET: Worklist/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: Worklist/Delete/5
        [HttpPost]
        public ActionResult Delete(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add delete logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        [HttpPost]
        public string GetOtherPacs()
        {
            List<OtherPacs> otherPacsList = new List<OtherPacs>();

            DataTable dt =  _dbHelper.GetTableNetAE();

            foreach (DataRow row in dt.Rows)
            {
                OtherPacs otherPacs = new OtherPacs();

                string strStorageCommitment = row["StorageCommitment"].ToString().Trim();
                if (strStorageCommitment == "1")
                {
                    otherPacs.StorageCommitment = "Yes";
                }
                else
                {
                    otherPacs.StorageCommitment = "No";
                }

                otherPacs.NetAEName = row["NetAEName"].ToString().Trim();
                otherPacs.AETitle = row["AETitle"].ToString().Trim();
                otherPacs.IPAddress = row["IPAddress"].ToString().Trim();
                //otherPacs.StorageCommitment = row["StorageCommitment"].ToString();

                otherPacsList.Add(otherPacs);
            }

            return _commonTool.GetJsonStringFromObject(otherPacsList);
        }

        [HttpPost]
        public string DoTransfer(RevTransferMdl transferMdl)
        {
            bool doTransferResult = false;

            TransferJobTableMdl model = this.GetTransferJobModel(transferMdl);

            bool isWholeStudy = transferMdl.IsCheckAll;

            int checkCompress = 0;

            if (int.Parse(transferMdl.TransferCompressType) < 0)
            {
                checkCompress = 0;
            }
            else
            {
                checkCompress = 1;
            }

            doTransferResult = _dbHelper.SaveTransferJob(transferMdl.PacsList, 
                TransferJobCommandType.ID_COMMAND_PUSHIMAGES, model, isWholeStudy, transferMdl.IsCreateNewGuid,
                checkCompress, transferMdl.TransferCompressType, transferMdl.TransferCompressType, 
                "admin", "administrator");

            return _commonTool.GetJsonStringFromObject(doTransferResult);
        }

        [HttpPost]
        public string DoExportJob(RevExportMdl exportMdl)
        {
            Session["DoExportStudyModel"] = null;

            ExportStudyModel model = new ExportStudyModel();

            try
            {
                
                List<string> ImageUidList = exportMdl.ImageList.Select(i => i.SopInstanceUid).ToList();
                //List<string> studyUidList = StringWrapper.ConvertStringToList(strStudyInstanceUIDList);

                //string strPatientId = StudyBLL.GetPatientIdByStudyUID(studyUidList[0]);
                //string strLastExportIncludeCDViewer = bImageIncludeDicomViewer ? "Y" : "N";
                //string strLastExportVerifyCDDVD = bImageBurningDicomViewCD ? "Y" : "N";

                //List<string> studyUidList = new List<string>();
                string strPatientId = exportMdl.StudyList[0].Patient.PatientId;
                string strLastExportIncludeCDViewer = exportMdl.IsImageIncludeDicomViewer ? "Y" : "N";
                string strLastExportVerifyCDDVD = exportMdl.IsImageBurningDicomViewCD ? "Y" : "N";
                string strImageType = exportMdl.ImageType;
                bool bImageIncludeDicomViewer = exportMdl.IsImageIncludeDicomViewer;
                bool bImageBurningDicomViewCD = true;

                _dbHelper.SaveExportJob(strImageType, strLastExportIncludeCDViewer, "1", "8", strLastExportVerifyCDDVD, "admin", "administrator");

                //int imageType = Convert.ToInt16(strImageType);
                //ExportJobDownloadImageType exportJobEnum = imageType.ToEnum<ExportJobDownloadImageType>(ExportJobDownloadImageType.JPEG);
                ExportJobDownloadImageType exportJobEnum = ExportJobDownloadImageType.JPEG;
                model.ExportJobDownloadImageType = exportJobEnum;
                //model.RptFolderPath = GXWebUtil.GetRPTCacheFolderPath();
                model.BImageIncludeDicomViewer = bImageIncludeDicomViewer;
                model.BImageBurningDicomViewCD = bImageBurningDicomViewCD;
                model.ExportImageUidsList = ImageUidList;
                model.SessionIdString = Session.SessionID;
                model.PatientId = strPatientId;
                model.DatetimeSpanFolder = this.GetTimeSpanTempFolder();
                //model.ZipFileName = this.GetUniqueZipFileName(model.RptFolderPath, model.PatientId);

                //model.SourceFileNameList.Clear();
                //model.TargetFileNameList.Clear();
                //model.TargetDicomFileNamePatientGuidPairs.Clear();

                #region Compress Image from DICOM to JPEG

                if (exportJobEnum == ExportJobDownloadImageType.JPEG)
                {

                    List<KeyValuePair<string, string>> lstImages = new List<KeyValuePair<string, string>>();

                    CompressTaskManager.AddCompressTask(exportMdl.ImageList, Session.SessionID);
                    //lstImages = JP2Compresser.AddTask_Jpeg(ImageUidList, Session.SessionID);

                    //model.ImagesList = lstImages;

                    //// Get physical path
                    //string strRPTFolderPath = GXWebUtil.GetRPTCacheFolderPath();
                    //for (int i = 0; i < lstImages.Count; i++)
                    //{
                    //    string strImagePhysicalPath = Path.Combine(strRPTFolderPath, lstImages[i].Value);
                    //    if (!model.TargetFileNameList.Contains(strImagePhysicalPath))
                    //    {
                    //        model.TargetFileNameList.Add(strImagePhysicalPath);
                    //    }
                    //}

                    //Session["DoExportStudyModel"] = model;

                }

                #endregion

                //#region  Compress Image from DICOM to PDF

                //else if (exportJobEnum == ExportJobDownloadImageType.PDF)
                //{
                //    // Log
                //    strLogMessage = "User choose Downloading PDF files.........";
                //    GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);

                //    strLogMessage = "Begin Compress Image from DICOM to JPEG for PDF.........";
                //    GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);

                //    List<KeyValuePair<string, string>> lstImages = new List<KeyValuePair<string, string>>();
                //    lstImages = JP2Compresser.AddTask_Jpeg(ImageUidList, Session.SessionID);

                //    model.ImagesList = lstImages;

                //    // Get physical path
                //    string strRPTFolderPath = GXWebUtil.GetRPTCacheFolderPath();
                //    for (int i = 0; i < lstImages.Count; i++)
                //    {
                //        string strImagePhysicalPath = Path.Combine(strRPTFolderPath, lstImages[i].Value);
                //        string strPDFPath = strImagePhysicalPath.Replace("jpg", "pdf");

                //        if (!model.TargetFileNameList.Contains(strPDFPath))
                //        {
                //            model.TargetFileNameList.Add(strPDFPath);
                //            // Log
                //            strLogMessage = string.Format("Add new pdf file to the download list: [{0}]", strPDFPath);
                //            GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //        }
                //    }

                //    Session["DoExportStudyModel"] = model;

                //    ParameterizedThreadStart tsGeneratorDicom2Pdf = new ParameterizedThreadStart(GeneratorDicom2Pdf);
                //    Thread tGeneratorDicom2Pdf = new Thread(tsGeneratorDicom2Pdf);
                //    tGeneratorDicom2Pdf.Start(model);
                //}

                //#endregion

                //#region  Compress Image from DICOM

                //if (exportJobEnum == ExportJobDownloadImageType.DICOM)
                //{
                //    int RemoveDicomTagMASK_ALL = MASK_ALL;
                //    if (bImageRemovePatientInformation)
                //    {
                //        RemoveDicomTagMASK_ALL = RemoveDicomTagMASK_ALL + 8;
                //    }
                //    if (bImageRemoveInstitutionName)
                //    {
                //        RemoveDicomTagMASK_ALL = RemoveDicomTagMASK_ALL + 16;
                //    }
                //    model.RemoveDicomTagMASK_ALL = RemoveDicomTagMASK_ALL;

                //// Download DICOM files
                //#region General Dicom Export

                //if (!bImageIncludeDicomViewer && !bImageBurningDicomViewCD)
                //    {
                //        // Log
                //        strLogMessage = "User choose Downloading DICOM files.........";
                //        GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);

                //        // Log
                //        strLogMessage = "Begin Compress Image from DICOM to DICOM.........";
                //        GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);


                //        string tempFolder = Path.Combine(model.RptFolderPath, model.DatetimeSpanFolder);

                //        List<string> lstProcessingFileName = new List<string>();
                //        List<string> lstPresentationFileName = new List<string>();

                //        foreach (string sopInstanceUID in ImageUidList)
                //        {
                //            String sourceDicomFile = ImageBLL.GetDICOMFilePath(sopInstanceUID);
                //            string sourceDicomFilePatientGUID = ImageBLL.GetPatientUIdByImageInstanceId(sopInstanceUID);
                //            String targetDicomFile = Path.Combine(tempFolder, Path.GetFileName(sourceDicomFile));
                //            string strIndexDCMFileName = FileWrapper.GetFileName(sourceDicomFile);

                //            if (!model.SourceFileNameList.Contains(sourceDicomFile))
                //            {
                //                model.SourceFileNameList.Add(sourceDicomFile);
                //            }

                //            if (!model.TargetFileNameList.Contains(targetDicomFile))
                //            {
                //                model.TargetFileNameList.Add(targetDicomFile);
                //                // Log
                //                strLogMessage = string.Format("Add new DICOM file to the download list: [{0}]", targetDicomFile);
                //                GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //            }

                //            if (!model.TargetDicomFileNamePatientGuidPairs.ContainsKey(strIndexDCMFileName))
                //            {
                //                model.TargetDicomFileNamePatientGuidPairs.Add(strIndexDCMFileName, sourceDicomFilePatientGUID);
                //                // Log
                //                strLogMessage = string.Format("Add new index DCM : [{0}],PatientGUID : [{1}] to dictionary TargetDicomFileNamePatientGuidPairs.", strIndexDCMFileName, sourceDicomFilePatientGUID);
                //                GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //            }
                //        }

                //        Session["DoExportStudyModel"] = model;

                //        ParameterizedThreadStart tsGeneratorDicomProcessing2Presentation = new ParameterizedThreadStart(GeneratorDicom2Dicom);
                //        Thread newThread1 = new Thread(tsGeneratorDicomProcessing2Presentation);
                //        newThread1.Start(model);
                //    }

                //    #endregion

                //#region Include Dicom View Tool Export

                //else if (bImageIncludeDicomViewer && !bImageBurningDicomViewCD)
                //{

                //    // Log
                //    strLogMessage = "User choose Downloading Dicom View Tool files.........";
                //    GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);

                //    string tempFolder = Path.Combine(model.RptFolderPath, model.DatetimeSpanFolder);

                //    FileWrapper.CreateDirectory(tempFolder);

                //    string dcmTempFolder = Path.Combine(tempFolder, "WorkingDIR\\DICOM");
                //    FileWrapper.CreateDirectory(dcmTempFolder);

                //    int fileIndex = 1;

                //    foreach (string sopInstanceUID in ImageUidList)
                //    {
                //        String sourceDicomFile = ImageBLL.GetDICOMFilePath(sopInstanceUID);
                //        string sourceDicomFilePatientGUID = ImageBLL.GetPatientUIdByImageInstanceId(sopInstanceUID);
                //        string strIndexDCMFileName = string.Format("{0}DCM", (fileIndex++).ToString());
                //        String targetDicomFile = Path.Combine(dcmTempFolder, strIndexDCMFileName);


                //        if (!model.SourceFileNameList.Contains(sourceDicomFile))
                //        {
                //            model.SourceFileNameList.Add(sourceDicomFile);
                //        }

                //        //model.LstMiddleStoreFileName.Add(destDicomFile);
                //        if (!model.TargetFileNameList.Contains(targetDicomFile))
                //        {
                //            model.TargetFileNameList.Add(targetDicomFile);
                //            // Log
                //            strLogMessage = string.Format("Add new DICOM file to the download list: [{0}]", targetDicomFile);
                //            GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //        }

                //        if (!model.TargetDicomFileNamePatientGuidPairs.ContainsKey(strIndexDCMFileName))
                //        {
                //            model.TargetDicomFileNamePatientGuidPairs.Add(strIndexDCMFileName, sourceDicomFilePatientGUID);
                //            // Log
                //            strLogMessage = string.Format("Add new index DCM : [{0}],PatientGUID : [{1}] to dictionary TargetDicomFileNamePatientGuidPairs.", strIndexDCMFileName, sourceDicomFilePatientGUID);
                //            GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //        }
                //    }

                //    // prepera report file
                //    foreach (string studyUid in studyUidList)
                //    {
                //        bool hasReport = WebReportDAL.HasReport(studyUid);
                //        if (hasReport)
                //        {
                //            strLogMessage = "Begin Compress Report to Html.........";
                //            GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);

                //            string targetReportFilePath = Path.Combine(dcmTempFolder, string.Format("{0}.html", studyUid));
                //            if (!model.TargetReportFilePathList.Contains(targetReportFilePath))
                //            {
                //                model.TargetReportFilePathList.Add(targetReportFilePath);
                //            }

                //            if (!model.TargetFileNameList.Contains(targetReportFilePath))
                //            {
                //                model.TargetFileNameList.Add(targetReportFilePath);
                //            }
                //            strLogMessage = string.Format("Add new report html file to the download list: [{0}]", targetReportFilePath);
                //            GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //        }
                //    }

                //    // Prepare the parameter

                //    string strEasyFilmSourceZipFile = Path.Combine(GXWebUtil.GetGXResourceFolderPath(), DicomDIR);
                //    string strEasyFilmTargetZipFile = Path.Combine(tempFolder, TempDicomDIR);

                //    model.SourceDicomDIR7ZFile = strEasyFilmSourceZipFile;
                //    model.TargetDicomDIR7ZFile = strEasyFilmTargetZipFile;

                //    // Copy .7z file to temp folder
                //    strLogMessage = string.Format("Copy file, From:[{0}], To:[{1}]", strEasyFilmSourceZipFile, strEasyFilmTargetZipFile);
                //    GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //    //
                //    if (!FileWrapper.FileExist(strEasyFilmTargetZipFile))
                //    {
                //        FileWrapper.CopyFile(strEasyFilmSourceZipFile, strEasyFilmTargetZipFile);
                //        File.SetAttributes(strEasyFilmTargetZipFile, FileAttributes.Normal);
                //    }

                //    Session["DoExportStudyModel"] = model;

                //    ParameterizedThreadStart tsGeneratorDicom2Dicom = new ParameterizedThreadStart(GeneratorDicom2Dicom);
                //    Thread tDicom2Dicom = new Thread(tsGeneratorDicom2Dicom);
                //    tDicom2Dicom.Start(model);

                //    ParameterizedThreadStart tsGeneratorDicom2Html = new ParameterizedThreadStart(GeneratorDicom2Html);
                //    Thread tDicom2Html = new Thread(tsGeneratorDicom2Html);
                //    tDicom2Html.Start(model);

                //    ParameterizedThreadStart tsGeneratorDicom2DICOMDirFiles = new ParameterizedThreadStart(GeneratorDicom2DicomDirZipFiles);
                //    Thread newThread1 = new Thread(tsGeneratorDicom2DICOMDirFiles);
                //    newThread1.Start(model);

                //}

                //#endregion

                //    #region Include Dicom View Tool OR Burning CD Tool Export

                //    else if (bImageIncludeDicomViewer && bImageBurningDicomViewCD)
                //    {
                //        // Log
                //        strLogMessage = "User choose Downloading Burning CD Tool files.........";
                //        GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);

                //        string tempFolder = Path.Combine(model.RptFolderPath, model.DatetimeSpanFolder);

                //        FileWrapper.CreateDirectory(tempFolder);

                //        string dcmTempFolder = Path.Combine(tempFolder, "WorkingDIR\\DICOM");
                //        FileWrapper.CreateDirectory(dcmTempFolder);

                //        int fileIndex = 1;

                //        foreach (string sopInstanceUID in ImageUidList)
                //        {
                //            String sourceDicomFile = ImageBLL.GetDICOMFilePath(sopInstanceUID);
                //            string sourceDicomFilePatientGUID = ImageBLL.GetPatientUIdByImageInstanceId(sopInstanceUID);
                //            string strIndexDCMFileName = string.Format("{0}DCM", (fileIndex++).ToString());
                //            String targetDicomFile = Path.Combine(dcmTempFolder, strIndexDCMFileName);

                //            if (!model.SourceFileNameList.Contains(sourceDicomFile))
                //            {
                //                model.SourceFileNameList.Add(sourceDicomFile);
                //            }

                //            //model.LstMiddleStoreFileName.Add(destDicomFile);
                //            if (!model.TargetFileNameList.Contains(targetDicomFile))
                //            {
                //                model.TargetFileNameList.Add(targetDicomFile);
                //                // Log
                //                strLogMessage = string.Format("Add new DICOM file to the download list: [{0}]", targetDicomFile);
                //                GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //            }

                //            if (!model.TargetDicomFileNamePatientGuidPairs.ContainsKey(strIndexDCMFileName))
                //            {
                //                model.TargetDicomFileNamePatientGuidPairs.Add(strIndexDCMFileName, sourceDicomFilePatientGUID);
                //                // Log
                //                strLogMessage = string.Format("Add new index DCM : [{0}],PatientGUID : [{1}] to dictionary TargetDicomFileNamePatientGuidPairs.", strIndexDCMFileName, sourceDicomFilePatientGUID);
                //                GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //            }
                //        }

                //        // prepera report file
                //        foreach (string studyUid in studyUidList)
                //        {
                //            bool hasReport = WebReportDAL.HasReport(studyUid);
                //            if (hasReport)
                //            {
                //                strLogMessage = "Begin Compress Report to Html.........";
                //                GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);

                //                string targetReportFilePath = Path.Combine(dcmTempFolder, string.Format("{0}.html", studyUid));
                //                if (!model.TargetReportFilePathList.Contains(targetReportFilePath))
                //                {
                //                    model.TargetReportFilePathList.Add(targetReportFilePath);
                //                }

                //                if (!model.TargetFileNameList.Contains(targetReportFilePath))
                //                {
                //                    model.TargetFileNameList.Add(targetReportFilePath);
                //                }
                //                strLogMessage = string.Format("Add new report html file to the download list: [{0}]", targetReportFilePath);
                //                GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //            }
                //        }

                //        //----------------------------------------------------------------------------------------------
                //        // [2013/6/19 13:16:49   19009377]
                //        // !!! WARNNING !!! 
                //        // DICOMDIR also need p2p processing, so we need a thread to prepare the DICOM file
                //        //----------------------------------------------------------------------------------------------

                //        // Prepare the parameter
                //        string strEasyFilmSourceZipFile = Path.Combine(GXWebUtil.GetGXResourceFolderPath(), DicomBurnCD);
                //        string strEasyFilmTargetZipFile = Path.Combine(tempFolder, DicomBurnCD);
                //        string strasyFilmTargetBurnCDDVD = Path.Combine(tempFolder, BurnCDDExe);

                //        model.SourceDicomDIR7ZFile = strEasyFilmSourceZipFile;
                //        model.TargetDicomDIR7ZFile = strEasyFilmTargetZipFile;
                //        model.TargetBurnCDFilePath = strasyFilmTargetBurnCDDVD;

                //        model.ZipFileName = this.GetUniqueZipFileName(model.RptFolderPath, model.PatientId);

                //        //// Add a un-exist file to avoid zip
                //        //lstOutputFileList.Add(Path.Combine(tempFolder, Guid.NewGuid().ToString()));

                //        if (bImageIncludeDicomViewer && bImageBurningDicomViewCD)
                //        {
                //            // add patientinfo.xml
                //            string strPatientInfoXmlFile = Path.Combine(tempFolder, "PatientInfo.xml");

                //            #region  ///////////////// Write xml /////////////////
                //            XmlDocument xmldoc = new XmlDocument();
                //            xmldoc.LoadXml("<root/>");
                //            XmlElement informationSec = xmldoc.CreateElement("information");
                //            xmldoc.FirstChild.AppendChild(informationSec);
                //            // PID
                //            XmlElement PIDSec = xmldoc.CreateElement("info");
                //            XmlElement PIDTitle = xmldoc.CreateElement("PatientID");
                //            XmlElement PIDValue = xmldoc.CreateElement("PatientID");
                //            informationSec.AppendChild(PIDSec);
                //            PIDSec.AppendChild(PIDTitle);
                //            PIDSec.AppendChild(PIDValue);
                //            PIDTitle.InnerText = "PatientID";
                //            PIDValue.InnerText = ImageBLL.GetPatientId(ImageUidList[0]);
                //            // PName
                //            XmlElement PNameSec = xmldoc.CreateElement("info");
                //            XmlElement PNameTitle = xmldoc.CreateElement("PatientName");
                //            XmlElement PNameValue = xmldoc.CreateElement("PatientName");
                //            informationSec.AppendChild(PNameSec);
                //            PNameSec.AppendChild(PNameTitle);
                //            PNameSec.AppendChild(PNameValue);
                //            PNameTitle.InnerText = "PatientName";
                //            string strPName = ImageBLL.GetPatientName(ImageUidList[0]);
                //            PNameValue.InnerText = strPName;
                //            // ImageCount
                //            XmlElement ImageCountSec = xmldoc.CreateElement("info");
                //            XmlElement ImageCountTitle = xmldoc.CreateElement("ImageCount");
                //            XmlElement ImageCountValue = xmldoc.CreateElement("ImageCount");
                //            informationSec.AppendChild(ImageCountSec);
                //            ImageCountSec.AppendChild(ImageCountTitle);
                //            ImageCountSec.AppendChild(ImageCountValue);
                //            ImageCountTitle.InnerText = "ImageCount";
                //            ImageCountValue.InnerText = ImageUidList.Length.ToString();
                //            // Write XML to file
                //            string strOuterXml = xmldoc.OuterXml;
                //            File.AppendAllText(strPatientInfoXmlFile, strOuterXml, Encoding.Default);
                //            #endregion

                //            // self-extract required files
                //            List<string> lstSelfExtractRequiredFile = new List<string>();
                //            lstSelfExtractRequiredFile.Add(Path.Combine(GXWebUtil.GetGXResourceFolderPath(), "7zsd.sfx"));
                //            lstSelfExtractRequiredFile.Add(Path.Combine(GXWebUtil.GetGXResourceFolderPath(), "config.txt"));

                //            model.SelfExtractRequiredFileList = lstSelfExtractRequiredFile;

                //            // Copy others files to temp folder
                //            foreach (string tempSelfExtractRequiredFile in lstSelfExtractRequiredFile)
                //            {
                //                string strNewSelfExtractRequiredFile = Path.Combine(tempFolder, Path.GetFileName(tempSelfExtractRequiredFile));
                //                if (!FileWrapper.FileExist(strNewSelfExtractRequiredFile))
                //                {
                //                    FileWrapper.CopyFile(tempSelfExtractRequiredFile, strNewSelfExtractRequiredFile);
                //                    File.SetAttributes(strNewSelfExtractRequiredFile, FileAttributes.Normal);
                //                    //
                //                    strLogMessage = string.Format("Copy file, From:[{0}], To:[{1}]", tempSelfExtractRequiredFile, strNewSelfExtractRequiredFile);
                //                    GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //                }
                //            }

                //            // Copy easy film file DicomBurnCD.7z to target DicomBurnCD.7z
                //            // Copy .7z file to temp folder
                //            strLogMessage = string.Format("Copy file, From:[{0}], To:[{1}]", strEasyFilmSourceZipFile, strEasyFilmTargetZipFile);
                //            GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);

                //            if (!FileWrapper.FileExist(strEasyFilmTargetZipFile))
                //            {
                //                FileWrapper.CopyFile(strEasyFilmSourceZipFile, strEasyFilmTargetZipFile);
                //                File.SetAttributes(strEasyFilmTargetZipFile, FileAttributes.Normal);
                //            }
                //        }

                //        Session["DoExportStudyModel"] = model;

                //        ParameterizedThreadStart tsGeneratorDicom2Dicom = new ParameterizedThreadStart(GeneratorDicom2Dicom);
                //        Thread tDicom2Dicom = new Thread(tsGeneratorDicom2Dicom);
                //        tDicom2Dicom.Start(model);

                //        ParameterizedThreadStart tsGeneratorDicom2Html = new ParameterizedThreadStart(GeneratorDicom2Html);
                //        Thread tDicom2Html = new Thread(tsGeneratorDicom2Html);
                //        tDicom2Html.Start(model);

                //        ParameterizedThreadStart tsGeneratorDicom2DICOMDirFiles = new ParameterizedThreadStart(GeneratorDicom2DicomDirZipFiles);
                //        Thread newThread1 = new Thread(tsGeneratorDicom2DICOMDirFiles);
                //        newThread1.Start(model);
                //    }

                //    #endregion
                //}

                //#endregion

                //Session["DoExportStudyModel"] = model;
            }
            catch (Exception ex)
            {
                //    ScriptManager.RegisterStartupScript(this.Page, this.GetType(), "divLoadingHidden", "divLoadingHidden();", true);
                //    GXLogManager.WriteLog(GXLogModule.WEB_PAGE_TransferExport, GXLogLevel.Error, GXLogCode.DEFAULT, ex);
            }

            return _commonTool.GetJsonStringFromObject("true");
        }


        [HttpPost]
        public string GetTransferCompress()
        {
            Dictionary<string, string> dicTransferCompress = new Dictionary<string, string>();
            DataTable tb = _dbHelper.GetTableTransferCompress();
            if (tb != null)
            {
                foreach (DataRow dr in tb.Rows)
                {
                    if (string.Compare(dr["PropertyName"].ToString(), "CompRatioList_0", true) > 0)
                    {
                        string compressText = String.Empty;
                        string compressValue = String.Empty;
                        if (dr["PropertyValue"].ToString().Trim() == "1")
                        {
                            compressText = "Lossless Compression";
                        }
                        else
                        {
                            compressText = "Lossy" + dr["PropertyValue"].ToString() + ":1";
                        }

                        compressValue = dr["PropertyValue"].ToString();
                        dicTransferCompress.Add(compressValue, compressText);
                    }
                }
            }
            return _commonTool.GetJsonStringFromObject(dicTransferCompress);

        }

        public class RevTransferMdl
        {
            public List<Study> StudyList { get; set; }

            public List<Series> SeriesList { get; set; }

            public List<Image> ImageList { get; set; }

            public List<OtherPacs> PacsList { get; set; }

            public bool IsCheckAll { get; set; }

            public string TransferCompressType { get; set; }

            public string LastExportPatientInfoConfig { get; set; }

            public bool IsCreateNewGuid { get; set; }
        }

        public class RevExportMdl
        {
            public List<Study> StudyList { get; set; }

            public List<Series> SeriesList { get; set; }

            public List<Image> ImageList { get; set; }

            public string ImageType                  {get; set; }
            public string ImageCompressRate          {get; set; }
            public bool IsImageRemovePatientInformation  {get; set; }
            public bool IsImageRemoveInstitutionName     {get; set; }
            public bool IsImageIncludeDicomViewer { get; set; }
            public bool IsImageBurningDicomViewCD { get; set; }
            public string LastExportPatientInfoConfig {get; set; }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        private TransferJobTableMdl GetTransferJobModel(RevTransferMdl transferMdl)
        {
            TransferJobTableMdl transferJobTableMdl = new TransferJobTableMdl();

            List<string> studyGUIDList = transferMdl.StudyList.Select(i => i.StudyInstanceUid).ToList();
            List<string> serialGUIDList = transferMdl.SeriesList.Select(i => i.InstanceUid).ToList();
            List<string> netAEList = transferMdl.PacsList.Select(i => i.NetAEName).ToList();
            List<string> imageList = transferMdl.ImageList.Select(i => i.SopInstanceUid).ToList();

            string studyGUIDs = _commonTool.GetGUIDsByList(studyGUIDList);
            string seriesGUIDs = _commonTool.GetGUIDsByList(serialGUIDList);
            string imageGUIDs = _commonTool.GetGUIDsByList(imageList);

            transferJobTableMdl = _dbHelper.GetTransferJobTableMdl(netAEList, studyGUIDs, seriesGUIDs, imageGUIDs);

            return transferJobTableMdl;
        }

        [Serializable]
        public class ExportStudyModel
        {
            public ExportStudyModel()
            { }

            public ExportJobDownloadImageType ExportJobDownloadImageType { get; set; }
            public string PatientId { get; set; }

            public static string GetRPTCacheFolderPath()
            {
                Page _Page = new Page();

                string strRPTCacheFolderPath = String.Empty;
                if (strRPTCacheFolderPath.Length == 0)
                {
                    strRPTCacheFolderPath = _Page.Server.MapPath("~/RPTCache");
                }
                return strRPTCacheFolderPath;
            }

            public string RptFolderPath
            {
                get { return GetRPTCacheFolderPath(); }
            }

            public string DatetimeSpanFolder
            {
                get;
                set;
            }

            public string SourceDicomDIR7ZFile
            {
                get;
                set;
            }

            public string TargetDicomDIR7ZFile
            {
                get;
                set;
            }

            public string TargetBurnCDFilePath
            {
                get;
                set;
            }

            public string ZipFileName
            {
                get;
                set;
            }

            public int RemoveDicomTagMASK_ALL
            {
                get;
                set;
            }

            public bool BImageIncludeDicomViewer
            {
                get;
                set;
            }

            public bool BImageBurningDicomViewCD
            {
                get;
                set;
            }

            public List<string> ExportImageUidsList
            {
                get;
                set;
            }

            public List<KeyValuePair<string, string>> ImagesList
            {
                get;
                set;
            }

            public List<string> SourceFileNameList
            {
                get;
                set;
            }

            public List<string> TargetFileNameList
            {
                get;
                set;
            }

            public Dictionary<string, string> TargetDicomFileNamePatientGuidPairs
            {
                get;
                set;
            }

            public List<string> SelfExtractRequiredFileList
            {
                get;
                set;
            }

            public List<string> TargetReportFilePathList
            {
                get;
                set;
            }

            public string SessionIdString
            {
                get;
                set;
            }
        }

        private string GetTimeSpanTempFolder()
        {
            return DateTime.Now.ToString("yyyyMMddHHmmssFFF");
        }

        /// <summary>
        /// Download image type for export
        /// </summary>
        public enum ExportJobDownloadImageType
        {
            DICOM = 0,
            JPEG,
            //BMP,
            //AVI,
            PDF
        }
    }
}
