﻿namespace Csh.ImageSuite.MiniPacs.Interface
{
    public interface IMiniPacsDicomHelper
    {
        bool DicomP2P(string sopInstanceUid, string inputFile, string outputFile, int opMask);

        string GetJpgFile(int serialNo);
    }
}