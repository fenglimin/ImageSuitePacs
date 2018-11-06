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
                                       "S.SerialNo ID_Study, S.StudyInstanceUID, S.StudyDate, S.StudyTime, S.SeriesCount, S.ImageCount IC_Study, " +
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
    }
}
