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

        public string PatientSex { get; set; }

        public string Modality { get; set; }

        public string StudyDate { get; set; }

        public DateTime? StudyDateFrom { get; set; }

        public DateTime? StudyDateTo { get; set; }

        public DateTime? PatientBirthDateFrom { get; set; }

        public DateTime? PatientBirthDateTo { get; set; }

        public string StudyId { get; set; }

        public string AccessionNo { get; set; }

        public string Printed { get; set; }


    }
}
