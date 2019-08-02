using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Csh.ImageSuite.Model.Common
{
    class WorklistModel
    {
    }

    public class OtherPacs
    {
        public bool PacsChecked { get; set; }

        public string NetAEName { get; set; }

        public string AETitle { get; set; }

        public string IPAddress { get; set; }

        public string StorageCommitment { get; set; }
    }

    public class TransferExportBaseModel
    {
        public DataTable TableStudy { get; set; }

        public DataTable TableSerial { get; set; }

        public DataTable TableImage { get; set; }
    }

    public class TransferJobTableMdl : TransferExportBaseModel
    {
        /// <summary>
        /// User check which NetAE Name need to be transfer
        /// </summary>
        public List<string> NetAEList { get; set; }

        /// <summary>
        /// All the NetAE infomation
        /// </summary>
        public DataTable TableNetAE { get; set; }
    }

    public class TransferOutputTypeConstant
    {
        public const string IMAGE = "IMAGEID";

        public const string SERIES = "SERIESID";

        public const string STUDY = "STUDYID";

        public const string PATIENT = "PATIENTID";
    }
}
