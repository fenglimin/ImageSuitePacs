using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace Csh.ImageSuite.Model.Dicom
{
    public class Study
    {
        public Study(string uid)
        {
            StudyInstanceUid = uid;
            SeriesList = new List<Series>();
        }

        public int Id { get; set; }

        public string StudyInstanceUid { get; set; }

        public Patient Patient { get; set; }

        [Display(Name = "Study ID")]
        public string StudyId { get; set; }

        [Display(Name = "Study Date")]
        public string StudyDateString{ get; set; }

        [Display(Name = "Study Time")]
        public string StudyTimeString { get; set; }

        [Display(Name = "Accession Number")]
        public string AccessionNo { get; set; }

        public string StudyDesc { get; set; }
        //public DateTime StudyDate { get; }

        //public DateTime StudyTime { get; }

        //public DateTime AcceptTime { get; }

        public List<Series> SeriesList { get; private set; }

        [Display(Name = "Series Count")]
        public int SeriesCount { get; set; }

        [Display(Name = "Image Count")]
        public int ImageCount { get; set; }

        public string Modality
        {
            get
            {
                var ret = string.Empty;
                foreach (var series in SeriesList)
                {
                    if (!ret.Contains(series.Modality + "|"))
                        ret += series.Modality + "|";
                }

                ret = ret.Remove(ret.Length - 1);
                return ret;
            }
        }
    }
}
