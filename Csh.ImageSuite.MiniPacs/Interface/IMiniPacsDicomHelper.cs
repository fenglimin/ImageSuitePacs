using Csh.ImageSuite.Model.JsonWrapper;

namespace Csh.ImageSuite.MiniPacs.Interface
{
    public interface IMiniPacsDicomHelper
    {
        bool DicomP2P(string sopInstanceUid, string inputFile, string outputFile, int opMask);

        string GetDicomFile(int serialNo, bool needP2P);

        string GetThumbnailFile(int serialNo);

        string SaveAnnToDicomFile(RevAnnImage revAnnImage);
    }
}