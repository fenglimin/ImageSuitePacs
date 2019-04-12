using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Csh.ImageSuite.Common.Interface;

namespace Csh.ImageSuite.WebHost.Controllers
{
    public class OverlayController : Controller
    {
        private readonly IDbHelper _dbHelper;
        private readonly ICommonTool _commonTool;

        public OverlayController(IPacsCoordinator pacsCoordinator, ICommonTool commonTool)
        {
            _dbHelper = pacsCoordinator.GetCurrentDbHelper();
            _commonTool = commonTool;
        }

        // GET: Overlay
        public string Index()
        {
            var overlays = _dbHelper.LoadOverlayConfig("global", "zh-CN");
            return _commonTool.GetJsonStringFromObject(overlays);
        }
    }
}