using System.Runtime.InteropServices;

namespace Csh.ImageSuite.MiniPacs
{
    public class MiniPacsDllImporter
    {
        [DllImport(@"C:\Program Files\Image Suite\PrimaryWS\dcmp2p.dll", CharSet = CharSet.Ansi, EntryPoint = "dicom_p2p")]
        public static extern int dicom_p2p(string pSOPInstanceUID, string pOutputPatientId, string pSrcFile, string pDstFile, int iMask);

        [DllImport(@"C:\Program Files\Image Suite\PrimaryWS\dcmp2p.dll", CharSet = CharSet.Ansi, EntryPoint = "dicom2jpg")]
        public static extern int dicom2jpg(string pSOPInstanceUID, string pDcmFile, string pJPGFile, int iWidth, int iHeight);

        [DllImport(@"C:\Program Files\Image Suite\PrimaryWS\dcmp2p_VM.dll", CharSet = CharSet.Ansi, EntryPoint = "dicom2jpg_vm")]
        public static extern int dicom2jpg_vm(string pSOPInstanceUID, int nFrameIndex, string pDcmFile, string pImageOperation, string pImageParas, string pJPGFile, string pJP2FileName);

    }

}