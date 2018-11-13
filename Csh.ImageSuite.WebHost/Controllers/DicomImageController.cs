using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Csh.ImageSuite.MiniPacs.Interface;

namespace Csh.ImageSuite.WebHost.Controllers
{
    public class DicomImageController : Controller
    {
        private IMiniPacsDicomHelper _miniPacsDicomHelper;

        public DicomImageController(IMiniPacsDicomHelper miniPacsDicomHelper)
        {
            this._miniPacsDicomHelper = miniPacsDicomHelper;
        }

        // GET: DicomImage
        public ActionResult Index()
        {
            return View();
        }

        // GET: DicomImage/Details/5
        public ActionResult Details(string id)
        {
            var jpgFile = _miniPacsDicomHelper.GetJpgFile(Convert.ToInt32(id));
            if (jpgFile == string.Empty)
            {
                return null;
            }

            var fs = new FileStream(jpgFile, FileMode.Open);
            var buffer = new byte[fs.Length];
            fs.Read(buffer, 0, (int)fs.Length);
            fs.Close();
            
            return File(buffer, "image/jpeg", "fileName.jpg");
        }

        // GET: DicomImage/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: DicomImage/Create
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

        // GET: DicomImage/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: DicomImage/Edit/5
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

        // GET: DicomImage/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: DicomImage/Delete/5
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
