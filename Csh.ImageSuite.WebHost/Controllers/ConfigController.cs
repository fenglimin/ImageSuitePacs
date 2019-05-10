using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Xml;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Config;

namespace Csh.ImageSuite.WebHost.Controllers
{
    public class ConfigController : Controller
    {

        private readonly IDbHelper _dbHelper;
        private readonly ICommonTool _commonTool;

        public ConfigController(IPacsCoordinator pacsCoordinator, ICommonTool commonTool)
        {
            _dbHelper = pacsCoordinator.GetCurrentDbHelper();
            _commonTool = commonTool;
        }

        public string MarkerConfig()
        {
            var basePath = AppDomain.CurrentDomain.BaseDirectory;
            var configMarkerPath = basePath + @"assets\img\Stamp\ImageMarker.config";

            var curPageIndex = -1;
            var curRowIndex = -1;

            var settings = new XmlReaderSettings();
            settings.DtdProcessing = DtdProcessing.Parse;

            var listMarkerGroupData = new List<MarkerGroupData>();
            using (var reader = XmlReader.Create(configMarkerPath))
            {

                reader.MoveToContent();
                // Parse the file and display each of the nodes.
                while (reader.Read())
                {
                    switch (reader.NodeType)
                    {
                        case XmlNodeType.Element:
                            var elementName = reader.Name;
                            elementName = elementName.Substring(0, elementName.Length - 1).ToLower();
                            
                            switch (elementName)
                            {
                                case "group":
                                    var markerGroupData = new MarkerGroupData();
                                    markerGroupData.GroupName = reader.GetAttribute("display");
                                    markerGroupData.MarkerDataTable = new List<IList<MarkerData>>();
                                    listMarkerGroupData.Add(markerGroupData);
                                    var pageId = reader.GetAttribute("page");
                                    curPageIndex = _commonTool.GetSafeIntValue(pageId) - 1;
                                    break;

                                case "row":
                                    var rowId = reader.GetAttribute("row");
                                    curRowIndex = _commonTool.GetSafeIntValue(rowId)- 1;
                                    var rowMarkerData = new List<MarkerData>();
                                    listMarkerGroupData[curPageIndex].MarkerDataTable.Add(rowMarkerData);
                                    break;

                                case "item":
                                    var markerData = new MarkerData();
                                    markerData.DisplayText = reader.GetAttribute("display");
                                    markerData.ImageName = reader.GetAttribute("imagename").ToUpper();

                                    listMarkerGroupData[curPageIndex].MarkerDataTable[curRowIndex].Add(markerData);
                                    break;
                            }
                            break;
                    }
                }

            }

            return _commonTool.GetJsonStringFromObject(listMarkerGroupData);
        }

        // GET: Config
        public ActionResult Index()
        {
            return View();
        }



        // GET: Config/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: Config/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Config/Create
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

        // GET: Config/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: Config/Edit/5
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

        // GET: Config/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: Config/Delete/5
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
