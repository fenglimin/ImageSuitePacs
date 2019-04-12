using System.ComponentModel.DataAnnotations;

namespace Csh.ImageSuite.Model.Dicom
{
    public class Patient
    {
        public Patient(string patientId)
        {
            PatientId = patientId;
        }

        public int Id { get; set; }

        [Display(Name = "Patient ID")]
        public string PatientId { get; set; }

        [Display(Name = "Name")]
        public string PatientName { get; set; }

        public string FirstName { get; set; }

        public string MiddleName { get; set; }

        public string LastName { get; set; }

        [Display(Name = "Date of Birth")]
        public string PatientBirthDate { get; set; }

        [Display(Name = "Patient Sex")]
        public string PatientSex { get; set; }

        public string PatientAge { get; set; }

        public string Breed { get; set; }

        public string Species { get; set; }
    }
}
