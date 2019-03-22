using System;
using System.Data;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;

namespace Csh.ImageSuite.Common
{
    public class PssiObjectCreator : IPssiObjectCreator
    {
        private readonly ICommonTool _commonTool;

        public PssiObjectCreator(ICommonTool commonTool)
        {
            _commonTool = commonTool;
        }

        public Patient CreatPatient(DataRow row)
        {
            var patient = new Patient(_commonTool.GetSafeStrValue(row["PatientID"]))
            {
                Id = _commonTool.GetSafeIntValue(row["ID_Patient"]),
                PatientName = _commonTool.GetSafeStrValue(row["PatientName"]),
                BirthDateString = _commonTool.GetSafeStrValue(row["PatientBirthDate"]),
                Gender = _commonTool.GetSafeStrValue(row["PatientSex"])
            };

            return patient;
        }

        public Study CreateStudy(DataRow row)
        {
            var study = new Study(_commonTool.GetSafeStrValue(row["StudyInstanceUID"]))
            {
                Id = _commonTool.GetSafeIntValue(row["ID_Study"]),
                AccessionNo = _commonTool.GetSafeStrValue(row["AccessionNo"]),
                StudyId = _commonTool.GetSafeStrValue(row["StudyID"]),
                StudyDateString = _commonTool.GetSafeStrValue(row["StudyDate"]),
                StudyTimeString = _commonTool.GetSafeStrValue(row["StudyTime"]),
                SeriesCount = _commonTool.GetSafeIntValue(row["SeriesCount"]),
                ImageCount = _commonTool.GetSafeIntValue(row["IC_Study"]),
                StudyDesc = _commonTool.GetSafeStrValue(row["StudyDescription"])
            };

            return study;
        }

        public Series CreateSeries(DataRow row)
        {
            var series = new Series(_commonTool.GetSafeStrValue(row["SeriesInstanceUID"]))
            {
                Id = _commonTool.GetSafeIntValue(row["ID_Series"]),
                BodyPart = _commonTool.GetSafeStrValue(row["BodyPart"]),
                ViewPosition = _commonTool.GetSafeStrValue(row["ViewPosition"]),
                Modality = _commonTool.GetSafeStrValue(row["Modality"]),
                SeriesNumber = _commonTool.GetSafeIntValue(row["SeriesNo"]),
                ImageCount = _commonTool.GetSafeIntValue(row["IC_Series"]),
                SeriesDateString = _commonTool.GetSafeStrValue(row["SeriesDate"]),
                SeriesTimeString = _commonTool.GetSafeStrValue(row["SeriesTime"])
            };

            return series;
        }

        public Image CreateImage(DataRow row)
        {
            var image = new Image(_commonTool.GetSafeStrValue(row["SOPInstanceUID"]))
            {
                Id = _commonTool.GetSafeIntValue(row["ID_Image"]),
                ImageColumns = _commonTool.GetSafeIntValue(row["ImageColumns"]),
                ImageRows = _commonTool.GetSafeIntValue(row["ImageRows"]),
                FilePath = _commonTool.GetSafeStrValue(row["ObjectFile"]),
                SerializeJson = string.Empty,
                ImageNumber = _commonTool.GetSafeIntValue(row["ImageNo"])
            };

            return image;
        }
    }
}