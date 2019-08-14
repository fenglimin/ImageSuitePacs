using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Csh.ImageSuite.Model.Dicom;

namespace Csh.ImageSuite.MiniPacs.CompressHelper
{
    public class CompressTaskManager
    {
        private static Object _authorizeKey = new Object();

        public static string AddCompressTask(List<Image> ImageList, string sessionId)
        {
            foreach (Image image in ImageList)
            {
                var ret = MiniPacsDllImporter.dicom2jpg("2.1860.2003123013209.62.2.1.1", @"E:\Images\20190428\ECOM000008913\2.1860.2003123013209.62.2.1.1.dcm",
                    @"D:\Test\2.1860.2003123013209.62.2.1.1_1.jpg", 200, 200);

            }

            //Thread myNewThread = new Thread(() => DoCompress(ImageList, sessionId));
            //myNewThread.Start();

            return "";
        }

        public static void DoCompress(List<Image> ImageList, string sessionId)
        {
            lock (_authorizeKey)
            {
                

                CompressParam param = new CompressParam();
                Dicom2JpegCompressWorker.ProcessCompress(param);
                Thread.Sleep(1000);
                //Console.WriteLine("Name:" + Thread.CurrentThread.Name + " count:" + count.ToString());
            }
        }


        public static CompressTask GetCompressTask(String sessionId)
        {
            CompressTask compressTask = null;
            lock (_authorizeKey)
            {


                //CompressTaskStack compressTaskStack = null;
                //foreach (CompressTaskStack cts in _ctStackList)
                //{
                //    if (cts.SessionID == sessionId)
                //    {
                //        compressTaskStack = cts;
                //        break;
                //    }
                //}

                //if (compressTaskStack != null)
                //{
                //    if (compressTaskStack.Count > 0)
                //    {
                //        compressTask = compressTaskStack.Pop();
                //    }
                //    // no compress task in stack
                //    else
                //    {
                //        //GXLogManager.WriteLog(GXLogModule.JP2ManagementServer_CompressTaskManager, GXLogLevel.Info, GXLogCode.DEFAULT,
                //        //    String.Format("Delete compress task stack for session {0}.", compressTaskStack.SessionID));
                //        _ctStackList.Remove(compressTaskStack);
                //    }
                //}
            }

            return compressTask;
        }
    }
}
