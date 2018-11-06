using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

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
                if(SeriesList.Count > 0)
                {
                    return SeriesList[0].Modality;
                }
                else
                {
                    return string.Empty;
                }
            }
        }
    }
}
