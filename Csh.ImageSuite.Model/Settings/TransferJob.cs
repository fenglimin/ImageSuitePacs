using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Csh.ImageSuite.Model.Settings
{
    public class TransferJob
    {
        public string JobUid { get; set; }
        public string DeliveryStatus { get; set; }   
        public string PatientName { get; set; }
        public string PatientId { get; set; }
        public string CreatedDate { get; set; }
        public string Type { get; set; }
        public string ImageCount { get; set; }
        public string DeliveryName { get; set; }
        public string Destination { get; set; }
        public string FinishedNumber { get; set; }
        public string SuccessNumber { get; set; }
        public string CompressionRatio { get; set; }
    }

    public class TransferJobItem
    {
        public string ItemNo { get; set; }
        public string Type { get; set; }
        public string PatientId { get; set; }
        public string Name { get; set; }
        public string ExecuteStatus { get; set; }
        public string ExecuteTime { get; set; }

    }
}
