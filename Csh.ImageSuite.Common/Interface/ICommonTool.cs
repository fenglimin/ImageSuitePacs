using System;
using System.Collections.Generic;
using System.ComponentModel;
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
    }
}
