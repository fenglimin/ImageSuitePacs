using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Csh.ImageSuite.MiniPacs;

namespace Csh.ImageSuite.WebHost.Common
{
    public class PatientAgeParser
    {
        /// <summary>
        /// µ±Ç°ÄêÁä
        /// </summary>
        public static string getPatientAge(string birthDate)
        {
            string today = System.DateTime.Now.ToString("yyyyMMdd");
            return getPatientAge(today, birthDate, "");
        }

        /// <summary>
        /// ¼ì²éÄêÁä
        /// </summary>
        public static string getPatientAge(string EndDate, string StartDate, string DefaultAge)
        {
            DateTime datStartDate = new DateTime();
            DateTime datEndDate = new DateTime();

            if (getDateTime(StartDate, out datStartDate) && getDateTime(EndDate, out datEndDate))
            {
                // Check if user inputted date time is valid
                if (datStartDate == DateTime.MinValue)
                    return "";

                // Calculate Age
                if (datStartDate <= datEndDate)
                    DefaultAge = CommonDal.getPatientAge(StartDate, EndDate);
            }
            return PatientAgeParser.formatAgeNumber(DefaultAge);
        }

        /// <summary>
        /// µ±Ç°ÄêÁä
        /// </summary>
        public static string getVetAge(string birthDate)
        {
            string today = System.DateTime.Now.ToString("yyyyMMdd");
            return getVetAge(today, birthDate, "");
        }

        /// <summary>
        /// ¼ì²éÄêÁä
        /// </summary>
        public static string getVetAge(string EndDate, string StartDate, string DefaultAge)
        {
            DateTime datStartDate = new DateTime();
            DateTime datEndDate = new DateTime();

            if (getDateTime(StartDate, out datStartDate) && getDateTime(EndDate, out datEndDate))
            {
                // Check if user inputted date time is valid
                if (datStartDate == DateTime.MinValue)
                    return "";

                //// Calculate Age
                //if (datStartDate <= datEndDate)
                //    DefaultAge = CommonBiz.getVetAge(StartDate, EndDate);
            }
            return DefaultAge;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="dateTime"></param>
        /// <param name="outDateTime"></param>
        /// <returns></returns>
        private static bool getDateTime(string dateTime, out DateTime outDateTime)
        {
            try
            {
                outDateTime = new DateTime(Convert.ToInt32(dateTime.Substring(0, 4)),
                    Convert.ToInt32(dateTime.Substring(4, 2)),
                    Convert.ToInt32(dateTime.Substring(6, 2)));
                return true;
            }
            catch
            {
                outDateTime = new DateTime();
                return false;
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="age"></param>
        /// <returns></returns>
        private static string formatAgeNumber(int age)
        {
            return String.Format("{0:D3}", age);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="age"></param>
        /// <returns></returns>
        private static string formatAgeNumber(string age)
        {
            if (age.Length == 4)
                return age;
            else if (age.Length > 4)
                return age.Substring(age.Length - 4, 4);
            else
                return age.PadLeft(4, '0');
        }
    }
}