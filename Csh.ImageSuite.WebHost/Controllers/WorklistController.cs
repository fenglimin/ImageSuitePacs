using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
//using System.Web.UI.WebControls;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Common;
using Csh.ImageSuite.Model.Dicom;
using Csh.ImageSuite.Model.Enum;


namespace Csh.ImageSuite.WebHost.Controllers
{
    public class WorklistController : Controller
    {
        private readonly ICommonTool _commonTool;
        private readonly IDbHelper _dbHelper;


        public WorklistController(IPacsCoordinator pacsCoordinator, ICommonTool commonTool)
        {
            _dbHelper = pacsCoordinator.GetCurrentDbHelper();
            _commonTool = commonTool;
        }


        // GET: Worklist
        public ActionResult Index()
        {
            return View();
        }

        // GET: Worklist/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: Worklist/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Worklist/Create
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

        // GET: Worklist/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: Worklist/Edit/5
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

        // GET: Worklist/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: Worklist/Delete/5
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

        [HttpPost]
        public string GetOtherPacs()
        {
            List<OtherPacs> otherPacsList = new List<OtherPacs>();

            DataTable dt =  _dbHelper.GetTableNetAE();

            foreach (DataRow row in dt.Rows)
            {
                OtherPacs otherPacs = new OtherPacs();

                string strStorageCommitment = row["StorageCommitment"].ToString().Trim();
                if (strStorageCommitment == "1")
                {
                    otherPacs.StorageCommitment = "Yes";
                }
                else
                {
                    otherPacs.StorageCommitment = "No";
                }

                otherPacs.NetAEName = row["NetAEName"].ToString().Trim();
                otherPacs.AETitle = row["AETitle"].ToString().Trim();
                otherPacs.IPAddress = row["IPAddress"].ToString().Trim();
                //otherPacs.StorageCommitment = row["StorageCommitment"].ToString();

                otherPacsList.Add(otherPacs);
            }

            return _commonTool.GetJsonStringFromObject(otherPacsList);
        }

        [HttpPost]
        public string DoTransfer(RevTransferMdl transferMdl)
        {
            bool doTransferResult = false;

            TransferJobTableMdl model = this.GetTransferJobModel(transferMdl);

            bool isWholeStudy = transferMdl.IsCheckAll;


            int checkCompress = 0;

            if (int.Parse(transferMdl.TransferCompressType) < 0)
            {
                checkCompress = 0;
            }
            else
            {
                checkCompress = 1;
            }

            doTransferResult = _dbHelper.SaveTransferJob(transferMdl.PacsList, 
                TransferJobCommandType.ID_COMMAND_PUSHIMAGES, model, isWholeStudy, transferMdl.IsCreateNewGuid,
                checkCompress, transferMdl.TransferCompressType, transferMdl.TransferCompressType, 
                "admin", "administrator");

            return _commonTool.GetJsonStringFromObject(doTransferResult);

        }

        [HttpPost]
        public string GetTransferCompress()
        {
            Dictionary<string, string> dicTransferCompress = new Dictionary<string, string>();
            DataTable tb = _dbHelper.GetTableTransferCompress();
            if (tb != null)
            {
                foreach (DataRow dr in tb.Rows)
                {
                    if (string.Compare(dr["PropertyName"].ToString(), "CompRatioList_0", true) > 0)
                    {
                        string compressText = String.Empty;
                        string compressValue = String.Empty;
                        //System.Web.UI.WebControls.ListItem item = new System.Web.UI.WebControls.ListItem();
                        if (dr["PropertyValue"].ToString().Trim() == "1")
                        {
                            compressText = "Lossless Compression"; // "Lossless Compression"; 
                        }
                        else
                        {
                            compressText = "Lossy" + dr["PropertyValue"].ToString() + ":1";
                        }

                        //item.Text = "Lossy" + dr["PropertyValue"].ToString() + ":1";

                        compressValue = dr["PropertyValue"].ToString();
                        dicTransferCompress.Add(compressValue, compressText);
                    }
                }
            }
            return _commonTool.GetJsonStringFromObject(dicTransferCompress);

        }

        public class RevTransferMdl
        {
            public List<Study> StudyList { get; set; }

            public List<Series> SeriesList { get; set; }

            public List<Image> ImageList { get; set; }

            public List<OtherPacs> PacsList { get; set; }

            public bool IsCheckAll { get; set; }

            public string TransferCompressType { get; set; }

            public string LastExportPatientInfoConfig { get; set; }

            public bool IsCreateNewGuid { get; set; }
        }



        #region Get StudyGUIDList, SerialGUIDList, NetAEList

        /// <summary>
        ///  Get StudyList, StudyGUIDs
        /// </summary>
        /// <returns></returns>
        private List<string> GetStudyGUIDList()
        {
            List<string> studyGUIDList = new List<string>();

            //if (Convert.ToInt16(this.hidStudyGUIDCount.Value) == 1)
            //{
            //    string studyGUID = this.hidStudyGUIDs.Value;
            //    if (!studyGUIDList.Contains(studyGUID))
            //    {
            //        studyGUIDList.Add(studyGUID.Trim());
            //    }
            //}
            //else if (Convert.ToInt16(this.hidStudyGUIDCount.Value) > 1)
            //{
            //    for (int rowIndex = 0; rowIndex < grdStudy.Rows.Count; rowIndex++)
            //    {
            //        GridViewRow item = grdStudy.Rows[rowIndex];
            //        if (item.RowType == DataControlRowType.DataRow)
            //        {
            //            CheckBox chkOne = item.Cells[0].FindControl("CheckOne") as CheckBox;
            //            if (chkOne != null)
            //            {
            //                if (chkOne.Checked)
            //                {
            //                    string studyGUID = grdStudy.DataKeys[item.DataItemIndex]["StudyInstanceUID"].ToString().Trim();
            //                    if (!studyGUIDList.Contains(studyGUID))
            //                    {
            //                        if (studyGUID != "")
            //                        {
            //                            studyGUIDList.Add(studyGUID.Trim());
            //                        }
            //                    }
            //                }
            //            }
            //        }
            //    }
            //}
            return studyGUIDList;
        }

        /// <summary>
        /// Get SerialGUIDList, SeriesGUIDs
        /// </summary>
        /// <returns></returns>
        private List<string> GetSerialGUIDList()
        {
            List<string> serialGUIDList = new List<string>();
            //if (Convert.ToInt16(this.hidStudyGUIDCount.Value) == 1)
            //{
            //    foreach (DataListItem item in seriesDataList.Items)
            //    {
            //        CheckBox serialChkBxItem = (CheckBox)item.FindControl("chkSerial");
            //        if (serialChkBxItem.Checked)
            //        {
            //            string serialID = this.seriesDataList.DataKeys[item.ItemIndex].ToString().Trim();
            //            if (!serialGUIDList.Contains(serialID))
            //            {
            //                if (serialID != "")
            //                {
            //                    serialGUIDList.Add(serialID);
            //                }
            //            }
            //        }
            //    }
            //}
            return serialGUIDList;
        }

        /// <summary>
        ///  Get NetAEList
        /// </summary>
        /// <returns></returns>
        private List<string> GetNetAEList()
        {
            List<string> netAEList = new List<string>();

            //for (int rowIndex = 0; rowIndex < grdNetAE.Rows.Count; rowIndex++)
            //{
            //    GridViewRow item = grdNetAE.Rows[rowIndex];
            //    if (item.RowType == DataControlRowType.DataRow)
            //    {
            //        CheckBox chkOne = item.Cells[0].FindControl("CheckOne") as CheckBox;
            //        if (chkOne != null)
            //        {
            //            if (chkOne.Checked)
            //            {
            //                string netAEName = grdNetAE.DataKeys[item.DataItemIndex]["NetAEName"].ToString().Trim();
            //                if (!netAEList.Contains(netAEName))
            //                {
            //                    if (netAEName != "")
            //                    {
            //                        netAEList.Add(netAEName.Trim());
            //                    }
            //                }
            //            }
            //        }
            //    }
            //}

            return netAEList;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        private TransferJobTableMdl GetTransferJobModel(RevTransferMdl transferMdl)
        {
            TransferJobTableMdl transferJobTableMdl = new TransferJobTableMdl();

            List<string> studyGUIDList = transferMdl.StudyList.Select(i => i.StudyInstanceUid).ToList();
            List<string> serialGUIDList = transferMdl.SeriesList.Select(i => i.InstanceUid).ToList();
            List<string> netAEList = transferMdl.PacsList.Select(i => i.NetAEName).ToList();
            List<string> imageList = transferMdl.ImageList.Select(i => i.SopInstanceUid).ToList();

            string studyGUIDs = _commonTool.GetGUIDsByList(studyGUIDList);
            string seriesGUIDs = _commonTool.GetGUIDsByList(serialGUIDList);
            string imageGUIDs = _commonTool.GetGUIDsByList(imageList);

            transferJobTableMdl = _dbHelper.GetTransferJobTableMdl(netAEList, studyGUIDs, seriesGUIDs, imageGUIDs);

            return transferJobTableMdl;
        }

        /// <summary>
        /// Get Export Image List
        /// </summary>
        /// <returns></returns>
        private List<string> GetExportImageList()
        {

            List<string> studyGUIDList = this.GetStudyGUIDList();
            List<string> serialGUIDList = this.GetSerialGUIDList();
            List<string> imageGUIDList = new List<string>();

            string studyGUIDs = _commonTool.GetGUIDsByList(studyGUIDList);
            string seriesGUIDs = _commonTool.GetGUIDsByList(serialGUIDList);
            //string imageGUIDs = _commonTool.GetSplitSingleQuotesUIDs(this.hidImageGUIDs.Value);
            string imageGUIDs = "11";

            DataTable dtImage = _dbHelper.GetTableImage(studyGUIDs, seriesGUIDs, imageGUIDs);

            foreach (DataRow drImage in dtImage.Rows)
            {
                string imageGUID = drImage["SOPInstanceUID"].ToString().Trim();
                if (!imageGUIDList.Contains(imageGUID))
                {
                    imageGUIDList.Add(imageGUID.Trim());
                }
            }

            //this.hidDownLoadStudyGUIDs.Value = StringWrapper.ListToStringJoinSingleQuotes(studyGUIDList);
            //this.hidDownLoadSerialGUIDs.Value = StringWrapper.ListToStringJoinSingleQuotes(serialGUIDList);
            //this.hidDownLoadImageGUIDs.Value = StringWrapper.ListToStringJoinSingleQuotes(imageGUIDList);

            return imageGUIDList;
        }

        #endregion
    }
}
