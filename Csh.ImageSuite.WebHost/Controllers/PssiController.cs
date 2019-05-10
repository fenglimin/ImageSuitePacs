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
            var study = _dbHelper.GetStudy(id);

            //List<Study>  lstStudy = _dbHelper.GetHasHistoryStudyUidArray(study.StudyInstanceUid);

            return _commonTool.GetJsonStringFromObject(study);
        }

        [System.Web.Mvc.HttpPost]
        public string GetStudiesForDcmViewer(StudyIdShowHistoryStudy studyIdShowHistoryStudy)
        {
            List<Study> lstStudy = new List<Study>();

            var study = _dbHelper.GetStudy(studyIdShowHistoryStudy.Id);

            if (studyIdShowHistoryStudy.ShowHistoryStudies)
            {
                lstStudy = _dbHelper.GetHasHistoryStudyUidArray(study.StudyInstanceUid);
            }
            else
            {
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

            return _commonTool.GetJsonStringFromObject("test");
        }

        [System.Web.Mvc.HttpPost]
        public string SetUnread(string id)
        {
            ScanStatus NewStatus = ScanStatus.Ended;
            _dbHelper.UpdateStudyScanStatus(id, NewStatus);

            return _commonTool.GetJsonStringFromObject("test");
        }

        [System.Web.Mvc.HttpPost]
        public string SetDeletePrevent(string id)
        {
            ReservedStatus reservedStatus = ReservedStatus.Reserved;
            _dbHelper.SetReserved(id, reservedStatus);

            return _commonTool.GetJsonStringFromObject("test");
        }

        [System.Web.Mvc.HttpPost]
        public string SetDeleteAllow(string id)
        {
            ReservedStatus reservedStatus = ReservedStatus.UnReserved;
            _dbHelper.SetReserved(id, reservedStatus);

            return _commonTool.GetJsonStringFromObject("test");
        }

        [System.Web.Mvc.HttpPost]
        public string DeleteStudy(DeleteStudyJson deleteStudyJson)
        {
            _dbHelper.DeletedStudy(deleteStudyJson.Id, deleteStudyJson.DeletionReason);

            return _commonTool.GetJsonStringFromObject("test");
        }

        public class DeleteStudyJson
        {
            public string Id { get; set; }
            public string DeletionReason { get; set; }
        }

        // GET: Pssi/Create
        public ActionResult Create()
        {
            return View();
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

        // GET: Pssi/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
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

        // GET: Pssi/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
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
    }
}
