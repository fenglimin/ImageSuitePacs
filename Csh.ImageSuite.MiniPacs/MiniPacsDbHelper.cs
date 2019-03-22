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
using System.Data.SqlClient;
using System.Xml;
using System.IO;

namespace Csh.ImageSuite.MiniPacs
{
    public class MiniPacsDbHelper : IDbHelper
    {
        private readonly IPssiObjectCreator _pssiObjectCreator;
        private readonly ICommonTool _commonTool;
        private readonly string _connectionString;
        private static readonly Dictionary<string, string> DicStorageDirectory = new Dictionary<string, string>();
        private static readonly Dictionary<string, string> DicOldWebPacsTransform = new Dictionary<string, string>();


        public MiniPacsDbHelper(IPssiObjectCreator pssiObjectCreator, ICommonTool commonTool)
        {
            _connectionString = ConfigurationManager.ConnectionStrings["WGGC_Connection"].ConnectionString;

            _pssiObjectCreator = pssiObjectCreator;
            _commonTool = commonTool;

            LoadStorageDirectory();

            AddOldWebPacsTranslate();
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

        private void AddOldWebPacsTranslate()
        {
            DicOldWebPacsTransform.Add("PatientID", "PatientId");
            DicOldWebPacsTransform.Add("PatientsName", "PatientName");
            DicOldWebPacsTransform.Add("PatientsSex", "Gender");
            DicOldWebPacsTransform.Add("AccessionNumber", "AccessionNo");
            //DicOldWebPacsTransform.Add("PatientsBirthDate", "studyId");
            //DicOldWebPacsTransform.Add("Modality", "modality");
        }

        public IList<QueryShortcut> LoadQueryShortcuts()
        {
            try
            {
                DataSet ds;
                string strSQL = "";
                List<SqlParameter> lstParameter = new List<SqlParameter>();

                strSQL = @"SELECT [PropertyName], [PropertyValue] FROM  [UserProfile] " +
                            "WHERE  [PropertyName] like @PropertyName AND [UserName] = @UserName AND [RoleName] = @RoleName " +
                            "ORDER BY [PropertyName]";

                lstParameter.Add(new SqlParameter("@UserName", "admin"));
                lstParameter.Add(new SqlParameter("@RoleName", "administrator"));
                lstParameter.Add(new SqlParameter("@PropertyName", string.Format("{0}{1}", "Web_WorklistShortcut", "%")));


                ds = SqlHelper.ExecuteQuery(strSQL, lstParameter.ToArray(), _connectionString);

                List<QueryShortcut> lstShortcut = new List<QueryShortcut>();
                QueryShortcut mdl;
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    mdl = new QueryShortcut();

                    // eg: Web_WorklistShortcut1|LocalDataSource|2|s
                    var names = row["PropertyName"].ToString().Split('|');
                    mdl.Name = names[3];

                    XmlDocument xmldoc = new XmlDocument();
                    xmldoc.LoadXml(row["PropertyValue"].ToString());

                    // Get all child node from root node
                    foreach (XmlNode node in xmldoc.LastChild)
                    {
                        if (node.Name == "TagPatientsBirthDate")
                        {
                            DateTime datFrom = DateTime.MinValue;
                            DateTime datTo = DateTime.MaxValue;

                            foreach (XmlNode _node in node.ChildNodes)
                            {
                                if (_node.Name == "From")
                                {
                                    try { mdl.BirthDateFrom = Convert.ToDateTime(_node.InnerText).AddMinutes(1); }
                                    catch { }
                                }
                                else if (_node.Name == "To")
                                {
                                    try { mdl.BirthDateTo = Convert.ToDateTime(_node.InnerText).AddMinutes(1); }
                                    catch { }
                                }
                            }

                            continue;
                        }

                        // Get all property of QueryShortcut
                        foreach (System.Reflection.PropertyInfo info in mdl.GetType().GetProperties())
                        {
                            string propertyName = info.Name;
                            // Transform old web pacs name
                            foreach (var value in DicOldWebPacsTransform.Values)
                            {
                                if (propertyName == value)
                                {
                                    propertyName = DicOldWebPacsTransform.FirstOrDefault(x => x.Value == value).Key;
                                }
                            }
                            // Set value
                            if (node.Name.Contains("Tag" + propertyName))
                            {
                                info.SetValue(mdl, node.InnerText, null);
                            }
                        }
                    }

                    lstShortcut.Add(mdl);
                }
                return lstShortcut;
            }
            catch (Exception)
            {
                throw;
            }

            //return new[]
            //{
            //    new QueryShortcut() {Id = 3, Name = "aa"},
            //    new QueryShortcut() {Id = 4, Name = "bb"},
            //    new QueryShortcut() {Id = 5, Name = "cc"},
            //    new QueryShortcut() {Id = 6, Name = "dd"},
            //    new QueryShortcut() {Id = 7, Name = "ee"},
            //    new QueryShortcut() {Id = 8, Name = "ff"}
            //};
        }

        public void SaveShortcut(QueryShortcut shortcut)
        {
            MemoryStream stream = new MemoryStream();
            XmlWriterSettings setting = new XmlWriterSettings();
            setting.Encoding = new UTF8Encoding(false);
            setting.Indent = false;
            XmlWriter writer = XmlWriter.Create(stream, setting);

            //Write root
            writer.WriteStartDocument();
            writer.WriteStartElement("root");


            // Get all property of QueryShortcut
            foreach (System.Reflection.PropertyInfo info in shortcut.GetType().GetProperties())
            {
                string propertyValue = (info.GetValue(shortcut, null) ?? "").ToString();
                string propertyName = info.Name;

                if (!String.IsNullOrEmpty(propertyValue))
                {
                    if (info.PropertyType == typeof(DateTime))
                    {
                        if (propertyName == "BirthDateFrom")
                        {
                            writer.WriteStartElement("Tag" + "PatientsBirthDate");
                            writer.WriteStartElement("From");
                            writer.WriteValue(propertyValue.ToString());
                            writer.WriteEndElement();
                            writer.WriteStartElement("To");
                            writer.WriteValue(shortcut.BirthDateTo.ToString());
                            writer.WriteEndElement();
                            writer.WriteEndElement();
                            continue;
                        }
                    }

                    foreach (var value in DicOldWebPacsTransform.Values)
                    {

                        if (propertyName == value)
                        {
                            propertyName = DicOldWebPacsTransform.FirstOrDefault(x => x.Value == value).Key;

                            writer.WriteStartElement("Tag" + propertyName);
                            writer.WriteValue(propertyValue);
                            writer.WriteEndElement();
                        }
                    }
                }
            }

            writer.WriteEndElement();
            writer.WriteEndDocument();

            // ¹Ø±Õwriter
            writer.Close();

            string strCondition = Encoding.UTF8.GetString(stream.ToArray());
            string shortcutName = "Web_WorklistShortcut1|LocalDataSource|2|"+ shortcut.Name.Trim();
            string shortcutXml = strCondition;

            SqlWrapper sql = new SqlWrapper();
            List<SqlParameter> lstSqlPara = new List<SqlParameter>();

            sql.SqlString = "INSERT INTO [UserProfile]([PropertyName],[PropertyValue],[Inheritance],[UserName],[RoleName],[ModuleName], [Exportable]) "
                          + "VALUES(@PropertyName, @PropertyValue, 1, @UserName, @RoleName, @ModuleName, @Exportable)";

            lstSqlPara.Add(new SqlParameter("@PropertyName", shortcutName));
            lstSqlPara.Add(new SqlParameter("@PropertyValue", shortcutXml));
            lstSqlPara.Add(new SqlParameter("@UserName", "admin"));
            lstSqlPara.Add(new SqlParameter("@RoleName", "administrator"));
            lstSqlPara.Add(new SqlParameter("@ModuleName", "Web"));
            lstSqlPara.Add(new SqlParameter("@Exportable", "Web_WorklistShortcut"));

            sql.Parameter = lstSqlPara.ToArray();

            SqlHelper.ExecuteNonQuery(sql, _connectionString);
        }

        public void DeleteShortcut(string shortcutName)
        {
            try
            {
                shortcutName = "Web_WorklistShortcut1|LocalDataSource|2|" + shortcutName.Trim();

                SqlWrapper sql = new SqlWrapper();
                List<SqlParameter> lstSqlPara = new List<SqlParameter>();

                sql.SqlString = "delete from UserProfile where PropertyName = @PropertyName";

                lstSqlPara.Add(new SqlParameter("@PropertyName", shortcutName));

                sql.Parameter = lstSqlPara.ToArray();

                SqlHelper.ExecuteNonQuery(sql, _connectionString);
            }
            catch (Exception ex)
            {

                throw;
            }
            
            
        }


        public IList<Study> GetStudies(QueryShortcut queryShortcut)
        {
            var studies = new List<Study>();

            var sqlStr = string.Format("SELECT " +
                                       "P.SerialNo ID_Patient, P.PatientID, P.PatientName, P.PatientBirthDate, P.PatientSex, " +
                                       "S.SerialNo ID_Study, S.StudyInstanceUID, S.AccessionNo, S.StudyID, S.StudyDate, S.StudyTime, S.SeriesCount, S.ImageCount IC_Study, S.StudyDescription, " +
                                       "R.SerialNo ID_Series, R.SeriesInstanceUID, R.SeriesNo, R.SeriesDate, R.SeriesTime, R.BodyPart, R.ViewPosition, R.Modality, R.ImageCount IC_Series " +
                                       "FROM Patient P, Study S, Series R " +
                                       "WHERE R.StudyInstanceUID = S.StudyInstanceUID AND S.PatientGUID = P.PatientGUID");
            sqlStr += BuildSqlCondition(queryShortcut);

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
            sbSql.Append("Study.SerialNo ID_Study, Study.StudyInstanceUID, Study.AccessionNo, Study.StudyID, Study.StudyDate, Study.StudyTime, Study.SeriesCount, Study.ImageCount IC_Study, Study.StudyDescription, ");//16
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

        private static string BuildSqlCondition(QueryShortcut queryShortcut)
        {
            var strCondition = string.Empty;
            if (queryShortcut == null)
            {
                return strCondition;
            }

            if (!string.IsNullOrEmpty(queryShortcut.PatientId))
            {
                strCondition += $" AND P.PatientID LIKE '%{queryShortcut.PatientId}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.PatientName))
            {
                strCondition += $" AND P.PatientName LIKE '%{queryShortcut.PatientName}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.BirthDateFrom.ToString()) && !string.IsNullOrEmpty(queryShortcut.BirthDateTo.ToString()))
            {
                DateTime birthDateFrom = (DateTime)queryShortcut.BirthDateFrom;
                DateTime birthDateTo = (DateTime)queryShortcut.BirthDateTo;

                strCondition += $" AND P.PatientBirthDate BETWEEN '{birthDateFrom.ToString("yyyyMMdd")}' AND '{birthDateTo.ToString("yyyyMMdd")}'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.Gender))
            {
                strCondition += $" AND P.PatientSex = '{queryShortcut.Gender}'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.StudyId))
            {
                strCondition += $" AND S.StudyID LIKE '%{queryShortcut.StudyId}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.StudyDate))
            {
                var today = DateTime.Today;
                switch (queryShortcut.StudyDate)
                {
                    case "Today":
                        queryShortcut.StudyDate = today.ToString("yyyyMMdd");
                        break;
                    case "Since Yesterday":
                        queryShortcut.StudyDate = today.AddDays(-1).ToString("yyyyMMdd");
                        break;
                    case "Last 7 Days":
                        queryShortcut.StudyDate = today.AddDays(-7).ToString("yyyyMMdd");
                        break;
                    case "Last 30 Days":
                        queryShortcut.StudyDate = today.AddDays(-30).ToString("yyyyMMdd");
                        break;
                    case "Last 6 Months":
                        queryShortcut.StudyDate = today.AddMonths(-6).ToString("yyyyMMdd");
                        break;
                    default:
                        queryShortcut.StudyDate = null; //eqauls "Alll"
                        break;
                }

                if (!string.IsNullOrEmpty(queryShortcut.StudyDate))
                {
                    strCondition += $" AND S.StudyDate >= '{queryShortcut.StudyDate}'";
                }
            }

            if (!string.IsNullOrEmpty(queryShortcut.Modality))
            {
                strCondition += $" AND R.Modality = '{queryShortcut.Modality}'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.AccessionNo))
            {
                strCondition += $" AND S.AccessionNo LIKE '%{queryShortcut.AccessionNo}%'";
            }


            return strCondition;
        }
    }
}
