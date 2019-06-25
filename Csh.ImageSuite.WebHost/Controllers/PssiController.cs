using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web.Http;
using Csh.ImageSuite.Model.Config;
using Csh.ImageSuite.Model.Enum;
using Csh.ImageSuite.Model.JsonWrapper;
using Csh.ImageSuite.WebHost.Common;

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
            //var study = _dbHelper.GetStudy(id);

            //List<Study>  lstStudy = _dbHelper.GetHasHistoryStudyUidArray(study.StudyInstanceUid);

            //return _commonTool.GetJsonStringFromObject(study);
            return "";
        }

        [System.Web.Mvc.HttpPost]
        public string GetStudiesForDcmViewer(RevStudiesForDcmViewer revStudiesForDcmViewer)
        {
            var lstStudy = new List<Study>();
            //var study = new Study();

            if (revStudiesForDcmViewer.ShowHistoryStudies)
            {
                foreach (var id in revStudiesForDcmViewer.Ids)
                {
                    var study = _dbHelper.GetStudy(int.Parse(id), false);

                    var tempStudies = _dbHelper.GetHasHistoryStudyUidArray(study.StudyInstanceUid,
                        revStudiesForDcmViewer.ShowKeyImage);

                    foreach (var tempStudy in tempStudies)
                    {
                        if (!lstStudy.Contains(tempStudy))
                        {
                            lstStudy.Add(tempStudy);
                        }
                    }
                }
            }
            else
            {
                foreach (var id in revStudiesForDcmViewer.Ids)
                {
                    var study = _dbHelper.GetStudy(int.Parse(id), revStudiesForDcmViewer.ShowKeyImage);

                    if (study == null)
                        return "";

                    if (!lstStudy.Contains(study))
                    {
                        lstStudy.Add(study);
                    }
                }
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

            return _commonTool.GetJsonStringFromObject(true);
        }

        [System.Web.Mvc.HttpPost]
        public string SetUnread(string id)
        {
            ScanStatus NewStatus = ScanStatus.Ended;
            _dbHelper.UpdateStudyScanStatus(id, NewStatus);

            return _commonTool.GetJsonStringFromObject(true);
        }

        [System.Web.Mvc.HttpPost]
        public string SetDeletePrevent(string id)
        {
            ReservedStatus reservedStatus = ReservedStatus.Reserved;
            _dbHelper.SetReserved(id, reservedStatus);

            return _commonTool.GetJsonStringFromObject(true);
        }

        [System.Web.Mvc.HttpPost]
        public string SetDeleteAllow(string id)
        {
            ReservedStatus reservedStatus = ReservedStatus.UnReserved;
            _dbHelper.SetReserved(id, reservedStatus);
            return _commonTool.GetJsonStringFromObject(true);
        }

        [System.Web.Mvc.HttpPost]
        public string DeleteStudy(DeleteStudyJson deleteStudyJson)
        {
            _dbHelper.DeletedStudy(deleteStudyJson.Id, deleteStudyJson.DeletionReason);
            return _commonTool.GetJsonStringFromObject(true);
        }

        [System.Web.Mvc.HttpPost]
        public string SetKeyImage(RevKeyImage revKeyImage)
        {
            _dbHelper.SetKeyImage(revKeyImage.Id, revKeyImage.Marked);
            return _commonTool.GetJsonStringFromObject(true);
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

        [System.Web.Mvc.HttpPost]
        public string UpdateStudy(Study study)
        {
            try
            {
                #region ************************************************************************
                string strDateSeparatorValue = "";
                string strDateFormatValue = _dbHelper.GetDateFormat(out strDateSeparatorValue);
                string strLogMessage = "";
                bool IsVetApplication = false;

                Dictionary<string, string> dict = new Dictionary<string, string>();

                #region ///// Update Patient
                string patlNameValue = study.Patient.LastName;
                string patfNameValue = study.Patient.FirstName;
                string patmNameValue = study.Patient.MiddleName;

                //string patNameValue = patlNameValue + "^" + patfNameValue + "^" + patmNameValue;
                string strPatientNameValue = GetPatientName(patlNameValue, patfNameValue, patmNameValue);

                string strPatientIdValue = study.Patient.PatientId;
                //string strVetOwnerNameValue = IsVetApplication == true ? patlNameValue : "";
                string strVetOwnerNameValue = "";

                string patDataBirthValue = study.Patient.PatientBirthDate;
                //CultureInfo cultureInfo = CultureInfo.CreateSpecificCulture("en-US");
                //string format = "ddd MMM dd yyyy HH:mm:ss zz00";
                //string stringValue = DateTime.Now.ToString(format, cultureInfo); // 得到日期字符串
                //DateTime dtPatientBirthday = DateTime.ParseExact(patDataBirthValue, format, cultureInfo); // 将字符串转换成日期
                DateTime dtPatientBirthday = GetDate(patDataBirthValue, strDateFormatValue, strDateSeparatorValue);
                string strPatientBirthDay = dtPatientBirthday.ToString("yyyyMMdd");

                // Get patient age
                DateTime datBirthday = GetDate(patDataBirthValue, strDateFormatValue, strDateSeparatorValue);
                string strPatientAge = GetPatientAge(datBirthday);

                //string strPatientSexValueFromDll = study.Patient.PatientSex;
                //string strPatientSpecies = study.Patient.Species;
                //string strPatientBreed = study.Patient.Breed;
                //string strPatientChip = study.Patient;
                string strPatientCommentValue = study.Patient.PatientComments ?? "";

                Study oldStudy = _dbHelper.GetStudy(study.Id, false);
                //string oldPatIdValue = StudyBLL.GetPatientIdByStudyUID(studyGUID);

                //MWLPatientMdl patMdl = MWLPatientBiz.GetPatientInfoByStudyUID(studyGUID);
                //if (patMdl == null) return false;
                Patient patientMdl = oldStudy.Patient;
                string oldPatIdValue = patientMdl.PatientId;

                var strPatientSex = study.Patient.PatientSex;
                //var strNeuteredValue = "";
                //var iNeutered = "";

                //if (strPatientSexValueFromDll.Length == 2)
                //{
                //    strPatientSex = strPatientSexValueFromDll.Substring(0, 1);
                //    iNeutered = strPatientSexValueFromDll.Substring(1, 1);
                //    if (iNeutered == "1")
                //    {
                //        strNeuteredValue = "ALTERED";
                //    }
                //    else if (iNeutered == "0")
                //    {
                //        strNeuteredValue = "UNALTERED";
                //    }
                //}
                //else
                //{
                //    strPatientSex = strPatientSexValueFromDll;
                //}

                bool isPatientUpdate = false;

                if (IsVetApplication)
                {
                    //if (!(patMdl.PatientName.Trim() == strPatientNameValue.Trim() &&
                    //    patMdl.PatientID.Trim() == strPatientIdValue.Trim() &&
                    //    patMdl.PatientBirthDate.Trim() == strPatientBirthDay.Trim() &&
                    //    patMdl.PatientSex.Trim() == strPatientSex.Trim() &&
                    //    patMdl.PatientComments.Trim() == strPatientCommentValue.Trim() &&
                    //    patMdl.Breed.Trim() == strPatientBreed.Trim() &&
                    //    patMdl.ChipId.Trim() == strPatientChip.Trim() &&
                    //    patMdl.Species.Trim() == strPatientSpecies.Trim()))
                    //{
                    //    isPatientUpdate = true;
                    //}
                }
                else
                {
                    if (!(patientMdl.PatientName.Trim() == strPatientNameValue.Trim() &&
                          patientMdl.PatientId.Trim() == strPatientIdValue.Trim() &&
                          patientMdl.PatientBirthDate.Trim() == strPatientBirthDay.Trim() &&
                          patientMdl.PatientSex.Trim() == strPatientSex.Trim() &&
                          patientMdl.PatientComments.Trim() == strPatientCommentValue.Trim()))
                    {
                        isPatientUpdate = true;
                    }
                }


                if (isPatientUpdate)
                {
                    dict.Clear();
                    // Update Patient
                    dict.Add("PatientName", strPatientNameValue);
                    dict.Add("PatientID", strPatientIdValue);
                    dict.Add("PatientBirthDate", strPatientBirthDay);
                    dict.Add("PatientSex", strPatientSex);
                    dict.Add("Comments", strPatientCommentValue);
                    dict.Add("OldPatientID", oldPatIdValue);
                    dict.Add("PatientAge", strPatientAge);
                    // Old Values
                    dict.Add("FirstName", patfNameValue);
                    dict.Add("MiddleName", patmNameValue);
                    dict.Add("LastName", patlNameValue);

                    if (IsVetApplication)
                    {
                        //dict.Add("Species", strPatientSpecies);
                        //dict.Add("Breed", strPatientBreed);
                        //dict.Add("ChipId", strPatientChip);
                    }
                    else
                    {
                        dict.Add("Species", patientMdl.Species);
                        dict.Add("Breed", patientMdl.Breed);
                        //dict.Add("ChipId", patientMdl.ChipId);
                    }


                    //dict.Add("OpUser", SessionLevelVariable.CurrentUser.UserId);
                    dict.Add("OpUser", "admin");
                    _dbHelper.UpdatePatientEdit(dict);
                    _dbHelper.SyncACQPatient(dict);

                    //strLogMessage = string.Format(" Update Patient Information-> "
                    //               + " Original Data:PatientName={0},PatientID={1},Gender={2},BirthDate={3},PatientAge={4},PatientComment={5},"
                    //               + " New Data:PatientName={6},PatientID={7},Gender={8},BirthDate={9},PatientAge={10},PatientComment={11}"
                    //               , patMdl.PatientName.Trim(), patMdl.PatientID.Trim(), patMdl.PatientSex.Trim(), patMdl.PatientBirthDate.Trim(), patMdl.PatientAge.Trim(), patMdl.PatientComments.Trim()
                    //               , strPatientNameValue, strPatientIdValue, strPatientSex, strPatientBirthDay, strPatientAge, strPatientCommentValue.Trim());

                    //GXLogManager.WriteLog(GXLogModule.Web_PAGE_PatientEdit, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                }
                #endregion

                #region ///// Update Study
                string studyAccNumValue = study.AccessionNo ?? "";
                string studyVeterinarian = study.Veterinarian ?? "";
                string studyRefPhyValue = study.ReferPhysician ?? "";
                string studyDesValue = study.StudyDescription ?? "";
                string studySymptonValue = study.AdditionalPatientHistory ?? "";
                string studyPriorityValue = study.RequestedProcPriority ?? "";

                //DataTable studyDt = StudyBLL.GetTableStudy(StringWrapper.GetSplitSingleQuotesUIDs(studyGUID));
                //if (studyDt.Rows.Count <= 0) return false;

                bool isStudyUpdate = false;
                if (IsVetApplication)
                {
                    //if (!(studyAccNumValue.Trim() == studyDt.Rows[0]["AccessionNo"].ToString().Trim() &&
                    //    studyRefPhyValue.Trim() == studyDt.Rows[0]["ReferPhysician"].ToString().Trim() &&
                    //    studyVeterinarian.Trim() == studyDt.Rows[0]["Veterinarian"].ToString().Trim() &&
                    //    strNeuteredValue.Trim() == studyDt.Rows[0]["Neutered"].ToString().Trim() &&
                    //    studyDesValue.Trim() == studyDt.Rows[0]["StudyDescription"].ToString().Trim() &&
                    //    studyPriorityValue.Trim() == studyDt.Rows[0]["RequestedProcPriority"].ToString().Trim() &&
                    //    studySymptonValue.Trim() == studyDt.Rows[0]["AdditionalPatientHistory"].ToString().Trim()))
                    //{
                    //    isStudyUpdate = true;
                    //}
                }
                else
                {
                    if (!(studyAccNumValue.Trim() == oldStudy.AccessionNo.Trim() &&
                        studyRefPhyValue.Trim() == oldStudy.ReferPhysician.Trim() &&
                        //strNeuteredValue.Trim() == oldStudy.ReferPhysician.Trim() &&
                        studyDesValue.Trim() == oldStudy.StudyDescription.Trim() &&
                        //studyPriorityValue.Trim() == oldStudy.RequestedProcPriority.Trim() &&
                        studySymptonValue.Trim() == oldStudy.AdditionalPatientHistory.Trim()))
                    {
                        isStudyUpdate = true;
                    }
                }


                if (isStudyUpdate)
                {
                    // Update Study
                    dict.Clear();

                    dict.Add("StudyInstanceUID", study.StudyInstanceUid);
                    dict.Add("AccessionNo", studyAccNumValue);
                    dict.Add("StudyID", study.StudyId.Trim());
                    dict.Add("StudyDate", study.StudyDate.Trim());
                    dict.Add("StudyTime", study.StudyTime.Trim());
                    dict.Add("ReferPhysician", studyRefPhyValue);
                    if (IsVetApplication)
                    {
                        //dict.Add("PhysicianOfRecord", studyVeterinarian);
                    }
                    else
                    {
                        dict.Add("PhysicianOfRecord", study.Veterinarian.Trim());
                    }

                    dict.Add("StudyDescription", studyDesValue);
                    dict.Add("StudyPriority", studyPriorityValue);
                    dict.Add("AdditionalPatientHistory", studySymptonValue);
                    // Old Values
                    //dict.Add("Neutered", studyDt.Rows[0]["Neutered"].ToString().Trim());
                    dict.Add("Neutered", "UNALTERED");
                    dict.Add("SeriesInstanceUID", "");
                    dict.Add("Modality", "");
                    dict.Add("BodyPart", "");
                    dict.Add("ViewPos", "");
                    dict.Add("SeriesDescription", "");
                    dict.Add("OpUser", "admin");
                    _dbHelper.UpdateStudyEdit(dict);

                    //strLogMessage = string.Format(" Update Study Information For PatientName={0},PatientID={1}->"
                    //                 + " Original Data:AcessionNo={2},StudyID={3},StudyDate={4},ReferPhysician={5},StudyDescription={6},AdditionalPatientHistory={7},"
                    //                 + " New Data:AcessionNo={8},StudyID={9},StudyDate={10},ReferPhysician={11},StudyDescription={12},AdditionalPatientHistory={13}"
                    //                 , strPatientNameValue.Trim(), strPatientIdValue.Trim()
                    //                 , studyDt.Rows[0]["AccessionNo"].ToString().Trim(), studyGUID.Trim(), studyDt.Rows[0]["StudyDate"].ToString().Trim(), studyDt.Rows[0]["ReferPhysician"].ToString().Trim(), studyDt.Rows[0]["StudyDescription"].ToString().Trim(), studyDt.Rows[0]["AdditionalPatientHistory"].ToString().Trim()
                    //                 , studyAccNumValue, studyGUID.Trim(), studyDt.Rows[0]["StudyDate"].ToString().Trim(), studyRefPhyValue.Trim(), studyDesValue.Trim(), studySymptonValue.Trim());

                    //GXLogManager.WriteLog(GXLogModule.Web_PAGE_PatientEdit, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                }
                #endregion

                #region ///// Update Series

                foreach (Series series in study.SeriesList)
                {
                    foreach (Series oldSeries in oldStudy.SeriesList)
                    {
                        if (oldSeries.SeriesNo == series.SeriesNo)
                        {
                            string strSeriesModalityValue = series.Modality ?? "";
                            string strSeriesDescriptionValue = series.SeriesDescription ?? "";
                            //string strSeriesKeyValue = series;

                            string strSeriesUID = series.InstanceUid ?? "";

                            string strBodyPart = series.BodyPart ?? "";
                            string strViewPosition = series.ViewPosition ?? "";
                            string strLocalBodyPart = series.LocalBodyPart ?? "";
                            string strLocalViewPosition = series.LocalViewPosition ?? "";

                            //if (strIsVetSpeciesChanged == "1")
                            //{
                            //    strBodyPart = strDefaultBodyPart;
                            //    strLocalBodyPart = strDefaultLocalBodyPart;
                            //    strViewPosition = strDefaultViewPosition;
                            //    strLocalViewPosition = strDefaultLocalViewPosition;
                            //}

                            //DataTable dtSeries = SeriesBLL.GetTableSeries(StringWrapper.GetSplitSingleQuotesUIDs(studyGUID), StringWrapper.GetSplitSingleQuotesUIDs(strSeriesUID));
                            //if (dtSeries.Rows.Count <= 0) return false;

                            bool isSeriesUpdate = false;

                            if (!(strSeriesModalityValue.Trim() == oldSeries.Modality.Trim() &&
                                  strSeriesDescriptionValue.Trim() == oldSeries.SeriesDescription.Trim() &&
                                  strBodyPart.Trim() == oldSeries.BodyPart.Trim() &&
                                  strViewPosition.Trim() == oldSeries.ViewPosition.Trim() &&
                                  strLocalBodyPart.Trim() == oldSeries.LocalBodyPart.Trim() &&
                                  strLocalViewPosition.Trim() == oldSeries.LocalViewPosition.Trim()))
                            {
                                isSeriesUpdate = true;
                            }

                            if (isSeriesUpdate)
                            {
                                // Update Series
                                dict.Clear();
                                dict.Add("SeriesInstanceUID", strSeriesUID);
                                dict.Add("Modality", strSeriesModalityValue);
                                // Old Values
                                dict.Add("SeriesCategory", "");

                                dict.Add("SeriesBodyPart", strBodyPart);
                                dict.Add("SeriesLocalBodypart", strLocalBodyPart);
                                dict.Add("SeriesViewPos", strViewPosition);
                                dict.Add("SeriesLocalViewPos", strLocalViewPosition);
                                dict.Add("SeriesDescription", strSeriesDescriptionValue);
                                dict.Add("SeriesOpUser", "admin");
                                _dbHelper.UpdateSerieEdit(dict);
                            }
                        }
                    }

                    

                    //    //strLogMessage = string.Format(" Update Series  Information For PatientName={0} ,PatientID={1},StudyInstanceUID={2}-->"
                    //    //                 + " Original Data:Modality={3},Category={4},BodyPart={5},ViewPosition={6},SeriesDescription = {7}, "
                    //    //                 + " New Data:Modality={8},Category={9},BodyPart={10},ViewPosition={11},SeriesDescription = {12} "
                    //    //                 , strPatientNameValue.Trim(), strPatientIdValue.Trim(), studyGUID.Trim()
                    //    //                 , dtSeries.Rows[0]["Modality"].ToString().Trim(), dtSeries.Rows[0]["Category"].ToString().Trim(), dtSeries.Rows[0]["LocalBodypart"].ToString().Trim(), dtSeries.Rows[0]["LocalViewPosition"].ToString().Trim(), dtSeries.Rows[0]["SeriesDescription"].ToString().Trim()
                    //    //                 , strSeriesModalityValue.Trim(), dtSeries.Rows[0]["Category"].ToString().Trim(), strLocalBodyPart.Trim(), strLocalViewPosition.Trim(), strSeriesDescriptionValue.Trim());

                    //    //GXLogManager.WriteLog(GXLogModule.Web_PAGE_PatientEdit, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                    //}
                }
                #endregion
                /////
                //if (strIsVetSpeciesChanged == "1" && IsVetApplication)
                //{
                //    DataTable dtVetSeries = SeriesBLL.GetTableSeries(StringWrapper.GetSplitSingleQuotesUIDs(studyGUID), "");
                //    if (dtVetSeries.Rows.Count <= 0) return false;

                //    foreach (DataRow dr in dtVetSeries.Rows)
                //    {
                //        // Update Series
                //        dict.Clear();

                //        strSeriesUID = dr["SeriesInstanceUID"].ToString().Trim();
                //        strSeriesModalityValue = dr["Modality"].ToString().Trim();
                //        strSeriesDescriptionValue = dr["SeriesDescription"].ToString().Trim();
                //        string strSeriesCategory = dr["Category"].ToString().Trim();

                //        dict.Add("SeriesInstanceUID", strSeriesUID);
                //        dict.Add("Modality", strSeriesModalityValue);
                //        dict.Add("SeriesCategory", strSeriesCategory);
                //        dict.Add("SeriesBodyPart", strDefaultBodyPart);
                //        dict.Add("SeriesLocalBodypart", strDefaultLocalBodyPart);
                //        dict.Add("SeriesViewPos", strDefaultViewPosition);
                //        dict.Add("SeriesLocalViewPos", strDefaultLocalViewPosition);
                //        dict.Add("SeriesDescription", strSeriesDescriptionValue);
                //        dict.Add("SeriesOpUser", SessionLevelVariable.CurrentUser.UserId);
                //        MWLPatientDAL.UpdateSerieEdit(dict);

                //        strLogMessage = string.Format(" Update Series  Information For PatientName={0} ,PatientID={1},StudyInstanceUID={2}-->"
                //                     + " Original Data:Modality={3},Category={4},BodyPart={5},ViewPosition={6},SeriesDescription = {7}, "
                //                     + " New Data:Modality={8},Category={9},BodyPart={10},ViewPosition={11} ,SeriesDescription = {12}"
                //                     , strPatientNameValue.Trim(), strPatientIdValue.Trim(), studyGUID.Trim()
                //                     , dr["Modality"].ToString().Trim(), dr["Category"].ToString().Trim(), dr["LocalBodypart"].ToString().Trim(), dr["LocalViewPosition"].ToString().Trim(), dr["SeriesDescription"].ToString().Trim()
                //                     , strSeriesModalityValue.Trim(), strSeriesCategory.Trim(), strDefaultLocalBodyPart.Trim(), strDefaultLocalViewPosition.Trim(), strSeriesDescriptionValue.Trim());

                //        //GXLogManager.WriteLog(GXLogModule.Web_PAGE_PatientEdit, GXLogLevel.Info, GXLogCode.DEFAULT, strLogMessage);
                //    }
                //}

                #endregion
                return _commonTool.GetJsonStringFromObject("true");
            }
            catch (Exception e)
            {
                return _commonTool.GetJsonStringFromObject("false");

            }


        }


        public static string GetPatientName(string LastName, string FirstName, string MiddleName)
        {
            // PatientName in DB storage format is: L^F^M
            string PatientName = string.Join("^", new string[] { LastName, FirstName, MiddleName });
            // Trim ^
            PatientName = PatientName.TrimEnd(new char[] { '^' });

            return PatientName;
        }

        public static DateTime GetDate(string DateString, string DateFormat, string DateSeparator)
        {
            try
            {
                string NewDateString = "";
                foreach (string var in DateString.Split(DateSeparator.ToCharArray()))
                {
                    if (var.Length == 1)
                    {
                        NewDateString += "0" + var;
                    }
                    else
                    {
                        NewDateString += var;
                    }
                }

                DateFormat = DateFormat.Replace(DateSeparator, "");
                return GXWebUtilGetDate(NewDateString, DateFormat);
            }
            catch
            {
                return DateTime.MinValue;
            }
        }

        public static DateTime GXWebUtilGetDate(string DateString, string DateFormat)
        {
            try
            {
                if (string.IsNullOrEmpty(DateString.Trim()))
                {
                    return DateTime.MinValue;
                }

                DateFormat = DateFormat.ToLower();
                string year = DateString.Substring(DateFormat.IndexOf("y"), DateFormat.LastIndexOf("y") - DateFormat.IndexOf("y") + 1);
                string month = DateString.Substring(DateFormat.IndexOf("m"), DateFormat.LastIndexOf("m") - DateFormat.IndexOf("m") + 1);
                string day = DateString.Substring(DateFormat.IndexOf("d"), DateFormat.LastIndexOf("d") - DateFormat.IndexOf("d") + 1);

                DateTime dat = new DateTime(Convert.ToInt16(year), Convert.ToInt16(month), Convert.ToInt16(day));
                return dat;
            }
            catch (Exception)
            {
                return DateTime.MinValue;
            }
        }

        public static string GetPatientAge(DateTime datBirthday)
        {
            try
            {
                string strTotalAge = PatientAgeParser.getPatientAge(datBirthday.ToString("yyyyMMdd"));
                return strTotalAge;
            }
            catch
            {
                return "";
            }
        }

        [System.Web.Mvc.HttpPost]
        public string CheckStudiesIncludeOffline(RevCheckedStudiesForOffline revCheckedStudiesForOffline)
        {
            revCheckedStudiesForOffline.StudyOfflineMessage = "";

            List<string> studyOfflineUidUSBList = new List<string>();
            bool isOffline = false;

            string strPopUpStudyOfflineMessage = "Please wait 20 seconds to restore patient images from Offline device.";

            List<string> studyInstanceUIDList = revCheckedStudiesForOffline.studyInstanceUIDList;
            string studyUIDs = GetGUIDsByList(studyInstanceUIDList);

            DataTable tbStudyOffline = _dbHelper.GetTableStudyOffline(studyUIDs, "");
            if (tbStudyOffline != null && tbStudyOffline.Rows.Count > 0)
            {
                isOffline = true;

                List<Study> studyInfoModelOfflineUIDList = new List<Study>();
                string strOfflineMessage = "";

                strOfflineMessage = _dbHelper.GetStringStudyOffline(studyUIDs, "", out studyInfoModelOfflineUIDList);

                // 1.PopUp Message for study offline
                if (strOfflineMessage.Trim().Length > 0)
                {
                    strPopUpStudyOfflineMessage += "\n" + strOfflineMessage;
                }

                foreach (Study model in studyInfoModelOfflineUIDList)
                {
                    if (model.IsUSBOffline == true)
                    {
                        if (!studyOfflineUidUSBList.Contains(model.StudyInstanceUid))
                        {
                            studyOfflineUidUSBList.Add(model.StudyInstanceUid);
                        }
                    }
                }
            }
            else
            {
                isOffline = false;
            }

            var sendCheckedStudiesForOffline = new SendCheckedStudiesForOffline
            {
                IsOffline = isOffline,
                StudyOfflineUidUSBList = studyOfflineUidUSBList,
                PopUpStudyOfflineMessage = strPopUpStudyOfflineMessage
            };

            return _commonTool.GetJsonStringFromObject(sendCheckedStudiesForOffline);
        }

        [System.Web.Mvc.HttpPost]
        public string StudyOfflineInsertCDJobList(List<string> studyInstanceUIDList)
        {
            //List<string> studyInstanceUIDList = new List<string>(studyInstanceUIDList);
            string studyUIDs = GetGUIDsByList(studyInstanceUIDList);

            List<Study> studyInfoModelOfflineUIDList = new List<Study>();

            List<string> logMsgList = new List<string>();

            _dbHelper.GetStringStudyOffline(studyUIDs, "", out studyInfoModelOfflineUIDList);

            List<string> studyOfflineUidCDList = new List<string>();
            List<string> studyOfflineUidUSBList = new List<string>();

            foreach (Study model in studyInfoModelOfflineUIDList)
            {
                if (model.IsCDOffline == true)
                {
                    if (!studyOfflineUidCDList.Contains(model.StudyInstanceUid))
                    {
                        studyOfflineUidCDList.Add(model.StudyInstanceUid);
                    }
                }

                if (model.IsUSBOffline == true)
                {
                    if (!studyOfflineUidUSBList.Contains(model.StudyInstanceUid))
                    {
                        studyOfflineUidUSBList.Add(model.StudyInstanceUid);
                    }
                }
            }

            // 2. Insert Restore Task in DB about CD JOB for study offline.
            if (studyOfflineUidCDList.Count > 0)
            {
                _dbHelper.AddCDJob(studyOfflineUidCDList);
                //_dbHelper.InsertCDJobList(studyOfflineUidCDList, ref logMsgList);
                CdSendSocketToSms(studyOfflineUidCDList);
            }

            // 3. Insert Restore Task in DB about USB JOB for study offline.
            if (studyOfflineUidUSBList.Count > 0)
            {
                //CDJobListBLL.InsertUSBJobList(studyOfflineUidUSBList, ref logMsgList);
                ParameterizedThreadStart tsThreadSendSocketToSMS = new ParameterizedThreadStart(ThreadSendSocketToSMS);
                Thread tThreadSendSocketToSMS = new Thread(tsThreadSendSocketToSMS);
                tThreadSendSocketToSMS.Start(studyOfflineUidUSBList);
            }


            //Dictionary<bool, string> dictEndStatus = new Dictionary<bool, string>();
            bool result = false;
            var msg = "";
            int i = 0;
            while (i != 20)
            {
                DataTable tbStudyOnline = _dbHelper.GetTableStudyOnline(studyUIDs, "");

                if (tbStudyOnline != null && tbStudyOnline.Rows.Count > 0)
                {
                    result = tbStudyOnline.Rows.Count == studyInstanceUIDList.Count;
                }

                if (!result)
                {
                    msg = "System timeout, unable to restore images from offline device." + "\n\n";
                    msg += studyUIDs + "\n";
                    msg += "Image restore in progress. Please refresh the worklist." + "\n";
                    msg += "For images archived to USB or NET storage, please make sure the storages are connected before restoring." + "\n";
                    msg += "For images burned to CD/DVD, please go to workstation to restore it.";
                }
                else
                {
                    msg = "";
                    break;
                }

                i++;
                Thread.Sleep(1000);
            }

            return _commonTool.GetJsonStringFromObject(msg);
        }

        public static string GetGUIDsByList(List<string> GUIDList)
        {
            string result = string.Empty;

            if (GUIDList.Count > 0)
            {
                foreach (string dataKey in GUIDList)
                {
                    if (dataKey.Trim().Length > 0)
                    {
                        result += "'" + dataKey.Trim() + "',";
                    }
                }
                if (result.Length > 0)
                {
                    result = result.Substring(0, result.Length - 1);
                }
            }
            return result;
        }

        private void ThreadSendSocketToSMS(object obj)
        {
            List<string> studyOfflineUidUSBList = (List<string>)obj;
            UsbSendSocketToSMS(studyOfflineUidUSBList);
        }

        public static void UsbSendSocketToSMS(List<string> studyUidList)
        {
            Socket clientSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            clientSocket.ReceiveTimeout = 5000;
            try
            {
                IPAddress serverIp = GetServerIP();
                IPEndPoint iep = new IPEndPoint(serverIp, 2000);
                string logMsg = "";
                try
                {
                    clientSocket.Connect(iep);
                    foreach (string studyUid in studyUidList)
                    {
                        logMsg = string.Format("StudyInstanceUID {0} send socket to SMS.", studyUid);
                        //GXLogManager.WriteLog(GXLogModule.WEB_PAGE_Worklist, GXLogLevel.Info, GXLogCode.DEFAULT, logMsg);

                        string studyUidTemp = studyUid.PadRight(64, ' ');

                        char[] studyUidArray = new char[64];

                        studyUidArray = studyUidTemp.ToCharArray();

                        char[] userIdArray = new char[16];

                        SMSConstant.SMS_OUTBUF sms_OutBuf = new SMSConstant.SMS_OUTBUF();

                        sms_OutBuf.nMagic = IPAddress.HostToNetworkOrder(0x19790324);
                        sms_OutBuf.tRqst.nCommand = 0;
                        sms_OutBuf.tRqst.StudyInstanceGUID = studyUidArray;

                        byte[] sendData = rawSerialize(sms_OutBuf);
                        int sendStatus = clientSocket.Send(sendData, sendData.Length, 0);
                        Thread.Sleep(1000);
                    }
                }
                catch (Exception ex)
                {
                    Console.Write(ex.ToString());
                }
                finally
                {
                    clientSocket.Close();
                }
            }
            catch (Exception ex)
            {
                Console.Write(ex.ToString());
            }
        }

        public void CdSendSocketToSms(List<string> studyUidList)
        {
            Socket clientSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            clientSocket.ReceiveTimeout = 5000;
            try
            {
                IPAddress serverIp = GetServerIP();
                IPEndPoint iep = new IPEndPoint(serverIp, 2000);
                string logMsg = "";
                try
                {
                    clientSocket.Connect(iep);
                    foreach (string studyUid in studyUidList)
                    {

                        string studyUidTemp = studyUid.PadRight(64, ' ');

                        char[] studyUidArray = new char[64];

                        studyUidArray = studyUidTemp.ToCharArray();

                        char[] userIdArray = new char[16];

                        SMSConstant.SMS_OUTBUF sms_OutBuf = new SMSConstant.SMS_OUTBUF();

                        sms_OutBuf.nMagic = IPAddress.HostToNetworkOrder(0x19790324);
                        sms_OutBuf.tRqst.nCommand = IPAddress.HostToNetworkOrder(4);
                        sms_OutBuf.tRqst.StudyInstanceGUID = studyUidArray;

                        byte[] sendData = rawSerialize(sms_OutBuf);

                        int sendStatus = clientSocket.Send(sendData, sendData.Length, 0);

                        if (sendStatus == sendData.Length)
                        {
                            _dbHelper.UpdateCDJobStatus(studyUid.Trim());
                        }

                        Thread.Sleep(1000);
                    }
                }
                catch (Exception ex)
                {

                }
                finally
                {
                    clientSocket.Close();
                }
            }
            catch (Exception ex)
            {
                Console.Write(ex.ToString());
            }
        }

        public static IPAddress GetServerIP()
        {
            string hostName = Dns.GetHostName();
            hostName = "127.0.0.1";
            if (hostName == null || hostName == "")
            {
                return null;
            }
            IPHostEntry ieh = new IPHostEntry();
            ieh = Dns.GetHostByName(hostName);
            return ieh.AddressList[0];
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static byte[] rawSerialize(object obj)
        {
            int rawsize = Marshal.SizeOf(obj);
            IntPtr buffer = Marshal.AllocHGlobal(rawsize);
            Marshal.StructureToPtr(obj, buffer, false);
            byte[] rawdatas = new byte[rawsize];
            Marshal.Copy(buffer, rawdatas, 0, rawsize);
            Marshal.FreeHGlobal(buffer);

            return rawdatas;
        }

        public class SMSConstant
        {
            const int SMS_OPERATE_STATUS = 0x00010000;

            //const definition used in SMS
            //sms_type
            const short SMS_TYPE_MAINSTORE = 0x0001;
            const short SMS_TYPE_SUBSTORE = 0x0002;
            const short SMS_TYPE_PRECD = 0x0003;
            const short SMS_TYPE_JUKEBOX = 0x0004;
            const short SMS_TYPE_USB = 0x0008;
            const short SMS_TYPE_CDROM = 0x0010;
            const short SMS_TYPE_DVDROM = 0x0011;
            const short SMS_TYPE_TAPE = 0x0020;
            const short SMS_TYPE_PRIVATE_NEARLINE = 0x0030;
            //status
            const short SMS_STATUS_MAINSTORE_OK = 0x0001;
            const short SMS_STATUS_MAINSTORE_PRECD = 0x0002;
            const short SMS_STATUS_MAINSTORE_ARCHIVED = 0x0003;
            const short SMS_STATUS_MAINSTORE_DELETE = 0x0004;
            const short SMS_STATUS_DELETED = 0x0004;//add by thomas, 06/06/2005
            const short SMS_STATUS_PROBLEMED = 0x0010;
            const short SMS_STATUS_SUBSTORE_OK = 0x0001;
            const short SMS_STATUS_SUBSTORE_ARCHIVED = 0x0003;
            const short SMS_STATUS_SUBSTORE_DELETE = 0x0004;

            public const string SMS_SERVICE_SOCKET_TIMEOUT = "SMSServiceTimeOut";// 5000;
            public const string SMS_SERVICE_SOCKET_IP_PORT = "SMSServicePort";  // 2000; // 53255;

            //2.communication related error
            public enum SMS_NET_STATUS
            {
                SMS_NET_OK = 0,          //success
                SMS_NET_CLOSE,           //pear close connection
                SMS_NET_TIMEOUT,         //network send/rcv timeout
                SMS_NET_DOWN,            //network down
                SMS_NET_SERVERDOWN,      //sms down
                SMS_NET_OTHER            //other error
            }

            //3.command enumeration
            public enum SMS_CMD
            {
                SMS_GET_STUDY,           //get offline study
                SMS_GET_FREESPACE,       //get free space
                SMS_FORCE_ARCHIVE,       //force to archive to PreCD
                SMS_FORCE_DELETE,        //force LRU 
                SMS_RESTORE_CD,          //restore study from offline
                SMS_DISABLE_ARCHIVE,     //stop the archival operation
                SMS_ENABLE_ARCHIVE       //enable archival operation 
            }

            //4.command struct
            [Serializable]
            [StructLayout(LayoutKind.Sequential)]
            public struct SMS_RQST
            {
                public int nCommand;
                [MarshalAs(UnmanagedType.ByValArray, SizeConst = 64)]
                public char[] StudyInstanceGUID;
                [MarshalAs(UnmanagedType.ByValArray, SizeConst = 16)]
                public char[] szUser;
                public int nOption;            // if nCommand is SMS_DISABLE_ARCHIVE,
                                               // nOption will be the timeout value in minute
            } //SMS_RQST, *LPSMS_RQST;

            [Serializable]
            [StructLayout(LayoutKind.Sequential)]
            public struct SMS_RSP
            {
                public int nCommand;
                public int nErrCode;
                public int nRsp1;
                public int nRsp2;
                public int nRsp3;
                public char[] szInfo;
            }

            [Serializable]
            [StructLayout(LayoutKind.Sequential)]
            // buf struct
            public struct SMS_INBUF
            {
                public int nMagic;
                public SMS_RSP tRsp;
            };

            [Serializable]
            [StructLayout(LayoutKind.Sequential)]
            public struct SMS_OUTBUF
            {
                public int nMagic;
                public SMS_RQST tRqst;
            };
        }

 
    }
}
