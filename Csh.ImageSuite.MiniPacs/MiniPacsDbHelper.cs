using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Common.Interface;
using Csh.ImageSuite.Model.Dicom;

namespace Csh.ImageSuite.MiniPacs
{
    public class MiniPacsDbHelper : IDbHelper
    {
        public IList<QueryShortcut> LoadQueryShortcuts()
        {
            return new[]
            {
                new QueryShortcut() {Id=3, Name="aa"},
                new QueryShortcut() {Id=4, Name="bb"},
                new QueryShortcut() {Id=5, Name="cc"},
                new QueryShortcut() {Id=6, Name="dd"},
                new QueryShortcut() {Id=7, Name="ee"},
                new QueryShortcut() {Id=8, Name="ff"}
            };
        }
    }
}
