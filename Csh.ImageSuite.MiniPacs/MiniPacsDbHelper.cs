using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Common.Database;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;

namespace Csh.ImageSuite.MiniPacs
{
    public class MiniPacsDbHelper : IDbHelper
    {
        private readonly IPssiObjectCreator _pssiObjectCreator;
        private readonly ICommonTool _commonTool;
        private readonly string _connectionString;
        private static readonly Dictionary<string, string> DicStorageDirectory = new Dictionary<string, string>();


        public MiniPacsDbHelper(IPssiObjectCreator pssiObjectCreator, ICommonTool commonTool)
        {
            _connectionString = ConfigurationManager.ConnectionStrings["WGGC_Connection"].ConnectionString;

            _pssiObjectCreator = pssiObjectCreator;
            _commonTool = commonTool;

            LoadStorageDirectory();
        }

        private void LoadStorageDirectory()
        {
            const string sqlStr =
                "SELECT root_dir, storageAEName FROM StorageAE WHERE use_system = 'PACS' AND Storage_type = 1";
            var result = SqlHelper.ExecuteQuery(sqlStr, _connectionString);

            foreach (DataRow row in result.Tables[0].Rows)
            {
                var rootDir = row["root_dir"].ToString();
                var storageAeName = row["storageAEName"].ToString();

                DicStorageDirectory.Add(storageAeName, rootDir + "\\");
            }
        }

        public IList<QueryShortcut> LoadQueryShortcuts()
        {
            return new[]
            {
                new QueryShortcut() {Id = 3, Name = "aa"},
                new QueryShortcut() {Id = 4, Name = "bb"},
                new QueryShortcut() {Id = 5, Name = "cc"},
                new QueryShortcut() {Id = 6, Name = "dd"},
                new QueryShortcut() {Id = 7, Name = "ee"},
                new QueryShortcut() {Id = 8, Name = "ff"}
            };
        }

        public IList<Study> GetStudies(QueryShortcut query)
        {
            var studies = new List<Study>();

            var sqlStr = string.Format("SELECT " +
                                       "P.SerialNo ID_Patient, P.PatientID, P.PatientName, P.PatientBirthDate, P.PatientSex, " +
                                       "S.SerialNo ID_Study, S.StudyInstanceUID, S.AccessionNo, S.StudyID, S.StudyDate, S.StudyTime, S.SeriesCount, S.ImageCount IC_Study, " +
                                       "R.SerialNo ID_Series, R.SeriesInstanceUID, R.SeriesNo, R.SeriesDate, R.SeriesTime, R.BodyPart, R.ViewPosition, R.Modality, R.ImageCount IC_Series " +
                                       "FROM Patient P, Study S, Series R " +
                                       "WHERE R.StudyInstanceUID = S.StudyInstanceUID AND S.PatientGUID = P.PatientGUID");
            //sqlStr += BuildSqlCondition(query);

            var result = SqlHelper.ExecuteQuery(sqlStr, _connectionString);
            foreach (DataRow row in result.Tables[0].Rows)
            {
                var series = _pssiObjectCreator.CreateSeries(row);

                var studyId = _commonTool.GetSafeIntValue(row["ID_Study"]);
                var study = studies.FirstOrDefault(s => s.Id == studyId);
                if (study == null)
                {
                    study = _pssiObjectCreator.CreateStudy(row);
                    study.Patient = _pssiObjectCreator.CreatPatient(row);
                    studies.Add(study);
                }

                series.Study = study;
                study.SeriesList.Add(series);
            }

            return studies;
        }

        public Study GetStudy(int serialNo)
        {
            var sbSql = new StringBuilder();
            sbSql.Append("select Image.SerialNo ID_Image, Image.SOPInstanceUID, Image.ImageColumns, Image.ImageRows, Image.ObjectFile, ");//4
            sbSql.Append("Series.SerialNo ID_Series, Series.SeriesInstanceUID, Series.BodyPart, Series.ViewPosition, Series.Modality,  Series.ImageCount IC_Series,");//9
            sbSql.Append("Study.SerialNo ID_Study, Study.StudyInstanceUID, Study.AccessionNo, Study.StudyID, Study.StudyDate, Study.StudyTime, Study.SeriesCount, Study.ImageCount IC_Study, ");//16
            sbSql.Append("Patient.SerialNo ID_Patient, Patient.PatientID, Patient.PatientName, Patient.PatientBirthDate, Patient.PatientSex, Series.SeriesDate, Series.SeriesTime, Series.SeriesNo, Image.ImageNo  from Image ");
            sbSql.Append("join Series on Image.SeriesInstanceUID = Series.SeriesInstanceUID ");
            sbSql.Append("join Study on Series.StudyInstanceUID = Study.StudyInstanceUID ");
            sbSql.Append("join Patient on study.PatientGUID = Patient.PatientGUID ");
            sbSql.Append("where study.SerialNo=" + serialNo);
            sbSql.Append(" order by Series.SeriesNo, Image.ImageNo");

            var sqlStr = sbSql.ToString();
            var result = SqlHelper.ExecuteQuery(sqlStr, _connectionString);

            Study newStudy = null;
            Patient newPatient = null;


            foreach (DataRow row in result.Tables[0].Rows)
            {
                if (newPatient == null)
                {
                    newPatient = _pssiObjectCreator.CreatPatient(row);
                }

                if (newStudy == null)
                {
                    newStudy = _pssiObjectCreator.CreateStudy(row);
                    newStudy.Patient = newPatient;
                }

                var seriesId = _commonTool.GetSafeIntValue(row["ID_Series"]);
                var newSeries = newStudy.SeriesList.FirstOrDefault(s => s.Id == seriesId);
                if (newSeries == null)
                {
                    newSeries = _pssiObjectCreator.CreateSeries(row);
                    newStudy.SeriesList.Add(newSeries);
                    newSeries.Study = newStudy;
                }

                var newImage = _pssiObjectCreator.CreateImage(row);
                newSeries.ImageList.Add(newImage);
                newImage.Series = newSeries;
            }

            return newStudy;
        }

        public Image GetImage(int serialNo)
        {
            var sqlStr = "SELECT SerialNo ID_Image, ImageNo, SOPInstanceUID, ImageColumns, ImageRows, ObjectFile FROM Image WHERE serialNo = " + serialNo;
            var result = SqlHelper.ExecuteQuery(sqlStr, _connectionString);
            if (result.Tables[0].Rows.Count != 1)
                return null;

            return _pssiObjectCreator.CreateImage(result.Tables[0].Rows[0]);
        }

        public string GetImageRootDir(int serialNo)
        {
            var sbSql = new StringBuilder();
            sbSql.Append("SELECT SMS.sms_name FROM SMS ");
            sbSql.Append("join Series on Series.StudyInstanceUID = SMS.SUID ");
            sbSql.Append("join Image on Image.SeriesInstanceUID = Series.SeriesInstanceUID ");
            sbSql.Append("where SMS.sms_type = 1 AND Image.serialNo = " + serialNo);

            var sqlStr = sbSql.ToString();
            var storageAeName = SqlHelper.GetSingleReturnValue(sqlStr, _connectionString);
            return DicStorageDirectory[storageAeName];
        }
    }
}
