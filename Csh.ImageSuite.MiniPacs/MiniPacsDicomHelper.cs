using System;
using System.IO;
using System.Linq;
using System.Text;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.MiniPacs.Interface;
using Csh.ImageSuite.Model.Enum;
using Csh.ImageSuite.Model.JsonWrapper;
using Dicom;

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

        public string GetDicomFile(int serialNo, bool needP2P)
        {
            var image = _dbHelper.GetImage(serialNo);
            if (image == null)
            {
                return string.Empty;
            }

            var dcmFile = Path.Combine(_dbHelper.GetImageRootDir(serialNo), image.FilePath);
            if (!needP2P)
            {
                return dcmFile;
            }

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

        /// <summary>
        /// Save annotation to dicom file
        /// </summary>
        /// <param name="revAnnImage"></param>
        /// <returns>Empty string is successful, else return the error message</returns>
        public string SaveAnnToDicomFile(RevAnnImage revAnnImage)
        {
            var ret = "";
            try
            {
                var annTag = new DicomTag(0x0011, 0x101D);
                var bytes = Enumerable.Range(0, revAnnImage.AnnString.Length)
                    .Where(x => x % 2 == 0)
                    .Select(x => Convert.ToByte(revAnnImage.AnnString.Substring(x, 2), 16))
                    .ToArray();

                var filePath = GetDicomFile(Convert.ToInt32(revAnnImage.Id), false);
                var dicomFile = DicomFile.Open(filePath);
                dicomFile.Dataset.AddOrUpdate(DicomVR.OB, annTag, bytes);

                var tempFile = filePath + ".tmp";
                dicomFile.Save(tempFile);
                File.Copy(tempFile, filePath, true);
                File.Delete(tempFile);
            }
            catch (Exception e)
            {
                ret = e.Message;
            }

            return ret;
        }
    }
}