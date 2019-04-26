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
            DicOldWebPacsTransform.Add("PatientsSex", "PatientSex");
            DicOldWebPacsTransform.Add("AccessionNumber", "AccessionNo");
            DicOldWebPacsTransform.Add("PatientsAge", "PatientAge");
            DicOldWebPacsTransform.Add("PatientsBirthDate", "PatientBirthDate");
            DicOldWebPacsTransform.Add("NumberOfStudyRelatedSeries", "SeriesCount");
            DicOldWebPacsTransform.Add("NumberOfStudyRelatedInstances", "ImageCount");
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
                            foreach (XmlNode _node in node.ChildNodes)
                            {
                                if (_node.Name == "From")
                                {
                                    try { mdl.PatientBirthDateFrom = Convert.ToDateTime(_node.InnerText).AddMinutes(1); }
                                    catch { }
                                }
                                else if (_node.Name == "To")
                                {
                                    try { mdl.PatientBirthDateTo = Convert.ToDateTime(_node.InnerText).AddMinutes(1); }
                                    catch { }
                                }
                            }

                            continue;
                        }

                        if (node.Name == "TagStudyDate")
                        {
                            if (node.ChildNodes.Count == 2)
                            {
                                foreach (XmlNode _node in node.ChildNodes)
                                {
                                    if (_node.Name == "From")
                                    {
                                        try { mdl.StudyDateFrom = Convert.ToDateTime(_node.InnerText).AddMinutes(1); }
                                        catch { }
                                    }
                                    else if (_node.Name == "To")
                                    {
                                        try { mdl.StudyDateTo = Convert.ToDateTime(_node.InnerText).AddMinutes(1); }
                                        catch { }
                                    }
                                }
                            }
                            else if (node.ChildNodes.Count == 1)
                            {
                                mdl.StudyDate = node.InnerText;
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
                            continue;
                        }
                    }

                    if (propertyName == "StudyDate" || propertyName == "StudyDateFrom")
                    {
                        if (String.IsNullOrEmpty(shortcut.StudyDate) || shortcut.StudyDate == "7")
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
        public List<WorklistColumn> GetWorklistColumnConfig(string UserId, string UILanguage)
        {
            try
            {
                //
                // Get All Modality Type
                Dictionary<string, string> dicModality = new Dictionary<string, string>();
                DataSet dsModality = GetAllModality();
                foreach (DataRow row in dsModality.Tables[0].Rows)
                {
                    dicModality.Add(row["ModalityType"].ToString(), row["ModalityType"].ToString());
                }

                //
                // Get Study Date Type
                Dictionary<string, string> dicStudyDate = new Dictionary<string, string>();
                foreach (int i in Enum.GetValues(typeof(StudyDateType)))
                {
                    String name = Enum.GetName(typeof(StudyDateType), i);
                    dicStudyDate.Add(i.ToString(), name);
                }

                //
                // Get Body Part Local Name
                Dictionary<string, string> dicBodyPartLocalName = new Dictionary<string, string>();
                DataTable tb = QueryBodyPartList("", "").Tables[0];

                foreach (DataRow Row in tb.Rows)
                {
                    string bodyPartName = Row["BodyPartName"].ToString().Trim();
                    string localName = Row["LocalName"].ToString().Trim();
                    dicBodyPartLocalName.Add(bodyPartName, localName);
                }


                SqlWrapper sql = new SqlWrapper();
                sql.CommandType = CommandType.StoredProcedure;
                sql.SqlString = "[WGGC_SP_GetWorklistColumn]";
                List<SqlParameter> lstParas = new List<SqlParameter>();
                SqlParameter para1 = new SqlParameter("@UserName", UserId);
                SqlParameter para2 = new SqlParameter("@LanguageType", UILanguage);
                SqlParameter para3 = new SqlParameter("@PssiLevel", 3);
                para3.DbType = DbType.Int32;
                sql.Parameter = new SqlParameter[] { para1, para2, para3 };

                DataSet ds = SqlHelper.ExecuteQuery(sql, _connectionString);

                List<WorklistColumn> lstWorklistColumn = new List<WorklistColumn>();

                // Use a list to check if duplicate
                List<string> lstColumnId = new List<string>();

                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    WorklistColumn mdl = new WorklistColumn();
                    mdl.ColumnSequence = Convert.ToInt16(row["ColumnIndex"]);

                    mdl.ColumnId = row["PropertyValue"].ToString().Trim();

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
                    
                    string initValueList = row["ValueList"].ToString();
                    if (initValueList != "")
                    {
                        string[] valueListOptions = initValueList.Split(',');
                        Dictionary<string, string> dicValueList = new Dictionary<string, string>();

                        foreach (string valueListOption in valueListOptions)
                        {
                            string[] initValueListKeyValue = valueListOption.Split('=');
                            // Remove | from N|
                            initValueListKeyValue[0] = initValueListKeyValue[0].Replace("|", "");
                            initValueListKeyValue[1] = initValueListKeyValue[1].Replace("|", "");
                            dicValueList.Add(initValueListKeyValue[1], initValueListKeyValue[0]);
                        }

                        mdl.ValueList = dicValueList;
                    }

                    if (mdl.ColumnId == "modality")
                    {
                        mdl.ControlType = "DropDownList";
                        mdl.ValueList = dicModality;
                    }

                    if (mdl.ColumnId == "studyDate")
                    {
                        mdl.ControlType = "DropDownList";
                        mdl.ValueList = dicStudyDate;
                    }

                    if (mdl.ColumnId == "bodyPartExamined")
                    {
                        mdl.ControlType = "DropDownList";
                        mdl.ValueList = dicBodyPartLocalName;
                    }

                    mdl.OverlayID = row["OverlayID"].ToString();

                    //user defined field
                    if (row.Table.Columns.Contains("LocalName"))
                    {
                        if (mdl.ColumnText.StartsWith("UserDefinedField"))
                        {
                            string localName = row["LocalName"].ToString();
                            if (!string.IsNullOrEmpty(localName))
                            {
                                mdl.UserDefinedName = localName;
                            }
                        }

                        if (row["Visible"] != null)
                        {
                            string visible = row["Visible"].ToString();
                            if (string.Compare(visible, "0", true) == 0)
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
                string strSQL = @"SELECT ModalityType FROM ModalityTypeList ORDER BY ModalityType";
                DataSet ds = SqlHelper.ExecuteQuery(strSQL, _connectionString);
                return ds;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<Study> GetStudies(QueryShortcut queryShortcut, string sortPara, int pageIndex, out int pageCount)
        {
            string dateFormat = GetDateFormat();
            string timeFormat = System.Threading.Thread.CurrentThread.CurrentCulture.DateTimeFormat.LongTimePattern;
            int studiesCount = GetStudiesCount(queryShortcut);
            int pageSize = GetWorklistPageSize();
            pageCount = studiesCount / pageSize + 1;

            string orderByCondition = "ORDER BY PatientID ";
            if (!String.IsNullOrEmpty(sortPara))
            {
                string sortName = (sortPara.Split('|'))[0];
                string sortOrder = (sortPara.Split('|'))[1];
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

                var studyId = _commonTool.GetSafeIntValue(row["ID_Study"]);
                var study = studies.FirstOrDefault(s => s.Id == studyId);
                if (study == null)
                {
                    study = _pssiObjectCreator.CreateStudy(row);
                    study.Patient = _pssiObjectCreator.CreatPatient(row);

                    if (!String.IsNullOrEmpty(study.Patient.PatientBirthDate))
                    {
                        string today = System.DateTime.Now.ToString("yyyyMMdd");
                        study.Patient.PatientAge = GetPatientAge(study.Patient.PatientBirthDate, today);
                        study.Patient.PatientBirthDate = DateTime.ParseExact(study.Patient.PatientBirthDate, "yyyyMMdd", null).ToString(dateFormat);
                    }

                    if (!String.IsNullOrEmpty(study.StudyDate))
                    {
                        study.StudyDate = DateTime.ParseExact(study.StudyDate, "yyyyMMdd", null).ToString(dateFormat);
                    }

                    if (!String.IsNullOrEmpty(study.StudyTime))
                    {
                        study.StudyTime = FormatTimeString(study.StudyTime.Trim(), "HHmmss", "HH:mm:ss");
                    }

                    if (!String.IsNullOrEmpty(study.Patient.PatientName))
                    {
                        study.Patient.PatientName = HandlePatientName(study.Patient.PatientName);
                    }

                    if (!String.IsNullOrEmpty(study.ScanStatus))
                    {
                        int iScanStatus = Int32.Parse(study.ScanStatus);
                        ScanStatus scanStatus = (ScanStatus)iScanStatus;

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
            int studiesCount = 0;

            var sqlStr = string.Format("SELECT " +
                                      "COUNT(*) " +
                                       "FROM Patient P, Study S " +
                                       "WHERE S.PatientGUID = P.PatientGUID ");

            sqlStr = BindingStudyCondition(queryShortcut, sqlStr);

            if (!string.IsNullOrEmpty(queryShortcut.Modality))
            {
                sqlStr += $" AND S.StudyInstanceUID in (SELECT StudyInstanceUID FROM Series WHERE Series.Modality = '{queryShortcut.Modality}')";
            }

            studiesCount = Int32.Parse(SqlHelper.GetSingleReturnValue(sqlStr, _connectionString));

            return studiesCount;
        }

        public Study GetStudy(int serialNo)
        {
            var sbSql = new StringBuilder();
            sbSql.Append("select Image.SerialNo ID_Image, Image.SOPInstanceUID, Image.ImageColumns, Image.ImageRows, Image.ObjectFile, ");//4
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

        private List<OverlayItemConfig> LoadOverlayConfig(string moduleName, string modality, string language)
        {
            try
            {
                var sqlStr = $"SELECT PropertyValue FROM SystemProfile WHERE ModuleName = '{moduleName}' AND PropertyName = '{modality}.OverlayCnt' AND Exportable='Overlay'";
                var overlayCount = Int32.Parse(SqlHelper.GetSingleReturnValue(sqlStr, _connectionString));

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
                var uiLanguage = "zh-CN";

                // Get UserDefinedField
                SqlWrapper sql = new SqlWrapper();
                var lstMdl = new List<OverlayItemConfig>();
                OverlayItemConfig mdl;
                sql.SqlString = @"select OL.OverlayUID [OverlayUID], OL.OverlayID [OverlayID], OL.LanguageValue [LanguageValue], UDF.LocalName [LocalName] " +
                    "from [Overlay_language] OL, [OverlayGroup] OG, [UserDefinedField] UDF where OL.OverlayID = OG.OverlayID AND OL.Language = @Language AND OG.Name = UDF.FieldName";
                sql.Parameter = new SqlParameter[] { new SqlParameter("@Language", uiLanguage) };
                var _dsOverlay = SqlHelper.ExecuteQuery(sql.SqlString, sql.Parameter, _connectionString);
                foreach (DataRow row in _dsOverlay.Tables[0].Rows)
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

                _dsOverlay = SqlHelper.ExecuteQuery(sql.SqlString, sql.Parameter, _connectionString);
                foreach (DataRow row in _dsOverlay.Tables[0].Rows)
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
            int pagesize = 0;

            var sbSql = new StringBuilder();
            sbSql.Append("SELECT PropertyValue FROM SystemProfile WHERE PropertyName='PageSize' and Exportable='Web_GeneralConfig' ");

            var sqlStr = sbSql.ToString();
            pagesize = Int32.Parse(SqlHelper.GetSingleReturnValue(sqlStr, _connectionString));

            return pagesize;
        }

        private string BuildSqlCondition(QueryShortcut queryShortcut, int pageIndex, int pageSize)
        {
            var strCondition = string.Empty;
            if (queryShortcut == null)
            {
                return strCondition;
            }

            strCondition = BindingStudyCondition(queryShortcut, strCondition);

            int rowFrom = 0;
            int rowTo = 0;
            if (pageIndex != 0)
            {
                rowFrom = (pageIndex - 1) * pageSize;
                rowTo = pageIndex * pageSize;
            }

            strCondition += " ) a , Series R WHERE a.row > " + rowFrom.ToString() + " and a.row <= " + rowTo.ToString() + " AND R.StudyInstanceUID = a.StudyInstanceUID";

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

            if (!string.IsNullOrEmpty(queryShortcut.PatientBirthDateFrom.ToString()) && !string.IsNullOrEmpty(queryShortcut.PatientBirthDateTo.ToString()))
            {
                DateTime birthDateFrom = (DateTime)queryShortcut.PatientBirthDateFrom;
                DateTime birthDateTo = (DateTime)queryShortcut.PatientBirthDateTo;

                strCondition += $" AND P.PatientBirthDate BETWEEN '{birthDateFrom.ToString("yyyyMMdd")}' AND '{birthDateTo.ToString("yyyyMMdd")}'";
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
                (!string.IsNullOrEmpty(queryShortcut.StudyDateFrom.ToString()) && !string.IsNullOrEmpty(queryShortcut.StudyDateTo.ToString())))
            {
                var today = DateTime.Today;
                string paraStudyDate = String.Empty;
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
                        DateTime studyDateFrom = (DateTime)queryShortcut.StudyDateFrom;
                        DateTime studyDateTo = (DateTime)queryShortcut.StudyDateTo;

                        strCondition +=
                            $" AND S.StudyDate BETWEEN '{studyDateFrom.ToString("yyyyMMdd")}' AND '{studyDateTo.ToString("yyyyMMdd")}' ";
                        break;
                }

                if (queryShortcut.StudyDate != "0" && !String.IsNullOrEmpty(paraStudyDate))
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

            return strCondition;
        }

        /// <summary>
        /// Get DateFormat from DB
        /// </summary>
        /// <returns></returns>
        public string GetDateFormat()
        {
            string strRet = GetSystemProfileProperty("DateFormat");
            if (strRet.Length == 0)
            {
                strRet = "yyyy/MM/dd";
            }
            else
            {
                strRet = strRet.Replace("Y", "y").Replace("D", "d");
            }
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
                SqlWrapper sql = new SqlWrapper();
                sql.SqlString = @"SELECT PropertyValue FROM SystemProfile WHERE PropertyName = @PropertyName"; ;
                sql.Parameter = new SqlParameter[] { new SqlParameter("@PropertyName", strPropertyName) };
                DataSet ds = SqlHelper.ExecuteQuery(sql, _connectionString);
                if (ds.Tables[0].Rows.Count > 0)
                {
                    return ds.Tables[0].Rows[0][0].ToString().Trim();
                }
            }
            catch { }
            return "";
        }

        public string FormatTimeString(string TimeString, string oldTimeFormat, string newTimeFormat)
        {
            try
            {
                DateTime dat = DateTime.Now;

                oldTimeFormat = oldTimeFormat.ToLower();
                string hour = TimeString.Substring(oldTimeFormat.IndexOf("h"), oldTimeFormat.LastIndexOf("h") - oldTimeFormat.IndexOf("h") + 1);
                string min = TimeString.Substring(oldTimeFormat.IndexOf("m"), oldTimeFormat.LastIndexOf("m") - oldTimeFormat.IndexOf("m") + 1);
                string sec = TimeString.Substring(oldTimeFormat.IndexOf("s"), oldTimeFormat.LastIndexOf("s") - oldTimeFormat.IndexOf("s") + 1);

                dat = new DateTime(dat.Year, dat.Month, dat.Day, Convert.ToInt16(hour), Convert.ToInt16(min), Convert.ToInt16(sec));
                return dat.ToString(newTimeFormat);
            }
            catch (Exception)
            {
                return TimeString;
            }
        }

        public DataSet QueryBodyPartList(string RegionName, string SPLocal)
        {
            try
            {
                SqlWrapper sql = new SqlWrapper();
                sql.CommandType = CommandType.StoredProcedure;
                sql.SqlString = "WGGC_SP_ACQ_GetBodyPartList";

                List<SqlParameter> lstparas = new List<SqlParameter>();
                SqlParameter para = new SqlParameter();
                para.DbType = DbType.Int32;
                para.ParameterName = "@IsVetApplication";
                //para.Value = IsVetApplication ? 1 : 0;
                para.Value = 0;
                lstparas.Add(para);

                para = new SqlParameter();
                para.DbType = DbType.String;
                para.ParameterName = "@RegionName";
                para.Value = RegionName;
                lstparas.Add(para);

                para = new SqlParameter();
                para.DbType = DbType.String;
                para.ParameterName = "@SPLocal";
                para.Value = SPLocal;
                lstparas.Add(para);

                para = new SqlParameter();
                para.DbType = DbType.Int32;
                para.ParameterName = "@LT_MAMMO";
                //para.Value = MLicense.IsMammoEnable() ? 1 : 0;
                para.Value = 1;
                lstparas.Add(para);

                para = new SqlParameter();
                para.DbType = DbType.Int32;
                para.ParameterName = "@LT_LLI_IMAGING";
                para.Value = 1/*MLicense.Options[MLicenseType.LT_LLI_IMAGING] ? 1 : 0*/;
                lstparas.Add(para);

                sql.Parameter = lstparas.ToArray();
                DataSet ds = SqlHelper.ExecuteQuery(sql, _connectionString);
                return ds;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public string GetPatientAge(string StartDate, string EndDate)
        {
            string strSql = "EXECUTE [WGGC].[dbo].[WGGC_SP_GetPatientAge] @StartDate,@EndDate,@RetValue OUTPUT";

            List<SqlParameter> lstParas = new List<SqlParameter>();
            lstParas.Add(new SqlParameter("@StartDate", StartDate));
            lstParas.Add(new SqlParameter("@EndDate", EndDate));

            SqlParameter RetValue = new SqlParameter("@RetValue", SqlDbType.VarChar, 64);
            RetValue.Direction = ParameterDirection.Output;
            lstParas.Add(RetValue);

            SqlHelper.ExecuteQuery(strSql, lstParas.ToArray(), _connectionString);

            return RetValue.Value.ToString();
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

        public int UpdateStudyScanStatus(string StudyInstanceUID, ScanStatus NewStatus)
        {
            List<SqlWrapper> lstSql = GetUpdateScanStatusSql(StudyInstanceUID, NewStatus);
            return SqlHelper.ExecuteNonQuery(lstSql, _connectionString);
        }

        private List<SqlWrapper> GetUpdateScanStatusSql(string StudyInstanceUID, ScanStatus NewStatus)
        {
            List<SqlWrapper> lstSql = new List<SqlWrapper>();

            // Update STUDY Table
            SqlWrapper sql = new SqlWrapper();
            string strSQL = @"UPDATE STUDY SET [SCANSTATUS]=@SCANSTATUS, CompleteToken=@TokenID, AcqDateTime = getdate() WHERE [StudyInstanceUID]=@StudyInstanceUID";
            SqlParameter[] paras = new SqlParameter[] {
                new SqlParameter("@StudyInstanceUID", StudyInstanceUID),
                new SqlParameter("@TokenID", Guid.NewGuid().ToString()),
                new SqlParameter("@SCANSTATUS", ((int)NewStatus).ToString())
            };
            sql.SqlString = strSQL;
            sql.Parameter = paras;
            lstSql.Add(sql);


            // Update MWLOrder Table
            sql = new SqlWrapper();
            strSQL = @"UPDATE MWLOrder SET [SCANSTATUS]=@SCANSTATUS WHERE [StudyInstanceUID]=@StudyInstanceUID";
            paras = new SqlParameter[] {
                new SqlParameter("@StudyInstanceUID", StudyInstanceUID),
                new SqlParameter("@SCANSTATUS", ((int)NewStatus).ToString())
            };
            sql.SqlString = strSQL;
            sql.Parameter = paras;
            lstSql.Add(sql);

            return lstSql;
        }

        /// <summary>
        /// Reserve or unreserved a study
        /// </summary>
        public void SetReserved(string studyInstanceUID, ReservedStatus reserved)
        {
            string chReserved = reserved == ReservedStatus.Reserved ? "Y" : "N";
            string strSQL = String.Format("UPDATE Study SET [Reserved]='{0}' WHERE StudyInstanceUID='{1}'",
                chReserved, studyInstanceUID);

            try
            {
                SqlHelper.ExecuteNonQuery(strSQL, _connectionString);
            }
            catch
            {

            }
        }

        public void DeletedStudy(string studyGUID, string deleteReason)
        {
            var sqlWrapper = new SqlWrapper();

            string strSQL = "WGGC_QC_DeleteStudy";
            var parameters = new SqlParameter[]{
                new SqlParameter("@strStudyInstanceUID", studyGUID),
                new SqlParameter("@strOpUser", "admin"),
                new SqlParameter("@strDelReason", deleteReason),
                new SqlParameter("@bAdmin", true) };

            sqlWrapper.SqlString = strSQL;
            sqlWrapper.Parameter = parameters;
            sqlWrapper.CommandType = CommandType.StoredProcedure;

            SqlHelper.ExecuteNonQuery(sqlWrapper, _connectionString);
        }
    }
}
