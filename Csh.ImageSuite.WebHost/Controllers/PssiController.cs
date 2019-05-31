using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Data;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web.Http;
using Csh.ImageSuite.Model.Config;
using Csh.ImageSuite.Model.Enum;
using Csh.ImageSuite.Model.JsonWrapper;

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
        public string CheckStudiesIncludeOffline(RevCheckedStudiesForOffline revCheckedStudiesForOffline)
        {
            //Dictionary<Dictionary<bool, string>, List<string>> dictResult = new Dictionary<Dictionary<bool, string>, List<string>>();
            revCheckedStudiesForOffline.StudyOfflineMessage = "";
            // This dictionary is include study is offline and popup study offline message.
            // If study offline on USB, should pop div loading and send socket to sms to online study.
            //Dictionary<bool, string> dictOfflineFlag = new Dictionary<bool, string>();
            //List<string> studyOfflineUidCDList = new List<string>();
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

                //dictOfflineFlag.Add(true, strPopUpStudyOfflineMessage);

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
                //dictOfflineFlag.Add(false, "");
                isOffline = false;
            }
            //dictResult.Add(dictOfflineFlag, studyOfflineUidUSBList);

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

        //public static int ReadConfigurationInt(string key)
        //{
        //    int result = -1;

        //    try
        //    {
        //        string configurationValue = ReadConfiguration(key);
        //        if (isNumberic(configurationValue))
        //        {
        //            result = Convert.ToInt32(configurationValue);
        //        }
        //    }
        //    catch (Exception ex)
        //    {

        //    }

        //    return result;
        //}

        //public static string ReadConfiguration(string key)
        //{
        //    string configurationValue = "";
        //    object objConfigurationValue = ConfigurationManager.AppSettings[key];
        //    if (objConfigurationValue != null && objConfigurationValue.ToString() != "")
        //    {
        //        configurationValue = objConfigurationValue.ToString();
        //    }
        //    return configurationValue;
        //}

        //public static bool isNumberic(string strValue)
        //{
        //    return Regex.IsMatch(strValue, @"^[-]?\d+[.]?\d*$");
        //}
    }
}
