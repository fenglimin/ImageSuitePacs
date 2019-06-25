using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Common.Database;

namespace Csh.ImageSuite.MiniPacs
{
    public class CommonDal
    {
        private static string _connectionString;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="StartDate"></param>
        /// <param name="EndDate"></param>
        /// <returns></returns>
        public static string getPatientAge(string StartDate, string EndDate)
        {
            _connectionString = ConfigurationManager.ConnectionStrings["WGGC_Connection"].ConnectionString;

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
    }
}
