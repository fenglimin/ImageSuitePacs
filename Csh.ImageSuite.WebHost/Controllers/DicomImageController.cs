using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.MiniPacs.Interface;
using Csh.ImageSuite.Model.JsonWrapper;
using Dicom;

namespace Csh.ImageSuite.WebHost.Controllers
{
    public class DicomImageController : Controller
    {
        private readonly IMiniPacsDicomHelper _miniPacsDicomHelper;
        private readonly ICommonTool _commonTool;
        public DicomImageController(IMiniPacsDicomHelper miniPacsDicomHelper, ICommonTool commonTool)
        {
            _miniPacsDicomHelper = miniPacsDicomHelper;
            _commonTool = commonTool;
        }

        // GET: DicomImage
        public ActionResult Index()
        {
            return View();
        }

        // GET: DicomImage/Dicom/5
        public ActionResult Dicom(string id)
        {
            var jpgFile = _miniPacsDicomHelper.GetDicomFile(Convert.ToInt32(id), true);
            if (jpgFile == string.Empty)
            {
                return null;
            }

            var fs = new FileStream(jpgFile, FileMode.Open);
            var buffer = new byte[fs.Length];
            fs.Read(buffer, 0, (int)fs.Length);
            fs.Close();
            
            return File(buffer, "image/jpeg", "fileName.dcm");
        }

        // GET: DicomImage/Thumbnail/5
        public ActionResult Thumbnail(string id)
        {
            var jpgFile = _miniPacsDicomHelper.GetThumbnailFile(Convert.ToInt32(id));
            if (jpgFile == string.Empty)
            {
                return null;
            }

            FileStream fs;
            try
            {
                fs = new FileStream(jpgFile, FileMode.Open);
            }
            catch (Exception)
            {
                Thread.Sleep(1000);
                fs = new FileStream(jpgFile, FileMode.Open);
            }
            
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

        // POST: dicomImage/saveAnnotation/
        [HttpPost]
        public string SaveAnnotation(RevAnnImage revAnnImage)
        {
            var ret = _miniPacsDicomHelper.SaveAnnToDicomFile(revAnnImage);
            return _commonTool.GetJsonStringFromObject(ret);
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
