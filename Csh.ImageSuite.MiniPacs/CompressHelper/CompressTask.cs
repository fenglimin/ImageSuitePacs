using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Csh.ImageSuite.MiniPacs.CompressHelper
{
    public enum CompressTaskType
    {
        Dicom2Jp2,
        Dicom2Jpeg,
        Unknown
    }

    public class CompressTask
    {
        public string SOPInstanceUID { get; set; }

        public String DicomFileName { get; set; }

        public String JP2FileNameWithoutExtension { get; set; }

        public String SessionID { get; set; }

        public int NumberOfFrames { get; set; }

        public CompressTaskType TaskType { get; set; }
    }
}
