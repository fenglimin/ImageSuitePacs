using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Csh.ImageSuite.Common.Interface
{
    public interface ICommonTool
    {
        int GetSafeIntValue(object value);

        string GetSafeStrValue(object value);

        string GetJsonStringFromObject(object value);

        string ChangeStringFirstCharCase(string value, bool toUpper);

        int GetSafeIntDbValue(DataRow row, string fieldName);

        string GetSafeStringDbValue(DataRow row, string fieldName);

        string GetGUIDsByList(List<string> GUIDList);

        string GeneraterRuleJobName(int ruleJobNameIndex);

        string GenerateUID();

        string MKLinkToWebURLStudyImagesByStorageAEName(string storageAEName, string imageFileName);


    }
}
