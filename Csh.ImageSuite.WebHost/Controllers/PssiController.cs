using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Data;
using System.Web.Http;
using Csh.ImageSuite.Model.Config;
using Csh.ImageSuite.Model.Enum;
using Csh.ImageSuite.Model.JsonWrapper;

namespace Csh.ImageSuite.WebHost.Controllers
{
    public class PssiController : Controller
    {
        private readonly IDbHelper _dbHelper;
        private readonly ICommonTool _commonTool;

        public PssiController(IPacsCoordinator pacsCoordinator, ICommonTool commonTool)
        {
            _dbHelper = pacsCoordinator.GetCurrentDbHelper();
            _commonTool = commonTool;
        }

        // GET: Pssi
        public string Index()
        {
            SendStudyData ssd = new SendStudyData();
            int pageCount = 0;


            var studies = _dbHelper.GetStudies(null, "", 1, out pageCount);
            return _commonTool.GetJsonStringFromObject(studies);
        }

        // GET: Pssi/Details/5
        public string Details(int id)
        {
            //var study = _dbHelper.GetStudy(id);

            //List<Study>  lstStudy = _dbHelper.GetHasHistoryStudyUidArray(study.StudyInstanceUid);

            //return _commonTool.GetJsonStringFromObject(study);
            return "";
        }

        [System.Web.Mvc.HttpPost]
        public string GetStudiesForDcmViewer(RevStudiesForDcmViewer revStudiesForDcmViewer)
        {
            var lstStudy = new List<Study>();
            //var study = new Study();

            if (revStudiesForDcmViewer.ShowHistoryStudies)
            {
                var study = _dbHelper.GetStudy(revStudiesForDcmViewer.Id, false);

                lstStudy = _dbHelper.GetHasHistoryStudyUidArray(study.StudyInstanceUid, revStudiesForDcmViewer.ShowKeyImage);
            }
            else
            {
                var study = _dbHelper.GetStudy(revStudiesForDcmViewer.Id, revStudiesForDcmViewer.ShowKeyImage);

                if (study == null)
                    return "";

                lstStudy.Add(study);
            }

            return _commonTool.GetJsonStringFromObject(lstStudy);
        }


        // POST: Pssi/Search/
        [System.Web.Mvc.HttpPost]
        public string Search(RevStudyData studyData)
        {
            SendStudyData ssd = new SendStudyData();
            int pageCount = 0;
            List<Study> studies = _dbHelper.GetStudies(studyData.Shortcut, studyData.SortItem, studyData.PageIndex, out pageCount);
            ssd.StudyList = studies;
            ssd.PageCount = pageCount;

            List<WorklistColumn> worklistColumns = _dbHelper.GetWorklistColumnConfig("admin", "en-US");
            ssd.WorklistColumns = worklistColumns;

            return _commonTool.GetJsonStringFromObject(ssd);
        }


        [System.Web.Mvc.HttpPost]
        public string SetRead(string id)
        {
            ScanStatus NewStatus = ScanStatus.Completed;
            _dbHelper.UpdateStudyScanStatus(id, NewStatus);

            return _commonTool.GetJsonStringFromObject(true);
        }

        [System.Web.Mvc.HttpPost]
        public string SetUnread(string id)
        {
            ScanStatus NewStatus = ScanStatus.Ended;
            _dbHelper.UpdateStudyScanStatus(id, NewStatus);

            return _commonTool.GetJsonStringFromObject(true);
        }

        [System.Web.Mvc.HttpPost]
        public string SetDeletePrevent(string id)
        {
            ReservedStatus reservedStatus = ReservedStatus.Reserved;
            _dbHelper.SetReserved(id, reservedStatus);

            return _commonTool.GetJsonStringFromObject(true);
        }

        [System.Web.Mvc.HttpPost]
        public string SetDeleteAllow(string id)
        {
            ReservedStatus reservedStatus = ReservedStatus.UnReserved;
            _dbHelper.SetReserved(id, reservedStatus);
            return _commonTool.GetJsonStringFromObject(true);
        }

        [System.Web.Mvc.HttpPost]
        public string DeleteStudy(DeleteStudyJson deleteStudyJson)
        {
            _dbHelper.DeletedStudy(deleteStudyJson.Id, deleteStudyJson.DeletionReason);
            return _commonTool.GetJsonStringFromObject(true);
        }

        [System.Web.Mvc.HttpPost]
        public string SetKeyImage(RevKeyImage revKeyImage)
        {
            _dbHelper.SetKeyImage(revKeyImage.Id, revKeyImage.Marked);
            return _commonTool.GetJsonStringFromObject(true);
        }


        // POST: Pssi/Create
        [System.Web.Mvc.HttpPost]
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


        // POST: Pssi/Edit/5
        [System.Web.Mvc.HttpPost]
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


        // POST: Pssi/Delete/5
        [System.Web.Mvc.HttpPost]
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

        [System.Web.Mvc.HttpPost]
        public string CheckStudiesIncludeOffline(RevCheckedStudiesForOffline revCheckedStudiesForOffline)
        {
            Dictionary<Dictionary<bool, string>, List<string>> dictResult = new Dictionary<Dictionary<bool, string>, List<string>>();
            revCheckedStudiesForOffline.StudyOfflineMessage = "";
            // This dictionary is include study is offline and popup study offline message.
            // If study offline on USB, should pop div loading and send socket to sms to online study.
            Dictionary<bool, string> dictOfflineFlag = new Dictionary<bool, string>();
            bool isOffline = false;
            //List<string> studyOfflineUidCDList = new List<string>();
            List<string> studyOfflineUidUSBList = new List<string>();

            string strPopUpStudyOfflineMessage = revCheckedStudiesForOffline.StudyOfflineMessage;
            try
            {
                List<string> studyInstanceUIDList = revCheckedStudiesForOffline.studyInstanceUIDList;
                string studyUIDs = GetGUIDsByList(studyInstanceUIDList);

                DataTable tbStudyOffline = _dbHelper.GetTableStudyOffline(studyUIDs, "");
                if (tbStudyOffline != null && tbStudyOffline.Rows.Count > 0)
                {
                    isOffline = true;

                    List<Study> studyInfoModelOfflineUIDList = new List<Study>();
                    string strOfflineMessage = "";

                    if (isOffline)
                    {
                        strOfflineMessage = _dbHelper.GetStringStudyOffline(studyUIDs, "", out studyInfoModelOfflineUIDList);
                    }

                    // 1.PopUp Message for study offline
                    if (strOfflineMessage.Trim().Length > 0)
                    {
                        strPopUpStudyOfflineMessage += "\n" + strOfflineMessage;
                    }

                    dictOfflineFlag.Add(isOffline, strPopUpStudyOfflineMessage);


                    foreach (Study model in studyInfoModelOfflineUIDList)
                    {
                        if (model.IsUSBOffline == true)
                        {
                            if (!studyOfflineUidUSBList.Contains(model.StudyInstanceUid))
                            {
                                studyOfflineUidUSBList.Add(model.StudyInstanceUid);
                            }
                        }
                    }
                }
                else
                {
                    dictOfflineFlag.Add(false, "");
                }
                dictResult.Add(dictOfflineFlag, studyOfflineUidUSBList);

            }
            catch (Exception ex)
            {
            }

            foreach (var test in dictResult)
            {
                return _commonTool.GetJsonStringFromObject(test);
            }

            return _commonTool.GetJsonStringFromObject(dictResult);
        }

        public static string GetGUIDsByList(List<string> GUIDList)
        {
            string result = string.Empty;

            if (GUIDList.Count > 0)
            {
                foreach (string dataKey in GUIDList)
                {
                    if (dataKey.Trim().Length > 0)
                    {
                        result += "'" + dataKey.Trim() + "',";
                    }
                }
                if (result.Length > 0)
                {
                    result = result.Substring(0, result.Length - 1);
                }
            }
            return result;
        }

        public class RevCheckedStudiesForOffline
        {
            public List<string> studyInstanceUIDList { get; set; }
            public string StudyOfflineMessage { get; set; }
        }
    }
}
