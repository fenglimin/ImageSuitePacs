

using System.Web.Script.Serialization;

namespace Csh.ImageSuite.Model.Dicom
{
    public class Image
    {
        public Image(string sopUid)
        {
            SopInstanceUid = sopUid;
        }

        public int Id { get; set; }

        public string SopInstanceUid { get; set; }

        /// <summary>
        /// ImageNumber, and the tag is (0020, 0013) Instance Number
        /// </summary>
        public int ImageNumber { get; set; }

        public string ImageDateString { get; set; }

        public string ImageTimeString { get; set; }

        public int ImageRows { get; set; }

        public int ImageColumns { get; set; }

        public string FilePath { get; set; }

        /// <summary>
        /// JSON string contains image's annotations, transform, window center/width, etc.
        /// </summary>
        public string SerializeJson { get; set; }

        [ScriptIgnore]
        public Series Series { get; set; }

    }
}
