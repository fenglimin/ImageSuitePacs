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
    }
}
