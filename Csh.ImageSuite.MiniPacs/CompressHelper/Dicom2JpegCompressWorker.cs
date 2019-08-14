using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Common.Registry;

namespace Csh.ImageSuite.MiniPacs.CompressHelper
{
    public class Dicom2JpegCompressWorker
    {
        public enum CompressResult
        {
            SUCCESS,
            FAIL
        }

        public string GetCacheFolder()
        {
            return RegistryHelper.ImageSuiteInstallDir;
        }

        public string GetFileExtension()
        {
            return ".jpg";
        }

        public static CompressResult ProcessCompress(CompressParam param)
        {
            int result = 1;
            try
            {
                result = MiniPacsDllImporter.dicom2jpg(param.sopInstanceUID, param.dicomFileName, param.outputFileName + "_1.jtf",
                    1200, 1200);
            }
            catch (Exception ex)
            {
                //GXLogManager.WriteLog(GXLogModule.JP2ManagementServer_CompressWorker, GXLogLevel.Error, GXLogCode.DEFAULT, ex);
            }

            return (result == 1) ? CompressResult.SUCCESS : CompressResult.FAIL;
        }
    }

    public class CompressParam
    {
        //public CompressParam()
        //{
        //    isJPX = 0;
        //    sopInstanceUID = string.Empty;
        //    dicomFileName = string.Empty;
        //    outputFileName = string.Empty;
        //}

        public String sopInstanceUID { get; set; }
        public String dicomFileName { get; set; }
        public String outputFileName { get; set; }
        public int isJPX { get; set; }
    }
}
