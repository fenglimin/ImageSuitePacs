using System.IO;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.MiniPacs.Interface;
using Csh.ImageSuite.Model.Enum;

namespace Csh.ImageSuite.MiniPacs
{
    public class MiniPacsDicomHelper : IMiniPacsDicomHelper
    {
        private readonly IDbHelper _dbHelper;
        private readonly ICommonTool _commonTool;

        public MiniPacsDicomHelper(IPacsCoordinator pacsCoordinator, ICommonTool commonTool)
        {
            _dbHelper = pacsCoordinator.GetDbHelper(PacsType.MiniPacs);
            _commonTool = commonTool;
        }

        public bool DicomP2P(string sopInstanceUid, string inputFile, string outputFile, int opMask)
        {
            var ret = MiniPacsDllImporter.dicom_p2p(sopInstanceUid, string.Empty, inputFile, outputFile, opMask);
            return ret == 0;
        }

        public string GetDicomFile(int serialNo)
        {
            var image = _dbHelper.GetImage(serialNo);
            if (image == null)
            {
                return string.Empty;
            }

            var dcmFile = Path.Combine(_dbHelper.GetImageRootDir(serialNo), image.FilePath);
            var processedFile = "D:\\" + image.SopInstanceUid + ".dcm";

            var ret = MiniPacsDllImporter.dicom_p2p(image.SopInstanceUid, string.Empty, dcmFile, processedFile, 3);
            
            return ret == 1 ? processedFile : string.Empty;
        }

        public string GetThumbnailFile(int serialNo)
        {
            var image = _dbHelper.GetImage(serialNo);
            if (image == null)
            {
                return string.Empty;
            }

            var dcmFile = Path.Combine(_dbHelper.GetImageRootDir(serialNo), image.FilePath);
            var bmpFile = dcmFile.Remove(dcmFile.Length - 3, 3) + "bmp";
            return bmpFile;
        }
    }
}