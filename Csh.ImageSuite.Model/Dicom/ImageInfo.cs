using System;
using System.Collections.Generic;
using System.Text;
using System.Collections;

namespace Csh.ImageSuite.Model.Dicom
{
    [Serializable]
    public class ImageInfo
    {
        private string _seriesInstanceUID;
        private string _sopInstanceUID;     // SOPInstanceUID
        private string _objectFile;         // ObjectFile
        private int _numberOfFrames;        // NumberOfFrames
        private string _imageNo;            // ImageNumber
        private string _jp2FileName;        // Jp2 file name

        public ImageInfo()
        {
            _seriesInstanceUID = string.Empty;
            _sopInstanceUID = String.Empty;
            _imageNo = String.Empty;
            _objectFile = String.Empty;
            _numberOfFrames = 0;
        }

        public string SeriesInstanceUID
        {
            get { return _seriesInstanceUID; }
            set { _seriesInstanceUID = value; }
        }

        public string SopInstanceUID
        {
            get { return _sopInstanceUID; }
            set { _sopInstanceUID = value; }
        }

        public string JP2FileName
        {
            get { return _jp2FileName; }
            set { _jp2FileName = value; }
        }

        public string ObjectFile
        {
            get { return _objectFile; }
            set { _objectFile = value; }
        }

        public int NumberOfFrames
        {
            get { return _numberOfFrames; }
            set { _numberOfFrames = value; }
        }

        public string ImageNumber
        {
            get { return _imageNo; }
            set { _imageNo = value; }
        }
    }

    [Serializable]
    public class ImageModel
    {
        public string ImagePreview;
        public string OldNum;
        public string NewNum;
        public string ImageTime;
        public string ImageType;
        public string AcqTime;
        public string SlicePostion;
        public string SOPID;
        public string EchoNum;
    }
}
