using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

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
            var studies = _dbHelper.GetStudies(null);
            return _commonTool.GetJsonStringFromObject(studies);
        }

        // GET: Pssi/Details/5
        public string Details(int id)
        {
            var study = _dbHelper.GetStudy(id);
            return _commonTool.GetJsonStringFromObject(study);
        }

        // POST: Pssi/Search/
        public string Search(QueryShortcut queryShortcut)
        {
            var studies = _dbHelper.GetStudies(queryShortcut);
            return _commonTool.GetJsonStringFromObject(studies);
        }


        // GET: Pssi/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Pssi/Create
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

        // GET: Pssi/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: Pssi/Edit/5
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

        // GET: Pssi/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: Pssi/Delete/5
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
    }
}
