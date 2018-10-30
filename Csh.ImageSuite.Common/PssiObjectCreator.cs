using System;
using System.Data;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;

namespace Csh.ImageSuite.Common
{
    public class PssiObjectCreator : IPssiObjectCreator
    {
        public Patient CreatPatient(DataRow row)
        {
            var patient = new Patient(GetSafeStringValue(row["PatientID"]))
            {
                Id = GetSafeIntValue(row["ID_Patient"]),
                PatientName = GetSafeStringValue(row["PatientName"]),
                BirthDateString = GetSafeStringValue(row["PatientBirthDate"]),
                Gender = GetSafeStringValue(row["PatientSex"])
            };

            return patient;
        }

        public Study CreateStudy(DataRow row)
        {
            var study = new Study(GetSafeStringValue(row["StudyInstanceUID"]))
            {
                Id = GetSafeIntValue(row["ID_Study"]),
                StudyDateString = GetSafeStringValue(row["StudyDate"]),
                StudyTimeString = GetSafeStringValue(row["StudyTime"]),
                SeriesCount = GetSafeIntValue(row["SeriesCount"]),
                ImageCount = GetSafeIntValue(row["IC_Study"])
            };

            return study;
        }

        public Series CreateSeries(DataRow row)
        {
            var series = new Series(row["SeriesInstanceUID"].ToString().TrimEnd())
            {
                Id = GetSafeIntValue(row["ID_Series"]),
                BodyPart = GetSafeStringValue(row["BodyPart"]),
                ViewPosition = GetSafeStringValue(row["ViewPosition"]),
                Modality = GetSafeStringValue(row["Modality"]),
                SeriesNumber = GetSafeIntValue(row["SeriesNo"]),
                ImageCount = GetSafeIntValue(row["IC_Series"]),
                SeriesDateString = GetSafeStringValue(row["SeriesDate"]),
                SeriesTimeString = GetSafeStringValue(row["SeriesTime"])
            };

            return series;
        }

        public Image CreateImage(DataRow row)
        {
            var image = new Image(row["SOPInstanceUID"].ToString().TrimEnd())
            {
                Id = GetSafeIntValue(row["ID_Image"]),
                ImageColumns = GetSafeIntValue(row["ImageColumns"]),
                ImageRows = GetSafeIntValue(row["ImageRows"]),
                FilePath = GetSafeStringValue(row["ObjectFile"]),
                SerializeJson = string.Empty,
                ImageNumber = GetSafeIntValue(row["ImageNo"])
            };

            return image;
        }

        public string GetSafeStringValue(object value)
        {
            return value?.ToString().TrimEnd() ?? string.Empty;
        }

        public int GetSafeIntValue(object value)
        {
            var ret = 0;

            try
            {
                if (value != null)
                {
                    ret = Convert.ToInt32(value.ToString().TrimEnd());
                }
            }
            catch (Exception)
            {
                // ignored
            }

            return ret;
        }
    }
}