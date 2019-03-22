using System;

namespace Csh.ImageSuite.Model.Dicom
{
    public class QueryShortcut
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public int DataSource { get; set; }

        public string PatientId { get; set; }

        public string PatientName { get; set; }

        public string Gender { get; set; }

        public string Modality { get; set; }

        public string StudyDate { get; set; }

        public DateTime? BirthDateFrom { get; set; }

        public DateTime? BirthDateTo { get; set; }

        public string StudyId { get; set; }

        public string AccessionNo { get; set; }

        public string Tempxml { get; set; }
    }
}
