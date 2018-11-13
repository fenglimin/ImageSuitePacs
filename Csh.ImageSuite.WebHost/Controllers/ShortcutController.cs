using System.Web.Mvc;
using Csh.ImageSuite.Common.Interface;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Csh.ImageSuite.WebHost.Controllers
{
    public class Shortcut
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class ShortcutController : Controller
    {
        private readonly IDbHelper _dbHelper;
        private readonly ICommonTool _commonTool;

        public ShortcutController(IPacsCoordinator pacsCoordinator, ICommonTool commonTool)
        {
            _dbHelper = pacsCoordinator.GetCurrentDbHelper();
            _commonTool = commonTool;
        }

        // GET: Shortcut
        public string Index()
        {
            var shortcuts = _dbHelper.LoadQueryShortcuts();
            return _commonTool.GetJsonStringFromObject(shortcuts);
        }

        // GET: Shortcut/Details/5
        public string Details(int id)
        {
            var shortcut = new Shortcut { Id = id, Name = "Sailddd" };
            var ret = JsonConvert.SerializeObject(shortcut, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });

            return ret;
        }

        // GET: Shortcut/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Shortcut/Create
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

        // GET: Shortcut/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: Shortcut/Edit/5
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

        // GET: Shortcut/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: Shortcut/Delete/5
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
