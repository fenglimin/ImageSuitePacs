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
        private readonly IPacsCoordinator _pacsCoordinator;
        private IDbHelper _dbHelper;

        public ShortcutController(IPacsCoordinator pacsCoordinator)
        {
            _pacsCoordinator = pacsCoordinator;
            _dbHelper = _pacsCoordinator.GetDbHelper();
        }

        // GET: Shortcut
        public string Index()
        {
            //var shortcuts = new Shortcut[]
            //{
            //    new Shortcut() {Id=3, Name="aa"},
            //    new Shortcut() {Id=4, Name="bb"},
            //    new Shortcut() {Id=5, Name="cc"},
            //    new Shortcut() {Id=6, Name="dd"},
            //    new Shortcut() {Id=7, Name="ee"},
            //    new Shortcut() {Id=8, Name="ff"}
            //};

            var shortcuts = _dbHelper.LoadQueryShortcuts();
            var ret = JsonConvert.SerializeObject(shortcuts, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });

            return ret;
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
