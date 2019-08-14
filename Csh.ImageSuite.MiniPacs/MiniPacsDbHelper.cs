using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Common;
using Csh.ImageSuite.Common.Database;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;
using System.Data.SqlClient;
using System.Diagnostics.Eventing.Reader;
using System.Xml;
using System.IO;
using Csh.ImageSuite.Model.Common;
using Csh.ImageSuite.Model.Config;
using Csh.ImageSuite.Model.Enum;


namespace Csh.ImageSuite.MiniPacs
{
    public class MiniPacsDbHelper : IDbHelper
    {
        private readonly IPssiObjectCreator _pssiObjectCreator;
        private readonly ICommonTool _commonTool;
        private readonly string _connectionString;
        private static readonly Dictionary<string, string> DicStorageDirectory = new Dictionary<string, string>();
        private static readonly Dictionary<string, string> DicOldWebPacsTransform = new Dictionary<string, string>();
        private Dictionary<string, string> DicBodyPartMapping;

        public MiniPacsDbHelper(IPssiObjectCreator pssiObjectCreator, ICommonTool commonTool)
        {
            _connectionString = ConfigurationManager.ConnectionStrings["WGGC_Connection"].ConnectionString;

            _pssiObjectCreator = pssiObjectCreator;
            _commonTool = commonTool;

            LoadStorageDirectory();

            AddOldWebPacsTranslate();

            DicBodyPartMapping = GetBodyPartMapping();
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
            DicOldWebPacsTransform.Add("PatientsSex", "PatientSex");
            DicOldWebPacsTransform.Add("AccessionNumber", "AccessionNo");
            DicOldWebPacsTransform.Add("PatientsAge", "PatientAge");
            DicOldWebPacsTransform.Add("PatientsBirthDate", "PatientBirthDate");
            DicOldWebPacsTransform.Add("NumberOfStudyRelatedSeries", "SeriesCount");
            DicOldWebPacsTransform.Add("NumberOfStudyRelatedInstances", "ImageCount");
            DicOldWebPacsTransform.Add("BodyPartExamined", "BodyPartExamined");
            DicOldWebPacsTransform.Add("Modality", "Modality");
            DicOldWebPacsTransform.Add("StudyDescription", "StudyDescription");
            DicOldWebPacsTransform.Add("Reserved", "Reserved");
            DicOldWebPacsTransform.Add("Readed", "Reported");
            DicOldWebPacsTransform.Add("Printed", "Printed");

        }

        public IList<QueryShortcut> LoadQueryShortcuts()
        {
            try
            {
                string strSql = "";
                List<SqlParameter> lstParameter = new List<SqlParameter>();

                strSql = @"SELECT [PropertyName], [PropertyValue] FROM  [UserProfile] " +
                            "WHERE  [PropertyName] like @PropertyName AND [UserName] = @UserName AND [RoleName] = @RoleName " +
                            "ORDER BY [PropertyName]";

                lstParameter.Add(new SqlParameter("@UserName", "admin"));
                lstParameter.Add(new SqlParameter("@RoleName", "administrator"));
                lstParameter.Add(new SqlParameter("@PropertyName", "Web_WorklistShortcut%"));

                var ds = SqlHelper.ExecuteQuery(strSql, lstParameter.ToArray(), _connectionString);

                List<QueryShortcut> lstShortcut = new List<QueryShortcut>();
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    var mdl = new QueryShortcut();

                    // eg: Web_WorklistShortcut1|LocalDataSource|2|s
                    var names = row["PropertyName"].ToString().Split('|');
                    mdl.Name = names[3];

                    XmlDocument xmlDoc = new XmlDocument();
                    xmlDoc.LoadXml(row["PropertyValue"].ToString());

                    // Get all child node from root node
                    foreach (XmlNode node in xmlDoc.LastChild)
                    {
                        switch (node.Name)
                        {
                            case "TagPatientsBirthDate":
                            {
                                foreach (XmlNode xmlNode in node.ChildNodes)
                                {
                                    switch (xmlNode.Name)
                                    {
                                        case "From":
                                            try { mdl.PatientBirthDateFrom = Convert.ToDateTime(xmlNode.InnerText).AddMinutes(1); }
                                            catch { }

                                            break;

                                        case "To":
                                            try { mdl.PatientBirthDateTo = Convert.ToDateTime(xmlNode.InnerText).AddMinutes(1); }
                                            catch { }

                                            break;
                                    }
                                }

                                continue;
                            }

                            case "TagStudyDate":
                            {
                                switch (node.ChildNodes.Count)
                                {
                                    case 2:
                                    {
                                        foreach (XmlNode xmlNode in node.ChildNodes)
                                        {
                                            switch (xmlNode.Name)
                                            {
                                                case "From":
                                                    mdl.StudyDateFrom = Convert.ToDateTime(xmlNode.InnerText).AddMinutes(1);
                                                    break;
                                                case "To":
                                                    mdl.StudyDateTo = Convert.ToDateTime(xmlNode.InnerText).AddMinutes(1);
                                                    break;
                                                default:
                                                    break;
                                            }
                                        }

                                        break;
                                    }

                                    case 1:
                                        mdl.StudyDate = node.InnerText;
                                        break;
                                    default:
                                        break;
                                }

                                continue;
                            }
                        }

                        // Get all property of QueryShortcut
                        foreach (var info in mdl.GetType().GetProperties())
                        {
                            var propertyName = info.Name;
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
        }

        public void SaveShortcut(QueryShortcut shortcut)
        {
            var stream = new MemoryStream();
            var setting = new XmlWriterSettings {Encoding = new UTF8Encoding(false), Indent = false};
            var writer = XmlWriter.Create(stream, setting);

            //Write root
            writer.WriteStartDocument();
            writer.WriteStartElement("root");


            // Get all property of QueryShortcut
            foreach (var info in shortcut.GetType().GetProperties())
            {
                var propertyValue = (info.GetValue(shortcut, null) ?? "").ToString();
                var propertyName = info.Name;

                if (string.IsNullOrEmpty(propertyValue)) continue;

                if (propertyName == "PatientBirthDateFrom")
                {
                    writer.WriteStartElement("Tag" + "PatientsBirthDate");
                    writer.WriteStartElement("From");
                    writer.WriteValue(propertyValue);
                    writer.WriteEndElement();
                    writer.WriteStartElement("To");
                    writer.WriteValue(shortcut.PatientBirthDateTo.ToString());
                    writer.WriteEndElement();
                    writer.WriteEndElement();
                }
                else if (propertyName == "StudyDate" || propertyName == "StudyDateFrom")
                {
                    if (string.IsNullOrEmpty(shortcut.StudyDate) || shortcut.StudyDate == "7")
                    {
                        writer.WriteStartElement("Tag" + "StudyDate");
                        writer.WriteStartElement("From");
                        writer.WriteValue(shortcut.StudyDateFrom.ToString());
                        writer.WriteEndElement();
                        writer.WriteStartElement("To");
                        writer.WriteValue(shortcut.StudyDateTo.ToString());
                        writer.WriteEndElement();
                        writer.WriteEndElement();
                    }
                    else
                    {
                        if (propertyName == "StudyDate")
                        {
                            writer.WriteStartElement("Tag" + propertyName);
                            writer.WriteValue(propertyValue);
                            writer.WriteEndElement();
                        }
                    }
                }
                else if (DicOldWebPacsTransform.ContainsValue(propertyName))
                {
                    propertyName = DicOldWebPacsTransform.FirstOrDefault(x => x.Value == propertyName).Key;

                    writer.WriteStartElement("Tag" + propertyName);
                    writer.WriteValue(propertyValue.Trim());
                    writer.WriteEndElement();
                }
            }

            writer.WriteEndElement();
            writer.WriteEndDocument();

            writer.Close();

            var strCondition = Encoding.UTF8.GetString(stream.ToArray());
            var shortcutName = "Web_WorklistShortcut1|LocalDataSource|2|"+ shortcut.Name.Trim();
            var shortcutXml = strCondition;

            var sql = new SqlWrapper();
            var lstSqlPara = new List<SqlParameter>();

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

                var sql = new SqlWrapper();
                var lstSqlPara = new List<SqlParameter>();

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
        public List<WorklistColumn> GetWorklistColumnConfig(string userId, string uiLanguage)
        {
            try
            {
                //
                // Get All Modality Type
                var dicModality = new Dictionary<string, string>();
                var dsModality = GetAllModality();
                foreach (DataRow row in dsModality.Tables[0].Rows)
                {
                    dicModality.Add(row["ModalityType"].ToString().Trim(), row["ModalityType"].ToString().Trim());
                }

                //
                // Get Study Date Type
                var dicStudyDate = new Dictionary<string, string>();
                foreach (int i in Enum.GetValues(typeof(StudyDateType)))
                {
                    var name = Enum.GetName(typeof(StudyDateType), i);
                    dicStudyDate.Add(i.ToString(), name);
                }

                //
                // Get Body Part Local Name
                var dicBodyPartLocalName = new Dictionary<string, string>();
                var tb = QueryBodyPartList("", "").Tables[0];

                foreach (DataRow row in tb.Rows)
                {
                    var bodyPartName = row["BodyPartName"].ToString().Trim();
                    var localName = row["LocalName"].ToString().Trim();
                    dicBodyPartLocalName.Add(bodyPartName, localName);
                }


                var sql = new SqlWrapper
                {
                    CommandType = CommandType.StoredProcedure, SqlString = "[WGGC_SP_GetWorklistColumn]"
                };

                var para1 = new SqlParameter("@UserName", userId);
                var para2 = new SqlParameter("@LanguageType", uiLanguage);
                var para3 = new SqlParameter("@PssiLevel", 3) {DbType = DbType.Int32};
                sql.Parameter = new SqlParameter[] { para1, para2, para3 };

                var ds = SqlHelper.ExecuteQuery(sql, _connectionString);

                var lstWorklistColumn = new List<WorklistColumn>();

                // Use a list to check if duplicate
                var lstColumnId = new List<string>();

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    var mdl = new WorklistColumn
                    {
                        ColumnSequence = Convert.ToInt16(row["ColumnIndex"]),
                        ColumnId = row["PropertyValue"].ToString().Trim()
                    };


                    foreach (var value in DicOldWebPacsTransform.Keys)
                    {
                        if (row["PropertyValue"].ToString() == value)
                        {
                            mdl.ColumnId = DicOldWebPacsTransform.FirstOrDefault(x => x.Key == value).Value;
                        }
                    }

                    mdl.ColumnId = _commonTool.ChangeStringFirstCharCase(mdl.ColumnId, false);

                    mdl.ColumnText = row["LanguageValue"].ToString();
                    mdl.ControlType = row["ControlType"].ToString();
                    
                    var initValueList = row["ValueList"].ToString();
                    if (initValueList != "")
                    {
                        var valueListOptions = initValueList.Split(',');
                        var dicValueList = new Dictionary<string, string>();

                        foreach (var valueListOption in valueListOptions)
                        {
                            var initValueListKeyValue = valueListOption.Split('=');
                            // Remove | from N|
                            initValueListKeyValue[0] = initValueListKeyValue[0].Replace("|", "");
                            initValueListKeyValue[1] = initValueListKeyValue[1].Replace("|", "");
                            dicValueList.Add(initValueListKeyValue[1], initValueListKeyValue[0]);
                        }

                        mdl.ValueList = dicValueList;
                    }

                    switch (mdl.ColumnId)
                    {
                        case "modality":
                            mdl.ControlType = "DropDownList";
                            mdl.ValueList = dicModality;
                            break;
                        case "studyDate":
                            mdl.ControlType = "DropDownList";
                            mdl.ValueList = dicStudyDate;
                            break;
                        case "bodyPartExamined":
                            mdl.ControlType = "DropDownList";
                            mdl.ValueList = dicBodyPartLocalName;
                            break;
                        case "reported":
                            mdl.ColumnId = "readed";
                            break;
                        default:
                            break;
                    }

                    mdl.OverlayID = row["OverlayID"].ToString();

                    //user defined field
                    if (row.Table.Columns.Contains("LocalName"))
                    {
                        if (mdl.ColumnText.StartsWith("UserDefinedField"))
                        {
                            var localName = row["LocalName"].ToString();
                            if (!string.IsNullOrEmpty(localName))
                            {
                                mdl.UserDefinedName = localName;
                            }
                        }

                        if (row["Visible"] != null)
                        {
                            var visible = row["Visible"].ToString();
                            if (string.Compare(visible, "0", StringComparison.OrdinalIgnoreCase) == 0)
                            {
                                mdl.Visible = false;
                            }
                        }
                    }

                    if (lstColumnId.Contains(mdl.ColumnId))
                        continue;

                    lstColumnId.Add(mdl.ColumnId);
                    lstWorklistColumn.Add(mdl);
                }
                return lstWorklistColumn;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public DataSet GetAllModality()
        {
            try
            {
                const string strSql = @"SELECT ModalityType FROM ModalityTypeList ORDER BY ModalityType";
                var ds = SqlHelper.ExecuteQuery(strSql, _connectionString);
                return ds;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<Study> GetStudies(QueryShortcut queryShortcut, string sortPara, int pageIndex, out int pageCount)
        {
            string seperateFormat;
            var dateFormat = GetDateFormat(out seperateFormat);
            var studiesCount = GetStudiesCount(queryShortcut);
            var pageSize = GetWorklistPageSize();
            pageCount = studiesCount / pageSize + 1;

            string orderByCondition;
            if (!string.IsNullOrEmpty(sortPara))
            {
                var sortName = (sortPara.Split('|'))[0];
                var sortOrder = (sortPara.Split('|'))[1];
                orderByCondition = "ORDER BY " + sortName + " " + sortOrder;
            }
            else
            {
                // Default sort by StudyDate DESC
                orderByCondition = "ORDER BY " + "StudyDate" + " " + "DESC";
            }

            var studies = new List<Study>();

            var sqlStr = " SELECT *, R.SerialNo ID_Series, R.SeriesInstanceUID, R.SeriesNo, R.SeriesDate, R.SeriesTime, R.BodyPart, R.ViewPosition, R.Modality, R.ImageCount IC_Series FROM ( ";

            sqlStr += string.Format("SELECT " +
                                       "P.SerialNo ID_Patient, P.PatientID PatientID, P.PatientName, P.PatientBirthDate, P.PatientSex, " + 
                                       "P.FirstName FirstName, P.LastName LastName, P.MiddleName MiddleName, P.Comments PatientComments, " + 
                                       "S.SerialNo ID_Study, S.StudyInstanceUID, S.AccessionNo, S.StudyID, S.StudyDate, S.StudyTime, " +
                                       "S.SeriesCount, S.ImageCount IC_Study, S.StudyDescription, S.Printed, S.Reserved, S.Readed, S.ReferPhysician, " +
                                       "S.InstanceAvailability, S.AdditionalPatientHistory, S.ScanStatus, S.Send, " +
                                       "ROW_NUMBER() OVER ("+ orderByCondition + ") as row " +
                                       "FROM Patient P, Study S " +
                                       "WHERE S.PatientGUID = P.PatientGUID AND S.Hide <> 1 ");

            sqlStr += BuildSqlCondition(queryShortcut, pageIndex, pageSize);

            var result = SqlHelper.ExecuteQuery(sqlStr, _connectionString);
            foreach (DataRow row in result.Tables[0].Rows)
            {
                var series = _pssiObjectCreator.CreateSeries(row);

                if (!string.IsNullOrEmpty(series.LocalBodyPart))
                {
                    if (DicBodyPartMapping.ContainsKey(series.LocalBodyPart))
                    {
                        series.LocalBodyPart = DicBodyPartMapping.FirstOrDefault(x => x.Key == series.LocalBodyPart).Value;
                    }
                }

                var studyId = _commonTool.GetSafeIntValue(row["ID_Study"]);
                var study = studies.FirstOrDefault(s => s.Id == studyId);
                if (study == null)
                {
                    study = _pssiObjectCreator.CreateStudy(row);
                    study.Patient = _pssiObjectCreator.CreatPatient(row);

                    if (!string.IsNullOrEmpty(study.Patient.PatientBirthDate))
                    {
                        var today = DateTime.Now.ToString("yyyyMMdd");
                        study.Patient.PatientAge = GetPatientAge(study.Patient.PatientBirthDate, today);
                        study.Patient.PatientBirthDate = DateTime.ParseExact(study.Patient.PatientBirthDate, "yyyyMMdd", null).ToString(dateFormat);
                    }

                    if (!string.IsNullOrEmpty(study.StudyDate))
                    {
                        study.StudyDate = DateTime.ParseExact(study.StudyDate, "yyyyMMdd", null).ToString(dateFormat);
                    }

                    if (!string.IsNullOrEmpty(study.StudyTime))
                    {
                        study.StudyTime = FormatTimeString(study.StudyTime.Trim(), "HHmmss", "HH:mm:ss");
                    }

                    if (!string.IsNullOrEmpty(study.Patient.PatientName))
                    {
                        study.Patient.PatientName = HandlePatientName(study.Patient.PatientName);
                    }

                    if (!string.IsNullOrEmpty(study.InstanceAvailability))
                    {
                        study.InstanceAvailability = study.InstanceAvailability == "ONLINE" ? "Online" : "Offline";
                    }

                    if (!string.IsNullOrEmpty(study.ScanStatus))
                    {
                        var iScanStatus = int.Parse(study.ScanStatus);
                        var scanStatus = (ScanStatus)iScanStatus;

                        study.ScanStatus = scanStatus.ToString();
                    }


                    studies.Add(study);
                }

                series.Study = study;
                study.SeriesList.Add(series);
            }

            return studies;
        }

        public int GetStudiesCount(QueryShortcut queryShortcut)
        {
            var sqlStr = string.Format("SELECT " +
                                      "COUNT(*) " +
                                       "FROM Patient P, Study S " +
                                       "WHERE S.PatientGUID = P.PatientGUID ");

            sqlStr = BindingStudyCondition(queryShortcut, sqlStr);

            if (!string.IsNullOrEmpty(queryShortcut.Modality))
            {
                sqlStr += $" AND S.StudyInstanceUID in (SELECT StudyInstanceUID FROM Series WHERE Series.Modality = '{queryShortcut.Modality}')";
            }

            var studiesCount = int.Parse(SqlHelper.GetSingleReturnValue(sqlStr, _connectionString));

            return studiesCount;
        }

        public Study GetStudy(int serialNo, bool showKeyImage)
        {
            var sbSql = new StringBuilder();
            sbSql.Append("select Image.SerialNo ID_Image, Image.SOPInstanceUID, Image.ImageNo, Image.ImageColumns, Image.ImageRows, Image.ObjectFile, ");//4
            sbSql.Append("Image.ImageDate, Image.ImageTime, Image.AcquisitionDate, Image.AcquisitionTime, Image.KeyImage, Image.BitsAllocated, ");//4
            sbSql.Append("Series.SerialNo ID_Series, Series.SeriesInstanceUID, Series.BodyPart, Series.ViewPosition, Series.Modality,  Series.ImageCount IC_Series, ");//9
            sbSql.Append("Series.ContrastBolus, Series.LocalBodyPart, Series.SeriesDescription, Series.OperatorName, Series.ReferHospital,  Series.PatientPosition, Series.LocalViewPosition, ");//9
            sbSql.Append("Study.SerialNo ID_Study, Study.StudyInstanceUID, Study.AccessionNo, Study.StudyID, Study.StudyDate, Study.StudyTime, Study.SeriesCount, Study.ImageCount IC_Study, Study.StudyDescription, ");//16
            sbSql.Append("Study.ReferPhysician, Study.TokenId, Study.AdditionalPatientHistory, Study.Veterinarian, Study.RequestedProcPriority, ");
            sbSql.Append("Patient.SerialNo ID_Patient, Patient.PatientID, Patient.PatientName, Patient.PatientBirthDate, Patient.PatientSex, Patient.PatientAge, Patient.Breed, Patient.Species, ");
            sbSql.Append("Series.SeriesDate, Series.SeriesTime, Series.SeriesNo, Image.ImageNo  from Image ");
            sbSql.Append("join Series on Image.SeriesInstanceUID = Series.SeriesInstanceUID ");
            sbSql.Append("join Study on Series.StudyInstanceUID = Study.StudyInstanceUID ");
            sbSql.Append("join Patient on study.PatientGUID = Patient.PatientGUID ");
            sbSql.Append("where study.SerialNo=" + serialNo);
            if (showKeyImage)
            {
                sbSql.Append(" and Image.KeyImage='Y'");
            }
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
            return result.Tables[0].Rows.Count != 1 ? null : _pssiObjectCreator.CreateImage(result.Tables[0].Rows[0]);
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

        public List<OverlayItemConfig> LoadOverlayConfig(string moduleName, string language)
        {
            try
            {
                var listConfig = new List<OverlayItemConfig>();

                var sqlStr = $"SELECT PropertyValue FROM SystemProfile WHERE ModuleName = '{moduleName}' AND PropertyName = 'OverlayModality' AND Exportable='Overlay'";
                var modalityList = SqlHelper.GetSingleReturnValue(sqlStr, _connectionString).Split(',');

                foreach (var modality in modalityList)
                {
                    listConfig.AddRange(LoadOverlayConfig(moduleName, modality, language));
                }

                return listConfig;
            }
            catch (Exception e)
            {
                return null;
            }
        }

        private IEnumerable<OverlayItemConfig> LoadOverlayConfig(string moduleName, string modality, string language)
        {
            try
            {
                var sqlStr = $"SELECT PropertyValue FROM SystemProfile WHERE ModuleName = '{moduleName}' AND PropertyName = '{modality}.OverlayCnt' AND Exportable='Overlay'";
                var overlayCount = int.Parse(SqlHelper.GetSingleReturnValue(sqlStr, _connectionString));

                var listConfig = new List<OverlayItemConfig>();

                for (var i = 1; i <= overlayCount; i++)
                {
                    sqlStr = $"SELECT PropertyValue FROM SystemProfile WHERE ModuleName = '{moduleName}' AND PropertyName = '{modality}.Overlay.{i}' AND Exportable='Overlay'";
                    var config = new OverlayItemConfig {Modality = modality};
                    config.FromString(SqlHelper.GetSingleReturnValue(sqlStr, _connectionString));

                    LoadOverlayValueConfig(ref config, language);
                    listConfig.Add(config);
                }

                
                return listConfig;
            }
            catch (Exception e)
            {
                return null;
            }
        }

        private bool LoadOverlayValueConfig(ref OverlayItemConfig config, string language)
        {
            try
            {
                var sqlStr = "SELECT OG.Name DicomName, OG.OverlayID, [Group], Element, TableName, FieldName, OL.Name OverlayName, OL.LanguageValue FROM OverlayGroup OG, Overlay_Language OL " + 
                    $"WHERE OG.OverlayID = OL.OverlayID AND OL.OverlayUID={config.OverlayUid} AND OL.Language = '{language}'";

                var result = SqlHelper.ExecuteQuery(sqlStr, _connectionString);
                if (result.Tables[0].Rows.Count != 1)
                    return false;

                var row = result.Tables[0].Rows[0];
                config.OverlayId = _commonTool.GetSafeStrValue(row["OverlayID"]);
                config.LocalName = _commonTool.GetSafeStrValue(row["LanguageValue"]);
                config.OverlayName = _commonTool.GetSafeStrValue(row["OverlayName"]);
                config.DicomName = _commonTool.GetSafeStrValue(row["DicomName"]);
                config.GroupNumber = (ushort)_commonTool.GetSafeIntValue(row["Group"]);
                config.ElementNumber = (ushort)_commonTool.GetSafeIntValue(row["Element"]);
                config.TableName = _commonTool.GetSafeStrValue(row["TableName"]);
                config.FieldName = _commonTool.GetSafeStrValue(row["FieldName"]);

                config.TableName = _commonTool.ChangeStringFirstCharCase(config.TableName, false);
                config.FieldName = _commonTool.ChangeStringFirstCharCase(config.FieldName, false);

                config.FieldName = config.FieldName.Replace("ID", "Id");

                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public List<OverlayItemConfig> LoadOverlays()
        {
            try
            {
                const string uiLanguage = "zh-CN";

                // Get UserDefinedField
                SqlWrapper sql = new SqlWrapper();
                var lstMdl = new List<OverlayItemConfig>();
                OverlayItemConfig mdl;
                sql.SqlString = @"select OL.OverlayUID [OverlayUID], OL.OverlayID [OverlayID], OL.LanguageValue [LanguageValue], UDF.LocalName [LocalName] " +
                    "from [Overlay_language] OL, [OverlayGroup] OG, [UserDefinedField] UDF where OL.OverlayID = OG.OverlayID AND OL.Language = @Language AND OG.Name = UDF.FieldName";
                sql.Parameter = new SqlParameter[] { new SqlParameter("@Language", uiLanguage) };
                var dsOverlay = SqlHelper.ExecuteQuery(sql.SqlString, sql.Parameter, _connectionString);
                foreach (DataRow row in dsOverlay.Tables[0].Rows)
                {
                    mdl = new OverlayItemConfig();
                    mdl.OverlayUid = row["OverlayUID"].ToString();
                    mdl.OverlayId = row["OverlayID"].ToString();
                    mdl.LocalName = row["LocalName"].ToString();
                    mdl.OverlayName = row["LanguageValue"].ToString();
                    lstMdl.Add(mdl);
                }

                sql = new SqlWrapper
                {
                    SqlString = @"select [OverlayUID], [OverlayID], [LanguageValue], [Name] from [Overlay_Language] " +
                                @"where [Language] = @Language order by [LanguageValue]",
                    Parameter = new SqlParameter[] {new SqlParameter("@Language", uiLanguage)}
                };

                dsOverlay = SqlHelper.ExecuteQuery(sql.SqlString, sql.Parameter, _connectionString);
                foreach (DataRow row in dsOverlay.Tables[0].Rows)
                {
                    mdl = new OverlayItemConfig();
                    if (row["Name"].ToString().Contains("USERDEFINEDFIELD"))
                    {
                        continue;
                    }

                    mdl.OverlayUid = row["OverlayUID"].ToString();
                    mdl.OverlayId = row["OverlayID"].ToString();
                    mdl.OverlayName = row["LanguageValue"].ToString();
                    lstMdl.Add(mdl);
                }

                return lstMdl;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public int GetWorklistPageSize()
        {
            var pageSize = 0;

            var sbSql = new StringBuilder();
            sbSql.Append("SELECT PropertyValue FROM SystemProfile WHERE PropertyName='PageSize' and Exportable='Web_GeneralConfig' ");

            var sqlStr = sbSql.ToString();
            pageSize = int.Parse(SqlHelper.GetSingleReturnValue(sqlStr, _connectionString));

            return pageSize;
        }

        private string BuildSqlCondition(QueryShortcut queryShortcut, int pageIndex, int pageSize)
        {
            var strCondition = string.Empty;
            if (queryShortcut == null)
            {
                return strCondition;
            }

            strCondition = BindingStudyCondition(queryShortcut, strCondition);

            var rowFrom = 0;
            var rowTo = 0;
            if (pageIndex != 0)
            {
                rowFrom = (pageIndex - 1) * pageSize;
                rowTo = pageIndex * pageSize;
            }

            strCondition += " ) a , Series R WHERE a.row > " + rowFrom.ToString() + " and a.row <= " + rowTo.ToString() + " AND R.StudyInstanceUID = a.StudyInstanceUID";

            if (!string.IsNullOrEmpty(queryShortcut.BodyPartExamined))
            {
                strCondition += $" AND R.BodyPart='{queryShortcut.BodyPartExamined}'";
            }

            return strCondition;
        }

        public string BindingStudyCondition(QueryShortcut queryShortcut, string strCondition)
        {
            if (!string.IsNullOrEmpty(queryShortcut.Modality))
            {
                strCondition += $" AND S.StudyInstanceUID in (SELECT StudyInstanceUID FROM Series WHERE Series.Modality = '{queryShortcut.Modality}')";
            }

            if (!string.IsNullOrEmpty(queryShortcut.PatientId))
            {
                strCondition += $" AND P.PatientID LIKE '%{queryShortcut.PatientId}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.PatientName))
            {
                strCondition += $" AND P.PatientName LIKE '%{queryShortcut.PatientName}%'";
            }

            if (queryShortcut.PatientBirthDateFrom != null && queryShortcut.PatientBirthDateTo != null)
            {
                var birthDateFrom = (DateTime)queryShortcut.PatientBirthDateFrom;
                var birthDateTo = (DateTime)queryShortcut.PatientBirthDateTo;

                strCondition += $" AND P.PatientBirthDate BETWEEN '{birthDateFrom:yyyyMMdd}' AND '{birthDateTo:yyyyMMdd}'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.PatientSex))
            {
                strCondition += $" AND P.PatientSex = '{queryShortcut.PatientSex}'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.StudyId))
            {
                strCondition += $" AND S.StudyID LIKE '%{queryShortcut.StudyId}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.StudyDate) || 
                (queryShortcut.StudyDateFrom != null && queryShortcut.StudyDateTo != null))
            {
                var today = DateTime.Today;
                var paraStudyDate = string.Empty;
                switch (queryShortcut.StudyDate)
                {
                    case "0":
                        //queryShortcut.StudyDate = null; //eqauls "All"
                        break;
                    case "1":
                        paraStudyDate = today.ToString("yyyyMMdd");
                        break;
                    case "2":
                        paraStudyDate = today.AddDays(-1).ToString("yyyyMMdd");
                        break;
                    case "3":
                        paraStudyDate = today.AddDays(-7).ToString("yyyyMMdd");
                        break;
                    case "4":
                        paraStudyDate = today.AddDays(-30).ToString("yyyyMMdd");
                        break;
                    case "5":
                        paraStudyDate = today.AddMonths(-6).ToString("yyyyMMdd");
                        break;
                    case "6":
                        paraStudyDate = today.AddMonths(-12).ToString("yyyyMMdd");
                        break;
                    default:
                        var studyDateFrom = (DateTime)queryShortcut.StudyDateFrom;
                        var studyDateTo = (DateTime)queryShortcut.StudyDateTo;

                        strCondition +=
                            $" AND S.StudyDate BETWEEN '{studyDateFrom:yyyyMMdd}' AND '{studyDateTo:yyyyMMdd}' ";
                        break;
                }

                if (queryShortcut.StudyDate != "0" && !string.IsNullOrEmpty(paraStudyDate))
                {
                    strCondition += $" AND S.StudyDate >= '{paraStudyDate}'";
                }
            }

            if (!string.IsNullOrEmpty(queryShortcut.AccessionNo))
            {
                strCondition += $" AND S.AccessionNo LIKE '%{queryShortcut.AccessionNo}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.Printed))
            {
                strCondition += $" AND S.Printed LIKE '%{queryShortcut.Printed}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.InstanceAvailability))
            {
                strCondition += $" AND S.InstanceAvailability LIKE '%{queryShortcut.InstanceAvailability}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.ScanStatus))
            {
                strCondition += $" AND S.ScanStatus LIKE '%{queryShortcut.ScanStatus}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.StudyDescription))
            {
                strCondition += $" AND S.StudyDescription LIKE '%{queryShortcut.StudyDescription}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.Reserved))
            {
                strCondition += $" AND S.Reserved LIKE '%{queryShortcut.Reserved}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.Readed))
            {
                strCondition += $" AND S.Readed LIKE '%{queryShortcut.Readed}%'";
            }

            if (!string.IsNullOrEmpty(queryShortcut.Printed))
            {
                strCondition += $" AND S.Printed LIKE '%{queryShortcut.Printed}%'";
            }

            return strCondition;
        }

        /// <summary>
        /// Get DateFormat from DB
        /// </summary>
        /// <returns></returns>
        public string GetDateFormat(out string strDateSeparator)
        {
            var strRet = GetSystemProfileProperty("DateFormat");
            strRet = strRet.Length == 0 ? "yyyy/MM/dd" : strRet.Replace("Y", "y").Replace("D", "d");
            strDateSeparator = strRet.ToUpper().Replace("Y", "").Replace("M", "").Replace("D", "").Substring(0, 1);

            return strRet;
        }

        /// <summary>
        /// This is a base function for others function to invoke
        /// Query SystemProfile table to get specified PropertyValue by PropertyName
        /// </summary>
        /// <param name="strPropertyName"></param>
        /// <returns></returns>
        public string GetSystemProfileProperty(string strPropertyName)
        {
            try
            {
                var sql = new SqlWrapper
                {
                    SqlString = @"SELECT PropertyValue FROM SystemProfile WHERE PropertyName = @PropertyName",
                    Parameter = new SqlParameter[] {new SqlParameter("@PropertyName", strPropertyName)}
                };

                var ds = SqlHelper.ExecuteQuery(sql, _connectionString);
                if (ds.Tables[0].Rows.Count > 0)
                {
                    return ds.Tables[0].Rows[0][0].ToString().Trim();
                }
            }
            catch { }
            return "";
        }

        public string FormatTimeString(string timeString, string oldTimeFormat, string newTimeFormat)
        {
            try
            {
                var dat = DateTime.Now;

                oldTimeFormat = oldTimeFormat.ToLower();
                var hour = timeString.Substring(oldTimeFormat.IndexOf("h", StringComparison.Ordinal),
                    oldTimeFormat.LastIndexOf("h", StringComparison.Ordinal) - oldTimeFormat.IndexOf("h", StringComparison.Ordinal) + 1);
                var min = timeString.Substring(oldTimeFormat.IndexOf("m", StringComparison.Ordinal),
                    oldTimeFormat.LastIndexOf("m", StringComparison.Ordinal) - oldTimeFormat.IndexOf("m", StringComparison.Ordinal) + 1);
                var sec = timeString.Substring(oldTimeFormat.IndexOf("s", StringComparison.Ordinal),
                    oldTimeFormat.LastIndexOf("s", StringComparison.Ordinal) - oldTimeFormat.IndexOf("s", StringComparison.Ordinal) + 1);

                dat = new DateTime(dat.Year, dat.Month, dat.Day, Convert.ToInt16(hour), Convert.ToInt16(min), Convert.ToInt16(sec));
                return dat.ToString(newTimeFormat);
            }
            catch (Exception)
            {
                return timeString;
            }
        }

        public DataSet QueryBodyPartList(string regionName, string spLocal)
        {
            try
            {
                var sql = new SqlWrapper
                {
                    CommandType = CommandType.StoredProcedure, SqlString = "WGGC_SP_ACQ_GetBodyPartList"
                };

                var parasols = new List<SqlParameter>();
                var para = new SqlParameter {DbType = DbType.Int32, ParameterName = "@IsVetApplication", Value = 0};
                //para.Value = IsVetApplication ? 1 : 0;
                parasols.Add(para);

                para = new SqlParameter {DbType = DbType.String, ParameterName = "@RegionName", Value = regionName};
                parasols.Add(para);

                para = new SqlParameter {DbType = DbType.String, ParameterName = "@SPLocal", Value = spLocal};
                parasols.Add(para);

                para = new SqlParameter {DbType = DbType.Int32, ParameterName = "@LT_MAMMO", Value = 1};
                //para.Value = MLicense.IsMammoEnable() ? 1 : 0;
                parasols.Add(para);

                para = new SqlParameter {DbType = DbType.Int32, ParameterName = "@LT_LLI_IMAGING", Value = 1};
                parasols.Add(para);

                sql.Parameter = parasols.ToArray();
                var ds = SqlHelper.ExecuteQuery(sql, _connectionString);
                return ds;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public string GetPatientAge(string startDate, string endDate)
        {
            if (startDate == null) throw new ArgumentNullException(nameof(startDate));
            const string strSql = "EXECUTE [WGGC].[dbo].[WGGC_SP_GetPatientAge] @StartDate,@EndDate,@RetValue OUTPUT";

            var lstParas = new List<SqlParameter>
            {
                new SqlParameter("@StartDate", startDate), new SqlParameter("@EndDate", endDate)
            };

            var retValue = new SqlParameter("@RetValue", SqlDbType.VarChar, 64) {Direction = ParameterDirection.Output};
            lstParas.Add(retValue);

            SqlHelper.ExecuteQuery(strSql, lstParas.ToArray(), _connectionString);

            return retValue.Value.ToString();
        }

        /// <summary>
        /// Handle the patient name, remove/replace the character "^"
        /// </summary>
        /// <param name="strPatName"></param>
        /// <returns></returns>
        public string HandlePatientName(string strPatName)
        {
            try
            {
                var strLocalPatientName = GetLocalPatientName(strPatName);

                if (strLocalPatientName.Length > 0)
                    return strLocalPatientName;


                if (strPatName.IndexOf("^", StringComparison.Ordinal) > -1)
                {
                    if (System.Text.Encoding.UTF8.GetBytes(strPatName).Length != strPatName.Length)
                    {
                        //including chinese words, just remove the character "^" 
                        strPatName = strPatName.Replace("^", "");
                    }
                    else
                    {
                        //not contain chinese words, replace the character "^" with space
                        strPatName = strPatName.Replace("^", " ");
                    }
                }

            }
            catch { }
            return strPatName.Trim();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="strPatName"></param>
        /// <returns></returns>
        public string GetLocalPatientName(string strPatName)
        {
            try
            {
                SqlWrapper sql = new SqlWrapper();
                sql.SqlString = "select top 1 LocalPatientName from View_Patient where PatientName=@PatientName";
                sql.Parameter = new SqlParameter[] { new SqlParameter("@PatientName", strPatName) };
                DataSet ds = SqlHelper.ExecuteQuery(sql, _connectionString);
                if (ds.Tables[0].Rows.Count > 0)
                {
                    return ds.Tables[0].Rows[0][0].ToString();
                }
            }
            catch { }
            return "";
        }

        public int UpdateStudyScanStatus(string studyInstanceUid, ScanStatus newStatus)
        {
            var lstSql = GetUpdateScanStatusSql(studyInstanceUid, newStatus);
            return SqlHelper.ExecuteNonQuery(lstSql, _connectionString);
        }

        private static List<SqlWrapper> GetUpdateScanStatusSql(string studyInstanceUid, ScanStatus newStatus)
        {
            var lstSql = new List<SqlWrapper>();

            // Update STUDY Table
            var sql = new SqlWrapper();
            var strSql = @"UPDATE STUDY SET [SCANSTATUS]=@SCANSTATUS, CompleteToken=@TokenID, AcqDateTime = getdate() WHERE [StudyInstanceUID]=@StudyInstanceUID";
            var paras = new[] {
                new SqlParameter("@StudyInstanceUID", studyInstanceUid),
                new SqlParameter("@TokenID", Guid.NewGuid().ToString()),
                new SqlParameter("@SCANSTATUS", ((int)newStatus).ToString())
            };
            sql.SqlString = strSql;
            sql.Parameter = paras;
            lstSql.Add(sql);


            // Update MWLOrder Table
            sql = new SqlWrapper();
            strSql = @"UPDATE MWLOrder SET [SCANSTATUS]=@SCANSTATUS WHERE [StudyInstanceUID]=@StudyInstanceUID";
            paras = new [] {
                new SqlParameter("@StudyInstanceUID", studyInstanceUid),
                new SqlParameter("@SCANSTATUS", ((int)newStatus).ToString())
            };
            sql.SqlString = strSql;
            sql.Parameter = paras;
            lstSql.Add(sql);

            return lstSql;
        }

        /// <summary>
        /// Reserve or unreserved a study
        /// </summary>
        public void SetReserved(string studyInstanceUID, ReservedStatus reserved)
        {
            var chReserved = reserved == ReservedStatus.Reserved ? "Y" : "N";
            var strSQL = $"UPDATE Study SET [Reserved]='{chReserved}' WHERE StudyInstanceUID='{studyInstanceUID}'";

            try
            {
                SqlHelper.ExecuteNonQuery(strSQL, _connectionString);
            }
            catch
            {

            }
        }

        public void DeletedStudy(string studyGuid, string deleteReason)
        {
            var sqlWrapper = new SqlWrapper();

            var strSQL = "WGGC_QC_DeleteStudy";
            var parameters = new []{
                new SqlParameter("@strStudyInstanceUID", studyGuid),
                new SqlParameter("@strOpUser", "admin"),
                new SqlParameter("@strDelReason", deleteReason),
                new SqlParameter("@bAdmin", true) };

            sqlWrapper.SqlString = strSQL;
            sqlWrapper.Parameter = parameters;
            sqlWrapper.CommandType = CommandType.StoredProcedure;

            SqlHelper.ExecuteNonQuery(sqlWrapper, _connectionString);
        }

        public List<Study> GetHasHistoryStudyUidArray(string studyUid, bool showKeyImage)
        {
            var result = new List<Study>();

            var sb = new StringBuilder();
            sb.Append("SELECT A.* FROM Study A INNER JOIN Study B ON A.PatientGUID = B.PatientGUID ");
            sb.Append(" WHERE A.Hide <> 1 AND B.StudyInstanceUID IN('" + studyUid + "')");
            var strSql = sb.ToString();
            var ds = SqlHelper.ExecuteQuery(strSql, _connectionString);

            if (ds.Tables.Count <= 0) return result;
            var tb = ds.Tables[0];
            foreach (DataRow dr in tb.Rows)
            {
                var serialNo = dr["SerialNo"].ToString().Trim();
                var study = GetStudy(int.Parse(serialNo), showKeyImage);
                if (!result.Contains(study))
                {
                    result.Add(study);
                }
            }
            return result;
        }

        /// <summary>
        /// Mark a Image as KeyImage, or Unmark a KeyImage as general Image.
        /// </summary>
        public void SetKeyImage(string id, bool marked)
        {
            var chMark = marked ? 'Y' : 'N';
            var strSQL = $"UPDATE [Image] SET KeyImage='{chMark}' WHERE SerialNo='{id}'";

            try
            {
                SqlHelper.ExecuteNonQuery(strSQL, _connectionString);
            }
            catch
            {
                throw;
            }
        }

        public List<string> GetKeyImageList(List<string> lstImageUidList)
        {
            var sql = new SqlWrapper
            {
                SqlString =
                    $"SELECT [SOPInstanceUID],[KeyImage] FROM [Image] WHERE [SOPInstanceUID] IN ('{string.Join("','", lstImageUidList.ToArray())}') AND [KeyImage]='Y'"
            };

            var ds = SqlHelper.ExecuteQuery(sql, _connectionString);

            var lstKeyImages = new List<string>();
            if (ds.Tables.Count != 1) return lstKeyImages;
            foreach (DataRow row in ds.Tables[0].Rows)
            {
                lstKeyImages.Add(row["SOPInstanceUID"].ToString().Trim());
            }
            return lstKeyImages;
        }

        public DataTable GetTableStudyOfflineRestoreMessage(string studyGUIDs, string strWhere)
        {
            DataTable tb = null;

            var sb = new StringBuilder();
            sb.Append(" SELECT * FROM View_StudyOffline WHERE 1 = 1 ");

            if (studyGUIDs.Trim().Length > 0)
            {
                sb.Append(" AND StudyInstanceUID in (" + studyGUIDs + ")");
            }
            if (strWhere.Trim().Length > 0)
            {
                sb.Append(" " + strWhere + " ");
            }
            var strSQL = sb.ToString();
            var ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
            if (ds.Tables.Count > 0)
            {
                tb = ds.Tables[0];
            }
            return tb;
        }

        public DataTable GetTableStudyOffline(string studyGUIDs, string strWhere)
        {
            DataTable tb = null;

            StringBuilder sb = new StringBuilder();
            sb.Append(" SELECT * FROM Study WHERE InstanceAvailability = 'OFFLINE' ");

            if (studyGUIDs.Trim().Length > 0)
            {
                sb.Append(" AND StudyInstanceUID in (" + studyGUIDs + ")");
            }
            if (strWhere.Trim().Length > 0)
            {
                sb.Append(" " + strWhere + " ");
            }
            string strSQL = sb.ToString();
            DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
            if (ds.Tables.Count > 0)
            {
                tb = ds.Tables[0];
            }
            return tb;
        }

        public string GetStringStudyOffline(string studyGUIDs, string strWhere, out List<Study> studyInfoModelOfflineUIDList)
        {
            string strOfflineMessage = "";
            studyInfoModelOfflineUIDList = new List<Study>();
            try
            {
                DataTable tbStudyOffline = this.GetTableStudyOfflineRestoreMessage(studyGUIDs, strWhere);
                DataTable tbStudyDistinct = tbStudyOffline.DefaultView.ToTable(true, "StudyInstanceUID", "PatientID");

                if (tbStudyOffline != null)
                {
                    foreach (DataRow dr in tbStudyDistinct.Rows)
                    {
                        string strSingleOfflineMessage = "";

                        string patientID = dr["PatientID"].ToString().Trim();
                        string studyUID = dr["StudyInstanceUID"].ToString().Trim();

                        //Study studyInfoModel = new Study(studyUID);
                        Study studyInfoModel = new Study();
                        studyInfoModel.StudyInstanceUid = studyUID;
                        studyInfoModel.SeriesList = new List<Series>();

                        string offlineStorageName = "";
                        string diskName = "";

                        string diskWhere = string.Format(" StudyInstanceUID = '{0}' AND SMS_TYPE >= {1} AND Status = {2} ", studyUID, 16, 1);
                        DataRow[] drDISK = tbStudyOffline.Select(diskWhere);

                        string mainStorageWhere = string.Format(" StudyInstanceUID = '{0}' AND SMS_TYPE = {1} AND Status = {2} ", studyUID, 1, 4);
                        DataRow[] drMaimStorage = tbStudyOffline.Select(mainStorageWhere);

                        if (drDISK.Length > 0 && drMaimStorage.Length > 0)
                        {
                            diskName = drDISK[0]["SMS_NAME"].ToString().Trim();
                            studyInfoModel.IsCDOffline = true;
                        }
                        else
                        {
                            continue;
                        }

                        string usbWhere = string.Format(" StudyInstanceUID = '{0}' AND ( SMS_TYPE = {1} OR SMS_TYPE = {2} )  ", studyUID, 8, 9);
                        DataRow[] drUSB = tbStudyOffline.Select(usbWhere);
                        if (drUSB.Length > 0)
                        {
                            offlineStorageName = drUSB[0]["SMS_NAME"].ToString().Trim();
                            studyInfoModel.IsUSBOffline = true;
                        }

                        if (offlineStorageName.Trim().Length > 0)
                        {
                            strSingleOfflineMessage += offlineStorageName;
                        }
                        else
                        {
                            strSingleOfflineMessage += "CD/DVD";
                        }

                        if (diskName.Trim().Length > 0)
                        {
                            strSingleOfflineMessage += " [" + diskName + "]";
                        }
                        if (strSingleOfflineMessage.Trim().Length > 0)
                        {
                            strSingleOfflineMessage = string.Format("PatientID : {0}, ", patientID) + strSingleOfflineMessage;
                            strSingleOfflineMessage += "\n";
                        }
                        studyInfoModel.OfflinePopupMessage = strSingleOfflineMessage;

                        strOfflineMessage += strSingleOfflineMessage;

                        if (studyInfoModelOfflineUIDList.Find(delegate (Study model) { return model.StudyInstanceUid == studyUID.Trim(); }) == null)
                        {
                            studyInfoModelOfflineUIDList.Add(studyInfoModel);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return strOfflineMessage;
        }

        public int UpdatePatientEdit(Dictionary<string, string> dict)
        {
            SqlWrapper sqlWrapper = new SqlWrapper();
            sqlWrapper.SqlString = "[WGGC_QC_UpdatePatient]";
            sqlWrapper.Parameter = new SqlParameter[] {
                new SqlParameter("@strPatientName", dict["PatientName"]),
                new SqlParameter("@strNewPatientID", dict["PatientID"]),
                new SqlParameter("@strBirthDate", dict["PatientBirthDate"]),
                new SqlParameter("@strPatientSex", dict["PatientSex"]),
                new SqlParameter("@strPatientComment", dict["Comments"]),
                new SqlParameter("@strOldPatientID", dict["OldPatientID"]),
                new SqlParameter("@strPatientAge", dict["PatientAge"]),
                new SqlParameter("@strFirstName", dict["FirstName"]),
                new SqlParameter("@strMiddleName", dict["MiddleName"]),
                new SqlParameter("@strLastName", dict["LastName"]),
                new SqlParameter("@strSpecies", dict["Species"]),
                new SqlParameter("@strBreed", dict["Breed"]),
                new SqlParameter("@strOpUser", dict["OpUser"]),
                new SqlParameter("@strPatientChipID", "")};
            sqlWrapper.CommandType = CommandType.StoredProcedure;

            return SqlHelper.ExecuteNonQuery(sqlWrapper, _connectionString);
        }

        public int SyncACQPatient(Dictionary<string, string> dict)
        {
            SqlWrapper sqlWrapper = new SqlWrapper();
            sqlWrapper.SqlString = "[WGGC_SP_ACQ_UpdatePatient]";
            sqlWrapper.Parameter = new SqlParameter[] {
                new SqlParameter("@strNewPatientID", dict["PatientID"]),
                new SqlParameter("@strOldPatientID", dict["OldPatientID"]),
                new SqlParameter("@strLastName", dict["LastName"]),
                new SqlParameter("@strOpUser", dict["OpUser"])};
            sqlWrapper.CommandType = CommandType.StoredProcedure;

            return SqlHelper.ExecuteNonQuery(sqlWrapper, _connectionString);
        }

        public int UpdateStudyEdit(Dictionary<string, string> dict)
        {
            SqlWrapper sqlWrapper = new SqlWrapper();
            sqlWrapper.SqlString = "[WGGC_QC_UpdateStudy]";
            sqlWrapper.Parameter = new SqlParameter[] {
                new SqlParameter("@strStudyInstanceUID", dict["StudyInstanceUID"]),
                new SqlParameter("@strAccessionNo", dict["AccessionNo"]),
                new SqlParameter("@strStudyID", dict["StudyID"]),
                new SqlParameter("@strStudyDate", dict["StudyDate"]),
                new SqlParameter("@strStudyTime", dict["StudyTime"]),
                new SqlParameter("@strReferPhysician", dict["ReferPhysician"]),
                new SqlParameter("@strPhysicianOfRecord", dict["PhysicianOfRecord"]),
                new SqlParameter("@strStudyDescription", dict["StudyDescription"]),
                new SqlParameter("@strRequestedProcPriority", dict["StudyPriority"]),
                new SqlParameter("@strAdditionalPatientHistory", dict["AdditionalPatientHistory"]),
                new SqlParameter("@strNeutered", dict["Neutered"]),
                new SqlParameter("@strSeriesInstanceUID", dict["SeriesInstanceUID"]),
                new SqlParameter("@strModality", dict["Modality"]),
                new SqlParameter("@strBodyPart", dict["BodyPart"]),
                new SqlParameter("@strViewPos", dict["ViewPos"]),
                new SqlParameter("@strSeriesDescription", dict["SeriesDescription"]),
                new SqlParameter("@strOpUser", dict["OpUser"])
                };
            sqlWrapper.CommandType = CommandType.StoredProcedure;

            UpdateSeriesTransferStatusByStudy(new List<string> { dict["StudyInstanceUID"] });

            return SqlHelper.ExecuteNonQuery(sqlWrapper, _connectionString);
        }

        public int UpdateSeriesTransferStatusByStudy(List<string> lstStudyUIDs)
        {
            // SEND_STAT_NOTSEND		= 0;
            // SEND_STAT_SENDING		= 1;
            // SEND_STAT_SENT			= 2;
            // SEND_STAT_COMMIT		    = 3;
            // SEND_STAT_MANUALSEND	    = 4;
            // SEND_STAT_PARTSEND		= 5;
            // SEND_STAT_SENDERROR		= 6;
            if (lstStudyUIDs.Count == 0)
            {
                return 0;
            }
            SqlWrapper sql = new SqlWrapper();
            string strSQL = @"UPDATE Series SET ForwardStatus='4' 
                              WHERE  ForwardStatus IN ('1', '2', '3')
                              AND    StudyInstanceUID IN ({0})";
            string strUIDs = string.Format("'{0}'", string.Join("','", lstStudyUIDs.ToArray()));
            sql.SqlString = string.Format(strSQL, strUIDs);
            int ret = SqlHelper.ExecuteNonQuery(sql, _connectionString);
            return ret;
        }

        public int UpdateSerieEdit(Dictionary<string, string> dict)
        {
            SqlWrapper sqlWrapper = new SqlWrapper();
            sqlWrapper.SqlString = "[WGGC_QC_UpdateSeries]";
            sqlWrapper.Parameter = new SqlParameter[] {
                    new SqlParameter("@strSeriesInstanceUID", dict["SeriesInstanceUID"]),
                    new SqlParameter("@strModality", dict["Modality"]),
                    new SqlParameter("@strCategory", dict["SeriesCategory"]),
                    new SqlParameter("@strBodyPart", dict["SeriesBodyPart"]),
                    new SqlParameter("@strLocalBodypart", dict["SeriesLocalBodypart"]),
                    new SqlParameter("@strViewPos", dict["SeriesViewPos"]),
                    new SqlParameter("@strLocalViewPos", dict["SeriesLocalViewPos"]),
                    new SqlParameter("@strSeriesDescription", dict["SeriesDescription"]),
                    new SqlParameter("@strOpUser", dict["SeriesOpUser"])
                };
            sqlWrapper.CommandType = CommandType.StoredProcedure;

            //Series serDAL = new Series();
            //UpdateSeriesTransferStatusByStudy(new List<string> { serDAL.GetStudyInstanceUID(dict["SeriesInstanceUID"]) });

            return SqlHelper.ExecuteNonQuery(sqlWrapper, _connectionString);
        }

        public bool SaveExportJob(string strLastExportFormat, string strLastExportIncludeCDViewer, string strLastExportJPGCompressRate, string strLastExportPatientInfoConfig, string strLastExportVerifyCDDVD, string userId, string roleID)
        {
            bool doExport = false;
            // SQL Tran
            List<SqlWrapper> lstSql = new List<SqlWrapper>();
            try
            {
                BatchSetProfileProperty(ref lstSql, userId, roleID, "TransferPanel", "LastExportFormat", strLastExportFormat);
                BatchSetProfileProperty(ref lstSql, userId, roleID, "TransferPanel", "LastExportIncludeCDViewer", strLastExportIncludeCDViewer);
                BatchSetProfileProperty(ref lstSql, userId, roleID, "TransferPanel", "LastExportJPGCompressRate", strLastExportJPGCompressRate);
                //CommonDAL.BatchSetProfileProperty(ref lstSql, userId, roleID, GlobalConstant.TransferPanel, "LastExportPatientInfoConfig", "8");
                BatchSetProfileProperty(ref lstSql, userId, roleID, "TransferPanel", "LastExportPatientInfoConfig", strLastExportPatientInfoConfig);
                BatchSetProfileProperty(ref lstSql, userId, roleID, "TransferPanel", "LastExportVerifyCDDVD", strLastExportVerifyCDDVD);

                SqlHelper.ExecuteNonQuery(lstSql, _connectionString);
                doExport = true;
            }
            catch (Exception ex)
            {
                doExport = false;
                throw ex;
            }
            return doExport;
        }

        public static void BatchSetProfileProperty(ref List<SqlWrapper> lstSql, string UserName, string RoleName, string ModuleName, string PropertyName, string PropertyValue)
        {
            try
            {
                SqlWrapper sql;
                SqlParameter[] parameters;
                sql = new SqlWrapper();
                sql.SqlString = @"delete FROM UserProfile 
                                  where UserName=@UserName and RoleName=@RoleName and ModuleName=@ModuleName and PropertyName=@PropertyName";
                parameters = new SqlParameter[]{
                    new SqlParameter("@UserName", UserName),
                    new SqlParameter("@RoleName", RoleName),
                    new SqlParameter("@ModuleName", ModuleName),
                    new SqlParameter("@PropertyName", PropertyName)};
                sql.Parameter = parameters;
                lstSql.Add(sql);


                sql = new SqlWrapper();
                sql.SqlString = @"insert into UserProfile(UserName, RoleName, ModuleName, PropertyName, PropertyValue)
                                  values(@UserName, @RoleName, @ModuleName, @PropertyName, @PropertyValue)";
                parameters = new SqlParameter[]{
                    new SqlParameter("@UserName", UserName),
                    new SqlParameter("@RoleName", RoleName),
                    new SqlParameter("@ModuleName", ModuleName),
                    new SqlParameter("@PropertyName", PropertyName),
                    new SqlParameter("@PropertyValue", PropertyValue)};
                sql.Parameter = parameters;
                lstSql.Add(sql);
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public bool InsertCDJobList(List<string> studyUidList, ref List<string> logMsgList)
        {
            string logMsg;
            bool result = false;
            try
            {
                // SQL Tran
                List<SqlWrapper> lstSql = new List<SqlWrapper>();
                SqlWrapper sql;
                SqlParameter[] parameters;

                foreach (var studyUid in studyUidList)
                {
                    logMsg = string.Format("RowIndex {0} Insert Study UID : {1} into CDJobList.", studyUidList.IndexOf(studyUid).ToString(), studyUid);
                    if (!logMsgList.Contains(logMsg))
                    {
                        logMsgList.Add(logMsg);
                    }
                    sql = new SqlWrapper();
                    sql.SqlString = "WGGC_AppendCDJob";
                    sql.CommandType = CommandType.StoredProcedure;
                    parameters = new SqlParameter[]{
                        new SqlParameter("@strStudyInstanceUID", studyUid) };
                    sql.Parameter = parameters;
                    lstSql.Add(sql);
                }

                SqlHelper.ExecuteNonQuery(lstSql, _connectionString);
                result = true;
            }
            catch (System.Exception ex)
            {
                logMsg = ex.ToString();
                if (!logMsgList.Contains(logMsg))
                {
                    logMsgList.Add(logMsg);
                }
            }
            return result;
        }

        public DataTable GetTableStudyOnline(string studyGUIDs, string strWhere)
        {
            DataTable tb = null;

            StringBuilder sb = new StringBuilder();
            sb.Append(" SELECT * FROM Study WHERE InstanceAvailability = 'ONLINE' ");

            if (studyGUIDs.Trim().Length > 0)
            {
                sb.Append(" AND StudyInstanceUID in (" + studyGUIDs + ")");
            }
            if (strWhere.Trim().Length > 0)
            {
                sb.Append(" " + strWhere + " ");
            }
            string strSQL = sb.ToString();
            DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
            if (ds.Tables.Count > 0)
            {
                tb = ds.Tables[0];
            }
            return tb;
        }

        public void UpdateCDJobStatus(string studyUid)
        {
            try
            {
                SqlConnection cnn = new SqlConnection(_connectionString);
                SqlCommand com = cnn.CreateCommand();
                com.CommandText = "UPDATE CDJobList SET Status = @EndStatus Where StudyInstanceUID = @studyUid";
                com.Parameters.AddWithValue("@EndStatus", 3);
                com.Parameters.AddWithValue("@studyUid", studyUid);
                cnn.Open();
                com.ExecuteNonQuery();
                cnn.Close();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public void AddCDJob(List<string> studyUidList)
        {
            foreach (string studyUid in studyUidList)
            {
                string strStudyUid = studyUid.Trim();
                try
                {
                    SqlConnection cnn = new SqlConnection(_connectionString);
                    SqlCommand cmd = new SqlCommand("WGGC_AppendCDJob", cnn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.Add("@strStudyInstanceUID", SqlDbType.Text).Value = strStudyUid;
                    cnn.Open();
                    cmd.ExecuteNonQuery();
                    cnn.Close();
                }
                catch (Exception)
                {
                    throw;
                }
            }

        }

        public Dictionary<string, string> GetBodyPartMapping()
        {
            string strSQL = "SELECT BodyPartName,LocalName FROM BodyPartList";
            try
            {
                DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
                DataTable table = ds.Tables.Count > 0 ? ds.Tables[0] : new DataTable();
                Dictionary<string, string> bodyPartMapping = new Dictionary<string, string>();

                foreach (DataRow pRow in table.Rows)
                {
                    string bodyPartName = pRow["BodyPartName"].ToString().Trim();
                    string localName = pRow["LocalName"].ToString().Trim();
                    bodyPartMapping[bodyPartName] = localName;
                }
                return bodyPartMapping;
            }
            catch
            {
                throw;
            }
        }

        public DataTable GetTableNetAE()
        {
            DataTable tb = null;
            string strSQL = " SELECT RTRIM(NetAEName) AS NetAEName, AETitle, IPAddress, StorageCommitment FROM NetAE   WHERE (NodeType = '3PARTYPACS' OR NodeType = 'OTHERWGGC') AND NetAERole = 'SSCP'     ";
            DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
            if (ds.Tables.Count > 0)
            {
                tb = ds.Tables[0];
            }
            return tb;
        }


        public bool SaveTransferJob(List<OtherPacs> otherPacses, TransferJobCommandType commandType, TransferJobTableMdl model, bool m_bWholeStudy,
           bool m_bUpdateUID, int m_iCheckCompress, string ddlTransferCompressRateSelectIndex, string ddlTransferCompressRateSelectValue, string userId, string roleID)
        {
            bool result = false;

            string strCommand = string.Empty;
            string strCommandSC = string.Empty;

            List<string> jobNameList = new List<string>();
            string m_strUIDType = TransferOutputTypeConstant.SERIES;
            // SQL Tran
            List<SqlWrapper> lstSql = new List<SqlWrapper>();
            SqlWrapper sql;
            SqlParameter[] parameters;

            List<string> newUidList = new List<string>();
            int ruleJobNameIndex = 0;
            try
            {
                #region DoTransfer

                foreach (OtherPacs otherPacs in otherPacses)
                {
                    int nItemTotalNumber = 0;

                    string strCompress = "";
                    string strJobUID = string.Empty;
                    string strJobUIDSC = string.Empty;

                    if (m_iCheckCompress == 1)
                    {
                        strCompress = "Compress:" + ddlTransferCompressRateSelectValue + "&";
                    }

                    DataRow[] drNetAEs = model.TableNetAE.Select(" NetAEName ='" + otherPacs.NetAEName + "'");
                    if (drNetAEs.Length > 0)
                    {
                        string storageCommitment = drNetAEs[0]["StorageCommitment"].ToString();
                        int iStorageCommit = Convert.ToInt32(storageCommitment);
                        if (iStorageCommit > 0 && !m_bUpdateUID)
                        {
                            strCommandSC = strCompress + "PushSC:" + otherPacs.NetAEName;
                        }
                    }

                    if (commandType == TransferJobCommandType.ID_COMMAND_PUSHIMAGES)
                    {
                        strCommand = strCompress + "PushImage:" + otherPacs.NetAEName;
                    }

                    // CommandType is Push Images
                    if (commandType == TransferJobCommandType.ID_COMMAND_PUSHIMAGES)
                    {

                        foreach (DataRow drStudy in model.TableStudy.Rows)
                        {
                            string studyGUID = drStudy["StudyInstanceUID"].ToString().Trim();
                            string strPatientUID = drStudy["PatientID"].ToString().Trim();
                            string strPatientName = this.handlePatientName(drStudy["PatientName"].ToString().Trim());
                            string strComments = strPatientUID + ":" + strPatientName;
                            nItemTotalNumber = 0;

                            bool bStudyNeedManualSend = drStudy["Send"].ToString() == "4" ? true : false;
                            bool m_bForceSendAll = drStudy["Send"].ToString() == "2" ? true : false;

                            bool ruleJobNameExist = true;

                            string strRuleJobName = _commonTool.GeneraterRuleJobName(ruleJobNameIndex);

                            DataTable _dtRuleJob = GetTableRuleJob(strRuleJobName);
                            if (_dtRuleJob.Rows.Count > 0)
                            {
                                ruleJobNameIndex++;
                                strRuleJobName = _commonTool.GeneraterRuleJobName(ruleJobNameIndex);
                            }

                            while (ruleJobNameExist == true)
                            {
                                ruleJobNameExist = jobNameList.Contains(strRuleJobName);

                                if (ruleJobNameExist == false)
                                {
                                    jobNameList.Add(strRuleJobName);
                                }
                                else
                                {
                                    ruleJobNameIndex++;
                                    strRuleJobName = _commonTool.GeneraterRuleJobName(ruleJobNameIndex);
                                }
                            }

                            //generate UID for Job and Job item
                            strJobUID = Guid.NewGuid().ToString();
                            strJobUIDSC = Guid.NewGuid().ToString();

                            if (m_bUpdateUID)
                            {
                                sql = new SqlWrapper();
                                sql.SqlString = "update study set QCStatus = 1 where StudyInstanceUID = @StudyInstanceUID ";
                                parameters = new SqlParameter[] {
                                        new SqlParameter("@StudyInstanceUID", studyGUID)};
                                sql.Parameter = parameters;
                                lstSql.Add(sql);
                            }

                            bool hasReport = HasReport(studyGUID);
                            // Report 操作
                            // Only transfer report for study mode 
                            //if (string.Compare(m_strUIDType, TransferOutputTypeConstant.IMAGE) == 0 || m_bWholeStudy)
                            if (m_bWholeStudy)
                            {
                                // Add rule item for report
                                // IReport2DicomPtr pRpt2Dcm(__uuidof(Report2Dicom));
                                // If the study has a report
                                // VARIANT_BOOL hasReport = pRpt2Dcm->HasReport(_bstr_t(strCurrentStudyUID));
                                if (hasReport)
                                {
                                    //should update the fields for send in WebReport table, MR3
                                    if (m_bUpdateUID)
                                    {
                                        string strSeriesInstUIDForSend = GenerateUID();
                                        string strSOPInstUIDForSend = GenerateUID();

                                        sql = new SqlWrapper();
                                        sql.SqlString = "UPDATE WebReport SET SeriesInstUIDForSend= @SeriesInstUIDForSend, SOPInstUIDForSend= @SOPInstUIDForSend WHERE StudyInstanceUID=@StudyInstanceUID ";
                                        parameters = new SqlParameter[]{
                                        new SqlParameter("@SeriesInstUIDForSend", strSeriesInstUIDForSend),
                                        new SqlParameter("@SOPInstUIDForSend", strSOPInstUIDForSend),
                                        new SqlParameter("@StudyInstanceUID", studyGUID)};
                                        sql.Parameter = parameters;
                                        lstSql.Add(sql);
                                    }
                                    else
                                    {
                                        sql = new SqlWrapper();
                                        sql.SqlString = "UPDATE WebReport SET SeriesInstUIDForSend=SeriesInstanceUID, SOPInstUIDForSend=SOPInstanceUID WHERE StudyInstanceUID=@StudyInstanceUID ";
                                        parameters = new SqlParameter[]{
                                        new SqlParameter("@StudyInstanceUID", studyGUID)};
                                        sql.Parameter = parameters;
                                        lstSql.Add(sql);
                                    }

                                    sql = new SqlWrapper();
                                    sql.SqlString = "INSERT INTO [RuleJobItem] (JobUID,UIDType,UID,Command,Comments) Values (@JobUID,@UIDType, @UID,@Command,@Comments)";
                                    parameters = new SqlParameter[]{
                                new SqlParameter("@JobUID", strJobUID),
                                new SqlParameter("@UIDType", "REPORT"),
                                new SqlParameter("@UID", studyGUID),
                                new SqlParameter("@Command", strCommand),
                                new SqlParameter("@Comments", strComments) };
                                    sql.Parameter = parameters;
                                    lstSql.Add(sql);

                                    // total item number should plus 1
                                    nItemTotalNumber++;

                                }
                            }

                            DataRow[] drSerials = model.TableSerial.Select("StudyInstanceUID = '" + studyGUID + "' AND AcceptStatus = 2 AND HideSeries = 0  ");
                            foreach (DataRow drSerial in drSerials)
                            {
                                string strSerialGUID = drSerial["SeriesInstanceUID"].ToString().Trim();
                                string strSeriesForwardStatus = drSerial["ForwardStatus"].ToString();

                                // send these modified series
                                // 0: FORWARD_STATUS_UNSENT
                                // 4: FORWARD_STATUS_NEED_MANUALLY_SEND
                                //	int SEND_STAT_NOTSEND		= 0;
                                //	int SEND_STAT_SENDING		= 1;
                                //	int SEND_STAT_SENT			= 2;
                                //	int SEND_STAT_COMMIT		= 3;
                                //	int SEND_STAT_MANUALSEND	= 4;
                                //	int SEND_STAT_PARTSEND		= 5;
                                //	int SEND_STAT_SENDERROR		= 6;
                                // if (!m_bForceSendAll && bStudyNeedManualSend && !(strSeriesForwardStatus == "0" || strSeriesForwardStatus == "4"))
                                if (!m_bForceSendAll && bStudyNeedManualSend && !(strSeriesForwardStatus == "0" || strSeriesForwardStatus == "4" || strSeriesForwardStatus == "3" || strSeriesForwardStatus == "6"))
                                {
                                    continue;
                                }

                                // Only when the check box is checked and Manual Transfer
                                //
                                if (m_bUpdateUID)
                                {
                                    // write uid to element table
                                    UpdateElementUID(ref lstSql, strSerialGUID, 1, ref newUidList);		// qc edit the series id					
                                }

                                DataRow[] drImages = model.TableImage.Select("SeriesInstanceUID = '" + strSerialGUID + "' ");
                                foreach (DataRow drImage in drImages)
                                {
                                    string strImageUID = drImage["SOPInstanceUID"].ToString().Trim();
                                    // Only when the check box is checked and Manual Transfer
                                    if (m_bUpdateUID)
                                    {
                                        UpdateElementUID(ref lstSql, strImageUID, 0, ref newUidList);		// qc edit the sop instance uid
                                    }
                                    string strSSIUIDs = studyGUID + "," + strSerialGUID + "," + strImageUID + "," + drImage["ObjectFile"].ToString();
                                    sql = new SqlWrapper();
                                    sql.SqlString = "INSERT INTO RuleJobItem(JobUID,UIDType,UID,SeriesInstanceUID,Command,Comments) values (@JobUID,@UIDType, @UID,@SeriesInstanceUID,@Command,@Comments)";
                                    parameters = new SqlParameter[]{
                                        new SqlParameter("@JobUID", strJobUID),
                                        new SqlParameter("@UIDType", m_strUIDType),
                                        new SqlParameter("@UID", strSSIUIDs),
                                        new SqlParameter("@SeriesInstanceUID", strSerialGUID),
                                        new SqlParameter("@Command", strCommand),
                                        new SqlParameter("@Comments", strComments) };
                                    sql.Parameter = parameters;
                                    lstSql.Add(sql);

                                    if (strCommandSC != "")
                                    {
                                        sql = new SqlWrapper();
                                        sql.SqlString = "INSERT INTO RuleJobItem(JobUID,UIDType,UID,SeriesInstanceUID,Command,Comments) values (@JobUID,@UIDType, @UID,@SeriesInstanceUID,@Command,@Comments)";
                                        parameters = new SqlParameter[]{
                                            new SqlParameter("@JobUID", strJobUIDSC),
                                            new SqlParameter("@UIDType", m_strUIDType),
                                            new SqlParameter("@UID", strSSIUIDs),
                                            new SqlParameter("@SeriesInstanceUID", strSerialGUID),
                                            new SqlParameter("@Command", strCommandSC),
                                            new SqlParameter("@Comments", strComments) };
                                        sql.Parameter = parameters;
                                        lstSql.Add(sql);
                                    }

                                    nItemTotalNumber++;
                                }

                                sql = new SqlWrapper();
                                sql.SqlString = " update series set ForwardStatus = 1 where SeriesInstanceUID = @SeriesInstanceUID ";
                                parameters = new SqlParameter[] {
                                        new SqlParameter("@SeriesInstanceUID", strSerialGUID)};
                                sql.Parameter = parameters;
                                lstSql.Add(sql);
                            }

                            //2016/12/13 - Scott Wu - Defect EK_HI00223523: After user click "Transfer" button of one study on web/PACS, there will nothing happened on this study on Finland system.
                            string sCreateDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss", System.Globalization.CultureInfo.InvariantCulture);
                            sql = new SqlWrapper();
                            sql.SqlString = "insert into RuleJob(JobUID,JobName, Submitter,ItemTotalNumber,CreateDateTime, StudyInstanceUID) values(@JobUID,@JobName,@Submitter,@ItemTotalNumber,@CreateDateTime,@StudyInstanceUID)";
                            parameters = new SqlParameter[]{
                                new SqlParameter("@JobUID", strJobUID),
                                new SqlParameter("@JobName", strRuleJobName),
                                new SqlParameter("@Submitter", Constant.TransferPanel),
                                new SqlParameter("@ItemTotalNumber", nItemTotalNumber),
                                new SqlParameter("@CreateDateTime", sCreateDate),
                                new SqlParameter("@StudyInstanceUID", studyGUID) };
                            sql.Parameter = parameters;
                            lstSql.Add(sql);


                            if (nItemTotalNumber < 1)
                            {
                                sql = new SqlWrapper();
                                sql.SqlString = "delete from  RuleJobItem where JobUID = @JobUID";
                                parameters = new SqlParameter[]{
                                new SqlParameter("@JobUID", strJobUID)};
                                sql.Parameter = parameters;
                                lstSql.Add(sql);
                                continue;
                            }

                            if (strCommandSC != "")
                            {
                                //2016/12/13 - Scott Wu - Defect EK_HI00223523: After user click "Transfer" button of one study on web/PACS, there will nothing happened on this study on Finland system.
                                string strExpectExecTime = DateTime.Now.AddMinutes(2).ToString("yyyy-MM-dd HH:mm:ss", System.Globalization.CultureInfo.InvariantCulture);
                                int itemtotalNumber = nItemTotalNumber;
                                //if (hasReport && m_bWholeStudy)
                                if (m_bWholeStudy)
                                {
                                    itemtotalNumber = itemtotalNumber - 1;
                                }
                                sql = new SqlWrapper();
                                sql.SqlString = "insert into RuleJob(JobUID,JobName, Submitter,ItemTotalNumber,CreateDateTime, StudyInstanceUID, ExpectExecTime) values(@JobUID,@JobName,@Submitter,@ItemTotalNumber, @CreateDateTime, @StudyInstanceUID, @ExpectExecTime)";
                                parameters = new SqlParameter[]{
                                    new SqlParameter("@JobUID", strJobUIDSC),
                                    new SqlParameter("@JobName", strRuleJobName + "_SC"),
                                    new SqlParameter("@Submitter", Constant.TransferPanel),
                                    new SqlParameter("@ItemTotalNumber", itemtotalNumber),
                                    new SqlParameter("@CreateDateTime", sCreateDate),
                                    new SqlParameter("@StudyInstanceUID", studyGUID),
                                    new SqlParameter("@ExpectExecTime", strExpectExecTime)};
                                sql.Parameter = parameters;
                                lstSql.Add(sql);
                            }
                            //if (m_strUIDType.CompareNoCase(IDS_UIDTYPE_IMAGE) == 0)
                            sql = new SqlWrapper();
                            sql.SqlString = "update Study set Send = 1 where StudyInstanceUID = @StudyInstanceUID ";
                            parameters = new SqlParameter[]{
                            new SqlParameter("@StudyInstanceUID", studyGUID)};
                            sql.Parameter = parameters;
                            lstSql.Add(sql);
                        }
                    }
                }

                #endregion

                if (model.NetAEList.Count > 0)
                {
                    BatchSetProfileProperty(ref lstSql, userId, roleID, Constant.TransferPanel, "LastDeliveryCompress", m_iCheckCompress.ToString());
                    BatchSetProfileProperty(ref lstSql, userId, roleID, Constant.TransferPanel, "LastDeliveryCompressRate", ddlTransferCompressRateSelectIndex);
                    string lastDeliveryDest = string.Join("\\", model.NetAEList);
                    BatchSetProfileProperty(ref lstSql, userId, roleID, Constant.TransferPanel, "LastDeliveryDest", lastDeliveryDest);
                    string strCreateNewGUID = "0";
                    if (m_bUpdateUID)
                    {
                        strCreateNewGUID = "1";
                    }
                    BatchSetProfileProperty(ref lstSql, userId, roleID, Constant.TransferPanel, "LastDeliveryRenewUID", strCreateNewGUID);

                    SqlHelper.ExecuteNonQuery(lstSql, _connectionString);
                    result = true;
                }
            }
            catch (Exception ex)
            {
                result = false;
                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_TransferJobDAL, GXLogLevel.Error, GXLogCode.DEFAULT, ex.Message);
                throw ex;
            }
            return result;
        }

        public void UpdateElementUID(ref List<SqlWrapper> lstSql, string strOldUID, int iLevel, ref List<string> newUidList)
        {
            SqlWrapper sql;
            SqlParameter[] parameters;
            int group = 32;
            int element = 14;
            int step = 0;
            if (iLevel == 1)
            {
                group = 32;
                element = 14;
            }
            else if (iLevel == 0)
            {
                group = 8;
                element = 24;
            }

            bool elementPrimaryKeyExist = false;

            string elementPrimaryKey = strOldUID + "-" + element.ToString() + "-" + group.ToString() + "-" + step.ToString();
            if (!newUidList.Contains(elementPrimaryKey))
            {
                newUidList.Add(elementPrimaryKey);
            }
            else
            {
                elementPrimaryKeyExist = true;
            }

            sql = new SqlWrapper();
            sql.SqlString = @"select [Group], Element, UID, Step from element where [Group] = @Group and Element= @Element and UID = @UID and Step = 0 ";
            parameters = new SqlParameter[] {
                    new SqlParameter("@Group", group),
                    new SqlParameter("@Element", element),
                    new SqlParameter("@UID", strOldUID)
                };
            sql.Parameter = parameters;
            DataSet ds = SqlHelper.ExecuteQuery(sql, _connectionString);
            if (ds.Tables[0].Rows.Count > 0)
            {
                sql = new SqlWrapper();
                sql.SqlString = @"update Element set Value = @ElementValue where [Group] = @Group and Element= @Element and UID = @UID and Step = 0 ";
                parameters = new SqlParameter[] {
                    new SqlParameter("@ElementValue", _commonTool.GenerateUID()),
                    new SqlParameter("@Group", group),
                    new SqlParameter("@Element", element),
                    new SqlParameter("@UID", strOldUID)
                };
                sql.Parameter = parameters;
                lstSql.Add(sql);
            }
            else
            {
                if (elementPrimaryKeyExist)
                {
                    sql = new SqlWrapper();
                    sql.SqlString = @"update Element set Value = @ElementValue where [Group] = @Group and Element= @Element and UID = @UID and Step = 0 ";
                    parameters = new SqlParameter[] {
                        new SqlParameter("@ElementValue", _commonTool.GenerateUID()),
                        new SqlParameter("@Group", group),
                        new SqlParameter("@Element", element),
                        new SqlParameter("@UID", strOldUID)
                    };
                    sql.Parameter = parameters;
                    lstSql.Add(sql);
                }
                else
                {
                    sql = new SqlWrapper();
                    sql.SqlString = @"Insert into Element ([Group],[Element],[UID],[VR],[Value],[Level],[Step]) values( @Group, @Element,@UID,@VR,@ElementValue,@Level,@Step )";
                    parameters = new SqlParameter[] {
                        new SqlParameter("@Group", group),
                        new SqlParameter("@Element", element),
                        new SqlParameter("@UID", strOldUID),
                        new SqlParameter("@VR", "UI"),
                        new SqlParameter("@ElementValue", _commonTool.GenerateUID()),
                        new SqlParameter("@Level", iLevel),
                        new SqlParameter("@Step", step)
                    };
                    sql.Parameter = parameters;
                    lstSql.Add(sql);
                }
            }
        }

        public DataTable GetTableRuleJob(string strRuleJobNames)
        {
            DataTable tb = null;

            string ruleJobs = strRuleJobNames.Trim();
            StringBuilder sb = new StringBuilder();
            sb.Append(" SELECT * FROM RuleJob WHERE 1 = 1 ");

            if (ruleJobs.Trim().Length > 0)
            {
                sb.Append(" AND JobName = '" + ruleJobs + "'");
            }
            string strSQL = sb.ToString();
            DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
            if (ds.Tables.Count > 0)
            {
                tb = ds.Tables[0];
            }
            return tb;
        }

        public string handlePatientName(string strPatName)
        {
            try
            {
                string strLocalPatientName = GetLocalPatientName(strPatName);

                if (strLocalPatientName.Length > 0)
                    return strLocalPatientName;

                 
                if (strPatName.IndexOf("^") > -1)
                {
                    if (System.Text.Encoding.UTF8.GetBytes(strPatName).Length != strPatName.Length)
                    {
                        //including chinese words, just remove the character "^" 
                        strPatName = strPatName.Replace("^", "");
                    }
                    else
                    {
                        //not contain chinese words, replace the character "^" with space
                        strPatName = strPatName.Replace("^", " ");
                    }
                }

            }
            catch { }
            return strPatName.Trim();
        }

        public DataTable GetTableImage(string studyGUIDs, string serialGUIDs, string imageGUIDs)
        {
            DataTable tb = null;
            string guids = studyGUIDs;
            string serials = serialGUIDs;
            string images = imageGUIDs;

            StringBuilder sb = new StringBuilder();
            sb.Append("select Image.SerialNo AS ImageKey,dbo.WGGC_FUN_STRING_GetStudyStorageAEName_ByUID(Series.StudyInstanceUID,3) AS ImageStorageAEName");
            sb.Append(" , Replace(Image.ObjectFile,'.dcm','.bmp') AS ImagePath,'' AS StudyImagePath, '' AS ObjectFilePath,Study.StudyInstanceUID, Image.* , Patient.PatientGUID,Patient.PatientName ");
            sb.Append(" from Study inner join Series on Study.StudyInstanceUID = Series.StudyInstanceUID inner join Image on Image.SeriesInstanceUID = Series.SeriesInstanceUID");
            sb.Append(" inner join Patient on Study.PatientGUID = Patient.PatientGUID where 1= 1");
            if (guids.Trim().Length > 0)
            {
                sb.Append(" AND Study.StudyInstanceUID in (" + guids + ")");
            }
            if (serials.Trim().Length > 0)
            {
                sb.Append(" AND Series.SeriesInstanceUID in (" + serials + ")");
            }
            if (images.Trim().Length > 0)
            {
                sb.Append(" AND Image.SOPInstanceUID in (" + images + ")");
            }
            sb.Append(" ORDER BY Series.SeriesNo ASC,Image.SeriesNo ASC ");
            string strSQL = sb.ToString();
            DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
            if (ds.Tables.Count > 0)
            {
                tb = ds.Tables[0];
                foreach (DataRow dr in tb.Rows)
                {
                    string studyImagePath = _commonTool.MKLinkToWebURLStudyImagesByStorageAEName(dr["ImageStorageAEName"].ToString(), dr["ImagePath"].ToString());
                    dr["StudyImagePath"] = studyImagePath;

                    string objFilePath = _commonTool.MKLinkToWebURLStudyImagesByStorageAEName(dr["ImageStorageAEName"].ToString(), dr["ObjectFile"].ToString());
                    dr["ObjectFilePath"] = objFilePath;
                }
            }

            return tb;
        }

        public TransferJobTableMdl GetTransferJobTableMdl(List<string> netAEList, string studyGUIDs, string seriesGUIDs, string imageGUIDs)
        {
            TransferJobTableMdl transferJobTableMdl = new TransferJobTableMdl();

            DataTable dtStudy = null;
            DataTable dtSerial = null;
            DataTable dtImage = null;

            DataTable dtNetAE = null;
            dtNetAE = GetTableNetAE();

            string studyWhere = " AND S.Hide <> 1";
            dtStudy = GetTableStudyByCondiation(studyGUIDs, studyWhere);

            string seriesWhere = " AND A.AcceptStatus = 2 AND A.HideSeries = 0 ";
            dtSerial = GetTableSeriesByCondiation(studyGUIDs, seriesGUIDs, seriesWhere);

            string imageWhere = " AND A.AcceptStatus = 2 AND A.HideSeries = 0 ";
            dtImage = GetTableImageByCondiation(studyGUIDs, seriesGUIDs, imageGUIDs, imageWhere);

            transferJobTableMdl.NetAEList = netAEList;
            transferJobTableMdl.TableStudy = dtStudy;
            transferJobTableMdl.TableSerial = dtSerial;
            transferJobTableMdl.TableImage = dtImage;
            transferJobTableMdl.TableNetAE = dtNetAE;

            return transferJobTableMdl;
        }

        public DataTable GetTableStudyByCondiation(string studyGUIDs, string strWhere)
        {
            DataTable tb = null;

            string guids = studyGUIDs;
            StringBuilder sb = new StringBuilder();
            sb.Append(" SELECT '' AS StudyDateTime, [dbo].[WGGC_FUN_GetStudyExamType](S.StudyInstanceUID) AS ExamType,P.*,S.* FROM Study S INNER JOIN Patient P ON S.PatientGUID = P.PatientGUID WHERE 1 = 1 ");

            if (guids.Trim().Length > 0)
            {
                sb.Append(" AND S.StudyInstanceUID in (" + guids + ")");
            }
            if (strWhere.Trim().Length > 0)
            {
                sb.Append(" " + strWhere + " ");
            }
            string strSQL = sb.ToString();
            DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
            if (ds.Tables.Count > 0)
            {
                tb = ds.Tables[0];
            }
            return tb;
        }

        public DataTable GetTableSeriesByCondiation(string studyGUIDs, string serialGUIDs, string strWhere)
        {
            DataTable tb = null;
            string guids = studyGUIDs;
            string serials = serialGUIDs;

            StringBuilder sb = new StringBuilder();
            sb.Append("SELECT '' AS StudyImagePath, dbo.WGGC_FUN_STRING_GetStudyStorageAEName_ByUID(A.StudyInstanceUID,3) AS ImageStorageAEName , A.SerialNo AS SeriesNumber, A.LocalBodypart AS BodyPartExamined ");
            sb.Append(",(SELECT TOP 1 B.ObjectFile FROM Image B where B.SeriesInstanceUID = A.SeriesInstanceUID order by B.SerialNo) as ImagePath ");
            sb.Append(",(SELECT TOP 1 B.SerialNo FROM Image B where B.SeriesInstanceUID = A.SeriesInstanceUID order by B.SerialNo) as ImageKey ");
            sb.Append(", A.* FROM Series A WHERE 1 = 1 ");

            if (guids.Trim().Length > 0)
            {
                sb.Append(" AND A.StudyInstanceUID in (" + guids + ")");
            }
            if (serials.Trim().Length > 0)
            {
                sb.Append(" AND A.SeriesInstanceUID in (" + serials + ")");
            }
            if (strWhere.Trim().Length > 0)
            {
                sb.Append(" " + strWhere);
            }
            sb.Append(" ORDER BY A.SeriesNo ASC ");
            string strSQL = sb.ToString();
            DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
            if (ds.Tables.Count > 0)
            {
                tb = ds.Tables[0];
            }
            //string studyImage = "~/" + WebConfigWrapper.ReadConfiguration("MSLinkStudyImages") + "/";
            foreach (DataRow dr in tb.Rows)
            {
                string studyImagePath = _commonTool.MKLinkToWebURLStudyImagesByStorageAEName(dr["ImageStorageAEName"].ToString(), dr["ImagePath"].ToString().Replace(".dcm", ".bmp"));
                dr["StudyImagePath"] = studyImagePath;
            }
            return tb;
        }

        public DataTable GetTableImageByCondiation(string studyGUIDs, string serialGUIDs, string imageGUIDs, string strWhere)
        {
            DataTable tb = null;

            StringBuilder sb = new StringBuilder();
            sb.Append("select B.SerialNo AS ImageKey, dbo.WGGC_FUN_STRING_GetStudyStorageAEName_ByUID(A.StudyInstanceUID,3) AS ImageStorageAEName, Replace(B.ObjectFile,'.dcm','.bmp') AS ImagePath ");
            sb.Append(" ,'' AS StudyImagePath, '' AS ObjectFilePath, B.*, A.StudyInstanceUID, A.seriesNo AS _seriesNo from Image B inner join Series A ON A.SeriesInstanceUID = B.SeriesInstanceUID WHERE 1 = 1 ");

            if (studyGUIDs.Trim().Length > 0)
            {
                sb.Append(" AND A.StudyInstanceUID in (" + studyGUIDs + ")");
            }
            if (serialGUIDs.Trim().Length > 0)
            {
                sb.Append(" AND A.SeriesInstanceUID in (" + serialGUIDs + ")");
            }
            if (imageGUIDs.Trim().Length > 0)
            {
                sb.Append(" AND B.SOPInstanceUID in (" + imageGUIDs + ")");
            }
            if (strWhere.Trim().Length > 0)
            {
                sb.Append(" " + strWhere);
            }
            sb.Append(" ORDER BY A.SeriesNo ASC,B.SeriesNo ASC ");
            string strSQL = sb.ToString();
            DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
            if (ds.Tables.Count > 0)
            {
                tb = ds.Tables[0];
                foreach (DataRow dr in tb.Rows)
                {
                    string studyImagePath = _commonTool.MKLinkToWebURLStudyImagesByStorageAEName(dr["ImageStorageAEName"].ToString(), dr["ImagePath"].ToString());
                    dr["StudyImagePath"] = studyImagePath;

                    string objFilePath = _commonTool.MKLinkToWebURLStudyImagesByStorageAEName(dr["ImageStorageAEName"].ToString(), dr["ObjectFile"].ToString());
                    dr["ObjectFilePath"] = objFilePath;
                }
            }
            return tb;

        }

        public bool HasReport(string StudyInstanceUID)
        {
            try
            {
                string strSQL = @"SELECT StudyInstanceUID FROM WebReport Where [StudyInstanceUID]=@StudyInstanceUID";
                SqlParameter[] paras = new SqlParameter[] {
                    new SqlParameter("@StudyInstanceUID", StudyInstanceUID)
                };

                DataSet ds = SqlHelper.ExecuteQuery(strSQL, paras, _connectionString);
                if (ds.Tables[0].Rows.Count > 0)
                {
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                //GXLogManager.WriteLog(GXLogModule.SQLServerDAL_WebReportDAL, GXLogLevel.Error, GXLogCode.DEFAULT, ex);
                return false;
            }
        }

        public string GenerateUID()
        {
            System.Threading.Thread.Sleep(100);
            int randomNumber = 1000;
            string strRetValue = string.Format("1.2.840.113564.50.{0}.{1}{2}{3}{4}{5}{6}{7}.{8}",
                new string[] {
                    System.Threading.Thread.CurrentThread.ManagedThreadId.ToString(),
                    DateTime.Now.ToString("yyyy"),
                    DateTime.Now.ToString("MM"),
                    DateTime.Now.ToString("dd"),
                    DateTime.Now.ToString("HH"),
                    DateTime.Now.ToString("mm"),
                    DateTime.Now.ToString("ss"),
                    DateTime.Now.Millisecond.ToString(),
                    (randomNumber++).ToString()});

            if (randomNumber >= 9999)
                randomNumber = 1000;

            if (strRetValue.Length % 2 == 1)
                strRetValue = strRetValue + "0";

            return strRetValue;
        }

        public DataTable GetTableTransferCompress()
        {
            DataTable tb = null;
            string strSQL = " SELECT * FROM [SystemProfile] where ModuleName = 'global' and Exportable = 'Compress' and PropertyName like '%CompRatioList_%' AND PropertyName <> 'CompRatioListCount' ";
            DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
            if (ds.Tables.Count > 0)
            {
                tb = ds.Tables[0];
            }
            return tb;
        }
    }
}
