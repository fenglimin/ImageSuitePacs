using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Web.Script.Serialization;

namespace Csh.ImageSuite.Model.Dicom
{
    public class Series
    {
        public Series(string uid)
        {
            InstanceUid = uid;
            ImageList = new List<Image>();
        }

        public int Id { get; set; }

        public string InstanceUid { get; set; }

        [ScriptIgnore]
        public Study Study { get; set; }

        [Display(Name = "Series Date")]
        public string SeriesDateString { get; set; }

        [Display(Name = "Series Time")]
        public string SeriesTimeString { get; set; }

        [Display(Name = "BodyPart")]
        public string BodyPart { get; set; }

        public string ViewPosition { get; set; }

        [Display(Name = "Series Number")]
        public int SeriesNumber { get; set; }

        public string Modality { get; set; }

        [Display(Name = "Image Count")]
        public int ImageCount { get; set; }

        public List<Image> ImageList { get; private set; }
    }
}
