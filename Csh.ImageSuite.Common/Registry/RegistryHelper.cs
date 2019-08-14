using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Win32;

namespace Csh.ImageSuite.Common.Registry
{
    public class RegistryHelper
    {
        public static string ImageSuiteInstallDir {
            get { return GetRegistryValue(@"SOFTWARE\Carestream Health\Image Suite", "InstallDir").ToString(); }
        }

        private static object GetRegistryValue(string dir, string subKey)
        {
            using (var hklm = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry64))
            {
                var reg = hklm.OpenSubKey(dir, true);
                return reg?.GetValue(subKey);
            }
        }
    }
}
