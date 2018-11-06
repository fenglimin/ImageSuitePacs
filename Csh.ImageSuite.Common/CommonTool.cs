using System;
using System.Collections.Generic;
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
    }
}
