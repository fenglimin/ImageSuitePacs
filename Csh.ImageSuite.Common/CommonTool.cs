using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Common.Interface;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Csh.ImageSuite.Common
{
    public class CommonTool : ICommonTool
    {
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

        public string GetSafeStrValue(object value)
        {
            return value?.ToString().TrimEnd() ?? string.Empty;
        }

        public string GetJsonStringFromObject(object value)
        {
            var ret = JsonConvert.SerializeObject(value, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                //PreserveReferencesHandling = PreserveReferencesHandling.Objects,
                //Formatting = Formatting.Indented
            });

            return ret;
        }

        public string ChangeStringFirstCharCase(string value, bool toUpper)
        {
            if (string.IsNullOrEmpty(value))
                return value;

            if (toUpper)
            {
                return (value.Length > 1)? char.ToUpper(value[0]) + value.Substring(1) : char.ToUpper(value[0]).ToString();
            }
            else
            {
                return (value.Length > 1) ? char.ToLower(value[0]) + value.Substring(1) : char.ToLower(value[0]).ToString();
            }
            
        }

        public int GetSafeIntDbValue(DataRow row, string fieldName)
        {
            return row.Table.Columns.Contains(fieldName) ? GetSafeIntValue(row[fieldName]) : 0;
        }

        public string GetSafeStringDbValue(DataRow row, string fieldName)
        {
            return row.Table.Columns.Contains(fieldName) ? GetSafeStrValue(row[fieldName]) : string.Empty;
        }

        public string GetGUIDsByList(List<string> GUIDList)
        {
            string result = string.Empty;

            if (GUIDList.Count > 0)
            {
                foreach (string dataKey in GUIDList)
                {
                    if (dataKey.Trim().Length > 0)
                    {
                        result += "'" + dataKey.Trim() + "',";
                    }
                }
                if (result.Length > 0)
                {
                    result = result.Substring(0, result.Length - 1);
                }
            }
            return result;
        }

        public string GeneraterRuleJobName(int ruleJobNameIndex)
        {
            string result = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            //result = result.Insert(8, "_");
            if (ruleJobNameIndex > 0)
            {
                result += ruleJobNameIndex.ToString();
            }
            return result;
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

        public string MKLinkToWebURLStudyImagesByStorageAEName(string storageAEName, string imageFileName)
        {
            imageFileName = imageFileName.TrimStart('/').Trim();
            imageFileName = imageFileName.Replace("\\", "/");
            imageFileName = imageFileName.TrimEnd('/');
            return MKLinkToWebURLStudyImagesByStorageAEName(storageAEName) + imageFileName;
        }

        public string MKLinkToWebURLStudyImagesByStorageAEName(string storageAEName)
        {
            storageAEName = storageAEName.Trim();
            storageAEName = storageAEName.Replace("\\", "");
            storageAEName = storageAEName.TrimEnd('/');
            return @"~/" + storageAEName + @"/";
        }
    }
}
