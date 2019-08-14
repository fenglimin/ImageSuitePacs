using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Csh.ImageSuite.Common.Interface;
using System.Data;
using Csh.ImageSuite.Model.Settings;



namespace Csh.ImageSuite.WebHost.Controllers
{
    public class SettingsController : Controller
    {

        private readonly ICommonTool _commonTool;
        private readonly IDbHelper _dbHelper;


        public SettingsController(IPacsCoordinator pacsCoordinator, ICommonTool commonTool)
        {
            _dbHelper = pacsCoordinator.GetCurrentDbHelper();
            _commonTool = commonTool;
        }



        // GET: Settings
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public string GetTransferJob()
        {
            List<TransferJob> lstTransferJob = new List<TransferJob>();
            DataSet _dsTransferJob = _dbHelper.GetAllTransferJobDS();

            _dsTransferJob.Tables[0].Columns.Add("StatusLocal");
            foreach (DataRow row in _dsTransferJob.Tables[0].Rows)
            {
                TransferJob transferJob = new TransferJob();

                transferJob.JobUid = row["JobUID"].ToString().Trim();
                transferJob.DeliveryStatus = row["Status"].ToString().Trim();
                transferJob.PatientName = row["PatientName"].ToString().Trim();
                transferJob.PatientId = row["PatientId"].ToString().Trim();
                transferJob.CreatedDate = row["CreateDateTime"].ToString().Trim();
                transferJob.Type = row["Type"].ToString().Trim();
                transferJob.ImageCount = row["ItemTotalNumber"].ToString().Trim();
                transferJob.DeliveryName = row["JobName"].ToString().Trim();
                transferJob.Destination = row["Destination"].ToString().Trim();
                transferJob.FinishedNumber = row["ExecutedNumber"].ToString().Trim();
                transferJob.SuccessNumber = row["SuccessNumber"].ToString().Trim();
                transferJob.CompressionRatio = row["CompressionRatio"].ToString().Trim();
                lstTransferJob.Add(transferJob);
            }

            return _commonTool.GetJsonStringFromObject(lstTransferJob);
        }

        [HttpPost]
        public string GetTransferJobItem(string jobUID)
        {
            List<TransferJobItem> lstTransferJobItems = new List<TransferJobItem>();

            DataSet ds = _dbHelper.GetAllTransferJobItemDS(jobUID);

            foreach (DataRow row in ds.Tables[0].Rows)
            {
                TransferJobItem transferJobItem = new TransferJobItem();

                transferJobItem.ItemNo = row["ItemSerialNo"].ToString().Trim();
                transferJobItem.Type = row["UIDType"].ToString().Trim();
                transferJobItem.PatientId = row["PatientID"].ToString().Trim();
                transferJobItem.Name = row["PatientName"].ToString().Trim();
                transferJobItem.ExecuteStatus = row["ExecStatus"].ToString().Trim();
                transferJobItem.ExecuteTime = row["ExecTime"].ToString().Trim();
                lstTransferJobItems.Add(transferJobItem);
            }


            return _commonTool.GetJsonStringFromObject(lstTransferJobItems);

        }

        [HttpPost]
        public string SetSelectedJobStatus(string jobUID, string newStatus)
        {
            _dbHelper.SetJobStatus(jobUID, newStatus);

            return _commonTool.GetJsonStringFromObject("");

        }

    }
}